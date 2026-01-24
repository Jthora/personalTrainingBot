import { describe, expect, it, vi } from 'vitest';
import * as featureFlags from '../../config/featureFlags';
import * as metrics from '../metrics';
import { emitCacheMetric } from '../cacheMetrics';

const enablePerfFlag = (enabled: boolean) => vi.spyOn(featureFlags, 'isFeatureEnabled').mockReturnValue(enabled);

describe('cacheMetrics', () => {
    it('records cache_event when feature flag is enabled', () => {
        enablePerfFlag(true);
        const spy = vi.spyOn(metrics, 'recordMetric');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'hit', source: 'localStorage' });
        expect(spy).toHaveBeenCalledWith('cache_event', expect.objectContaining({ dataset: 'workout_schedule', status: 'hit' }));
    });

    it('no-ops when feature flag is disabled', () => {
        enablePerfFlag(false);
        const spy = vi.spyOn(metrics, 'recordMetric');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'miss', source: 'localStorage' });
        expect(spy).not.toHaveBeenCalled();
    });
});
