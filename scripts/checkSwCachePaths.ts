#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { exit } from 'node:process';

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base');
if (!base) {
  console.error('Usage: npm run check:sw-cache-paths -- --base=http://localhost:4173');
  exit(1);
}

const shardPath = args.get('shard') ?? '/training_modules_shards/fitness.json';
const missPath = args.get('miss') ?? `/assets/missing-${Date.now()}.png`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let failed = false;

  try {
    await page.goto(base, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => navigator.serviceWorker?.ready, { timeout: 8000 });

    const diag = await requestCacheDiag(page);
    if (!diag) {
      throw new Error('Cache diagnostics not available from SW.');
    }

    const warmResult = await fetchPath(page, shardPath, { cache: 'reload' });
    if (!warmResult.ok) {
      throw new Error(`Warm fetch failed for ${shardPath} (status ${warmResult.status}).`);
    }

    const postWarmDiag = await requestCacheDiag(page);
    if (!postWarmDiag || !hasCacheEntry(postWarmDiag, shardPath)) {
      throw new Error(`Shard ${shardPath} did not land in runtime cache after warm fetch.`);
    }

    await page.setOfflineMode(true);
    const offlineHit = await fetchPath(page, shardPath, { cache: 'default' });
    if (!offlineHit.ok) {
      throw new Error(`Offline cache hit failed for ${shardPath} (status ${offlineHit.status}).`);
    }

    const offlineMiss = await fetchPath(page, missPath, { cache: 'default' });
    if (offlineMiss.ok) {
      throw new Error(`Unexpected offline success for ${missPath}; cache miss path should fail.`);
    }

    console.log(`PASS cache hit/miss: warm + offline hit for ${shardPath}, offline miss for ${missPath}.`);
  } catch (err) {
    failed = true;
    console.error('FAIL cache hit/miss check:', err);
  } finally {
    await browser.close();
    exit(failed ? 2 : 0);
  }
})();

async function fetchPath(
  page: puppeteer.Page,
  path: string,
  init: FetchInit
): Promise<{ ok: boolean; status: number; error?: string }> {
  return page.evaluate(
    async ({ path: requestPath, init: requestInit }) => {
      try {
        const res = await fetch(requestPath, requestInit);
        return { ok: res.ok, status: res.status };
      } catch (err) {
        return { ok: false, status: 0, error: String(err) };
      }
    },
    { path, init }
  );
}

async function requestCacheDiag(page: puppeteer.Page): Promise<CacheDiag | null> {
  return page.evaluate(() => {
    return new Promise<CacheDiag | null>((resolve) => {
      const nav = (globalThis as any).navigator;
      if (!nav?.serviceWorker?.controller) {
        resolve(null);
        return;
      }
      const channel = new (globalThis as any).MessageChannel();
      const timeout = setTimeout(() => resolve(null), 5000);
      channel.port1.onmessage = (event: any) => {
        clearTimeout(timeout);
        resolve(event.data as CacheDiag);
      };
      nav.serviceWorker.controller.postMessage({ type: 'CACHE_DIAG' }, [channel.port2]);
    });
  });
}

function hasCacheEntry(diag: CacheDiag, path: string): boolean {
  const entries = Object.values(diag.entries ?? {});
  return entries.some((paths) => paths.includes(path));
}

type FetchInit = { cache: 'reload' | 'default' };
type CacheDiag = {
  version: string;
  precache: string;
  runtime: string;
  entries: Record<string, string[]>;
  error?: string;
};
