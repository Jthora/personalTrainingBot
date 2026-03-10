import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../gunDb', () => ({
  getGun: vi.fn(() => null),
}));

vi.mock('../gunIdentity', () => {
  const listeners = new Set<(id: any) => void>();
  return {
    GunIdentityService: {
      get: vi.fn(() => null),
      getPublicKey: vi.fn(() => null),
      updateAlias: vi.fn(),
      subscribe: vi.fn((cb: (id: any) => void) => {
        listeners.add(cb);
        cb(null);
        return () => listeners.delete(cb);
      }),
      _listeners: listeners,
    },
  };
});

vi.mock('../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

vi.mock('../../store/OperativeProfileStore', () => {
  const storeListeners = new Set<() => void>();
  return {
    default: {
      get: vi.fn(() => null),
      patch: vi.fn(),
      subscribe: vi.fn((cb: () => void) => {
        storeListeners.add(cb);
        return () => storeListeners.delete(cb);
      }),
      _listeners: storeListeners,
    },
  };
});

import { startGunProfileBridge, stopGunProfileBridge } from '../gunProfileBridge';
import { GunIdentityService } from '../gunIdentity';
import OperativeProfileStore from '../../store/OperativeProfileStore';

beforeEach(() => {
  stopGunProfileBridge();
  vi.clearAllMocks();
});

describe('GunProfileBridge', () => {
  it('starts without throwing', () => {
    expect(() => startGunProfileBridge()).not.toThrow();
  });

  it('stops without throwing', () => {
    startGunProfileBridge();
    expect(() => stopGunProfileBridge()).not.toThrow();
  });

  it('subscribes to identity service on start', () => {
    startGunProfileBridge();
    expect(GunIdentityService.subscribe).toHaveBeenCalled();
  });

  it('subscribes to profile store on start', () => {
    startGunProfileBridge();
    expect(OperativeProfileStore.subscribe).toHaveBeenCalled();
  });

  it('does not double-start', () => {
    startGunProfileBridge();
    startGunProfileBridge();
    // subscribe should only be called once per start (3 subscriptions total)
    const identitySubCalls = (GunIdentityService.subscribe as ReturnType<typeof vi.fn>).mock.calls.length;
    const storeSubCalls = (OperativeProfileStore.subscribe as ReturnType<typeof vi.fn>).mock.calls.length;
    // First start: 1 identity sub + 2 store subs = 3
    // Second start: no-op
    expect(identitySubCalls).toBe(1);
    expect(storeSubCalls).toBe(2);
  });
});
