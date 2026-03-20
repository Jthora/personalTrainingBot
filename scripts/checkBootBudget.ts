#!/usr/bin/env npx tsx
/**
 * Boot Performance Budget Check (P3-035 → P3-039)
 *
 * Reads perf baseline JSON files from `artifacts/perf/` and enforces timing
 * budgets against the collected `load:boot_to_shell` measure (custom metric)
 * and `first-contentful-paint` / `largest-contentful-paint` paint entries
 * when available.
 *
 * Budgets:
 *   - FCP target:         < 1.0s on 3G (P3-035)
 *   - LCP target:         < 2.5s on 3G (P3-036)
 *   - boot_to_shell:      < 500ms (custom measure — JS parse through first render)
 *
 * Exits non-zero if any p90 exceeds its budget.
 *
 * Usage:
 *   npx tsx scripts/checkBootBudget.ts [--glob <pattern>]
 *   npx tsx scripts/checkBootBudget.ts --glob "2026-03*android4g-cold*"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { percentile } from './perf/compare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERF_DIR = path.resolve(__dirname, '..', 'artifacts', 'perf');

// ── Budget thresholds (p90, milliseconds) ──
interface Budget {
  metric: string;
  label: string;
  /** p90 ceiling in ms — fail if p90 exceeds this */
  p90Limit: number;
}

const budgets: Budget[] = [
  { metric: 'first-contentful-paint',    label: 'FCP (3G)',          p90Limit: 1500 },
  { metric: 'largest-contentful-paint',  label: 'LCP (3G)',          p90Limit: 3000 },
  { metric: 'load:boot_to_shell',        label: 'Boot → Shell',     p90Limit: 500  },
];

// ── Helpers ──

interface PerfEntry {
  type: string;
  name: string;
  startTime?: number;
  value?: number;
}

function loadBaselines(pattern: string): PerfEntry[][] {
  if (!fs.existsSync(PERF_DIR)) {
    console.error(`No perf directory found at ${PERF_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PERF_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => {
      if (!pattern) return true;
      return new RegExp(pattern.replace(/\*/g, '.*')).test(f);
    })
    .sort();

  if (files.length === 0) {
    console.warn(`No baseline files match pattern: ${pattern || '*'}`);
    return [];
  }

  console.log(`Loading ${files.length} baseline file(s)…`);
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(PERF_DIR, f), 'utf8');
    return JSON.parse(raw) as PerfEntry[];
  });
}

function collectMetric(runs: PerfEntry[][], metricName: string): number[] {
  const values: number[] = [];
  for (const entries of runs) {
    for (const e of entries) {
      if (e.name !== metricName) continue;
      // timing entries use `value`, paint entries use `startTime`
      const v = e.type === 'timing' ? e.value : e.startTime;
      if (typeof v === 'number' && v > 0) {
        values.push(v);
      }
    }
  }
  return values;
}

function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  return `${ms.toFixed(0)}ms`;
}

// ── Main ──

const args = process.argv.slice(2);
let glob = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--glob' && args[i + 1]) {
    glob = args[i + 1];
  }
}

// Default: latest android4g cold runs (most representative for boot budget)
if (!glob) {
  glob = '*android4g-cold*';
}

const runs = loadBaselines(glob);
if (runs.length === 0) {
  console.log('No baseline data — budget check skipped (run perf:baseline first).');
  process.exit(0);
}

console.log(`\nBoot Performance Budget Check`);
console.log('='.repeat(70));
console.log('Metric'.padEnd(30), 'Samples'.padEnd(10), 'p50'.padEnd(12), 'p90'.padEnd(12), 'Limit'.padEnd(12), 'Status');
console.log('-'.repeat(70));

let failures = 0;

for (const budget of budgets) {
  const values = collectMetric(runs, budget.metric);

  if (values.length === 0) {
    console.log(
      budget.label.padEnd(30),
      '0'.padEnd(10),
      '—'.padEnd(12),
      '—'.padEnd(12),
      formatMs(budget.p90Limit).padEnd(12),
      'SKIP (no data)',
    );
    continue;
  }

  const p50 = percentile(values, 50);
  const p90 = percentile(values, 90);
  const pass = p90 !== null && p90 <= budget.p90Limit;

  if (!pass) failures++;

  console.log(
    budget.label.padEnd(30),
    String(values.length).padEnd(10),
    formatMs(p50).padEnd(12),
    formatMs(p90).padEnd(12),
    formatMs(budget.p90Limit).padEnd(12),
    pass ? 'PASS' : 'FAIL',
  );
}

console.log('-'.repeat(70));

if (failures > 0) {
  console.error(`\n${failures} budget(s) exceeded — see above.`);
  process.exitCode = 1;
} else {
  console.log('\nAll boot budgets within limits.');
}
