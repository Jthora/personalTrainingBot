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
  console.error('Usage: npx tsx scripts/checkDeepLinksOffline.ts --base=http://localhost:4173');
  exit(1);
}

const routes = [
  '/',
  '/home',
  '/home/plan',
  '/home/cards',
  '/home/progress',
  '/home/handler',
  '/home/settings',
  '/mission/brief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/triage?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/case?op=op-operation-bravo&case=case-bravo-signal-cascade&signal=signal-bravo-route-hijack',
  '/mission/signal?op=op-operation-charlie&case=case-charlie-artifact-chain&signal=signal-charlie-chain-gap',
  '/mission/checklist?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/debrief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge',
  '/mission/brief?op=op-missing&case=case-missing&signal=sig-missing',
  '/training',
  '/training/run',
  '/c/demo-slug?source=test',
  '/share/demo-slug',
];

const normalize = (url: string) => url.replace(/\/$/, '');
const baseUrl = normalize(base);

const legacyTaxonomyLabels = ['Mission Kit', 'Drills/Intel', 'Signals/Ops Brief', 'Ops/Settings'];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let failed = false;

  try {
    // Go online to register SW and warm caches
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => navigator.serviceWorker?.ready, { timeout: 10000 });

    // Warm manifest/shard explicitly
    await page.evaluate(async () => {
      await Promise.all([
        fetch('/training_modules_manifest.json', { cache: 'reload' }).catch(() => null),
        fetch('/training_modules_shards/fitness.json', { cache: 'reload' }).catch(() => null),
      ]);
    });

    // Warm navigations to seed route caches
    for (const route of routes) {
      const url = `${baseUrl}${route.startsWith('/') ? '' : '/'}${route}`;
      await page.goto(url, { waitUntil: 'networkidle2' }).catch(() => null);
    }

    await page.setOfflineMode(true);

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
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch((err) => {
          consoleErrors.push(String(err));
          return null;
        });
        const status = response?.status?.() ?? 0;
        const hasRoot = await page.evaluate(() => Boolean(document.getElementById('root')));
        const offlineReported = await page.evaluate(() => navigator.onLine === false);
        const locationPath = await page.evaluate(() => window.location.pathname + window.location.search);
        if (route.startsWith('/mission/')) {
          await page.waitForFunction(
            () => {
              const text = document.body?.innerText ?? '';
              return text.includes('Current Step:') && text.includes('Next Step:');
            },
            { timeout: 8000 },
          ).catch(() => null);
        }

        const navCoherence = await page.evaluate(
          ({ legacyLabels }) => {
            const text = document.body?.innerText ?? '';
            const hasCurrentStep = text.includes('Current Step:');
            const hasNextStep = text.includes('Next Step:');
            const foundLegacyLabels = legacyLabels.filter((label) => text.includes(label));
            return {
              hasCurrentStep,
              hasNextStep,
              foundLegacyLabels,
            };
          },
          { legacyLabels: legacyTaxonomyLabels },
        );

        if (!hasRoot || consoleErrors.length || pageErrors.length) {
          failed = true;
          console.error('FAIL offline', route, { status, location: locationPath, consoleErrors, pageErrors, offline: offlineReported, hasRoot });
        } else if (
          route.startsWith('/mission/')
          && (!navCoherence.hasCurrentStep || !navCoherence.hasNextStep || navCoherence.foundLegacyLabels.length)
        ) {
          failed = true;
          console.error('FAIL offline nav coherence', route, {
            status,
            location: locationPath,
            offline: offlineReported,
            ...navCoherence,
          });
        } else {
          if (!offlineReported) {
            console.warn(`WARN offline flag reported online for ${route}`);
          }
          console.log(`PASS offline ${route} -> ${locationPath} (status ${status || 'cached'})`);
        }
      } finally {
        page.off('console', consoleListener);
        page.off('pageerror', pageErrorListener);
      }
    }
  } catch (err) {
    failed = true;
    console.error('FAIL offline deep-links setup:', err);
  } finally {
    await browser.close();
    exit(failed ? 2 : 0);
  }
})();
