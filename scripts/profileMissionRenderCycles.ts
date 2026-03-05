#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

type ProfileAggregate = {
  id: string;
  renderCount: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  maxActualDuration: number;
  lastPhase: 'mount' | 'update' | 'nested-update';
  lastActualDuration: number;
  lastBaseDuration: number;
};

type ProfileSummary = {
  id: string;
  renderCount: number;
  avgActualDurationMs: number;
  maxActualDurationMs: number;
  totalActualDurationMs: number;
  totalBaseDurationMs: number;
  lastPhase: ProfileAggregate['lastPhase'];
};

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split('=');
  if (key && value) args.set(key.replace(/^--/, ''), value);
}

const base = args.get('base') ?? process.env.BASE_URL;
const outputPath = args.get('output') ?? 'artifacts/mission-render-profile-report.json';

if (!base) {
  console.error('Usage: npx tsx scripts/profileMissionRenderCycles.ts --base=http://localhost:4173 [--output=artifacts/mission-render-profile-report.json]');
  process.exit(1);
}

const normalizeBase = (value: string) => value.replace(/\/$/, '');
const missionContextQuery = 'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

const withMissionContext = (route: string): string => {
  if (route.includes('?')) {
    return `${route}&${missionContextQuery}`;
  }
  return `${route}?${missionContextQuery}`;
};

const round = (value: number): number => Number(value.toFixed(3));

const buildSummary = (raw: Record<string, ProfileAggregate>): ProfileSummary[] =>
  Object.values(raw)
    .map((entry) => ({
      id: entry.id,
      renderCount: entry.renderCount,
      avgActualDurationMs: entry.renderCount ? round(entry.totalActualDuration / entry.renderCount) : 0,
      maxActualDurationMs: round(entry.maxActualDuration),
      totalActualDurationMs: round(entry.totalActualDuration),
      totalBaseDurationMs: round(entry.totalBaseDuration),
      lastPhase: entry.lastPhase,
    }))
    .sort((a, b) => b.totalActualDurationMs - a.totalActualDurationMs);

const formatMs = (value: number): string => `${value.toFixed(2)} ms`;

const mergeProfiles = (
  current: Record<string, ProfileAggregate>,
  next: Record<string, ProfileAggregate>,
): Record<string, ProfileAggregate> => {
  const merged: Record<string, ProfileAggregate> = { ...current };

  Object.entries(next).forEach(([id, entry]) => {
    const existing = merged[id];
    if (!existing) {
      merged[id] = { ...entry };
      return;
    }

    merged[id] = {
      ...existing,
      renderCount: existing.renderCount + entry.renderCount,
      totalActualDuration: existing.totalActualDuration + entry.totalActualDuration,
      totalBaseDuration: existing.totalBaseDuration + entry.totalBaseDuration,
      maxActualDuration: Math.max(existing.maxActualDuration, entry.maxActualDuration),
      lastPhase: entry.lastPhase,
      lastActualDuration: entry.lastActualDuration,
      lastBaseDuration: entry.lastBaseDuration,
    };
  });

  return merged;
};

async function exerciseTriageRoute(page: puppeteer.Page, baseUrl: string) {
  await page.goto(`${baseUrl}${withMissionContext('/mission/triage')}`, {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector('section[aria-label="Triage board"]', { timeout: 30_000 });

  const firstCard = await page.$('section[aria-label="Triage board"] li button');
  if (firstCard) {
    await firstCard.click();
    await page.keyboard.press('A');
    await page.keyboard.press('E');
  }

  const allButtons = await page.$$('button');
  for (const button of allButtons) {
    const text = await page.evaluate((el) => el.textContent ?? '', button);
    if (text.trim() === 'Feed') {
      await button.click();
      break;
    }
  }
}

async function exerciseCaseRoute(page: puppeteer.Page, baseUrl: string) {
  await page.goto(`${baseUrl}${withMissionContext('/mission/case')}`, {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector('section[aria-label="Artifact list"]', { timeout: 30_000 });

  const search = await page.$('input[aria-label="Search artifacts"]');
  if (search) {
    await search.type('alpha');
    await search.click({ clickCount: 3 });
    await search.press('Backspace');
  }

  const firstArtifact = await page.$('ul[aria-label="Case artifacts list"] li button');
  if (firstArtifact) {
    await firstArtifact.click();
  }

  const markReviewed = await page.$('button[aria-label^="Mark "]');
  if (markReviewed) {
    await markReviewed.click();
  }
}

async function readProfile(page: puppeteer.Page): Promise<Record<string, ProfileAggregate>> {
  return page.evaluate(() => {
    const globalWindow = window as unknown as Record<string, unknown>;
    const raw = globalWindow.__MISSION_RENDER_PROFILE__;
    if (!raw || typeof raw !== 'object') return {};
    return raw as Record<string, ProfileAggregate>;
  });
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    const globalWindow = window as unknown as Record<string, unknown>;
    globalWindow.__MISSION_RENDER_PROFILE_ENABLED__ = true;
    globalWindow.__MISSION_RENDER_PROFILE__ = {};
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

  const baseUrl = normalizeBase(base);

  try {
    let mergedProfile: Record<string, ProfileAggregate> = {};
    const warnings: string[] = [];

    try {
      await exerciseTriageRoute(page, baseUrl);
      mergedProfile = mergeProfiles(mergedProfile, await readProfile(page));
    } catch (error) {
      const message = `triage route profile skipped: ${(error as Error).message}`;
      warnings.push(message);
      console.warn(`[mission-render-profile] ${message}`);
    }

    try {
      await exerciseCaseRoute(page, baseUrl);
      mergedProfile = mergeProfiles(mergedProfile, await readProfile(page));
    } catch (error) {
      const message = `case route profile skipped: ${(error as Error).message}`;
      warnings.push(message);
      console.warn(`[mission-render-profile] ${message}`);
    }

    const summary = buildSummary(mergedProfile);

    const artifact = {
      generatedAt: new Date().toISOString(),
      base: baseUrl,
      summary,
      raw: mergedProfile,
      warnings,
    };

    const absoluteOutput = path.resolve(process.cwd(), outputPath);
    fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
    fs.writeFileSync(absoluteOutput, JSON.stringify(artifact, null, 2), 'utf8');

    console.info('\nMission render profile report');
    console.info('Component'.padEnd(34), 'Renders'.padEnd(10), 'Avg'.padEnd(12), 'Max'.padEnd(12), 'Total');
    console.info('-'.repeat(88));
    summary.forEach((entry) => {
      console.info(
        entry.id.padEnd(34),
        String(entry.renderCount).padEnd(10),
        formatMs(entry.avgActualDurationMs).padEnd(12),
        formatMs(entry.maxActualDurationMs).padEnd(12),
        formatMs(entry.totalActualDurationMs),
      );
    });

    console.info(`\nSaved report to ${absoluteOutput}`);
  } finally {
    await browser.close();
  }
}

main();
