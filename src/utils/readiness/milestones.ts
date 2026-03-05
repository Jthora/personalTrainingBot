import type { DebriefProgression } from './progressionModel';
import type { CompetencySnapshot } from './competencyModel';

export type MissionMilestoneTierId = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';

export type MissionMilestoneTier = {
  id: MissionMilestoneTierId;
  label: string;
  minScore: number;
  prerequisites: string[];
};

export type MissionMilestoneProgress = {
  tier: MissionMilestoneTier;
  progressPct: number;
  unlocked: boolean;
  nextTier: MissionMilestoneTier | null;
  nextUnlockHint: string;
};

export const missionMilestoneTiers: MissionMilestoneTier[] = [
  {
    id: 'tier_1',
    label: 'Tier I · Trainee',
    minScore: 0,
    prerequisites: ['Establish baseline readiness above 0.', 'Complete at least one mission drill path.'],
  },
  {
    id: 'tier_2',
    label: 'Tier II · Operator',
    minScore: 55,
    prerequisites: ['Readiness score ≥ 55.', 'Debrief trend is stable or improving.'],
  },
  {
    id: 'tier_3',
    label: 'Tier III · Specialist',
    minScore: 70,
    prerequisites: ['Readiness score ≥ 70.', 'Signal analysis competency ≥ 65.', 'At least one debrief outcome applied.'],
  },
  {
    id: 'tier_4',
    label: 'Tier IV · Mission Lead',
    minScore: 85,
    prerequisites: ['Readiness score ≥ 85.', 'Artifact traceability competency ≥ 70.', 'Debrief trend is improving.'],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolveTier = (score: number): MissionMilestoneTier => {
  for (let index = missionMilestoneTiers.length - 1; index >= 0; index -= 1) {
    if (score >= missionMilestoneTiers[index].minScore) {
      return missionMilestoneTiers[index];
    }
  }
  return missionMilestoneTiers[0];
};

const resolveProgressPct = (score: number, tier: MissionMilestoneTier, nextTier: MissionMilestoneTier | null): number => {
  if (!nextTier) return 100;
  const span = Math.max(1, nextTier.minScore - tier.minScore);
  return Math.round(clamp(((score - tier.minScore) / span) * 100, 0, 100));
};

const resolveNextUnlockHint = (
  score: number,
  nextTier: MissionMilestoneTier | null,
  competency: CompetencySnapshot,
  progression: DebriefProgression,
): string => {
  if (!nextTier) {
    return 'Top milestone unlocked. Maintain mission consistency and debrief quality.';
  }

  if (score < nextTier.minScore) {
    return `Increase readiness to ${nextTier.minScore} to unlock ${nextTier.label}.`;
  }

  if (nextTier.id === 'tier_3' && competency.dimensionScores.signal_analysis < 65) {
    return 'Increase signal analysis competency to 65 by resolving more high-value signals.';
  }

  if (nextTier.id === 'tier_4' && competency.dimensionScores.artifact_traceability < 70) {
    return 'Increase artifact traceability competency to 70 by completing artifact-chain drills.';
  }

  if (progression.trend !== 'improving' && nextTier.id === 'tier_4') {
    return 'Improve debrief trend with stronger outcome ratings to unlock Tier IV.';
  }

  return `Complete ${nextTier.label} prerequisites to unlock.`;
};

export const computeMissionMilestoneProgress = (
  score: number,
  competency: CompetencySnapshot,
  progression: DebriefProgression,
): MissionMilestoneProgress => {
  const tier = resolveTier(score);
  const tierIndex = missionMilestoneTiers.findIndex((entry) => entry.id === tier.id);
  const nextTier = tierIndex >= 0 && tierIndex < missionMilestoneTiers.length - 1
    ? missionMilestoneTiers[tierIndex + 1]
    : null;

  return {
    tier,
    progressPct: resolveProgressPct(score, tier, nextTier),
    unlocked: true,
    nextTier,
    nextUnlockHint: resolveNextUnlockHint(score, nextTier, competency, progression),
  };
};
