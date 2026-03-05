#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import puppeteer from 'puppeteer';

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base') ?? process.env.BASE_URL;
const output = args.get('output') ?? 'artifacts/offline-recovery-report.json';
const shardPath = '/training_modules_shards/fitness.json';
const manifestPath = '/training_modules_manifest.json';

if (!base) {
  console.error('Usage: npx tsx scripts/checkOfflineRecovery.ts --base=http://localhost:4173 [--output=artifacts/offline-recovery-report.json]');
  exit(1);
}

const normalize = (url: string) => url.replace(/\/$/, '');
const baseUrl = normalize(base);

type Check = {
  name: string;
  status: 'pass' | 'fail';
  details?: Record<string, unknown>;
};

type FetchResult = {
  ok: boolean;
  status: number;
  error?: string;
  json?: unknown;
};

const writeReport = (value: unknown) => {
  const full = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2), 'utf8');
  console.info(`[offline-recovery] wrote report to ${full}`);
};

const fetchPath = async (
  page: puppeteer.Page,
  requestPath: string,
  cacheMode: 'default' | 'reload',
  parseJson = false,
): Promise<FetchResult> => {
  return page.evaluate(
    async ({ pathValue, cacheValue, parseJsonValue }) => {
      try {
        const response = await fetch(pathValue, { cache: cacheValue });
        if (parseJsonValue) {
          const json = await response.json().catch(() => null);
          return { ok: response.ok, status: response.status, json };
        }
        return { ok: response.ok, status: response.status };
      } catch (error) {
        return { ok: false, status: 0, error: String(error) };
      }
    },
    { pathValue: requestPath, cacheValue: cacheMode, parseJsonValue: parseJson },
  );
};

const removeCacheEntry = async (page: puppeteer.Page, requestPath: string): Promise<boolean> => {
  return page.evaluate(async (pathValue) => {
    const names = await caches.keys();
    let removed = false;
    for (const name of names) {
      const cache = await caches.open(name);
      const ok = await cache.delete(pathValue);
      removed = removed || ok;
    }
    return removed;
  }, requestPath);
};

const corruptCacheEntry = async (page: puppeteer.Page, requestPath: string): Promise<void> => {
  await page.evaluate(async (pathValue) => {
    const names = await caches.keys();
    for (const name of names) {
      const cache = await caches.open(name);
      const hasEntry = await cache.match(pathValue);
      if (!hasEntry) continue;
      await cache.put(
        pathValue,
        new Response('corrupted-cache-entry', {
          status: 503,
          headers: { 'content-type': 'text/plain' },
        }),
      );
    }
  }, requestPath);
};

const overwriteManifestWithStale = async (page: puppeteer.Page): Promise<void> => {
  await page.evaluate(async (pathValue) => {
    const names = await caches.keys();
    const staleBody = JSON.stringify({ generatedAt: 'stale', version: 'stale', modules: [] });
    for (const name of names) {
      const cache = await caches.open(name);
      if (name.includes('runtime')) {
        await cache.put(
          pathValue,
          new Response(staleBody, {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }
    }
  }, manifestPath);
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const checks: Check[] = [];

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => navigator.serviceWorker?.ready, { timeout: 10000 });

    const warmManifest = await fetchPath(page, manifestPath, 'reload', true);
    const warmShard = await fetchPath(page, shardPath, 'reload');
    checks.push({
      name: 'warm_cache_online',
      status: warmManifest.ok && warmShard.ok ? 'pass' : 'fail',
      details: { warmManifest, warmShard },
    });

    await corruptCacheEntry(page, shardPath);
    checks.push({
      name: 'simulate_cache_corruption_replace_shard',
      status: 'pass',
    });

    await page.setOfflineMode(true);
    const corruptedOffline = await fetchPath(page, shardPath, 'default');
    checks.push({
      name: 'offline_fetch_fails_after_corruption',
      status: !corruptedOffline.ok ? 'pass' : 'fail',
      details: { corruptedOffline },
    });

    await page.setOfflineMode(false);
    await removeCacheEntry(page, shardPath);
    const recoveredOnline = await fetchPath(page, shardPath, 'reload');
    checks.push({
      name: 'online_recovery_reloads_shard',
      status: recoveredOnline.ok ? 'pass' : 'fail',
      details: { recoveredOnline },
    });

    await page.setOfflineMode(true);
    const recoveredOffline = await fetchPath(page, shardPath, 'default');
    checks.push({
      name: 'offline_fetch_succeeds_after_recovery',
      status: recoveredOffline.ok ? 'pass' : 'fail',
      details: { recoveredOffline },
    });

    await page.setOfflineMode(false);
    await overwriteManifestWithStale(page);

    const staleRead = await fetchPath(page, manifestPath, 'default', true);
    const staleModules = Array.isArray((staleRead.json as { modules?: unknown[] } | undefined)?.modules)
      ? ((staleRead.json as { modules?: unknown[] }).modules ?? [])
      : [];
    checks.push({
      name: 'simulate_stale_manifest_cache',
      status: staleRead.ok && staleModules.length === 0 ? 'pass' : 'fail',
      details: { staleRead, staleModules: staleModules.length },
    });

    await removeCacheEntry(page, manifestPath);
    const refreshedManifest = await fetchPath(page, manifestPath, 'reload', true);
    const refreshedModules = Array.isArray((refreshedManifest.json as { modules?: unknown[] } | undefined)?.modules)
      ? ((refreshedManifest.json as { modules?: unknown[] }).modules ?? [])
      : [];
    checks.push({
      name: 'stale_manifest_invalidated_by_reload',
      status: refreshedManifest.ok && refreshedModules.length > 0 ? 'pass' : 'fail',
      details: { refreshedManifest, refreshedModules: refreshedModules.length },
    });

    const failed = checks.some((check) => check.status === 'fail');
    writeReport({
      ts: new Date().toISOString(),
      base: baseUrl,
      checks,
      failed,
    });

    if (failed) {
      checks.filter((check) => check.status === 'fail').forEach((check) => {
        console.error('[offline-recovery] FAIL', check.name, check.details ?? {});
      });
      exit(2);
    }

    checks.forEach((check) => {
      console.info(`[offline-recovery] PASS ${check.name}`);
    });
    exit(0);
  } catch (error) {
    writeReport({
      ts: new Date().toISOString(),
      base: baseUrl,
      failed: true,
      error: (error as Error).message,
      checks,
    });
    console.error('[offline-recovery] failure', error);
    exit(2);
  } finally {
    await browser.close();
  }
})();
