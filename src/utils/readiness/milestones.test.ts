import { describe, expect, it } from 'vitest';
import { computeMissionMilestoneProgress } from './milestones';
import type { DomainProgressSnapshot } from './domainProgress';
import type { DebriefProgression } from './progressionModel';

/** Minimal domain progress snapshot for testing. */
const domainProgress: DomainProgressSnapshot = {
  weightedScore: 72,
  domains: [
    { domainId: 'combat', domainName: 'Combat', score: 70, drillCount: 5, avgAssessment: 4, uniqueDrills: 3, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'fitness', domainName: 'Fitness', score: 74, drillCount: 6, avgAssessment: 4.2, uniqueDrills: 4, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'intelligence', domainName: 'Intelligence', score: 68, drillCount: 3, avgAssessment: 3.5, uniqueDrills: 2, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'cybersecurity', domainName: 'Cybersecurity', score: 66, drillCount: 2, avgAssessment: 3, uniqueDrills: 1, lastActiveDate: null, trend: null, coverageRatio: null },
  ],
};

const progression: DebriefProgression = {
  appliedDelta: 4,
  appliedOutcomes: 2,
  trend: 'improving',
};

describe('computeMissionMilestoneProgress', () => {
  it('resolves Tier I with next-tier unlock hint for low score', () => {
    const milestone = computeMissionMilestoneProgress(40, domainProgress, progression);
    expect(milestone.tier.id).toBe('tier_1');
    expect(milestone.nextTier?.id).toBe('tier_2');
    expect(milestone.nextUnlockHint).toContain('55');
  });

  it('returns top-tier completion hint when max tier is reached', () => {
    const milestone = computeMissionMilestoneProgress(96, domainProgress, progression);
    expect(milestone.tier.id).toBe('tier_4');
    expect(milestone.progressPct).toBe(100);
    expect(milestone.nextTier).toBeNull();
  });
});
