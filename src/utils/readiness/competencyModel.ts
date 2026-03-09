import type { Drill, MissionKit } from '../../data/missionKits/sampleMissionKit';

export type CompetencyDimension =
  | 'triage_execution'
  | 'signal_analysis'
  | 'artifact_traceability'
  | 'decision_quality';

export const competencyWeights: Record<CompetencyDimension, number> = {
  triage_execution: 0.3,
  signal_analysis: 0.28,
  artifact_traceability: 0.24,
  decision_quality: 0.18,
};

export type MissionActionImpact = {
  actionId: string;
  dimension: CompetencyDimension;
  impact: number;
};

export const missionActionImpacts: MissionActionImpact[] = [
  { actionId: 'drill_start', dimension: 'triage_execution', impact: 3 },
  { actionId: 'step_complete', dimension: 'decision_quality', impact: 2 },
  { actionId: 'signal_ack', dimension: 'signal_analysis', impact: 4 },
  { actionId: 'signal_resolve', dimension: 'signal_analysis', impact: 5 },
  { actionId: 'artifact_review', dimension: 'artifact_traceability', impact: 4 },
  { actionId: 'artifact_promote', dimension: 'artifact_traceability', impact: 5 },
  { actionId: 'drill_complete', dimension: 'decision_quality', impact: 4 },
];

export type CompetencySnapshot = {
  weightedScore: number;
  dimensionScores: Record<CompetencyDimension, number>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const baselineDimensionScores = (): Record<CompetencyDimension, number> => ({
  triage_execution: 50,
  signal_analysis: 50,
  artifact_traceability: 50,
  decision_quality: 50,
});

const drillActionMap: Record<string, string[]> = {
  'operation-alpha-intro-run': ['drill_start', 'signal_ack', 'step_complete', 'drill_complete'],
  'operation-bravo-branch-analysis': ['drill_start', 'signal_ack', 'signal_resolve', 'step_complete', 'drill_complete'],
  'operation-charlie-artifact-chain': ['drill_start', 'artifact_review', 'artifact_promote', 'step_complete', 'drill_complete'],
};

const inferActionsFromDrill = (drill: Drill): string[] => {
  if (drillActionMap[drill.id]) {
    return drillActionMap[drill.id];
  }

  if (drill.type === 'rapid-response') {
    return ['drill_start', 'signal_ack', 'step_complete'];
  }
  if (drill.type === 'tabletop') {
    return ['drill_start', 'signal_resolve', 'step_complete'];
  }
  return ['drill_start', 'artifact_review', 'step_complete'];
};

const applyImpact = (
  scores: Record<CompetencyDimension, number>,
  actionId: string,
  multiplier: number,
) => {
  missionActionImpacts
    .filter((item) => item.actionId === actionId)
    .forEach((impact) => {
      scores[impact.dimension] = clamp(scores[impact.dimension] + impact.impact * multiplier, 0, 100);
    });
};

const successMultiplier = (drill: Drill): number => {
  const successRate = typeof drill.successRate === 'number' ? drill.successRate : 0.55;
  return clamp(0.7 + successRate, 0.5, 1.6);
};

export const deriveCompetencySnapshot = (
  kit: MissionKit,
  overrideWeights?: Record<CompetencyDimension, number>,
): CompetencySnapshot => {
  const scores = baselineDimensionScores();

  kit.drills.forEach((drill) => {
    const actions = inferActionsFromDrill(drill);
    const multiplier = successMultiplier(drill);
    actions.forEach((actionId) => applyImpact(scores, actionId, multiplier));
  });

  const activeWeights = overrideWeights ?? competencyWeights;
  const weightedScore = (Object.keys(activeWeights) as CompetencyDimension[])
    .reduce((sum, dimension) => sum + scores[dimension] * activeWeights[dimension], 0);

  return {
    weightedScore: Math.round(clamp(weightedScore, 0, 100)),
    dimensionScores: scores,
  };
};
