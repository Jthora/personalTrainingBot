import { describe, expect, it, vi, beforeEach } from 'vitest';
import { collectCycleSummary } from '../MissionCycleSummary';

vi.mock('../../../store/TriageActionStore', () => ({
  TriageActionStore: {
    count: vi.fn(() => 3),
    byAction: vi.fn(() => ({
      ack: ['a1'],
      escalate: ['e1'],
      defer: ['d1'],
      resolve: [] as string[],
    })),
  },
}));

vi.mock('../../../store/ArtifactActionStore', () => ({
  ArtifactActionStore: {
    reviewedCount: vi.fn(() => 5),
    promotedCount: vi.fn(() => 2),
  },
}));

vi.mock('../../../store/SignalsStore', () => ({
  SignalsStore: {
    list: vi.fn(() => [
      { id: 's1', status: 'open', updatedAt: 1 },
      { id: 's2', status: 'ack', updatedAt: 2 },
      { id: 's3', status: 'resolved', updatedAt: 3 },
      { id: 's4', status: 'open', updatedAt: 4 },
    ]),
  },
}));

describe('collectCycleSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates triage, artifact, and signal counts', () => {
    const summary = collectCycleSummary();

    expect(summary.triage).toEqual({
      ack: 1,
      escalate: 1,
      defer: 1,
      resolve: 0,
      total: 3,
    });

    expect(summary.artifacts).toEqual({
      reviewed: 5,
      promoted: 2,
    });

    expect(summary.signals).toEqual({
      total: 4,
      open: 2,
      acknowledged: 1,
      resolved: 1,
    });
  });
});
