import { describe, expect, it } from 'vitest';
import {
  buildMissionTransitionPayload,
  missionStepTransitionContracts,
  missionRoutePaths,
} from '../missionTelemetryContracts';

describe('mission telemetry contracts', () => {
  it('defines a transition contract for every mission route', () => {
    expect(missionStepTransitionContracts).toHaveLength(missionRoutePaths.length);
    expect(missionStepTransitionContracts.every((contract) => contract.eventKey === 'ia:tab_view')).toBe(true);
  });

  it('builds payload with required mission transition fields', () => {
    const payload = buildMissionTransitionPayload({
      fromTab: '/mission/brief',
      toTab: '/mission/triage',
      source: 'tab',
      operationId: 'op-1',
      caseId: 'case-1',
      signalId: 'sig-1',
      actionId: 'tab:/mission/triage',
    });

    expect(payload.tab).toBe('/mission/triage');
    expect(payload.fromTab).toBe('/mission/brief');
    expect(payload.toTab).toBe('/mission/triage');
    expect(payload.transitionType).toBe('mission_step_transition');
    expect(payload.source).toBe('tab');
  });
});
