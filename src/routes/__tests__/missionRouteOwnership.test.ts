import { describe, expect, it } from 'vitest';
import {
  resolveLegacyAliasPath,
} from '../missionCutover';

describe('mission route ownership', () => {
  it('retains legacy aliases as compatibility redirects to mission routes', () => {
    expect(resolveLegacyAliasPath('/schedules')).toBe('/mission/brief');
    expect(resolveLegacyAliasPath('/drills')).toBe('/mission/triage');
    expect(resolveLegacyAliasPath('/training')).toBe('/mission/training');
    expect(resolveLegacyAliasPath('/training/run')).toBe('/mission/training');
    expect(resolveLegacyAliasPath('/settings')).toBe('/mission/debrief');
  });
});
