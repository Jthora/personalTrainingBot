import { describe, expect, it } from 'vitest';
import { formatMissionTimebox, getMissionHeaderModel } from '../model';
import type { MissionEntityCollection } from '../../../domain/mission/types';

const collection: MissionEntityCollection = {
  operations: [
    {
      kind: 'operation',
      id: 'op-1',
      version: 'v1',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      codename: 'Operation One',
      objective: 'Secure mission lane',
      status: 'briefing',
      readinessScore: 64,
      caseIds: ['case-1'],
      signalIds: ['sig-1'],
      checklistIds: ['chk-1'],
    },
  ],
  cases: [],
  leads: [],
  signals: [],
  artifacts: [],
  intelPackets: [],
  debriefOutcomes: [],
};

describe('mission header model', () => {
  it('returns loading model when collection is missing', () => {
    const model = getMissionHeaderModel(null, null, 50);
    expect(model.kind).toBe('loading');
  });

  it('returns error model for stale context operation id', () => {
    const model = getMissionHeaderModel(collection, { operationId: 'missing-op', caseId: null, signalId: null, updatedAt: Date.now() }, 50);
    expect(model.kind).toBe('error');
  });

  it('returns ready model with operation details', () => {
    const model = getMissionHeaderModel(collection, { operationId: 'op-1', caseId: null, signalId: null, updatedAt: Date.now() }, 50);
    expect(model.kind).toBe('ready');
    if (model.kind !== 'ready') {
      throw new Error('Expected ready model');
    }
    expect(model.title).toBe('Operation One');
    expect(model.statusLabel).toBe('BRIEFING');
    expect(model.readinessLabel).toContain('64');
  });

  it('formats timebox from created timestamp', () => {
    expect(formatMissionTimebox('2026-03-05T00:00:00.000Z', Date.parse('2026-03-05T03:00:00.000Z'))).toBe('T+3h');
    expect(formatMissionTimebox('2026-03-05T00:00:00.000Z', Date.parse('2026-03-07T05:00:00.000Z'))).toBe('T+2d 5h');
  });
});