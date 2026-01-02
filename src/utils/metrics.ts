export type MetricEvent =
    | 'schedule_empty_generated'
    | 'schedule_load_success'
    | 'schedule_load_failure'
    | 'schedule_generation_success'
    | 'schedule_generation_failure'
    | 'workout_completed'
    | 'workout_skipped';

interface MetricPayload {
    name: MetricEvent;
    data?: Record<string, unknown>;
    timestamp: string;
}

const STORAGE_KEY = 'trainingMetrics';
const MAX_EVENTS = 200;

export const nowMs = (): number => {
    if (typeof performance !== 'undefined' && performance.now) return performance.now();
    return Date.now();
};

export const recordMetric = (name: MetricEvent, data?: Record<string, unknown>) => {
    const payload: MetricPayload = {
        name,
        data,
        timestamp: new Date().toISOString(),
    };

    try {
        console.info('[metrics]', payload);

        if (typeof localStorage === 'undefined') {
            return;
        }

        const existingRaw = localStorage.getItem(STORAGE_KEY);
        const existing: MetricPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(payload);

        if (existing.length > MAX_EVENTS) {
            existing.splice(0, existing.length - MAX_EVENTS);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
        console.warn('Metrics: Failed to record metric event', { name, data, error });
    }
};
