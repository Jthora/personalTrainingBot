/**
 * useGunIdentity — React hook for Gun.js SEA cryptographic identity.
 *
 * Auto-logs in on mount if a stored identity exists.
 * Provides create, login, logout, export, and import actions.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { GunIdentityService, type GunIdentity } from '../services/gunIdentity';

export type GunIdentityState = {
  /** The current identity, or null if not authenticated */
  identity: GunIdentity | null;
  /** True while an async operation (create/import) is in flight */
  loading: boolean;
  /** Last error, cleared on next operation */
  error: string | null;
  /** Whether the user has a stored identity (may or may not be logged in yet) */
  hasStoredIdentity: boolean;
};

export type GunIdentityActions = {
  /** Generate a new cryptographic identity */
  create: (alias: string) => Promise<void>;
  /** Update the alias on the current identity */
  updateAlias: (alias: string) => void;
  /** Export identity as JSON (optionally encrypted with passphrase) */
  exportIdentity: (passphrase?: string) => Promise<string>;
  /** Import identity from JSON (passphrase required if encrypted) */
  importIdentity: (exported: string, passphrase?: string) => Promise<void>;
  /** Wipe the stored identity and log out */
  logout: () => void;
  /** Get the public key for display / QR sharing */
  publicKey: string | null;
};

export function useGunIdentity(): GunIdentityState & GunIdentityActions {
  const [identity, setIdentity] = useState<GunIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to identity changes + auto-login on mount
  useEffect(() => {
    const unsub = GunIdentityService.subscribe((id) => {
      setIdentity(id);
    });

    // Auto-login if there's a stored identity
    const stored = GunIdentityService.get();
    if (stored) {
      GunIdentityService.login();
    }

    return unsub;
  }, []);

  const create = useCallback(async (alias: string) => {
    setLoading(true);
    setError(null);
    try {
      await GunIdentityService.create(alias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create identity');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAlias = useCallback((alias: string) => {
    GunIdentityService.updateAlias(alias);
  }, []);

  const exportIdentity = useCallback(async (passphrase?: string) => {
    setError(null);
    try {
      return await GunIdentityService.exportIdentity(passphrase);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setError(msg);
      throw err;
    }
  }, []);

  const importIdentity = useCallback(async (exported: string, passphrase?: string) => {
    setLoading(true);
    setError(null);
    try {
      await GunIdentityService.importIdentity(exported, passphrase);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setError(null);
    GunIdentityService.logout();
  }, []);

  const publicKey = useMemo(() => identity?.keypair.pub ?? null, [identity]);

  const hasStoredIdentity = GunIdentityService.get() !== null;

  return {
    identity,
    loading,
    error,
    hasStoredIdentity,
    create,
    updateAlias,
    exportIdentity,
    importIdentity,
    logout,
    publicKey,
  };
}
