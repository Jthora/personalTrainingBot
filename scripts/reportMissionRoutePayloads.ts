#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { missionRouteBudgets, type MissionRouteTier } from './missionRouteBudgets';

type AssetRecord = {
  url: string;
  path: string;
  resourceType: string;
  transferSize: number;
};

type RouteReport = {
  route: string;
  tier: MissionRouteTier;
  transferBytes: number;
  maxTransferBytes: number;
  pass: boolean;
  assets: AssetRecord[];
};

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const base = args.get('base') ?? process.env.BASE_URL;
const outputPath = args.get('output') ?? 'artifacts/mission-route-payload-report.json';

if (!base) {
  console.error('Usage: npx tsx scripts/reportMissionRoutePayloads.ts --base=http://localhost:4173 [--output=artifacts/mission-route-payload-report.json]');
  process.exit(1);
}

const normalizeBase = (value: string) => value.replace(/\/$/, '');
const toRelativePath = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const shouldTrackResource = (resourceType: string, requestPath: string): boolean => {
  if (requestPath.startsWith('/@vite')) return false;
  if (requestPath.includes('hot-update')) return false;
  return ['document', 'script', 'stylesheet', 'xhr', 'fetch', 'image', 'font'].includes(resourceType);
};

const collapseByPath = (assets: AssetRecord[]): AssetRecord[] => {
  const deduped = new Map<string, AssetRecord>();
  assets.forEach((asset) => {
    const existing = deduped.get(asset.path);
    if (!existing || asset.transferSize > existing.transferSize) {
      deduped.set(asset.path, asset);
    }
  });
  return Array.from(deduped.values());
};

const formatKb = (value: number) => `${(value / 1024).toFixed(1)} KB`;

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const reports: RouteReport[] = [];

  try {
    for (const budget of missionRouteBudgets) {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      const assets: AssetRecord[] = [];

      page.on('response', async (response) => {
        const request = response.request();
        const requestPath = toRelativePath(response.url());
        const resourceType = request.resourceType();

        if (!shouldTrackResource(resourceType, requestPath)) return;

        let transferSize = 0;
        try {
          const headers = await response.headers();
          const headerLength = headers['content-length'] ? Number(headers['content-length']) : 0;
          if (Number.isFinite(headerLength) && headerLength > 0) {
            transferSize = headerLength;
          } else {
            const buffer = await response.buffer();
            transferSize = buffer.length;
          }
        } catch {
          transferSize = 0;
        }

        assets.push({
          url: response.url(),
          path: requestPath,
          resourceType,
          transferSize,
        });
      });

      const url = `${normalizeBase(base)}${budget.route}`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      const uniqueAssets = collapseByPath(assets);
      const transferBytes = uniqueAssets.reduce((sum, asset) => sum + asset.transferSize, 0);
      reports.push({
        route: budget.route,
        tier: budget.tier,
        transferBytes,
        maxTransferBytes: budget.maxTransferBytes,
        pass: transferBytes <= budget.maxTransferBytes,
        assets: uniqueAssets
          .sort((a, b) => b.transferSize - a.transferSize)
          .slice(0, 20),
      });

      await page.close();
    }
  } finally {
    await browser.close();
  }

  const outputFullPath = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(outputFullPath), { recursive: true });
  fs.writeFileSync(
    outputFullPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        base: normalizeBase(base),
        routes: reports,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.info('\nMission route payload report');
  console.info('Route'.padEnd(24), 'Tier'.padEnd(16), 'Transfer'.padEnd(12), 'Budget'.padEnd(12), 'Status');
  console.info('-'.repeat(80));
  reports.forEach((report) => {
    console.info(
      report.route.padEnd(24),
      report.tier.padEnd(16),
      formatKb(report.transferBytes).padEnd(12),
      formatKb(report.maxTransferBytes).padEnd(12),
      report.pass ? 'PASS' : 'FAIL',
    );
  });
  console.info(`\nSaved report to ${outputFullPath}`);
}

main();
