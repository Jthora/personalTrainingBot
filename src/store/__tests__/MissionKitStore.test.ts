import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionKitStore } from '../MissionKitStore';
import type { MissionKit } from '../../data/missionKits/sampleMissionKit';

vi.mock('../../utils/missionKitGenerator', () => ({
  generateMissionKit: vi.fn(() => null), // default: no generated kit
}));

import { generateMissionKit } from '../../utils/missionKitGenerator';
const mockGenerate = vi.mocked(generateMissionKit);

describe('MissionKitStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    MissionKitStore.regenerateKit(); // reset session cache between tests
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

  /* ── Phase 4.3: getPrimaryKit prefers generated kit ── */

  it('getPrimaryKit returns generated kit when available', () => {
    const fakeKit: MissionKit = {
      id: 'generated-test',
      title: 'Dynamic Training Kit',
      synopsis: 'Test kit',
      missionType: 'cyber',
      drills: [
        { id: 'gen-drill-1', title: 'Cyber Drill', type: 'rapid-response', difficulty: 3, durationMinutes: 10, moduleId: 'cybersecurity' },
      ],
    };
    mockGenerate.mockReturnValue(fakeKit);
    const primary = MissionKitStore.getPrimaryKit();
    expect(primary).toBeDefined();
    expect(primary!.id).toBe('generated-test');
    expect(primary!.title).toBe('Dynamic Training Kit');
  });

  it('getPrimaryKit returns same cached kit on repeated calls', () => {
    const fakeKit: MissionKit = {
      id: 'cached-kit',
      title: 'Cached Kit',
      synopsis: 'Test',
      missionType: 'cyber',
      drills: [{ id: 'gen-drill-c', title: 'D', type: 'rapid-response', difficulty: 3, durationMinutes: 5 }],
    };
    mockGenerate.mockReturnValue(fakeKit);
    const first = MissionKitStore.getPrimaryKit();
    const second = MissionKitStore.getPrimaryKit();
    expect(first!.id).toBe('cached-kit');
    expect(second!.id).toBe('cached-kit');
    // generateMissionKit should only be called once because of caching
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('regenerateKit clears the cache so next getPrimaryKit re-generates', () => {
    mockGenerate.mockReturnValue({ id: 'kit-a', title: 'A', synopsis: '', missionType: 'cyber', drills: [] });
    MissionKitStore.getPrimaryKit();
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    MissionKitStore.regenerateKit();
    mockGenerate.mockReturnValue({ id: 'kit-b', title: 'B', synopsis: '', missionType: 'cyber', drills: [] });
    const refreshed = MissionKitStore.getPrimaryKit();
    expect(mockGenerate).toHaveBeenCalledTimes(2);
    expect(refreshed!.id).toBe('kit-b');
  });

  it('getPrimaryKit falls back to sample kit when generator returns null', () => {
    mockGenerate.mockReturnValue(null);
    const primary = MissionKitStore.getPrimaryKit();
    expect(primary).toBeDefined();
    // The sample kit has a known title
    expect(primary!.drills.length).toBeGreaterThan(0);
  });

  it('getPrimaryKit applies drill stats to generated kit', () => {
    MissionKitStore.recordDrillCompletion('gen-drill-stats', true);
    const fakeKit: MissionKit = {
      id: 'generated-stats-test',
      title: 'Stats Kit',
      synopsis: 'Test',
      missionType: 'cyber',
      drills: [
        { id: 'gen-drill-stats', title: 'Stat Drill', type: 'rapid-response', difficulty: 3, durationMinutes: 10, moduleId: 'cybersecurity' },
      ],
    };
    mockGenerate.mockReturnValue(fakeKit);
    const primary = MissionKitStore.getPrimaryKit();
    expect(primary!.drills[0].lastCompleted).toBeDefined();
    expect(primary!.drills[0].successRate).toBe(1);
  });
});
