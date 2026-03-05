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
  console.error('Usage: npx tsx scripts/checkDeepLinks.ts --base=http://localhost:4173');
  exit(1);
}

const routes = [
  '/',
  '/home',
  '/home/plan',
  '/home/cards',
  '/home/progress',
  '/home/coach',
  '/home/settings',
  '/mission/brief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/triage?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/case?op=op-operation-bravo&case=case-bravo-signal-cascade&signal=signal-bravo-route-hijack',
  '/mission/signal?op=op-operation-charlie&case=case-charlie-artifact-chain&signal=signal-charlie-chain-gap',
  '/mission/checklist?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/debrief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/brief?op=op-missing&case=case-missing&signal=sig-missing',
  '/training',
  '/c/demo-slug?source=test',
  '/share/demo-slug',
];

const normalize = (url: string) => url.replace(/\/$/, '');
const baseUrl = normalize(base);

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let failed = false;

  for (const route of routes) {
    const url = `${baseUrl}${route.startsWith('/') ? '' : '/'}${route}`;
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    const consoleListener = (msg: puppeteer.ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    const pageErrorListener = (err: Error) => pageErrors.push(err.message);

    page.on('console', consoleListener);
    page.on('pageerror', pageErrorListener);

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      const status = response?.status() ?? 0;
      const okStatus = status > 0 && status < 400;

      await page.waitForSelector('#root', { timeout: 8000 });
      const locationPath = await page.evaluate(() => window.location.pathname + window.location.search);

      if (!okStatus) {
        failed = true;
        console.error(`FAIL ${route}: status ${status}`);
      } else if (consoleErrors.length || pageErrors.length) {
        failed = true;
        console.error(`FAIL ${route}: console/page errors`, { consoleErrors, pageErrors, location: locationPath });
      } else {
        console.log(`PASS ${route} -> ${locationPath} (status ${status})`);
      }
    } catch (err) {
      failed = true;
      console.error(`FAIL ${route}:`, err);
    } finally {
      page.off('console', consoleListener);
      page.off('pageerror', pageErrorListener);
    }
  }

  await browser.close();
  exit(failed ? 2 : 0);
})();
