import { operationAlphaStepSequence } from '../../domain/mission/exemplars/operationAlpha';
import { operationBravoStepSequence } from '../../domain/mission/exemplars/operationBravo';
import { operationCharlieStepSequence } from '../../domain/mission/exemplars/operationCharlie';

export type DrillStep = {
  id: string;
  label: string;
};

export type Drill = {
  id: string;
  title: string;
  type: 'simulation' | 'tabletop' | 'rapid-response';
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationMinutes: number;
  steps?: DrillStep[];
  lastCompleted?: string; // ISO date
  successRate?: number; // 0-1
};

export type MissionKit = {
  id: string;
  title: string;
  synopsis: string;
  missionType: 'cyber' | 'osint' | 'comms' | 'resilience';
  drills: Drill[];
};

export const sampleMissionKit: MissionKit = {
  id: 'operation-exemplar-kit',
  title: 'Operation Exemplar Kit',
  synopsis: 'Run Alpha, Bravo, and Charlie mission flows for triage, signal analysis, and artifact-chain decisions.',
  missionType: 'cyber',
  drills: [
    {
      id: 'operation-alpha-intro-run',
      title: 'Operation Alpha: Introductory Triage Run',
      type: 'rapid-response',
      difficulty: 3,
      durationMinutes: 18,
      steps: operationAlphaStepSequence,
      lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      successRate: 0.88,
    },
    {
      id: 'operation-bravo-branch-analysis',
      title: 'Operation Bravo: Signal Branch Analysis',
      type: 'tabletop',
      difficulty: 4,
      durationMinutes: 22,
      steps: operationBravoStepSequence,
      lastCompleted: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      successRate: 0.74,
    },
    {
      id: 'operation-charlie-artifact-chain',
      title: 'Operation Charlie: Artifact Chain Decisions',
      type: 'simulation',
      difficulty: 5,
      durationMinutes: 24,
      steps: operationCharlieStepSequence,
      successRate: 0.68,
    },
    {
      id: 'alpha-containment-window',
      title: 'Alpha Containment Timing Drill',
      type: 'rapid-response',
      difficulty: 4,
      durationMinutes: 18,
      lastCompleted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      successRate: 0.6,
    },
  ],
};
