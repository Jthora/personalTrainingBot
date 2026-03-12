import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../cache/indexedDbCache', () => ({
  withCache: vi.fn(async (_store: string, _key: string, _ttl: number, _sig: string, loader: () => Promise<unknown>) => {
    const data = await loader();
    return { data, source: 'network', stale: false };
  }),
  APP_VERSION: '1.0.0',
}));

vi.mock('../cache/constants', () => ({ TTL_MS: { scheduleStub: 60000, scheduleDetails: 60000 } }));

vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: vi.fn(() => false),
}));

const mockScheduleJSON = { id: 'sched-1', name: 'Test', items: [] };
const mockSchedule = {
  toJSON: () => mockScheduleJSON,
};

vi.mock('../MissionScheduleCreator', () => ({
  createMissionSchedule: vi.fn(async () => mockSchedule),
}));

vi.mock('../../store/MissionScheduleStore', () => ({
  default: {
    saveSchedule: vi.fn(),
    getScheduleSync: vi.fn(() => null),
  },
}));

vi.mock('../../types/MissionSchedule', () => ({
  MissionSchedule: {
    fromJSON: vi.fn((json: unknown) => ({ ...json as object, fromJSON: true })),
  },
}));

import { loadScheduleStub, onScheduleEvent } from '../ScheduleLoader';
import MissionScheduleStore from '../../store/MissionScheduleStore';

describe('ScheduleLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadScheduleStub returns schedule and saves to store', async () => {
    const result = await loadScheduleStub();
    expect(result.schedule).toBeTruthy();
    expect(MissionScheduleStore.saveSchedule).toHaveBeenCalled();
  });

  it('loadScheduleStub emits stub-ready event', async () => {
    const listener = vi.fn();
    const unsub = onScheduleEvent('schedule:stub-ready', listener);
    await loadScheduleStub();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ source: 'network' }));
    unsub();
  });

  it('onScheduleEvent returns unsubscribe function', () => {
    const listener = vi.fn();
    const unsub = onScheduleEvent('schedule:stub-ready', listener);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('loadScheduleStub emits refresh-failed on error', async () => {
    const { createMissionSchedule } = await import('../MissionScheduleCreator');
    (createMissionSchedule as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'));
    const listener = vi.fn();
    const unsub = onScheduleEvent('schedule:refresh-failed', listener);
    await expect(loadScheduleStub()).rejects.toThrow('boom');
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ stage: 'stub' }));
    unsub();
  });
});
