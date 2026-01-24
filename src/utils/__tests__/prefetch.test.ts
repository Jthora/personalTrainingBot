import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { prefetchOnIdle } from '../prefetch';

describe('prefetchOnIdle', () => {
    let originalRIC: any;
    let originalNavigator: any;

    beforeEach(() => {
        vi.useFakeTimers();
    originalRIC = (globalThis as any).requestIdleCallback;
    originalNavigator = (globalThis as any).navigator;
    });

    afterEach(() => {
        vi.useRealTimers();
        (globalThis as any).requestIdleCallback = originalRIC;
        (globalThis as any).navigator = originalNavigator;
    });

    it('skips when saveData is true', () => {
        const logger = vi.fn();
        (globalThis as any).navigator = { connection: { saveData: true, effectiveType: '4g' } };
        const cancel = prefetchOnIdle([() => Promise.resolve()], { logger });
        vi.runAllTimers();
        expect(logger).toHaveBeenCalledWith('prefetch: skipped due to connection guard (saveData=true, effectiveType=4g)');
        cancel();
    });

    it('runs loaders on idle when connection allowed', async () => {
        const logger = vi.fn();
        const loader = vi.fn().mockResolvedValue(undefined);

        (globalThis as any).navigator = { connection: { saveData: false, effectiveType: '4g' } };
        (globalThis as any).requestIdleCallback = (cb: () => void) => {
            cb();
            return 1 as any;
        };

        prefetchOnIdle([loader], { logger, timeoutMs: 50 });
        await vi.runAllTimersAsync();

        expect(loader).toHaveBeenCalledTimes(1);
        expect(logger).not.toHaveBeenCalledWith(expect.stringContaining('skipped'));
    });
});
