import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Web3AuthService before importing SettingsStore
vi.mock('../../services/Web3AuthService', () => ({
  default: {
    getInstance: () => ({
      getWalletAddress: vi.fn().mockResolvedValue(null),
      connect: vi.fn().mockResolvedValue('0xabc123'),
      disconnect: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

import SettingsStore from '../SettingsStore';

const STORAGE_KEY = 'ptb:user-preferences';

describe('SettingsStore', () => {
  let store: InstanceType<typeof SettingsStore>;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Reset singleton for test isolation
    // @ts-expect-error — accessing private static for test reset
    SettingsStore.instance = undefined;
    store = SettingsStore.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('getInstance returns singleton', () => {
    const a = SettingsStore.getInstance();
    const b = SettingsStore.getInstance();
    expect(a).toBe(b);
  });

  it('getUserPreferences returns dark theme by default', () => {
    const prefs = store.getUserPreferences();
    expect(prefs.theme).toBe('dark');
    expect(prefs.profile).toEqual({});
  });

  it('updateProfile persists and retrieves updated profile', () => {
    store.updateProfile({ nickname: 'ghost', avatar: 'skull.png' });
    const prefs = store.getUserPreferences();
    expect(prefs.profile.nickname).toBe('ghost');
    expect(prefs.profile.avatar).toBe('skull.png');
    // Persisted
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.profile.nickname).toBe('ghost');
  });

  it('updateTheme persists theme choice', () => {
    store.updateTheme('light');
    expect(store.getUserPreferences().theme).toBe('light');
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.theme).toBe('light');
  });

  it('initialize loads stored preferences', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'light', profile: { nickname: 'alpha' } }));
    // @ts-expect-error — reset for re-init
    SettingsStore.instance = undefined;
    const fresh = SettingsStore.getInstance();
    await fresh.initialize();
    expect(fresh.getUserPreferences().theme).toBe('light');
    expect(fresh.getUserPreferences().profile.nickname).toBe('alpha');
  });

  it('handles missing Web3Auth gracefully', async () => {
    const address = await store.getWalletAddress();
    expect(address).toBeNull();
  });

  it('handles corrupt localStorage gracefully', async () => {
    localStorage.setItem(STORAGE_KEY, '<<<invalid>>>');
    // @ts-expect-error — reset for re-init
    SettingsStore.instance = undefined;
    const fresh = SettingsStore.getInstance();
    await fresh.initialize();
    // Should fall back to defaults, not throw
    expect(fresh.getUserPreferences().theme).toBe('dark');
  });

  it('connectWeb3 returns address', async () => {
    const address = await store.connectWeb3();
    expect(address).toBe('0xabc123');
  });
});
