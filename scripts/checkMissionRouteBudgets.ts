#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { missionRouteBudgets } from './missionRouteBudgets';

type RouteResult = {
  route: string;
  tier: string;
  transferBytes: number;
  maxTransferBytes: number;
  pass: boolean;
};

type PayloadReport = {
  generatedAt: string;
  base: string;
  routes: RouteResult[];
};

const reportPath = process.argv[2] ?? 'artifacts/mission-route-payload-report.json';

const formatKb = (value: number) => `${(value / 1024).toFixed(1)} KB`;

const main = () => {
  const fullPath = path.resolve(process.cwd(), reportPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Mission route payload report not found: ${fullPath}`);
    console.error('Run `npm run report:mission-route-payloads -- --base=http://localhost:4173` first.');
    process.exit(1);
  }

  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as PayloadReport;
  const routeMap = new Map(parsed.routes.map((route) => [route.route, route]));

  const failures: Array<{ route: string; reason: string }> = [];
  const evaluations = missionRouteBudgets.map((budget) => {
    const measured = routeMap.get(budget.route);
    if (!measured) {
      failures.push({ route: budget.route, reason: 'Missing route measurement' });
      return {
        route: budget.route,
        tier: budget.tier,
        transferBytes: 0,
        maxTransferBytes: budget.maxTransferBytes,
        pass: false,
      };
    }

    const pass = measured.transferBytes <= budget.maxTransferBytes;
    if (!pass) {
      failures.push({
        route: budget.route,
        reason: `Transfer ${formatKb(measured.transferBytes)} > budget ${formatKb(budget.maxTransferBytes)}`,
      });
    }

    return {
      route: budget.route,
      tier: budget.tier,
      transferBytes: measured.transferBytes,
      maxTransferBytes: budget.maxTransferBytes,
      pass,
    };
  });

  console.info('\nMission route payload budget guard');
  console.info('Route'.padEnd(24), 'Tier'.padEnd(16), 'Transfer'.padEnd(12), 'Budget'.padEnd(12), 'Status');
  console.info('-'.repeat(80));
  evaluations.forEach((item) => {
    console.info(
      item.route.padEnd(24),
      item.tier.padEnd(16),
      formatKb(item.transferBytes).padEnd(12),
      formatKb(item.maxTransferBytes).padEnd(12),
      item.pass ? 'PASS' : 'FAIL',
    );
  });

  if (failures.length > 0) {
    console.error(`\nMission route payload guard failed for ${failures.length} route(s):`);
    failures.forEach((failure) => {
      console.error(`- ${failure.route}: ${failure.reason}`);
    });
    process.exit(1);
  }

  console.info('\nAll mission route payload budgets passed.');
};

main();
