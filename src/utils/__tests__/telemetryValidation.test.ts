import { describe, expect, it } from 'vitest';
import {
  buildTelemetryValidationReport,
  validateTrackedEvent,
} from '../telemetryValidation';
import type { TrackedEvent } from '../telemetry';

const validMissionTransitionEvent: TrackedEvent = {
  category: 'ia',
  action: 'tab_view',
  route: '/mission/triage',
  data: {
    tab: '/mission/triage',
    fromTab: '/mission/brief',
    toTab: '/mission/triage',
    transitionType: 'mission_step_transition',
    source: 'tab',
  },
  source: 'ui',
  ts: new Date().toISOString(),
  offline: false,
};

describe('telemetryValidation', () => {
  it('accepts valid mission transition payload', () => {
    expect(validateTrackedEvent(validMissionTransitionEvent)).toEqual([]);
  });

  it('flags mission transition when required fields are missing', () => {
    const invalid = {
      ...validMissionTransitionEvent,
      data: {
        tab: '/mission/triage',
      },
    };

    const issues = validateTrackedEvent(invalid);
    expect(issues.some((issue) => issue.includes('data.fromTab'))).toBe(true);
    expect(issues.some((issue) => issue.includes('data.toTab'))).toBe(true);
  });

  it('builds report summary and issue collection', () => {
    const report = buildTelemetryValidationReport([
      validMissionTransitionEvent,
      { ...validMissionTransitionEvent, category: 'signals', action: 'signal_ack', data: { id: 'sig-1' } } as TrackedEvent,
    ]);
    expect(report.total).toBe(2);
    expect(report.issues).toHaveLength(0);
    expect(report.summary.length).toBeGreaterThan(0);
  });
});
