#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';

type Checkpoint = {
  name: string;
  status: 'pass' | 'fail';
  detail?: string;
};

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const BASE_URL = args.get('base') ?? process.env.BASE_URL ?? 'http://localhost:4173';
const REPORT_OUT = args.get('report') ?? process.env.SCENARIO_REPORT ?? 'artifacts/psi-operative-scenario-report.json';
const VIEWPORT_WIDTH = Number(args.get('width') ?? process.env.SCENARIO_VIEWPORT_WIDTH ?? '390');
const VIEWPORT_HEIGHT = Number(args.get('height') ?? process.env.SCENARIO_VIEWPORT_HEIGHT ?? '844');
const MISSION_CONTEXT_QUERY = 'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

const withMissionContext = (routePath: string): string => {
  if (routePath.includes('?')) {
    return `${routePath}&${MISSION_CONTEXT_QUERY}`;
  }
  return `${routePath}?${MISSION_CONTEXT_QUERY}`;
};

const checkpoints: Checkpoint[] = [];

function record(name: string, status: 'pass' | 'fail', detail?: string) {
  checkpoints.push({ name, status, detail });
  const icon = status === 'pass' ? 'PASS' : 'FAIL';
  if (status === 'pass') {
    console.info(`[psi-sim] ${icon} ${name}${detail ? `: ${detail}` : ''}`);
  } else {
    console.error(`[psi-sim] ${icon} ${name}${detail ? `: ${detail}` : ''}`);
  }
}

async function expectVisible(page: Page, label: string, text: RegExp | string) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  record(label, 'pass');
}

async function clickByRole(page: Page, role: 'button' | 'link', name: RegExp | string, label: string) {
  const locator = page.getByRole(role, { name }).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click({ timeout: 15000 });
  record(label, 'pass');
}

async function gotoMission(page: Page, routePath: string) {
  await page.goto(`${BASE_URL}${withMissionContext(routePath)}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#root', { timeout: 15000 });
}

async function assertPath(page: Page, expectedPath: string, label: string) {
  const actualPath = await page.evaluate(() => window.location.pathname);
  if (actualPath !== expectedPath) {
    throw new Error(`${label}: expected ${expectedPath}, got ${actualPath}`);
  }
  record(label, 'pass', actualPath);
}

async function runScenario(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem('mission:intake:v1');
      window.localStorage.removeItem('mission:guidance-overlay:v1');
      window.localStorage.removeItem('mission:step-complete:v1');
      window.localStorage.setItem('ptb:mission-flow-context', JSON.stringify({
        operationId: 'op-operation-alpha',
        caseId: 'case-alpha-relay-corridor',
        signalId: 'signal-alpha-beacon-surge',
        updatedAt: Date.now(),
      }));
    } catch {
      // noop
    }
  });

  await gotoMission(page, '/mission/brief');
  await expectVisible(page, 'Intake panel visible', /Psi Operative Super Hero Cyber Investigator Training/i);
  await clickByRole(page, 'button', /Start Briefing/i, 'Start briefing clicked');

  await expectVisible(page, 'Brief step cue rendered', /Current Step:/i);
  await expectVisible(page, 'Guidance card rendered', /Operator Assistant/i);
  await clickByRole(page, 'button', /Mark Step Complete|✓ Step Complete/i, 'Brief marked complete');
  await clickByRole(page, 'button', /Continue to Triage/i, 'Advanced to triage');
  await assertPath(page, '/mission/triage', 'At triage route');

  await expectVisible(page, 'Triage handoff visible', /Why this step matters/i);
  await clickByRole(page, 'button', /Mark Step Complete|✓ Step Complete/i, 'Triage marked complete');
  await clickByRole(page, 'button', /Continue to Case/i, 'Advanced to case');
  await assertPath(page, '/mission/case', 'At case route');

  await expectVisible(page, 'Case handoff visible', /Inputs required/i);
  await clickByRole(page, 'button', /Mark Step Complete|✓ Step Complete/i, 'Case marked complete');
  await clickByRole(page, 'button', /Continue to Signal/i, 'Advanced to signal');
  await assertPath(page, '/mission/signal', 'At signal route');

  const signalTitle = page.locator('input[placeholder="Signal title"]').first();
  await signalTitle.waitFor({ state: 'visible', timeout: 15000 });
  await signalTitle.fill('Scenario Signal');
  const signalDetail = page.locator('textarea[placeholder="What changed, who needs to know"]').first();
  await signalDetail.fill('Generated during Psi Operative journey simulation.');
  record('Signal form filled', 'pass');
  await clickByRole(page, 'button', /Add signal/i, 'Signal added');

  await clickByRole(page, 'button', /Mark Step Complete|✓ Step Complete/i, 'Signal marked complete');
  await clickByRole(page, 'button', /Continue to Checklist/i, 'Advanced to checklist');
  await assertPath(page, '/mission/checklist', 'At checklist route');

  await expectVisible(page, 'Checklist title visible', /Action Checklist/i);
  await clickByRole(page, 'button', /Mark Step Complete|✓ Step Complete/i, 'Checklist marked complete');
  await clickByRole(page, 'button', /Continue to Debrief/i, 'Advanced to debrief');
  await assertPath(page, '/mission/debrief', 'At debrief route');

  await expectVisible(page, 'Debrief closure summary visible', /Closure Summary/i);
  await clickByRole(page, 'button', /Save locally/i, 'AAR save locally clicked');
  await clickByRole(page, 'button', /Export JSON/i, 'AAR export clicked');
}

function writeReport(durationMs: number, failed: boolean) {
  const summary = {
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport: {
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    },
    durationMs,
    failed,
    checkpoints,
  };

  const fullPath = path.resolve(process.cwd(), REPORT_OUT);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(summary, null, 2), 'utf8');
  console.info(`[psi-sim] wrote report to ${fullPath}`);
}

async function main() {
  const started = Date.now();
  let failed = false;
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({
      viewport: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      },
    });
    await runScenario(page);
  } catch (err) {
    failed = true;
    record('Scenario execution', 'fail', (err as Error).message);
  } finally {
    if (page) {
      await page.close().catch(() => undefined);
    }
    if (browser) {
      await browser.close().catch(() => undefined);
    }

    writeReport(Date.now() - started, failed);
    const hasCheckpointFailures = checkpoints.some((checkpoint) => checkpoint.status === 'fail');
    if (failed || hasCheckpointFailures) {
      process.exitCode = 1;
    } else {
      console.info('[psi-sim] scenario complete');
    }
  }
}

main();