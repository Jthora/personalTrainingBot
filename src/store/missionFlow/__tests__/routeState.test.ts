import { beforeEach, describe, expect, it, vi } from 'vitest';
import MissionEntityStore from '../../../domain/mission/MissionEntityStore';
import { getMissionSurfaceState } from '../routeState';
import { writeMissionFlowContext } from '../continuity';

const baseCollection = {
  operations: [
    {
      kind: 'operation' as const,
      id: 'op-1',
      version: 'v1' as const,
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      codename: 'Op 1',
      objective: 'Objective',
      status: 'planned' as const,
      readinessScore: 42,
      caseIds: ['case-1'],
      signalIds: ['sig-1'],
      checklistIds: ['chk-1'],
    },
  ],
  cases: [
    {
      kind: 'case' as const,
      id: 'case-1',
      version: 'v1' as const,
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      operationId: 'op-1',
      title: 'Case',
      summary: 'Summary',
      status: 'new' as const,
      severity: 'medium' as const,
      leadIds: [],
      signalIds: ['sig-1'],
      artifactIds: [],
    },
  ],
  leads: [],
  signals: [
    {
      kind: 'signal' as const,
      id: 'sig-1',
      version: 'v1' as const,
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
      operationId: 'op-1',
      caseId: 'case-1',
      title: 'Signal',
      detail: 'Detail',
      status: 'new' as const,
      severity: 'medium' as const,
      source: 'system' as const,
      observedAt: '2026-03-05T00:00:00.000Z',
    },
  ],
  artifacts: [],
  intelPackets: [],
  debriefOutcomes: [],
};

describe('mission route state', () => {
  beforeEach(() => {
    window.localStorage.clear();
    const store = MissionEntityStore.getInstance();
    store.clear();
    const getCollectionSpy = vi.spyOn(store, 'getCanonicalCollection');
    getCollectionSpy.mockRestore();
  });

  it('returns loading when canonical collection is unavailable', () => {
    const state = getMissionSurfaceState('brief');
    expect(state.kind).toBe('loading');
  });

  it('returns empty for case route when no case in context', () => {
    const store = MissionEntityStore.getInstance();
    vi.spyOn(store, 'getCanonicalCollection').mockReturnValue(baseCollection as any);

    const state = getMissionSurfaceState('case');
    expect(state.kind).toBe('empty');
  });

  it('returns error when stored operation id is stale', () => {
    const store = MissionEntityStore.getInstance();
    vi.spyOn(store, 'getCanonicalCollection').mockReturnValue(baseCollection as any);
    writeMissionFlowContext({ operationId: 'op-missing', caseId: 'case-1', signalId: 'sig-1', updatedAt: Date.now() });

    const state = getMissionSurfaceState('brief');
    expect(state.kind).toBe('error');
  });

  it('returns ready with valid context', () => {
    const store = MissionEntityStore.getInstance();
    vi.spyOn(store, 'getCanonicalCollection').mockReturnValue(baseCollection as any);
    writeMissionFlowContext({ operationId: 'op-1', caseId: 'case-1', signalId: 'sig-1', updatedAt: Date.now() });

    const state = getMissionSurfaceState('signal');
    expect(state.kind).toBe('ready');
  });
});
