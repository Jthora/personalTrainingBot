import { describe, it, expect } from 'vitest';
import {
  primaryTabs,
  missionTabs,
  getAllTabs,
  isMissionModeEnabled,
  setMissionMode,
  MISSION_MODE_STORAGE_KEY,
} from '../appShellTabs';

describe('appShellTabs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('primaryTabs has 4 entries', () => {
    expect(primaryTabs).toHaveLength(4);
    expect(primaryTabs.map((t) => t.label)).toEqual(['Train', 'Review', 'Progress', 'Profile']);
  });

  it('missionTabs has 5 entries, all marked missionOnly', () => {
    expect(missionTabs).toHaveLength(5);
    missionTabs.forEach((t) => expect(t.missionOnly).toBe(true));
  });

  it('getAllTabs returns 4 tabs when mission mode is off', () => {
    expect(getAllTabs(false)).toHaveLength(4);
  });

  it('getAllTabs returns 9 tabs when mission mode is on', () => {
    expect(getAllTabs(true)).toHaveLength(9);
  });

  it('isMissionModeEnabled reads from localStorage', () => {
    expect(isMissionModeEnabled()).toBe(false);
    localStorage.setItem(MISSION_MODE_STORAGE_KEY, 'enabled');
    expect(isMissionModeEnabled()).toBe(true);
  });

  it('setMissionMode persists to localStorage', () => {
    setMissionMode(true);
    expect(localStorage.getItem(MISSION_MODE_STORAGE_KEY)).toBe('enabled');
    setMissionMode(false);
    expect(localStorage.getItem(MISSION_MODE_STORAGE_KEY)).toBeNull();
  });

  it('each tab has unique path', () => {
    const all = getAllTabs(true);
    const paths = all.map((t) => t.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
