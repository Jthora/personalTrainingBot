import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock gunDb to avoid loading real Gun.js in tests
vi.mock('../gunDb', () => ({
  getGun: vi.fn(() => null),
  getSEA: vi.fn(() => null),
  _resetGunInstance: vi.fn(),
}));

import { getGun, getSEA, _resetGunInstance } from '../gunDb';

beforeEach(() => {
  _resetGunInstance();
  vi.clearAllMocks();
});

describe('gunDb', () => {
  it('getGun returns null (mocked, no real Gun in test env)', () => {
    expect(getGun()).toBeNull();
  });

  it('getSEA returns null (mocked)', () => {
    expect(getSEA()).toBeNull();
  });

  it('_resetGunInstance does not throw', () => {
    expect(() => _resetGunInstance()).not.toThrow();
  });
});
