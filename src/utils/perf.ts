import { isFeatureEnabled, type FeatureFlagKey } from '../config/featureFlags';

export type CorePerfMark = 'boot' | 'shell' | 'critical' | 'enrichment' | 'idle';
export type PerfMarkName = CorePerfMark | `custom:${string}` | `phase:${string}` | string;
export type PerfMeasureName = string;

const PERF_FLAG_KEY: FeatureFlagKey = 'performanceInstrumentation';

const hasPerformanceApi = (): boolean =>
    typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.measure === 'function';

const shouldRecord = (): boolean => hasPerformanceApi() && isFeatureEnabled(PERF_FLAG_KEY);

export const mark = (name: PerfMarkName, detail?: PerformanceMarkOptions['detail']): string | null => {
    if (!shouldRecord()) return null;
    try {
        performance.mark(name, detail !== undefined ? { detail } : undefined);
        return name;
    } catch (error) {
        console.warn('perf: mark failed', { name, error });
        return null;
    }
};

export const measure = (name: PerfMeasureName, startMark: string, endMark?: string): number | null => {
    if (!shouldRecord()) return null;
    try {
        performance.measure(name, startMark, endMark);
        const entry = performance.getEntriesByName(name, 'measure').pop();
        return entry?.duration ?? null;
    } catch (error) {
        console.warn('perf: measure failed', { name, error });
        return null;
    }
};

export const withTiming = async <T>(
    name: PerfMeasureName,
    fn: () => Promise<T> | T,
    options?: { startMark?: PerfMarkName; endMark?: PerfMarkName; detail?: PerformanceMarkOptions['detail'] },
): Promise<{ result: T; duration: number | null }> => {
    const enabled = shouldRecord();
    const startMark = options?.startMark ?? `${name}:start`;
    const endMark = options?.endMark ?? `${name}:end`;
    const startedAt = hasPerformanceApi() ? performance.now() : Date.now();

    if (enabled) {
        mark(startMark, options?.detail);
    }

    try {
        const result = await fn();
        if (enabled) {
            mark(endMark, options?.detail);
            const duration = measure(name, startMark, endMark) ?? (hasPerformanceApi() ? performance.now() - startedAt : null);
            return { result, duration };
        }
        return { result, duration: null };
    } catch (error) {
        if (enabled) {
            mark(endMark, options?.detail);
            measure(name, startMark, endMark);
        }
        throw error;
    }
};

export const clearPerfEntries = (prefix?: string): void => {
    if (!hasPerformanceApi()) return;
    const marks = performance.getEntriesByType('mark');
    const measures = performance.getEntriesByType('measure');
    marks.forEach(({ name }) => {
        if (!prefix || name.startsWith(prefix)) {
            performance.clearMarks(name);
        }
    });
    measures.forEach(({ name }) => {
        if (!prefix || name.startsWith(prefix)) {
            performance.clearMeasures(name);
        }
    });
};
