import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as featureFlags from '../../config/featureFlags';
import { clearPerfEntries, mark, measure, withTiming } from '../perf';

const enablePerfFlag = (enabled: boolean) => vi.spyOn(featureFlags, 'isFeatureEnabled').mockReturnValue(enabled);

describe('perf helper', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        clearPerfEntries();
    });

    it('no-ops when feature flag is disabled', async () => {
        enablePerfFlag(false);
        const markSpy = vi.spyOn(performance, 'mark');
        const measureSpy = vi.spyOn(performance, 'measure');

        expect(mark('boot')).toBeNull();
        expect(measure('test', 'start', 'end')).toBeNull();

        const { result, duration } = await withTiming('disabled', () => 5);
        expect(result).toBe(5);
        expect(duration).toBeNull();

        expect(markSpy).not.toHaveBeenCalled();
        expect(measureSpy).not.toHaveBeenCalled();
    });

    it('marks and measures when enabled', async () => {
        enablePerfFlag(true);
        const { result, duration } = await withTiming('compute', () => 10, { detail: { source: 'test' } });

        expect(result).toBe(10);
        expect(duration).not.toBeNull();
        const measures = performance.getEntriesByName('compute', 'measure');
        expect(measures.length).toBeGreaterThan(0);
        expect(measures[measures.length - 1]?.duration).toBeGreaterThanOrEqual(0);
    });

    it('records measure even when the wrapped function throws', async () => {
        enablePerfFlag(true);
        await expect(withTiming('failure', () => {
            throw new Error('boom');
        })).rejects.toThrow('boom');

        const measures = performance.getEntriesByName('failure', 'measure');
        expect(measures.length).toBeGreaterThan(0);
    });
});
