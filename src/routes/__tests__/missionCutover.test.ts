import { describe, expect, it } from 'vitest';
import { isMissionRouteEnabled, resolveLegacyAliasPath, toHomeFallbackPath } from '../missionCutover';
import type { FeatureFlagKey } from '../../config/featureFlags';

const buildReader = (enabled: Partial<Record<FeatureFlagKey, boolean>>) => (flag: FeatureFlagKey) => Boolean(enabled[flag]);

describe('mission cutover routing', () => {
  it('disables mission routes when mission default cutover flag is off', () => {
    const read = buildReader({ missionDefaultRoutes: false, missionSurfaceBrief: true });
    expect(isMissionRouteEnabled('/mission/brief', read)).toBe(false);
    expect(isMissionRouteEnabled('/mission/triage', read)).toBe(false);
  });

  it('enables only explicitly flagged mission surfaces', () => {
    const read = buildReader({
      missionDefaultRoutes: true,
      missionSurfaceBrief: true,
      missionSurfaceTriage: false,
      missionSurfaceCase: true,
      missionSurfaceSignal: false,
      missionSurfaceChecklist: true,
      missionSurfaceDebrief: true,
    });

    expect(isMissionRouteEnabled('/mission/brief', read)).toBe(true);
    expect(isMissionRouteEnabled('/mission/triage', read)).toBe(false);
    expect(isMissionRouteEnabled('/mission/case', read)).toBe(true);
  });

  it('maps mission surfaces to legacy home fallbacks', () => {
    expect(toHomeFallbackPath('/mission/brief')).toBe('/home/plan');
    expect(toHomeFallbackPath('/mission/triage')).toBe('/home/cards');
    expect(toHomeFallbackPath('/mission/case')).toBe('/home/progress');
    expect(toHomeFallbackPath('/mission/signal')).toBe('/home/coach');
    expect(toHomeFallbackPath('/mission/checklist')).toBe('/home/cards');
    expect(toHomeFallbackPath('/mission/debrief')).toBe('/home/settings');
  });

  it('keeps retired workout-centric aliases mapped to mission routes', () => {
    expect(resolveLegacyAliasPath('/schedules')).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/workouts')).toBe('/mission/triage');
    expect(resolveLegacyAliasPath('/training')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/training/run')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/settings')).toBe('/mission/debrief');
  });
});
