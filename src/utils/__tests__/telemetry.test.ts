import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, readEventBuffer, logEvent, emitTelemetry } from '../telemetry';

describe('telemetry', () => {
  beforeEach(() => {
    window.localStorage.removeItem('ptb:telemetry-buffer');
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('trackEvent', () => {
    it('enriches event with ISO timestamp', () => {
      const result = trackEvent({ category: 'ia', action: 'tab_view' });
      expect(result.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('preserves provided ts', () => {
      const result = trackEvent({ category: 'ia', action: 'tab_view', ts: '2024-01-01T00:00:00.000Z' });
      expect(result.ts).toBe('2024-01-01T00:00:00.000Z');
    });

    it('enriches with current route', () => {
      const result = trackEvent({ category: 'ia', action: 'tab_view' });
      expect(result.route).toBe(window.location.pathname);
    });

    it('sets offline: true for offline_enter', () => {
      const result = trackEvent({ category: 'offline', action: 'offline_enter' });
      expect(result.offline).toBe(true);
    });

    it('sets offline: false for offline_exit', () => {
      const result = trackEvent({ category: 'offline', action: 'offline_exit' });
      expect(result.offline).toBe(false);
    });

    it('appends to localStorage buffer', () => {
      trackEvent({ category: 'ia', action: 'tab_view' });
      trackEvent({ category: 'ia', action: 'tab_view' });
      const buffer = readEventBuffer();
      expect(buffer.length).toBe(2);
    });

    it('caps buffer at 80', () => {
      for (let i = 0; i < 85; i++) {
        trackEvent({ category: 'ia', action: 'tab_view' });
      }
      expect(readEventBuffer().length).toBe(80);
    });
  });

  describe('readEventBuffer', () => {
    it('returns empty array when no buffer exists', () => {
      expect(readEventBuffer()).toEqual([]);
    });
  });

  describe('logEvent', () => {
    it('maps home_tab_switch to ia/tab_view', () => {
      logEvent({ type: 'home_tab_switch', tab: 'plan' });
      const buffer = readEventBuffer();
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer[buffer.length - 1].category).toBe('ia');
    });

    it('maps plan_start_training to drills/drill_start', () => {
      logEvent({ type: 'plan_start_training', mode: 'focus' });
      const buffer = readEventBuffer();
      const last = buffer[buffer.length - 1];
      expect(last.category).toBe('drills');
    });
  });

  describe('emitTelemetry', () => {
    it('logs schema event with auto-generated ts', () => {
      const spy = vi.spyOn(console, 'info');
      emitTelemetry({ kind: 'perf:route-transition', phase: 'complete', durationMs: 42 } as any);
      expect(spy).toHaveBeenCalledWith('[telemetry:perf]', expect.objectContaining({ kind: 'perf:route-transition' }));
    });
  });
});
