import fs from 'fs';
import path from 'path';
import { chromium, Browser, Page } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const OUTPUT_PATH = process.env.TELEMETRY_OUT ?? 'artifacts/telemetry-headless.json';
const MISSION_CONTEXT_QUERY = 'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

const withMissionContext = (routePath: string): string => {
  if (routePath.includes('?')) {
    return `${routePath}&${MISSION_CONTEXT_QUERY}`;
  }
  return `${routePath}?${MISSION_CONTEXT_QUERY}`;
};

async function safeClick(locator: ReturnType<Page['locator']>, description: string) {
  try {
    const handle = locator.first();
    await handle.waitFor({ state: 'visible', timeout: 15000 });
    await handle.scrollIntoViewIfNeeded();
    await handle.click({ timeout: 15000, trial: false });
  } catch (err) {
    console.warn(`[telemetry-trigger] skip ${description}: ${(err as Error).message}`);
  }
}

async function navigateAndWait(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

async function safeFill(locator: ReturnType<Page['locator']>, value: string, description: string) {
  try {
    const handle = locator.first();
    await handle.waitFor({ state: 'visible', timeout: 15000 });
    await handle.fill(value, { timeout: 15000 });
  } catch (err) {
    console.warn(`[telemetry-trigger] skip ${description}: ${(err as Error).message}`);
  }
}

async function triggerFlows(page: Page) {
  // Seed mission continuity context for gated signal/AAR surfaces
  await navigateAndWait(page, withMissionContext('/mission/brief'));
  await navigateAndWait(page, withMissionContext('/mission/signal'));

  // Readiness actions
  await navigateAndWait(page, withMissionContext('/home/plan'));
  await safeClick(page.getByRole('button', { name: /Next/i }).nth(0), 'readiness action');

  // Signals add/ack/resolve
  await navigateAndWait(page, withMissionContext('/mission/signal'));
  await safeFill(page.locator('input[placeholder="Signal title"]'), 'Headless signal', 'signal title');
  await safeFill(page.locator('textarea[placeholder="What changed, who needs to know"]'), 'Triggered in CI', 'signal detail');
  await safeClick(page.getByRole('button', { name: 'Add signal' }), 'add signal');
  await safeClick(page.getByRole('button', { name: /^Resolve$/ }), 'resolve signal');

  // AAR save/export
  await safeClick(page.getByRole('button', { name: 'Save locally' }), 'save AAR');
  await safeClick(page.getByRole('button', { name: 'Export JSON' }), 'export AAR');

  // Settings preload toggle
  await navigateAndWait(page, withMissionContext('/home/settings'));
  await safeClick(page.getByRole('button', { name: 'Preload now' }), 'preload start');
}

async function main() {
  const browser: Browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('featureFlagOverrides', JSON.stringify({
        missionDefaultRoutes: true,
        missionSurfaceBrief: true,
        missionSurfaceTriage: true,
        missionSurfaceCase: true,
        missionSurfaceSignal: true,
        missionSurfaceChecklist: true,
        missionSurfaceDebrief: true,
      }));
      window.localStorage.setItem('ptb:mission-flow-context', JSON.stringify({
        operationId: 'op-operation-alpha',
        caseId: 'case-alpha-relay-corridor',
        signalId: 'signal-alpha-beacon-surge',
        updatedAt: Date.now(),
      }));
    } catch {
      // ignore init storage failures
    }
  });

  try {
    await triggerFlows(page);
    const events = await page.evaluate(() => {
      try {
        const raw = window.localStorage.getItem('ptb:telemetry-buffer');
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        return [];
      }
    });

    try {
      const full = path.resolve(process.cwd(), OUTPUT_PATH);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, JSON.stringify(events, null, 2), 'utf8');
      console.info(`[telemetry-trigger] wrote ${events.length} event(s) to ${full}`);
    } catch (err) {
      console.warn(`[telemetry-trigger] failed to write buffer: ${(err as Error).message}`);
    }

    console.info('[telemetry-trigger] flows executed');
  } catch (err) {
    console.error('[telemetry-trigger] failure', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
