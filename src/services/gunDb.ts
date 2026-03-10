/**
 * Gun.js P2P database initialization.
 *
 * Gun is a decentralized, offline-first, peer-to-peer graph database.
 * This module creates a singleton Gun instance configured for the app's
 * relay peers and local storage.
 *
 * We import gun/gun.js (browser bundle) + gun/sea.js (crypto auth) directly
 * to avoid pulling in the Node.js server code from gun/index.js.
 */
import Gun from 'gun/gun.js';
import 'gun/sea.js';

/** Free community relay peers — add/remove as availability changes. */
const DEFAULT_RELAY_PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
];

/**
 * Allow overriding relay peers via env var for self-hosted relays.
 * Format: comma-separated URLs in VITE_GUN_PEERS.
 */
const getRelayPeers = (): string[] => {
  try {
    const env = (import.meta as any).env?.VITE_GUN_PEERS as string | undefined;
    if (env) {
      return env.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } catch { /* ignore */ }
  return DEFAULT_RELAY_PEERS;
};

let gunInstance: ReturnType<typeof Gun> | null = null;

/**
 * Returns the singleton Gun instance. Created lazily on first call.
 * Safe to call in SSR (returns a dummy that no-ops).
 */
export const getGun = () => {
  if (typeof window === 'undefined') {
    // SSR safety — return a minimal no-op shape
    return null;
  }

  if (!gunInstance) {
    gunInstance = Gun({
      peers: getRelayPeers(),
      localStorage: true,   // persist graph locally
      radisk: false,         // no RAD (server-side disk adapter)
    });
  }
  return gunInstance;
};

/**
 * Access the SEA (Security, Encryption, Authorization) module.
 * Available after gun/sea.js is imported above.
 */
export const getSEA = () => {
  if (typeof window === 'undefined') return null;
  return (Gun as any).SEA ?? (window as any).SEA ?? null;
};

/**
 * Reset the Gun instance (for testing).
 * @internal
 */
export const _resetGunInstance = () => {
  gunInstance = null;
};
