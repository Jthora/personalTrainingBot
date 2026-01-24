#!/usr/bin/env node
import fs from 'fs';

export function percentile(values, p) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const rank = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    if (lower === upper) return sorted[lower];
    const weight = rank - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function summarize(events) {
    const buckets = new Map();
    for (const event of events) {
        if (!event || event.type !== 'timing') continue;
        const list = buckets.get(event.name) ?? [];
        if (typeof event.value === 'number') {
            list.push(event.value);
        }
        buckets.set(event.name, list);
    }

    return Array.from(buckets.entries()).map(([name, values]) => ({
        name,
        count: values.length,
        p50: percentile(values, 50),
        p90: percentile(values, 90),
    }));
}

export function compare(baselineSummary, candidateSummary) {
    const byName = new Map();
    for (const row of baselineSummary) byName.set(row.name, { baseline: row });
    for (const row of candidateSummary) {
        const existing = byName.get(row.name) ?? {};
        existing.candidate = row;
        byName.set(row.name, existing);
    }

    return Array.from(byName.entries()).map(([name, { baseline, candidate }]) => {
        const delta = (field) => {
            if (!baseline?.[field] || !candidate?.[field]) return null;
            return candidate[field] - baseline[field];
        };
        const deltaPct = (field) => {
            if (!baseline?.[field] || !candidate?.[field]) return null;
            return ((candidate[field] - baseline[field]) / baseline[field]) * 100;
        };

        return {
            name,
            baseline_p50: baseline?.p50 ?? null,
            candidate_p50: candidate?.p50 ?? null,
            delta_p50: delta('p50'),
            delta_p50_pct: deltaPct('p50'),
            baseline_p90: baseline?.p90 ?? null,
            candidate_p90: candidate?.p90 ?? null,
            delta_p90: delta('p90'),
            delta_p90_pct: deltaPct('p90'),
            baseline_count: baseline?.count ?? 0,
            candidate_count: candidate?.count ?? 0,
        };
    });
}

function loadEvents(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error(`Expected array of events in ${filePath}`);
    }
    return parsed;
}

function printTable(rows) {
    console.table(
        rows.map(row => ({
            name: row.name,
            baseline_p50: row.baseline_p50?.toFixed?.(2) ?? row.baseline_p50,
            candidate_p50: row.candidate_p50?.toFixed?.(2) ?? row.candidate_p50,
            delta_p50: row.delta_p50?.toFixed?.(2) ?? row.delta_p50,
            delta_p50_pct: row.delta_p50_pct?.toFixed?.(1) ?? row.delta_p50_pct,
            baseline_p90: row.baseline_p90?.toFixed?.(2) ?? row.baseline_p90,
            candidate_p90: row.candidate_p90?.toFixed?.(2) ?? row.candidate_p90,
            delta_p90: row.delta_p90?.toFixed?.(2) ?? row.delta_p90,
            delta_p90_pct: row.delta_p90_pct?.toFixed?.(1) ?? row.delta_p90_pct,
            baseline_count: row.baseline_count,
            candidate_count: row.candidate_count,
        })),
    );
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const [baselinePath, candidatePath] = process.argv.slice(2);
    if (!baselinePath || !candidatePath) {
        console.error('Usage: node scripts/perf/compare.js <baseline.json> <candidate.json>');
        process.exit(1);
    }

    const baseline = summarize(loadEvents(baselinePath));
    const candidate = summarize(loadEvents(candidatePath));
    const rows = compare(baseline, candidate);
    printTable(rows);
}
