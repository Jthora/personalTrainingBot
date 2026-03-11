import { describe, it, expect } from 'vitest';
import {
  missionRoutePaths,
  coreMissionRoutePaths,
  isMissionRouteEnabled,
  toHomeFallbackPath,
} from '../missionCutover';

describe('missionCutover – extended coverage', () => {
  it('exports 8 mission route paths including stats and plan', () => {
    expect(missionRoutePaths).toHaveLength(8);
    expect(missionRoutePaths).toContain('/mission/stats');
    expect(missionRoutePaths).toContain('/mission/plan');
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
