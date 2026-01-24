import { isFeatureEnabled, type FeatureFlagKey } from '../config/featureFlags';
import { recordMetric } from './metrics';

export type CacheMetricStatus = 'hit' | 'miss' | 'stale' | 'write' | 'clear' | 'invalid';

export interface CacheMetricPayload {
    [key: string]: unknown;
    dataset: string;
    status: CacheMetricStatus;
    source?: 'localStorage' | 'memory' | string;
    ageMs?: number | null;
    sizeBytes?: number;
    reason?: string;
}

const FLAG_KEY: FeatureFlagKey = 'performanceInstrumentation';

const log = (payload: CacheMetricPayload) => {
    if (!isFeatureEnabled(FLAG_KEY)) return;
    recordMetric('cache_event', payload);
    if (typeof console !== 'undefined' && console.debug) {
        console.debug('[cache]', payload);
    }
};

export const emitCacheMetric = (payload: CacheMetricPayload): void => {
    try {
        log(payload);
    } catch (error) {
        console.warn('cacheMetrics: failed to emit cache metric', { payload, error });
    }
};
