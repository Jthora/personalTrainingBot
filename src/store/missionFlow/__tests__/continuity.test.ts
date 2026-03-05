import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildMissionUrlState,
  getMissionResumeTarget,
  parseMissionUrlState,
  resolveMissionFlowContext,
  writeMissionCheckpoint,
} from '../continuity';
import type { MissionEntityCollection } from '../../../domain/mission/types';

const collection: MissionEntityCollection = {
  operations: [
    {
      kind: 'operation',
      id: 'op-1',
      version: 'v1',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      codename: 'Op One',
      objective: 'Objective',
      status: 'planned',
      readinessScore: 50,
      caseIds: ['case-1'],
      signalIds: ['sig-1'],
      checklistIds: ['chk-1'],
    },
  ],
  cases: [
    {
      kind: 'case',
      id: 'case-1',
      version: 'v1',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      operationId: 'op-1',
      title: 'Case One',
      summary: 'Summary',
      status: 'new',
      severity: 'medium',
      leadIds: [],
      signalIds: ['sig-1'],
      artifactIds: [],
    },
  ],
  leads: [],
  signals: [
    {
      kind: 'signal',
      id: 'sig-1',
      version: 'v1',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      operationId: 'op-1',
      caseId: 'case-1',
      title: 'Signal One',
      detail: 'Signal detail',
      status: 'new',
      severity: 'medium',
      source: 'system',
      observedAt: '2026-03-05T00:00:00.000Z',
    },
  ],
  artifacts: [],
  intelPackets: [],
  debriefOutcomes: [],
};

describe('mission flow continuity', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('parses and sanitizes URL state params', () => {
    const parsed = parseMissionUrlState('?op=op-1&case=case-1&signal=sig-1');
    expect(parsed).toEqual({ operationId: 'op-1', caseId: 'case-1', signalId: 'sig-1' });

    const invalid = parseMissionUrlState('?op=<bad>&case=case-1');
    expect(invalid.operationId).toBeNull();
    expect(invalid.caseId).toBe('case-1');
  });

  it('builds deterministic URL state from resolved context', () => {
    const context = resolveMissionFlowContext(collection, { operationId: 'op-1', caseId: 'case-1', signalId: 'sig-1' });
    expect(buildMissionUrlState(context)).toBe('op=op-1&case=case-1&signal=sig-1');
  });

  it('falls back to defaults when candidate ids are stale', () => {
    const resolved = resolveMissionFlowContext(collection, { operationId: 'op-missing', caseId: 'case-missing', signalId: 'sig-missing' });
    expect(resolved.operationId).toBe('op-1');
    expect(resolved.caseId).toBe('case-1');
    expect(resolved.signalId).toBe('sig-1');
  });

  it('returns checkpoint route when recent, else brief fallback', () => {
    expect(getMissionResumeTarget('/mission/brief')).toBe('/mission/brief');

    writeMissionCheckpoint('/mission/checklist');
    expect(getMissionResumeTarget('/mission/brief')).toBe('/mission/checklist');
  });
});
