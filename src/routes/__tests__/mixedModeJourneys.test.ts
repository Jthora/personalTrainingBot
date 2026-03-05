import { describe, expect, it } from 'vitest';
import {
  getDefaultRootPath,
  isMissionRouteEnabled,
  resolveLegacyAliasPath,
  toHomeFallbackPath,
} from '../missionCutover';
import type { FeatureFlagKey } from '../../config/featureFlags';

const readFrom = (flags: Partial<Record<FeatureFlagKey, boolean>>) => (flag: FeatureFlagKey) => Boolean(flags[flag]);

describe('mixed-mode route journeys', () => {
  it('keeps legacy home journey canonical when mission default is disabled', () => {
    const read = readFrom({
      missionDefaultRoutes: false,
      missionSurfaceBrief: true,
      missionSurfaceTriage: true,
      missionSurfaceChecklist: true,
      missionSurfaceDebrief: true,
    });

    expect(getDefaultRootPath(read)).toBe('/home/plan');
    expect(resolveLegacyAliasPath('/schedules')).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/workouts')).toBe('/mission/triage');
    expect(resolveLegacyAliasPath('/training')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/settings')).toBe('/mission/debrief');
    expect(isMissionRouteEnabled('/mission/brief', read)).toBe(false);
    expect(toHomeFallbackPath('/mission/brief')).toBe('/home/plan');
  });

  it('supports partial mission rollout while preserving fallback continuity', () => {
    const read = readFrom({
      missionDefaultRoutes: true,
      missionSurfaceBrief: true,
      missionSurfaceTriage: false,
      missionSurfaceCase: true,
      missionSurfaceSignal: false,
      missionSurfaceChecklist: true,
      missionSurfaceDebrief: false,
    });

    expect(getDefaultRootPath(read)).toBe('/mission/brief');
    expect(isMissionRouteEnabled('/mission/brief', read)).toBe(true);
    expect(isMissionRouteEnabled('/mission/triage', read)).toBe(false);
    expect(isMissionRouteEnabled('/mission/signal', read)).toBe(false);
    expect(resolveLegacyAliasPath('/workouts')).toBe('/mission/triage');
    expect(toHomeFallbackPath('/mission/triage')).toBe('/home/cards');
    expect(toHomeFallbackPath('/mission/signal')).toBe('/home/coach');
  });

  it('routes legacy aliases fully to mission surfaces after full cutover', () => {
    const read = readFrom({
      missionDefaultRoutes: true,
      missionSurfaceBrief: true,
      missionSurfaceTriage: true,
      missionSurfaceCase: true,
      missionSurfaceSignal: true,
      missionSurfaceChecklist: true,
      missionSurfaceDebrief: true,
    });

    expect(getDefaultRootPath(read)).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/schedules')).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/workouts')).toBe('/mission/triage');
    expect(resolveLegacyAliasPath('/training')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/training/run')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/settings')).toBe('/mission/debrief');
  });
});
