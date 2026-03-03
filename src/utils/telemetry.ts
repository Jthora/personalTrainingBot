type TelemetryEvent =
    | { type: 'home_tab_switch'; tab: string }
    | { type: 'plan_start_training'; mode?: 'focus' | 'overview'; action?: 'start' | 'resume' }
    | { type: 'plan_regenerate' }
    | { type: 'card_slug_focus'; slug: string; status: 'success' | 'not-found' };

type TelemetryEnvelope = TelemetryEvent & { ts?: number; sinceBootMs?: number };

// Lightweight placeholder; wire to real logger if available.
export function logEvent(event: TelemetryEvent): void {
    try {
        const sinceBootMs = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : undefined;
        const enriched: TelemetryEnvelope = {
            ...event,
            ts: Date.now(),
            sinceBootMs,
        };
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-console
            console.log('[telemetry]', enriched);
        }
    } catch (e) {
        // swallow
    }
}
