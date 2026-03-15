import type { DebriefProgression } from './progressionModel';
import type { DomainProgressSnapshot } from './domainProgress';
import { averageDomainScore } from './domainProgress';
import type { ArchetypeDefinition } from '../../data/archetypes';

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
    prerequisites: ['Establish baseline readiness above 0.', 'Complete at least one training exercise path.'],
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

const resolveProgressPct = (score: number, tier: MissionMilestoneTier, nextTier: MissionMilestoneTier | null): number => {
  if (!nextTier) return 100;
  const span = Math.max(1, nextTier.minScore - tier.minScore);
  return Math.round(clamp(((score - tier.minScore) / span) * 100, 0, 100));
};

const resolveNextUnlockHint = (
  score: number,
  nextTier: MissionMilestoneTier | null,
  domainProgress: DomainProgressSnapshot,
  progression: DebriefProgression,
  archetype?: ArchetypeDefinition,
): string => {
  if (!nextTier) {
    return 'Top milestone unlocked. Maintain mission consistency and debrief quality.';
  }

  if (score < nextTier.minScore) {
    return `Increase readiness to ${nextTier.minScore} to unlock ${nextTier.label}.`;
  }

  // Domain-based gate checks using archetype core/secondary modules
  if (archetype) {
    if (nextTier.id === 'tier_3') {
      const coreAvg = averageDomainScore(domainProgress, archetype.coreModules);
      const threshold = archetype.tier3Gate.threshold;
      if (coreAvg < threshold) {
        return `Increase core domain average to ${threshold} to unlock ${nextTier.label}. Current: ${coreAvg}.`;
      }
    }
    if (nextTier.id === 'tier_4') {
      const allModules = [...archetype.coreModules, ...archetype.secondaryModules];
      const allAvg = averageDomainScore(domainProgress, allModules);
      const threshold = archetype.tier4Gate.threshold;
      if (allAvg < threshold) {
        return `Increase archetype domain average to ${threshold} to unlock ${nextTier.label}. Current: ${allAvg}.`;
      }
    }
  } else {
    // Legacy gates — use composite domain score
    if (nextTier.id === 'tier_3' && domainProgress.weightedScore < 65) {
      return 'Increase domain progress to 65 by training across more disciplines.';
    }

    if (nextTier.id === 'tier_4' && domainProgress.weightedScore < 70) {
      return 'Increase domain progress to 70 by deepening training across disciplines.';
    }
  }

  if (progression.trend !== 'improving' && nextTier.id === 'tier_4') {
    return 'Improve debrief trend with stronger outcome ratings to unlock Tier IV.';
  }

  return `Complete ${nextTier.label} prerequisites to unlock.`;
};

export const computeMissionMilestoneProgress = (
  score: number,
  domainProgress: DomainProgressSnapshot,
  progression: DebriefProgression,
  archetype?: ArchetypeDefinition,
): MissionMilestoneProgress => {
  // Stage 22: overlay archetype milestone labels onto the base tiers
  const tiers = archetype
    ? missionMilestoneTiers.map((t, i) => ({
        ...t,
        label: archetype.milestoneLabels[i] ?? t.label,
      }))
    : missionMilestoneTiers;

  const resolveTierLocal = (s: number): MissionMilestoneTier => {
    for (let index = tiers.length - 1; index >= 0; index -= 1) {
      if (s >= tiers[index].minScore) {
        return tiers[index];
      }
    }
    return tiers[0];
  };

  const tier = resolveTierLocal(score);
  const tierIndex = tiers.findIndex((entry) => entry.id === tier.id);
  const nextTier = tierIndex >= 0 && tierIndex < tiers.length - 1
    ? tiers[tierIndex + 1]
    : null;

  return {
    tier,
    progressPct: resolveProgressPct(score, tier, nextTier),
    unlocked: true,
    nextTier,
    nextUnlockHint: resolveNextUnlockHint(score, nextTier, domainProgress, progression, archetype),
  };
};
