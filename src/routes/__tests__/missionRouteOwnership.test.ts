import { describe, expect, it } from 'vitest';
import {
  getDefaultRootPath,
  isMissionRouteEnabled,
  resolveLegacyAliasPath,
  toHomeFallbackPath,
} from '../missionCutover';

describe('mission route ownership', () => {
  it('uses mission brief as the canonical root', () => {
    expect(getDefaultRootPath()).toBe('/mission/brief');
  });

  it('keeps mission routes enabled for all canonical mission steps', () => {
    expect(isMissionRouteEnabled('/mission/brief')).toBe(true);
    expect(isMissionRouteEnabled('/mission/triage')).toBe(true);
    expect(isMissionRouteEnabled('/mission/case')).toBe(true);
    expect(isMissionRouteEnabled('/mission/signal')).toBe(true);
    expect(isMissionRouteEnabled('/mission/checklist')).toBe(true);
    expect(isMissionRouteEnabled('/mission/debrief')).toBe(true);
  });

  it('retains legacy aliases as compatibility redirects to mission routes', () => {
    expect(resolveLegacyAliasPath('/schedules')).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/drills')).toBe('/mission/triage');
    expect(resolveLegacyAliasPath('/training')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/training/run')).toBe('/mission/checklist');
    expect(resolveLegacyAliasPath('/settings')).toBe('/mission/debrief');
  });

  it('preserves home fallback mapping for compatibility reporting', () => {
    expect(toHomeFallbackPath('/mission/brief')).toBe('/home/plan');
    expect(toHomeFallbackPath('/mission/triage')).toBe('/home/cards');
    expect(toHomeFallbackPath('/mission/case')).toBe('/home/progress');
    expect(toHomeFallbackPath('/mission/signal')).toBe('/home/handler');
    expect(toHomeFallbackPath('/mission/checklist')).toBe('/home/cards');
    expect(toHomeFallbackPath('/mission/debrief')).toBe('/home/settings');
  });
});
