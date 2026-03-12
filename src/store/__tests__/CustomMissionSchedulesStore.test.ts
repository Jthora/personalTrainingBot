import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CustomMissionSchedulesStore from '../CustomMissionSchedulesStore';
import { CustomMissionSchedule, MissionSchedule } from '../../types/MissionSchedule';
import { DifficultySetting } from '../../types/DifficultySetting';

const makeSchedule = (name: string, desc: string): CustomMissionSchedule => {
  const inner = new MissionSchedule('2026-03-11', [], new DifficultySetting(5, [1, 10]));
  return new CustomMissionSchedule(name, desc, inner);
};

describe('CustomMissionSchedulesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    CustomMissionSchedulesStore.clearCustomSchedules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(CustomMissionSchedulesStore.getCustomSchedules()).toEqual([]);
  });

  it('saveCustomSchedule persists valid schedule', () => {
    const schedule = makeSchedule('Alpha', 'First mission plan');
    CustomMissionSchedulesStore.saveCustomSchedule(schedule);
    const all = CustomMissionSchedulesStore.getCustomSchedules();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Alpha');
    expect(all[0].description).toBe('First mission plan');
    expect(all[0].id).toBe(schedule.id);
  });

  it('getCustomSchedules returns all persisted', () => {
    CustomMissionSchedulesStore.saveCustomSchedule(makeSchedule('A', 'a'));
    CustomMissionSchedulesStore.saveCustomSchedule(makeSchedule('B', 'b'));
    CustomMissionSchedulesStore.saveCustomSchedule(makeSchedule('C', 'c'));
    expect(CustomMissionSchedulesStore.getCustomSchedules().length).toBe(3);
  });

  it('updateCustomSchedule applies partial update', () => {
    const schedule = makeSchedule('Original', 'desc');
    CustomMissionSchedulesStore.saveCustomSchedule(schedule);
    const updated = new CustomMissionSchedule('Updated', 'new desc', schedule.missionSchedule, schedule.id);
    CustomMissionSchedulesStore.updateCustomSchedule(updated);
    const all = CustomMissionSchedulesStore.getCustomSchedules();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Updated');
    expect(all[0].description).toBe('new desc');
  });

  it('updateCustomSchedule no-ops for unknown id', () => {
    const schedule = makeSchedule('Existing', 'desc');
    CustomMissionSchedulesStore.saveCustomSchedule(schedule);
    const stranger = makeSchedule('Ghost', 'nope');
    CustomMissionSchedulesStore.updateCustomSchedule(stranger);
    const all = CustomMissionSchedulesStore.getCustomSchedules();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Existing');
  });

  it('deleteCustomSchedule removes by id', () => {
    const a = makeSchedule('A', 'a');
    const b = makeSchedule('B', 'b');
    CustomMissionSchedulesStore.saveCustomSchedule(a);
    CustomMissionSchedulesStore.saveCustomSchedule(b);
    CustomMissionSchedulesStore.deleteCustomSchedule(a.id);
    const all = CustomMissionSchedulesStore.getCustomSchedules();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('B');
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('customMissionSchedules', '<<<bad json>>>');
    // Should fall back to empty or handle gracefully
    const all = CustomMissionSchedulesStore.getCustomSchedules();
    expect(Array.isArray(all)).toBe(true);
  });
});
