import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DifficultySettingsStore from '../DifficultySettingsStore';
import { DifficultySetting } from '../../types/DifficultySetting';

describe('DifficultySettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    DifficultySettingsStore.clearSettings();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to level 7, range [1, 10] when no persisted state', () => {
    const setting = DifficultySettingsStore.getSettings();
    expect(setting.level).toBe(7);
    expect(setting.range).toEqual([1, 10]);
  });

  it('saveSettings persists and retrieves', () => {
    const custom = new DifficultySetting(5, [3, 8]);
    DifficultySettingsStore.saveSettings(custom);
    const retrieved = DifficultySettingsStore.getSettings();
    expect(retrieved.level).toBe(5);
    expect(retrieved.range).toEqual([3, 8]);
  });

  it('saveSettings accepts JSON format', () => {
    DifficultySettingsStore.saveSettings({ level: 3, range: [1, 5] });
    const retrieved = DifficultySettingsStore.getSettings();
    expect(retrieved.level).toBe(3);
    expect(retrieved.range).toEqual([1, 5]);
  });

  it('clearSettings resets to default', () => {
    DifficultySettingsStore.saveSettings(new DifficultySetting(2, [1, 3]));
    DifficultySettingsStore.clearSettings();
    const setting = DifficultySettingsStore.getSettings();
    expect(setting.level).toBe(7);
  });

  it('getWeightedRandomDifficultyFromCurrentSelectedSetting returns value within range', () => {
    DifficultySettingsStore.saveSettings(new DifficultySetting(5, [3, 8]));
    for (let i = 0; i < 20; i++) {
      const result = DifficultySettingsStore.getWeightedRandomDifficultyFromCurrentSelectedSetting();
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(8);
    }
  });

  it('getWeightedRandomDifficultyFor clamps to range bounds', () => {
    for (let i = 0; i < 20; i++) {
      const result = DifficultySettingsStore.getWeightedRandomDifficultyFor(5, [4, 6]);
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(6);
    }
  });
});
