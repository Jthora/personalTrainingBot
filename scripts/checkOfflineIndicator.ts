#!/usr/bin/env node
import { exit } from 'node:process';
import puppeteer from 'puppeteer';

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base');
if (!base) {
  console.error('Usage: npx tsx scripts/checkOfflineIndicator.ts --base=http://localhost:4173');
  exit(1);
}

const statusSelector = '[role="status"][aria-live="polite"]';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let failed = false;

  try {
    await page.goto(base, { waitUntil: 'networkidle2' });

    await page.waitForSelector(statusSelector, { timeout: 5000 });
    const onlineText = await page.$eval(statusSelector, (el) => el.textContent || '');
    if (!onlineText.toLowerCase().includes('online')) {
      failed = true;
      console.error('FAIL: online indicator not present');
    }

    await page.setOfflineMode(true);
    await page.waitForFunction(() => navigator.onLine === false, { timeout: 5000 });
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        return (el.textContent || '').toLowerCase().includes('offline');
      },
      { timeout: 6000 },
      statusSelector,
    );
    const offlineText = await page.$eval(statusSelector, (el) => el.textContent || '');
    if (!offlineText.toLowerCase().includes('offline')) {
      failed = true;
      console.error('FAIL: offline indicator not present after network drop');
    }
  } catch (err) {
    failed = true;
    console.error('FAIL offline indicator check:', err);
  } finally {
    await browser.close();
    exit(failed ? 2 : 0);
  }
})();