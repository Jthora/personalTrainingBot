import { describe, expect, it } from 'vitest';
import { sampleMissionKit } from '../../data/missionKits/sampleMissionKit';
import { deriveCompetencySnapshot } from './competencyModel';

describe('deriveCompetencySnapshot', () => {
  it('returns bounded weighted score and all competency dimensions', () => {
    const snapshot = deriveCompetencySnapshot(sampleMissionKit);
    expect(snapshot.weightedScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.weightedScore).toBeLessThanOrEqual(100);
    expect(Object.keys(snapshot.dimensionScores).sort()).toEqual([
      'artifact_traceability',
      'decision_quality',
      'signal_analysis',
      'triage_execution',
    ]);
  });

  it('raises artifact traceability for Charlie artifact-chain drill mapping', () => {
    const snapshot = deriveCompetencySnapshot(sampleMissionKit);
    expect(snapshot.dimensionScores.artifact_traceability).toBeGreaterThan(50);
  });
});
