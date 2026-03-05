import { describe, expect, it } from 'vitest';
import {
  buildTelemetrySchemaSnapshot,
  diffTelemetrySchemas,
  hasTelemetrySchemaDrift,
} from '../telemetryDrift';
import type { TrackedEvent } from '../telemetry';

const events = (dataOverride?: Record<string, unknown>): TrackedEvent[] => [
  {
    category: 'ia',
    action: 'tab_view',
    data: {
      tab: '/mission/brief',
      fromTab: '/mission/brief',
      toTab: '/mission/triage',
      transitionType: 'mission_step_transition',
      source: 'tab',
      ...(dataOverride ?? {}),
    },
    ts: new Date().toISOString(),
    offline: false,
    route: '/mission/brief',
  },
];

describe('telemetryDrift', () => {
  it('builds deterministic snapshot keyed by category:action', () => {
    const snapshot = buildTelemetrySchemaSnapshot(events(), '2026-03-05T00:00:00.000Z');
    expect(snapshot.generatedAt).toBe('2026-03-05T00:00:00.000Z');
    expect(Object.keys(snapshot.eventSchemas)).toEqual(['ia:tab_view']);
  });

  it('detects new data keys as schema drift', () => {
    const baseline = buildTelemetrySchemaSnapshot(events());
    const current = buildTelemetrySchemaSnapshot(events({ actionId: 'tab:triage' }));
    const drift = diffTelemetrySchemas(baseline, current);
    expect(hasTelemetrySchemaDrift(drift)).toBe(true);
    expect(drift.changedDataKeys[0].newKeys).toContain('actionId');
  });
});
