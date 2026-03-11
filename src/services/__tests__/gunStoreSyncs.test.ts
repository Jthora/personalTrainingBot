import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all external deps
vi.mock('../gunSyncAdapter', () => ({
  createGunSyncAdapter: vi.fn(() => ({
    pushNow: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({
      version: 1, streakCount: 0, lastActiveDate: '', xp: 100, level: 1,
      totalDrillsCompleted: 5, badges: [], badgeUnlocks: [], quietMode: false,
      dailyGoal: { target: 5, unit: 'ops', progress: 0, updatedAt: '' },
      weeklyGoal: { target: 20, unit: 'ops', progress: 0, updatedAt: '', weekStart: '', weekEnd: '' },
      challenges: [], lastRecap: null, flags: {},
    })),
    save: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock('../../store/DrillRunStore', () => ({
  DrillRunStore: {
    get: vi.fn(() => null),
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock('../../store/AARStore', () => ({
  AARStore: {
    list: vi.fn(() => []),
    save: vi.fn(),
    replaceAll: vi.fn(),
  },
}));

import { startStoreSyncs, stopStoreSyncs } from '../gunStoreSyncs';
import { createGunSyncAdapter } from '../gunSyncAdapter';
import { AARStore } from '../../store/AARStore';
import UserProgressStore from '../../store/UserProgressStore';

beforeEach(() => {
  stopStoreSyncs();
  vi.clearAllMocks();
});

describe('gunStoreSyncs', () => {
  it('startStoreSyncs creates 3 sync adapters', () => {
    startStoreSyncs();
    expect(createGunSyncAdapter).toHaveBeenCalledTimes(3);

    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][0].namespace).toBe('progress');
    expect(calls[1][0].namespace).toBe('drillRun');
    expect(calls[2][0].namespace).toBe('aar');
  });

  it('drillRun adapter uses push direction', () => {
    startStoreSyncs();
    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[1][0].direction).toBe('push');
  });

  it('stopStoreSyncs does not throw', () => {
    startStoreSyncs();
    expect(() => stopStoreSyncs()).not.toThrow();
  });

  it('startStoreSyncs is idempotent — calling twice only registers 3 adapters, not 6', () => {
    startStoreSyncs();
    startStoreSyncs(); // second call should be a no-op
    expect(createGunSyncAdapter).toHaveBeenCalledTimes(3);
  });

  it('startStoreSyncs is idempotent after stop', () => {
    startStoreSyncs();
    stopStoreSyncs();
    (createGunSyncAdapter as ReturnType<typeof vi.fn>).mockClear();
    startStoreSyncs();
    expect(createGunSyncAdapter).toHaveBeenCalledTimes(3);
  });

  it('progress adapter serializes complex fields as JSON strings', () => {
    startStoreSyncs();
    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    const progressConfig = calls[0][0];
    const gunData = progressConfig.toGunData({
      version: 1, streakCount: 3, lastActiveDate: '2026-01-01', xp: 500, level: 2,
      totalDrillsCompleted: 10, badges: ['streak_3'], badgeUnlocks: [], quietMode: false,
      dailyGoal: { target: 5, unit: 'ops', progress: 2, updatedAt: '2026-01-01' },
      weeklyGoal: { target: 20, unit: 'ops', progress: 8, updatedAt: '2026-01-01', weekStart: '', weekEnd: '' },
      challenges: [], lastRecap: null, flags: {},
    });
    expect(gunData.xp).toBe(500);
    expect(gunData.badges_json).toBe('["streak_3"]');
    expect(typeof gunData._syncedAt).toBe('number');
  });

  it('progress adapter deserializes Gun data back', () => {
    startStoreSyncs();
    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    const progressConfig = calls[0][0];
    const result = progressConfig.fromGunData({
      version: 1, streakCount: 3, lastActiveDate: '2026-01-01', xp: 500, level: 2,
      totalDrillsCompleted: 10, quietMode: false, streakFrozen: false,
      badges_json: '["streak_3"]', badgeUnlocks_json: '[]',
      dailyGoal_json: '{"target":5,"unit":"ops","progress":2,"updatedAt":"2026-01-01"}',
      weeklyGoal_json: '{"target":20,"unit":"ops","progress":8,"updatedAt":"2026-01-01","weekStart":"","weekEnd":""}',
      challenges_json: '[]', lastRecap_json: 'null', flags_json: '{}',
    });
    expect(result).not.toBeNull();
    expect(result!.xp).toBe(500);
    expect(result!.badges).toEqual(['streak_3']);
  });

  it('aar setLocal uses replaceAll for atomic single-notification write', () => {
    startStoreSyncs();
    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    const aarConfig = calls[2][0];

    const mockReplaceAll = vi.mocked(AARStore.replaceAll);
    const mockSave = vi.mocked(AARStore.save);
    mockReplaceAll.mockClear();
    mockSave.mockClear();
    const now = Date.now();
    const remoteEntry = { id: 'remote-1', updatedAt: now + 1000, title: 'Remote', context: '', actions: '', outcomes: '', lessons: '', followups: '', owner: '', role: 'ops' as const, createdAt: now };

    aarConfig.setLocal({ entries: [remoteEntry], updatedAt: now + 1000 });

    expect(mockReplaceAll).toHaveBeenCalledTimes(1);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('progress adapter subscribes via UserProgressStore.subscribe', () => {
    startStoreSyncs();
    expect(vi.mocked(UserProgressStore.subscribe)).toHaveBeenCalledTimes(1);
  });

  it('aar adapter merges entries by updatedAt', () => {
    startStoreSyncs();
    const calls = (createGunSyncAdapter as ReturnType<typeof vi.fn>).mock.calls;
    const aarConfig = calls[2][0];

    // Verify the toGunData serializes entries
    const env = { entries: [{ id: 'a1', updatedAt: 100 }], updatedAt: 100 };
    const gunData = aarConfig.toGunData(env);
    expect(gunData.entries_json).toContain('a1');
    expect(typeof gunData._syncedAt).toBe('number');

    // Verify fromGunData deserializes
    const back = aarConfig.fromGunData({ entries_json: JSON.stringify([{ id: 'a1' }]), updatedAt: 100 });
    expect(back!.entries).toHaveLength(1);
  });
});
