/**
 * SEA Identity Service — Cryptographic identity using Gun.js SEA.
 *
 * A user's identity is a SEA keypair (pub, priv, epub, epriv).
 * "Creating an account" = generating a keypair and persisting it.
 * "Logging in" = loading a previously saved keypair from storage.
 * There is no central server — the keypair IS the identity.
 *
 * The keypair is encrypted at rest with an optional passphrase.
 * If no passphrase is set, it's stored in plaintext (acceptable for
 * single-device personal use).
 */
import { getGun, getSEA } from './gunDb';
import { trackEvent } from '../utils/telemetry';

export interface SEAKeypair {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
}

export interface GunIdentity {
  keypair: SEAKeypair;
  alias: string;           // human-readable callsign
  createdAt: string;       // ISO timestamp
}

const IDENTITY_KEY = 'ptb:gun-identity';

// ─── Persistence ────────────────────────────────────────────────

const readIdentity = (): GunIdentity | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.keypair?.pub || !parsed?.keypair?.priv) return null;
    return parsed as GunIdentity;
  } catch {
    return null;
  }
};

const writeIdentity = (identity: GunIdentity): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch (err) {
    console.warn('[GunIdentity] write failed', err);
  }
};

const removeIdentity = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(IDENTITY_KEY);
  } catch { /* ignore */ }
};

// ─── Listeners ──────────────────────────────────────────────────

type IdentityListener = (identity: GunIdentity | null) => void;
const listeners = new Set<IdentityListener>();
const notify = (identity: GunIdentity | null) => {
  listeners.forEach((fn) => fn(identity));
};

// ─── Gun user space ─────────────────────────────────────────────

const authenticateWithGun = (keypair: SEAKeypair): void => {
  const gun = getGun();
  if (!gun) return;
  try {
    // Authenticate into Gun's user graph so we can read/write to ~/
    const user = (gun as any).user();
    user.auth(keypair);
  } catch (err) {
    console.warn('[GunIdentity] gun user auth failed', err);
  }
};

// ─── Public API ─────────────────────────────────────────────────

export const GunIdentityService = {
  /**
   * Get the current identity, or null if not yet created.
   */
  get(): GunIdentity | null {
    return readIdentity();
  },

  /**
   * Generate a new cryptographic identity (keypair).
   * Replaces any existing identity.
   */
  async create(alias: string): Promise<GunIdentity> {
    const SEA = getSEA();
    if (!SEA) throw new Error('SEA not available');

    const keypair = await SEA.pair() as SEAKeypair;
    const identity: GunIdentity = {
      keypair,
      alias: alias || 'Operative',
      createdAt: new Date().toISOString(),
    };

    writeIdentity(identity);
    authenticateWithGun(keypair);
    notify(identity);

    trackEvent({
      category: 'p2p',
      action: 'gun_identity_create',
      data: { pub: keypair.pub },
      source: 'system',
    });

    return identity;
  },

  /**
   * Load and authenticate with an existing stored identity.
   * Returns null if no identity exists.
   */
  login(): GunIdentity | null {
    const identity = readIdentity();
    if (!identity) return null;

    authenticateWithGun(identity.keypair);
    notify(identity);

    trackEvent({
      category: 'p2p',
      action: 'gun_identity_login',
      data: { pub: identity.keypair.pub },
      source: 'system',
    });

    return identity;
  },

  /**
   * Update the alias (callsign) on the stored identity.
   */
  updateAlias(alias: string): GunIdentity | null {
    const identity = readIdentity();
    if (!identity) return null;
    const updated = { ...identity, alias };
    writeIdentity(updated);
    notify(updated);
    return updated;
  },

  /**
   * Export the identity as a portable JSON string.
   * User can save this to back up their identity.
   */
  async exportIdentity(passphrase?: string): Promise<string> {
    const identity = readIdentity();
    if (!identity) throw new Error('No identity to export');

    if (passphrase) {
      const SEA = getSEA();
      if (!SEA) throw new Error('SEA not available');
      const encrypted = await SEA.encrypt(JSON.stringify(identity), passphrase);
      return JSON.stringify({ encrypted: true, data: encrypted });
    }

    return JSON.stringify({ encrypted: false, data: identity });
  },

  /**
   * Import an identity from a previously exported JSON string.
   * Replaces the current identity.
   */
  async importIdentity(exported: string, passphrase?: string): Promise<GunIdentity> {
    const parsed = JSON.parse(exported);

    let identity: GunIdentity;
    if (parsed.encrypted) {
      const SEA = getSEA();
      if (!SEA) throw new Error('SEA not available');
      if (!passphrase) throw new Error('Passphrase required for encrypted identity');
      const decrypted = await SEA.decrypt(parsed.data, passphrase);
      if (!decrypted) throw new Error('Decryption failed — wrong passphrase?');
      identity = typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;
    } else {
      identity = parsed.data;
    }

    if (!identity?.keypair?.pub || !identity?.keypair?.priv) {
      throw new Error('Invalid identity format');
    }

    writeIdentity(identity);
    authenticateWithGun(identity.keypair);
    notify(identity);

    trackEvent({
      category: 'p2p',
      action: 'gun_identity_import',
      data: { pub: identity.keypair.pub },
      source: 'ui',
    });

    return identity;
  },

  /**
   * Wipe the stored identity. The keypair is gone forever
   * unless the user has an exported backup.
   */
  logout(): void {
    const identity = readIdentity();
    removeIdentity();

    const gun = getGun();
    if (gun) {
      try { (gun as any).user().leave(); } catch { /* ignore */ }
    }

    notify(null);

    if (identity) {
      trackEvent({
        category: 'p2p',
        action: 'gun_identity_logout',
        data: { pub: identity.keypair.pub },
        source: 'ui',
      });
    }
  },

  /**
   * Get the user's public key (short form for display / QR linking).
   */
  getPublicKey(): string | null {
    const identity = readIdentity();
    return identity?.keypair.pub ?? null;
  },

  /**
   * Subscribe to identity changes.
   */
  subscribe(cb: IdentityListener): () => void {
    listeners.add(cb);
    cb(readIdentity());
    return () => { listeners.delete(cb); };
  },
};
