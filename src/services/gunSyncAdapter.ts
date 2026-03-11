/**
 * GunSyncAdapter — Generic adapter for syncing localStorage stores to Gun.js.
 *
 * Gun's HAM (Hypothetical Amnesia Machine) algorithm does field-level
 * last-write-wins conflict resolution automatically. This adapter:
 *
 * 1. Watches a local store for changes → pushes to Gun user graph
 * 2. Watches the Gun user graph → patches the local store
 * 3. Uses a version clock (updatedAt timestamp) to avoid echo loops
 *
 * Each store gets its own namespace in the user graph: ~/stores/<namespace>
 *
 * Gun stores flat key-value pairs natively. For stores that hold arrays
 * (AAR entries, drill history), we use Gun's set() API which stores
 * items as a flat graph with soul links — Gun merges each item independently.
 */
import { getGun } from './gunDb';
import { GunIdentityService } from './gunIdentity';
import { trackEvent } from '../utils/telemetry';
import {
  markSyncing,
  markSynced,
  markError,
} from './syncStatusStore';

export type SyncDirection = 'push' | 'pull' | 'both';

export interface GunSyncAdapterConfig<T> {
  /** Unique namespace in the Gun user graph, e.g. 'progress', 'drillRun', 'aar' */
  namespace: string;
  /** Read current local state */
  getLocal: () => T | null;
  /** Write remote state to local store */
  setLocal: (data: T) => void;
  /** Serialize local state to a Gun-safe flat object (no nested arrays/objects) */
  toGunData: (local: T) => Record<string, string | number | boolean | null>;
  /** Deserialize Gun data back to local state */
  fromGunData: (gunData: Record<string, any>) => T | null;
  /** Detect if local state has changed (compare timestamps or hashes) */
  getVersion: (data: T) => number;
  /** Sync direction */
  direction?: SyncDirection;
}

export interface GunSyncHandle {
  /** Push current local state to Gun immediately */
  pushNow: () => void;
  /** Stop syncing and clean up listeners */
  stop: () => void;
}

/**
 * Create a sync adapter for a specific store.
 * Returns a handle to push manually or stop the sync.
 */
export const createGunSyncAdapter = <T>(config: GunSyncAdapterConfig<T>): GunSyncHandle => {
  const { namespace, getLocal, setLocal, toGunData, fromGunData, getVersion, direction = 'both' } = config;

  let active = true;
  let lastPushedVersion = 0;
  let lastPulledVersion = 0;
  let remoteListenerActive = false;

  const getUserNode = () => {
    const gun = getGun();
    if (!gun) return null;
    const user = (gun as any).user();
    if (!user?.is) return null;
    return user.get('stores').get(namespace);
  };

  // ─── Push: local → Gun ────────────────────────────────────────

  const push = () => {
    if (!active || direction === 'pull') return;

    const identity = GunIdentityService.get();
    if (!identity) return;

    const local = getLocal();
    if (!local) return;

    const version = getVersion(local);
    if (version === lastPushedVersion) return; // no change

    const node = getUserNode();
    if (!node) return;

    try {
      markSyncing(namespace);
      const gunData = toGunData(local);
      node.put(gunData);
      lastPushedVersion = version;
      markSynced(namespace);
    } catch (err) {
      console.warn(`[GunSync:${namespace}] push failed`, err);
      markError(namespace, err instanceof Error ? err.message : 'Push failed');
    }
  };

  // ─── Pull: Gun → local ────────────────────────────────────────

  const startListening = () => {
    if (!active || direction === 'push' || remoteListenerActive) return;

    const node = getUserNode();
    if (!node) return;

    remoteListenerActive = true;

    node.on((data: any) => {
      if (!active || !data) return;

      try {
        const remote = fromGunData(data);
        if (!remote) return;

        const remoteVersion = getVersion(remote);
        if (remoteVersion <= lastPulledVersion) return; // already seen
        if (remoteVersion === lastPushedVersion) return; // echo of our own push

        const local = getLocal();
        const localVersion = local ? getVersion(local) : 0;

        // Only apply remote if it's newer than local
        if (remoteVersion > localVersion) {
          setLocal(remote);
          lastPulledVersion = remoteVersion;
          markSynced(namespace);

          trackEvent({
            category: 'ia',
            action: `gun_sync_pull_${namespace}`,
            data: { remoteVersion, localVersion },
            source: 'system',
          });
        }
      } catch (err) {
        console.warn(`[GunSync:${namespace}] pull handler error`, err);
        markError(namespace, err instanceof Error ? err.message : 'Pull failed');
      }
    });
  };

  // ─── Auto-start listening when identity is available ──────────

  const unsubIdentity = GunIdentityService.subscribe((identity) => {
    if (identity && active) {
      // Push current local state to Gun
      push();
      // Start listening for remote changes
      startListening();
    }
  });

  return {
    pushNow: push,
    stop: () => {
      active = false;
      remoteListenerActive = false;
      unsubIdentity();
    },
  };
};
