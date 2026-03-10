import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../gunDb', () => ({
  getGun: vi.fn(() => null),
  getSEA: vi.fn(() => null),
}));

vi.mock('../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

import { GunIdentityService } from '../gunIdentity';
import { getSEA } from '../gunDb';

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('GunIdentityService', () => {
  it('get returns null when no identity is stored', () => {
    expect(GunIdentityService.get()).toBeNull();
  });

  it('create generates a keypair and persists identity', async () => {
    const mockKeypair = {
      pub: 'test-pub-key',
      priv: 'test-priv-key',
      epub: 'test-epub-key',
      epriv: 'test-epriv-key',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    const identity = await GunIdentityService.create('TestOperative');

    expect(identity.keypair.pub).toBe('test-pub-key');
    expect(identity.alias).toBe('TestOperative');
    expect(identity.createdAt).toBeTruthy();

    // Should be persisted
    const stored = GunIdentityService.get();
    expect(stored?.keypair.pub).toBe('test-pub-key');
  });

  it('login returns stored identity', async () => {
    const mockKeypair = {
      pub: 'login-pub',
      priv: 'login-priv',
      epub: 'login-epub',
      epriv: 'login-epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    await GunIdentityService.create('LoginTest');
    const result = GunIdentityService.login();

    expect(result?.keypair.pub).toBe('login-pub');
    expect(result?.alias).toBe('LoginTest');
  });

  it('login returns null when no identity exists', () => {
    expect(GunIdentityService.login()).toBeNull();
  });

  it('updateAlias updates the stored alias', async () => {
    const mockKeypair = {
      pub: 'alias-pub',
      priv: 'alias-priv',
      epub: 'alias-epub',
      epriv: 'alias-epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    await GunIdentityService.create('OriginalName');
    const updated = GunIdentityService.updateAlias('NewCallsign');

    expect(updated?.alias).toBe('NewCallsign');
    expect(GunIdentityService.get()?.alias).toBe('NewCallsign');
  });

  it('logout removes identity and notifies', async () => {
    const mockKeypair = {
      pub: 'logout-pub',
      priv: 'logout-priv',
      epub: 'logout-epub',
      epriv: 'logout-epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    await GunIdentityService.create('LogoutTest');
    expect(GunIdentityService.get()).not.toBeNull();

    GunIdentityService.logout();
    expect(GunIdentityService.get()).toBeNull();
  });

  it('subscribe fires immediately with current state', async () => {
    const cb = vi.fn();
    const unsub = GunIdentityService.subscribe(cb);

    expect(cb).toHaveBeenCalledWith(null);
    unsub();
  });

  it('subscribe fires on create', async () => {
    const mockKeypair = {
      pub: 'sub-pub',
      priv: 'sub-priv',
      epub: 'sub-epub',
      epriv: 'sub-epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    const cb = vi.fn();
    const unsub = GunIdentityService.subscribe(cb);
    cb.mockClear();

    await GunIdentityService.create('SubTest');
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ alias: 'SubTest' }));
    unsub();
  });

  it('getPublicKey returns pub from stored identity', async () => {
    expect(GunIdentityService.getPublicKey()).toBeNull();

    const mockKeypair = {
      pub: 'pubkey-test',
      priv: 'priv',
      epub: 'epub',
      epriv: 'epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    await GunIdentityService.create('PubKeyTest');
    expect(GunIdentityService.getPublicKey()).toBe('pubkey-test');
  });

  it('exportIdentity returns JSON string for unencrypted export', async () => {
    const mockKeypair = {
      pub: 'export-pub',
      priv: 'export-priv',
      epub: 'export-epub',
      epriv: 'export-epriv',
    };
    (getSEA as ReturnType<typeof vi.fn>).mockReturnValue({
      pair: vi.fn().mockResolvedValue(mockKeypair),
    });

    await GunIdentityService.create('ExportTest');
    const exported = await GunIdentityService.exportIdentity();
    const parsed = JSON.parse(exported);

    expect(parsed.encrypted).toBe(false);
    expect(parsed.data.keypair.pub).toBe('export-pub');
    expect(parsed.data.alias).toBe('ExportTest');
  });

  it('importIdentity restores an unencrypted export', async () => {
    const exportPayload = JSON.stringify({
      encrypted: false,
      data: {
        keypair: {
          pub: 'import-pub',
          priv: 'import-priv',
          epub: 'import-epub',
          epriv: 'import-epriv',
        },
        alias: 'ImportedOp',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const identity = await GunIdentityService.importIdentity(exportPayload);
    expect(identity.keypair.pub).toBe('import-pub');
    expect(identity.alias).toBe('ImportedOp');
    expect(GunIdentityService.get()?.keypair.pub).toBe('import-pub');
  });
});
