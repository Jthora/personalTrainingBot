import { describe, it, expect } from 'vitest';
import {
  missionRoutePaths,
  coreMissionRoutePaths,
  isMissionRouteEnabled,
  toHomeFallbackPath,
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

  it('stats and plan are enabled routes', () => {
    expect(isMissionRouteEnabled('/mission/stats')).toBe(true);
    expect(isMissionRouteEnabled('/mission/plan')).toBe(true);
  });

  it('toHomeFallbackPath returns undefined for stats and plan', () => {
    expect(toHomeFallbackPath('/mission/stats')).toBeUndefined();
    expect(toHomeFallbackPath('/mission/plan')).toBeUndefined();
  });
});
