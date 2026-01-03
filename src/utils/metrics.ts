export type MetricEvent =
    | 'schedule_empty_generated'
    | 'schedule_load_success'
    | 'schedule_load_failure'
    | 'schedule_generation_success'
    | 'schedule_generation_failure'
    | 'workout_completed'
    | 'workout_skipped'
    | 'progress_event_completion'
    | 'progress_event_non_completion'
    | 'progress_event_schedule_set'
    | 'alignment_check_pass'
    | 'alignment_check_warn'
    | 'alignment_warning_surface'
    | 'alignment_warning_resolved'
    | 'alignment_warning_ignored'
    | 'preview_drawer_open'
    | 'preview_drawer_close'
    | 'preview_drawer_reorder'
    | 'preview_drawer_replace'
    | 'preview_drawer_apply'
    | 'recap_modal_open'
    | 'recap_modal_dismiss'
    | 'recap_modal_cta'
    | 'recap_modal_share_copy'
    | 'recap_toast_impression'
    | 'recap_toast_dismiss'
    | 'recap_toast_cta'
    | 'selection_summary_debounce_hit'
    | 'selection_summary_debounce_miss'
    | 'alignment_check_debounce_hit'
    | 'alignment_check_debounce_miss'
    | 'store_reset_drift'
    | 'challenge_completed'
    | 'challenge_expired'
    | 'challenge_claimed'
    | 'copy_variant_served'
    | 'copy_variant_impression'
    | 'copy_variant_interaction';

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
