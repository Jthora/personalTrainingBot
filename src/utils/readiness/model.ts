import dayjs from 'dayjs';
import { sampleMissionKit, type Drill, type MissionKit } from '../../data/missionKits/sampleMissionKit';
import { validateMissionKit } from './validate';
import { deriveCompetencySnapshot, type CompetencySnapshot } from './competencyModel';
import { applyDebriefProgression, type DebriefProgression } from './progressionModel';
import type { MissionDebriefOutcome } from '../../domain/mission/types';
import { computeMissionMilestoneProgress, type MissionMilestoneProgress } from './milestones';
import { isFeatureEnabled } from '../../config/featureFlags';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { findArchetype } from '../../data/archetypes';

export type ReadinessResult = {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  nextActions: Array<{ id: string; title: string; route: string }>;
  kit: MissionKit;
  competency: CompetencySnapshot;
  progression: DebriefProgression;
  milestone: MissionMilestoneProgress;
};

export type ReadinessOptions = {
  debriefOutcomes?: MissionDebriefOutcome[];
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const validatedKits = new Set<string>();

const recencyBoost = (drill: Drill) => {
  if (!drill.lastCompleted) return -12;
  const days = dayjs().diff(dayjs(drill.lastCompleted), 'day');
  if (days <= 2) return 18;
  if (days <= 7) return 10;
  if (days <= 14) return 4;
  return -6;
};

const difficultyBoost = (drill: Drill) => (drill.difficulty - 3) * 3;

const successBoost = (drill: Drill) => {
  if (typeof drill.successRate !== 'number') return -6;
  const centered = drill.successRate - 0.6; // encourage >60% success
  return centered * 40; // +/- impact
};

const computeDrillScore = (drill: Drill) => {
  const base = 50;
  const score = base + recencyBoost(drill) + difficultyBoost(drill) + successBoost(drill);
  return clamp(score, 0, 100);
};

const pickNextActions = (drills: Drill[], count: number) => {
  const sorted = [...drills].sort((a, b) => {
    const aDate = a.lastCompleted ? dayjs(a.lastCompleted) : null;
    const bDate = b.lastCompleted ? dayjs(b.lastCompleted) : null;
    if (!aDate && bDate) return -1;
    if (aDate && !bDate) return 1;
    if (!aDate && !bDate) return b.difficulty - a.difficulty;
    return aDate!.valueOf() - bDate!.valueOf(); // oldest first
  });

  return sorted.slice(0, count).map((drill) => ({
    id: drill.id,
    title: drill.title,
    route: '/mission/checklist',
  }));
};

export function computeReadiness(kit: MissionKit = sampleMissionKit, options: ReadinessOptions = {}): ReadinessResult {
  if (!validatedKits.has(kit.id)) {
    const issues = validateMissionKit(kit);
    if (issues.length) {
      // eslint-disable-next-line no-console
      console.warn('[readiness] mission kit validation issues', issues);
    }
    validatedKits.add(kit.id);
  }

  // Stage 22: resolve active archetype for competency weight and milestone overrides
  const activeArchetype = isFeatureEnabled('archetypeSystem')
    ? (() => {
        const profile = OperativeProfileStore.get();
        return profile?.archetypeId ? findArchetype(profile.archetypeId) : undefined;
      })()
    : undefined;
  const archetypeWeights = activeArchetype?.competencyWeights;

  if (!kit.drills.length) {
    const competency = deriveCompetencySnapshot(kit, archetypeWeights);
    const emptyProgression = applyDebriefProgression(0, options.debriefOutcomes ?? []);
    return {
      score: emptyProgression.score,
      confidence: 'low',
      nextActions: [],
      kit,
      competency,
      progression: emptyProgression.progression,
      milestone: computeMissionMilestoneProgress(
        emptyProgression.score,
        competency,
        emptyProgression.progression,
        activeArchetype,
      ),
    };
  }

  const drillScores = kit.drills.map((d) => computeDrillScore(d));
  const avg = drillScores.reduce((a, b) => a + b, 0) / drillScores.length;
  const competency = deriveCompetencySnapshot(kit, archetypeWeights);
  const variance = drillScores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / drillScores.length;
  const stdev = Math.sqrt(variance);

  const confidence: ReadinessResult['confidence'] = stdev > 18 ? 'low' : stdev > 10 ? 'medium' : 'high';
  const nextActions = pickNextActions(kit.drills, 2);

  const blendedBaseScore = clamp(avg * 0.7 + competency.weightedScore * 0.3, 0, 100);
  const progressionApplied = applyDebriefProgression(blendedBaseScore, options.debriefOutcomes ?? []);
  const milestone = computeMissionMilestoneProgress(
    progressionApplied.score,
    competency,
    progressionApplied.progression,
    activeArchetype,
  );

  return {
    score: progressionApplied.score,
    confidence,
    nextActions,
    kit,
    competency,
    progression: progressionApplied.progression,
    milestone,
  };
}
