import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionKitStore } from '../MissionKitStore';

describe('MissionKitStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('getKits returns at least one kit', () => {
    const kits = MissionKitStore.getKits();
    expect(kits.length).toBeGreaterThan(0);
  });

  it('getPrimaryKit returns the first kit', () => {
    const primary = MissionKitStore.getPrimaryKit();
    expect(primary).toBeDefined();
    expect(primary!.drills).toBeDefined();
  });

  it('isVisible defaults to true', () => {
    expect(MissionKitStore.isVisible()).toBe(true);
  });

  it('toggleVisible flips state and persists', () => {
    expect(MissionKitStore.isVisible()).toBe(true);
    MissionKitStore.toggleVisible();
    expect(MissionKitStore.isVisible()).toBe(false);
    MissionKitStore.toggleVisible();
    expect(MissionKitStore.isVisible()).toBe(true);
  });

  it('setVisible explicitly sets visibility', () => {
    MissionKitStore.setVisible(false);
    expect(MissionKitStore.isVisible()).toBe(false);
    // Persisted to localStorage
    expect(JSON.parse(localStorage.getItem('missionKit:visible')!)).toBe(false);
  });

  it('recordDrillCompletion creates stats for new drill', () => {
    MissionKitStore.recordDrillCompletion('drill-1', true);
    const stored = JSON.parse(localStorage.getItem('ptb:drill-stats')!);
    expect(stored['drill-1']).toBeDefined();
    expect(stored['drill-1'].completionCount).toBe(1);
    expect(stored['drill-1'].successRate).toBe(1);
    expect(stored['drill-1'].lastCompleted).toBeDefined();
  });

  it('recordDrillCompletion increments existing stats', () => {
    MissionKitStore.recordDrillCompletion('drill-1', true);
    MissionKitStore.recordDrillCompletion('drill-1', false);
    const stored = JSON.parse(localStorage.getItem('ptb:drill-stats')!);
    expect(stored['drill-1'].completionCount).toBe(2);
    expect(stored['drill-1'].successRate).toBe(0.5); // 1 success out of 2
  });

  it('recordDrillCompletion calculates successRate correctly', () => {
    MissionKitStore.recordDrillCompletion('d', true);
    MissionKitStore.recordDrillCompletion('d', true);
    MissionKitStore.recordDrillCompletion('d', false);
    const stored = JSON.parse(localStorage.getItem('ptb:drill-stats')!);
    // (0.5 * 0 + 1) / 1 = 1, then (1 * 1 + 1) / 2 = 1, then (1 * 2 + 0) / 3 = 0.67
    expect(stored['d'].successRate).toBeCloseTo(0.67, 1);
  });
});
