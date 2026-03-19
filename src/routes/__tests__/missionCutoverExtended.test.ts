import { describe, it, expect } from 'vitest';
import {
  missionRoutePaths,
  coreMissionRoutePaths,
} from '../missionCutover';

describe('missionCutover – extended coverage', () => {
  it('exports 9 mission route paths including stats, plan, and training', () => {
    expect(missionRoutePaths).toHaveLength(9);
    expect(missionRoutePaths).toContain('/mission/stats');
    expect(missionRoutePaths).toContain('/mission/plan');
    expect(missionRoutePaths).toContain('/mission/training');
  });

  it('coreMissionRoutePaths contains the 6 core routes', () => {
    expect(coreMissionRoutePaths).toHaveLength(6);
    expect(coreMissionRoutePaths).not.toContain('/mission/stats');
    expect(coreMissionRoutePaths).not.toContain('/mission/plan');
  });
});
