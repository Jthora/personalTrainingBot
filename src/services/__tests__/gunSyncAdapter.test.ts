import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Gun infrastructure so we don't load real Gun.js
const mockPut = vi.hoisted(() => vi.fn());
const mockOn = vi.hoisted(() => vi.fn());
const mockGetNode = vi.hoisted(() => vi.fn(() => ({
  put: mockPut,
  on: mockOn,
  get: vi.fn(() => ({ put: mockPut, on: mockOn })),
})));

vi.mock('../gunDb', () => ({
  getGun: vi.fn(() => ({
    user: vi.fn(() => ({
      is: { pub: 'test-pub' },
      get: mockGetNode,
    })),
  })),
}));

const mockIdentitySubscribe = vi.hoisted(() => vi.fn());
vi.mock('../gunIdentity', () => ({
  GunIdentityService: {
    get: vi.fn(() => ({ keypair: { pub: 'test-pub' }, alias: 'Test', createdAt: '' })),
    getPublicKey: vi.fn(() => 'test-pub'),
    subscribe: mockIdentitySubscribe,
  },
}));

vi.mock('../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

import { createGunSyncAdapter } from '../gunSyncAdapter';

beforeEach(() => {
  vi.clearAllMocks();
  // By default, subscribe fires immediately with an identity
  mockIdentitySubscribe.mockImplementation((cb: (id: any) => void) => {
    cb({ keypair: { pub: 'test-pub' }, alias: 'Test', createdAt: '' });
    return () => {};
  });
});

describe('GunSyncAdapter', () => {
  const createTestAdapter = (overrides = {}) => {
    const local = { value: 42, updatedAt: 1000 };
    const config = {
      namespace: 'test',
      getLocal: vi.fn(() => local),
      setLocal: vi.fn(),
      toGunData: vi.fn((d: typeof local) => ({ value: d.value, updatedAt: d.updatedAt })),
      fromGunData: vi.fn((d: any) => d.value != null ? { value: d.value, updatedAt: d.updatedAt } : null),
      getVersion: vi.fn((d: typeof local) => d.updatedAt),
      ...overrides,
    };
    const handle = createGunSyncAdapter(config);
    return { handle, config, local };
  };

  it('creates without throwing', () => {
    const { handle } = createTestAdapter();
    expect(handle).toBeTruthy();
    expect(handle.pushNow).toBeTypeOf('function');
    expect(handle.stop).toBeTypeOf('function');
    handle.stop();
  });

  it('subscribes to identity on creation', () => {
    const { handle } = createTestAdapter();
    expect(mockIdentitySubscribe).toHaveBeenCalled();
    handle.stop();
  });

  it('pushNow calls toGunData and puts to Gun', () => {
    // Identity subscribe auto-pushes on creation, so toGunData is already called.
    // We verify the initial push happened.
    const { handle, config } = createTestAdapter();
    expect(config.toGunData).toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalled();
    handle.stop();
  });

  it('pushNow is a no-op when direction is pull', () => {
    const { handle, config } = createTestAdapter({ direction: 'pull' as const });
    handle.pushNow();
    expect(config.toGunData).not.toHaveBeenCalled();
    handle.stop();
  });

  it('pushNow skips if getLocal returns null', () => {
    const { handle } = createTestAdapter({ getLocal: () => null });
    handle.pushNow();
    expect(mockPut).not.toHaveBeenCalled();
    handle.stop();
  });

  it('stop prevents further pushes', () => {
    const { handle, config } = createTestAdapter();
    handle.stop();
    config.toGunData.mockClear();
    mockPut.mockClear();
    handle.pushNow();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('does not push same version twice', () => {
    const { handle } = createTestAdapter();
    mockPut.mockClear();
    handle.pushNow();
    const firstCallCount = mockPut.mock.calls.length;
    handle.pushNow(); // same version, should skip
    expect(mockPut.mock.calls.length).toBe(firstCallCount);
    handle.stop();
  });
});
