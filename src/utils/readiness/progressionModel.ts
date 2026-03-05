import dayjs from 'dayjs';
import type { MissionDebriefOutcome, DebriefRating } from '../../domain/mission/types';

export type DebriefProgression = {
  appliedDelta: number;
  appliedOutcomes: number;
  trend: 'declining' | 'stable' | 'improving';
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ratingMultiplier: Record<DebriefRating, number> = {
  insufficient: -1,
  adequate: 0.4,
  strong: 0.8,
  exceptional: 1.2,
};

const recencyWeight = (updatedAt: string): number => {
  const days = Math.max(0, dayjs().diff(dayjs(updatedAt), 'day'));
  if (days <= 3) return 1;
  if (days <= 14) return 0.85;
  if (days <= 30) return 0.7;
  return 0.55;
};

const outcomeDelta = (outcome: MissionDebriefOutcome): number => {
  const boundedDelta = clamp(outcome.readinessDelta, -10, 10);
  return boundedDelta * ratingMultiplier[outcome.rating] * recencyWeight(outcome.updatedAt);
};

export const applyDebriefProgression = (
  baseScore: number,
  debriefOutcomes: MissionDebriefOutcome[],
): { score: number; progression: DebriefProgression } => {
  if (!debriefOutcomes.length) {
    return {
      score: Math.round(clamp(baseScore, 0, 100)),
      progression: {
        appliedDelta: 0,
        appliedOutcomes: 0,
        trend: 'stable',
      },
    };
  }

  const totalDelta = debriefOutcomes.reduce((sum, outcome) => sum + outcomeDelta(outcome), 0);
  const boundedTotalDelta = clamp(totalDelta, -12, 15);
  const score = clamp(baseScore + boundedTotalDelta, 0, 100);

  const trend: DebriefProgression['trend'] = boundedTotalDelta > 1
    ? 'improving'
    : boundedTotalDelta < -1
      ? 'declining'
      : 'stable';

  return {
    score: Math.round(score),
    progression: {
      appliedDelta: Math.round(boundedTotalDelta),
      appliedOutcomes: debriefOutcomes.length,
      trend,
    },
  };
};
