import { TelemetryEvent as SchemaTelemetryEvent } from './telemetrySchema';

export type IaAction = 'tab_view' | 'deep_link_load' | 'nav_error';
export type P2PAction =
  | 'gun_identity_create'
  | 'gun_identity_login'
  | 'gun_identity_import'
  | 'gun_identity_logout'
  | 'gun_profile_remote_update'
  | `gun_sync_pull_${string}`
  | 'ipfs_fetch_success'
  | 'ipfs_fetch_fallback';
export type ReadinessAction = 'score_render' | 'score_source' | 'next_action_click';
export type OfflineAction =
  | 'offline_enter'
  | 'offline_exit'
  | 'cache_hit'
  | 'cache_miss'
  | 'sw_install'
  | 'sw_update_available'
  | 'sw_update_applied';
export type DrillsAction = 'drill_start' | 'step_complete' | 'drill_complete' | 'drill_abort' | 'drill_export';
export type SignalsAction = 'signal_create' | 'signal_ack' | 'signal_resolve';
export type AarAction = 'aar_create' | 'aar_save' | 'aar_export';
export type SettingsAction = 'toggle_low_data' | 'toggle_mute' | 'preload_trigger';

export type AppTelemetryEvent =
  | { category: 'ia'; action: IaAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system' | 'sw'; ts?: string }
  | { category: 'p2p'; action: P2PAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string }
  | { category: 'readiness'; action: ReadinessAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string }
  | { category: 'offline'; action: OfflineAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system' | 'sw'; ts?: string }
  | { category: 'drills'; action: DrillsAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string }
  | { category: 'signals'; action: SignalsAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string }
  | { category: 'aar'; action: AarAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string }
  | { category: 'settings'; action: SettingsAction; route?: string; label?: string; value?: string | number; data?: Record<string, unknown>; source?: 'ui' | 'system'; ts?: string };

export type TrackedEvent = AppTelemetryEvent & {
  ts: string;
  route?: string;
  offline: boolean;
  net?: string;
  device?: string;
};

const BUFFER_KEY = 'ptb:telemetry-buffer';
const BUFFER_LIMIT = 80;

const readBuffer = (): TrackedEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as TrackedEvent[]) : [];
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry] read buffer failed', err);
    }
    return [];
  }
};

const writeBuffer = (next: TrackedEvent[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BUFFER_KEY, JSON.stringify(next.slice(-BUFFER_LIMIT)));
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry] write buffer failed', err);
    }
  }
};

const getNet = () => {
  if (typeof navigator === 'undefined') return undefined;
  const connection = (navigator as any).connection;
  return connection?.effectiveType as string | undefined;
};

export function trackEvent(event: AppTelemetryEvent): TrackedEvent {
  const ts = event.ts ?? new Date().toISOString();
  const route = event.route ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);
  const offline = event.category === 'offline' && event.action === 'offline_enter'
    ? true
    : event.category === 'offline' && event.action === 'offline_exit'
      ? false
      : typeof navigator !== 'undefined'
        ? !navigator.onLine
        : false;
  const net = getNet();
  const enriched: TrackedEvent = {
    ...event,
    ts,
    route,
    offline,
    net,
  };

  const buffer = readBuffer();
  writeBuffer([...buffer, enriched]);

  try {
    // eslint-disable-next-line no-console
    console.info('[event]', enriched);
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry] track failed', err);
    }
  }

  return enriched;
}

export function readEventBuffer(): TrackedEvent[] {
  return readBuffer();
}

export function emitTelemetry(event: SchemaTelemetryEvent) {
  const payload: SchemaTelemetryEvent = {
    ...event,
    ts: event.ts ?? new Date().toISOString(),
  };

  try {
    // eslint-disable-next-line no-console
    console.info('[telemetry:perf]', payload);
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry] emit failed', err);
    }
  }
}

type LegacyTelemetryEvent =
  | { type: 'home_tab_switch'; tab: string }
  | { type: 'plan_start_training'; mode?: 'focus' | 'overview'; action?: 'start' | 'resume' }
  | { type: 'plan_regenerate' }
  | { type: 'card_slug_focus'; slug: string; status: 'success' | 'not-found' };

// Lightweight placeholder; maps legacy events onto the typed sink.
export function logEvent(event: LegacyTelemetryEvent): void {
  try {
    if (event.type === 'home_tab_switch') {
      trackEvent({ category: 'ia', action: 'tab_view', route: event.tab, data: { tab: event.tab, source: 'legacy' } });
      return;
    }
    if (event.type === 'plan_start_training') {
      trackEvent({ category: 'drills', action: 'drill_start', data: { mode: event.mode ?? 'overview', source: event.action ?? 'start', legacy: true } });
      return;
    }
    if (event.type === 'plan_regenerate') {
      trackEvent({ category: 'readiness', action: 'next_action_click', data: { actionId: 'plan_regenerate', source: 'legacy' } });
      return;
    }
    if (event.type === 'card_slug_focus') {
      trackEvent({ category: 'ia', action: 'deep_link_load', data: { slug: event.slug, status: event.status, source: 'legacy' } });
    }
  } catch (e) {
    // swallow
  }
}
