import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withCache, clearAll } from '../indexedDbCache';
import { TTL_MS } from '../constants';

describe('withCache', () => {
    beforeEach(async () => {
        localStorage.clear();
        await clearAll();
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns cached data when within TTL', async () => {
        const loader = vi.fn(async () => 'fresh-data');

        const first = await withCache('moduleCatalog', 'all', TTL_MS.moduleCatalog, 'sig', loader);
        expect(first.source).toBe('network');
        expect(loader).toHaveBeenCalledTimes(1);

        vi.setSystemTime(TTL_MS.moduleCatalog - 1000);
        const second = await withCache('moduleCatalog', 'all', TTL_MS.moduleCatalog, 'sig', loader);
        expect(second.source).toBe('cache');
        expect(second.data).toBe('fresh-data');
        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('serves stale data and triggers refresh when expired and allowStale', async () => {
        let counter = 0;
        const loader = vi.fn(async () => {
            counter += 1;
            return `value-${counter}`;
        });

        const first = await withCache('moduleCatalog', 'all', 1000, 'sig', loader);
        expect(first.source).toBe('network');

        vi.setSystemTime(5000);
        const second = await withCache('moduleCatalog', 'all', 1000, 'sig', loader, { allowStale: true });
        expect(second.source).toBe('stale-cache');
        expect(second.data).toBe('value-1');

        // allow background refresh promise to resolve
        await Promise.resolve();
        expect(loader).toHaveBeenCalledTimes(2);
    });
});
