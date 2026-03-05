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
  console.error('Usage: npm run check:sw-offline -- --base=http://localhost:4173');
  exit(1);
}

const shardPath = args.get('shard') ?? '/training_modules_shards/fitness.json';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let failed = false;

  try {
    // Go online to allow SW registration
    await page.goto(base, { waitUntil: 'networkidle2' });

    // Wait for SW ready
    await page.waitForFunction(() => navigator.serviceWorker?.ready, { timeout: 8000 });

    // Warm cache by fetching shard online
    const warmResult = await page.evaluate(async (path) => {
      const res = await fetch(path, { cache: 'reload' });
      return { ok: res.ok, status: res.status };
    }, shardPath);

    if (!warmResult.ok) {
      throw new Error(`Warm fetch failed: status ${warmResult.status}`);
    }

    // Go offline and attempt fetch from cache/SW
    await page.setOfflineMode(true);
    const offlineResult = await page.evaluate(async (path) => {
      try {
        const res = await fetch(path, { cache: 'default' });
        return { ok: res.ok, status: res.status };
      } catch (err) {
        return { ok: false, status: 0, error: String(err) };
      }
    }, shardPath);

    if (offlineResult.ok) {
      console.log(`PASS offline fetch ${shardPath} via SW cache (status ${offlineResult.status}).`);
    } else {
      failed = true;
      console.error(`FAIL offline fetch ${shardPath}:`, offlineResult);
    }
  } catch (err) {
    failed = true;
    console.error('FAIL SW offline check:', err);
  } finally {
    await browser.close();
    exit(failed ? 2 : 0);
  }
})();
