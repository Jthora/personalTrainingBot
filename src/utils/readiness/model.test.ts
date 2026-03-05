import { describe, expect, it } from 'vitest';
import { computeReadiness } from './model';
import { sampleMissionKit } from '../../data/missionKits/sampleMissionKit';
import type { MissionDebriefOutcome } from '../../domain/mission/types';

const sampleDebrief: MissionDebriefOutcome = {
  kind: 'debrief_outcome',
  id: 'debrief-sample',
  version: 'v1',
  createdAt: '2026-03-05T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  operationId: 'op-sample',
  summary: 'Strong completion',
  lessonsLearned: ['Lesson'],
  followUpActions: ['Action'],
  rating: 'strong',
  readinessDelta: 6,
};

describe('computeReadiness', () => {
  it('returns a bounded score and two next actions', () => {
    const result = computeReadiness(sampleMissionKit);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.nextActions.length).toBe(2);
    expect(result.milestone.tier.id).toBeTruthy();
  });

  it('falls back when no drills exist', () => {
    const kit = { ...sampleMissionKit, drills: [] };
    const result = computeReadiness(kit);
    expect(result.score).toBe(0);
    expect(result.confidence).toBe('low');
    expect(result.nextActions).toEqual([]);
    expect(result.progression.trend).toBe('stable');
  });

  it('applies debrief progression updates when outcomes are provided', () => {
    const baseline = computeReadiness(sampleMissionKit);
    const withDebrief = computeReadiness(sampleMissionKit, { debriefOutcomes: [sampleDebrief] });
    expect(withDebrief.score).toBeGreaterThanOrEqual(baseline.score);
    expect(withDebrief.progression.appliedOutcomes).toBe(1);
    expect(withDebrief.milestone.progressPct).toBeGreaterThanOrEqual(0);
    expect(withDebrief.milestone.progressPct).toBeLessThanOrEqual(100);
  });
});
