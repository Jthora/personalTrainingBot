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
const output = args.get('output') ?? 'artifacts/offline-critical-path-report.json';

if (!base) {
  console.error('Usage: npx tsx scripts/checkOfflineCriticalPath.ts --base=http://localhost:4173 [--output=artifacts/offline-critical-path-report.json]');
  exit(1);
}

const normalize = (url: string) => url.replace(/\/$/, '');
const baseUrl = normalize(base);

const continuityParams = 'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

const checkpoints = [
  `/mission/brief?${continuityParams}`,
  `/mission/triage?${continuityParams}`,
  `/mission/case?${continuityParams}`,
  `/mission/signal?${continuityParams}`,
  `/mission/checklist?${continuityParams}`,
  `/mission/debrief?${continuityParams}`,
  '/training/run',
] as const;

type CheckpointResult = {
  route: string;
  status: 'pass' | 'fail';
  httpStatus: number | null;
  location: string;
  hasRoot: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  offlineReported: boolean;
};

const writeReport = (value: unknown) => {
  const full = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2), 'utf8');
  console.info(`[offline-critical-path] wrote report to ${full}`);
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: CheckpointResult[] = [];

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => navigator.serviceWorker?.ready, { timeout: 10000 });

    await page.evaluate(async () => {
      await Promise.all([
        fetch('/training_modules_manifest.json', { cache: 'reload' }).catch(() => null),
        fetch('/training_modules_shards/fitness.json', { cache: 'reload' }).catch(() => null),
      ]);
    });

    for (const route of checkpoints) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle2' }).catch(() => null);
    }

    await page.setOfflineMode(true);

    for (const route of checkpoints) {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const consoleListener = (msg: puppeteer.ConsoleMessage) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };
      const pageErrorListener = (err: Error) => pageErrors.push(err.message);

      page.on('console', consoleListener);
      page.on('pageerror', pageErrorListener);

      try {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch(() => null);
        const httpStatus = response?.status?.() ?? null;
        const hasRoot = await page.evaluate(() => Boolean(document.getElementById('root')));
        const location = await page.evaluate(() => window.location.pathname + window.location.search);
        const offlineReported = await page.evaluate(() => navigator.onLine === false);

        const status: CheckpointResult['status'] = hasRoot && consoleErrors.length === 0 && pageErrors.length === 0
          ? 'pass'
          : 'fail';

        results.push({
          route,
          status,
          httpStatus,
          location,
          hasRoot,
          consoleErrors,
          pageErrors,
          offlineReported,
        });
      } finally {
        page.off('console', consoleListener);
        page.off('pageerror', pageErrorListener);
      }
    }

    const failed = results.some((item) => item.status === 'fail');
    writeReport({
      ts: new Date().toISOString(),
      base: baseUrl,
      mode: 'offline-critical-path',
      checkpoints: results,
      failed,
    });

    if (failed) {
      results.filter((item) => item.status === 'fail').forEach((item) => {
        console.error('[offline-critical-path] FAIL', item.route, {
          location: item.location,
          httpStatus: item.httpStatus,
          hasRoot: item.hasRoot,
          consoleErrors: item.consoleErrors,
          pageErrors: item.pageErrors,
        });
      });
      exit(2);
    }

    results.forEach((item) => {
      if (!item.offlineReported) {
        console.warn(`[offline-critical-path] WARN navigator.onLine reported true for ${item.route}`);
      }
      console.info(`[offline-critical-path] PASS ${item.route} -> ${item.location}`);
    });
    exit(0);
  } catch (error) {
    writeReport({
      ts: new Date().toISOString(),
      base: baseUrl,
      mode: 'offline-critical-path',
      failed: true,
      error: (error as Error).message,
      checkpoints: results,
    });
    console.error('[offline-critical-path] failure', error);
    exit(2);
  } finally {
    await browser.close();
  }
})();
