import { describe, expect, it } from 'vitest';
import { compare, percentile, summarize } from './compare.js';

const sampleEvents = [
    { type: 'timing', name: 'load:boot_to_shell', value: 1200 },
    { type: 'timing', name: 'load:boot_to_shell', value: 800 },
    { type: 'timing', name: 'load:boot_to_shell', value: 1000 },
    { type: 'timing', name: 'load:critical_to_enrichment', value: 500 },
    { type: 'timing', name: 'load:critical_to_enrichment', value: 700 },
];

describe('perf compare script helpers', () => {
    it('computes percentile with interpolation', () => {
        expect(percentile([1, 2, 3, 4], 50)).toBe(2.5);
        expect(percentile([1, 2, 3, 4], 90)).toBeCloseTo(3.7, 1);
        expect(percentile([], 50)).toBeNull();
    });

    it('summarizes timing events by name', () => {
        const summary = summarize(sampleEvents);
        const boot = summary.find(s => s.name === 'load:boot_to_shell');
        expect(boot?.count).toBe(3);
        expect(boot?.p50).toBe(1000);
        expect(boot?.p90).toBeCloseTo(1160);
    });

    it('compares baseline and candidate summaries', () => {
        const baseline = summarize(sampleEvents);
        const candidate = summarize([
            { type: 'timing', name: 'load:boot_to_shell', value: 900 },
            { type: 'timing', name: 'load:boot_to_shell', value: 1100 },
            { type: 'timing', name: 'load:boot_to_shell', value: 1300 },
        ]);
        const rows = compare(baseline, candidate);
        const boot = rows.find(r => r.name === 'load:boot_to_shell');
        expect(boot?.baseline_p50).toBe(1000);
        expect(boot?.candidate_p50).toBe(1100);
        expect(boot?.delta_p50).toBe(100);
        expect(boot?.delta_p50_pct).toBeCloseTo(10);
    });
});
