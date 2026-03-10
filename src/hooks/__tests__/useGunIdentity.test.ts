import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockCreate = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());
const mockUpdateAlias = vi.hoisted(() => vi.fn());
const mockExportIdentity = vi.hoisted(() => vi.fn());
const mockImportIdentity = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn(() => null));
const mockSubscribe = vi.hoisted(() => vi.fn());

vi.mock('../../services/gunIdentity', () => {
  return {
    GunIdentityService: {
      get: mockGet,
      create: mockCreate,
      login: mockLogin,
      logout: mockLogout,
      updateAlias: mockUpdateAlias,
      exportIdentity: mockExportIdentity,
      importIdentity: mockImportIdentity,
      subscribe: mockSubscribe,
    },
  };
});

import { useGunIdentity } from '../useGunIdentity';

beforeEach(() => {
  vi.clearAllMocks();
  // Default subscribe fires immediately with null
  mockSubscribe.mockImplementation((cb: (id: any) => void) => {
    cb(null);
    return () => {};
  });
});

describe('useGunIdentity', () => {
  it('starts with null identity', () => {
    const { result } = renderHook(() => useGunIdentity());
    expect(result.current.identity).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('subscribes on mount and auto-logins if stored identity exists', () => {
    mockGet.mockReturnValue({ keypair: { pub: 'x' }, alias: 'A', createdAt: '' });
    renderHook(() => useGunIdentity());
    expect(mockSubscribe).toHaveBeenCalled();
    expect(mockLogin).toHaveBeenCalled();
  });

  it('does not auto-login when no stored identity', () => {
    mockGet.mockReturnValue(null);
    renderHook(() => useGunIdentity());
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('create calls service and handles loading state', async () => {
    mockCreate.mockResolvedValue({ keypair: { pub: 'new' }, alias: 'New', createdAt: '' });
    const { result } = renderHook(() => useGunIdentity());

    await act(async () => {
      await result.current.create('New');
    });
    expect(mockCreate).toHaveBeenCalledWith('New');
    expect(result.current.loading).toBe(false);
  });

  it('logout calls service', () => {
    const { result } = renderHook(() => useGunIdentity());
    act(() => {
      result.current.logout();
    });
    expect(mockLogout).toHaveBeenCalled();
  });

  it('create sets error on failure', async () => {
    mockCreate.mockRejectedValue(new Error('SEA not available'));
    const { result } = renderHook(() => useGunIdentity());

    await act(async () => {
      await result.current.create('Fail');
    });
    expect(result.current.error).toBe('SEA not available');
  });

  it('publicKey is null when no identity', () => {
    const { result } = renderHook(() => useGunIdentity());
    expect(result.current.publicKey).toBeNull();
  });
});
