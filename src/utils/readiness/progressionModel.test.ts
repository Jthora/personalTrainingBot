import { describe, expect, it } from 'vitest';
import { applyDebriefProgression } from './progressionModel';
import type { MissionDebriefOutcome } from '../../domain/mission/types';

const makeDebrief = (overrides: Partial<MissionDebriefOutcome>): MissionDebriefOutcome => ({
  kind: 'debrief_outcome',
  id: 'debrief-1',
  version: 'v1',
  createdAt: '2026-03-05T00:00:00.000Z',
  updatedAt: '2026-03-05T00:00:00.000Z',
  operationId: 'op-1',
  summary: 'Summary',
  lessonsLearned: ['Lesson'],
  followUpActions: ['Action'],
  rating: 'strong',
  readinessDelta: 5,
  ...overrides,
});

describe('applyDebriefProgression', () => {
  it('applies bounded positive delta for strong recent debriefs', () => {
    const outcome = makeDebrief({ rating: 'strong', readinessDelta: 10, updatedAt: new Date().toISOString() });
    const result = applyDebriefProgression(60, [outcome]);
    expect(result.score).toBeGreaterThan(60);
    expect(result.progression.trend).toBe('improving');
  });

  it('caps aggregate delta and keeps score bounded', () => {
    const outcomes = Array.from({ length: 5 }, (_, index) => makeDebrief({ id: `d-${index}`, rating: 'exceptional', readinessDelta: 10 }));
    const result = applyDebriefProgression(95, outcomes);
    expect(result.progression.appliedDelta).toBeLessThanOrEqual(15);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
