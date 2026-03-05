import { describe, expect, it } from 'vitest';
import { computeMissionMilestoneProgress } from './milestones';
import type { CompetencySnapshot } from './competencyModel';
import type { DebriefProgression } from './progressionModel';

const competency: CompetencySnapshot = {
  weightedScore: 72,
  dimensionScores: {
    triage_execution: 70,
    signal_analysis: 74,
    artifact_traceability: 68,
    decision_quality: 66,
  },
};

const progression: DebriefProgression = {
  appliedDelta: 4,
  appliedOutcomes: 2,
  trend: 'improving',
};

describe('computeMissionMilestoneProgress', () => {
  it('resolves Tier I with next-tier unlock hint for low score', () => {
    const milestone = computeMissionMilestoneProgress(40, competency, progression);
    expect(milestone.tier.id).toBe('tier_1');
    expect(milestone.nextTier?.id).toBe('tier_2');
    expect(milestone.nextUnlockHint).toContain('55');
  });

  it('returns top-tier completion hint when max tier is reached', () => {
    const top = computeMissionMilestoneProgress(96, { ...competency, dimensionScores: { ...competency.dimensionScores, artifact_traceability: 78 } }, progression);
    expect(top.tier.id).toBe('tier_4');
    expect(top.progressPct).toBe(100);
    expect(top.nextTier).toBeNull();
  });
});
