/**
 * GunProfileBridge — Syncs the OperativeProfileStore with Gun.js P2P graph.
 *
 * When P2P identity is enabled:
 * 1. On identity create/login, the operative profile is written to the user's
 *    Gun graph (~/profile), making it available across devices.
 * 2. On remote update (from another device), the local profile store is patched.
 * 3. Callsign changes in ProfileEditor propagate to Gun identity alias.
 *
 * This is a one-way-sync-with-merge bridge, not a full CRDT. The Gun HAM
 * algorithm handles conflict resolution at the field level.
 */
import { getGun } from './gunDb';
import { GunIdentityService, type GunIdentity } from './gunIdentity';
import OperativeProfileStore, { type OperativeProfile } from '../store/OperativeProfileStore';
import { trackEvent } from '../utils/telemetry';

type Unsubscribe = () => void;

let active = false;
let cleanupFns: Unsubscribe[] = [];

/**
 * Write the current local profile to the user's Gun graph.
 */
const pushProfileToGun = (profile: OperativeProfile): void => {
  const gun = getGun();
  if (!gun) return;
  try {
    const user = (gun as any).user();
    if (!user?.is) return; // not authenticated
    user.get('profile').put({
      archetypeId: profile.archetypeId,
      handlerId: profile.handlerId,
      callsign: profile.callsign,
      enrolledAt: profile.enrolledAt,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[GunProfileBridge] push failed', err);
  }
};

/**
 * Listen for remote profile changes from the user's Gun graph
 * and patch the local store.
 */
const listenForRemoteProfile = (): Unsubscribe => {
  const gun = getGun();
  if (!gun) return () => {};

  let listenerActive = true;

  try {
    const user = (gun as any).user();
    if (!user?.is) return () => {};

    user.get('profile').on((data: any) => {
      if (!listenerActive || !data) return;

      const local = OperativeProfileStore.get();
      if (!local) return;

      // Only patch if the remote data is actually different
      const changed =
        data.archetypeId !== local.archetypeId ||
        data.handlerId !== local.handlerId ||
        data.callsign !== local.callsign;

      if (changed && data.archetypeId && data.handlerId) {
        OperativeProfileStore.patch({
          archetypeId: data.archetypeId,
          handlerId: data.handlerId,
          callsign: data.callsign ?? local.callsign,
        });
        trackEvent({
          category: 'p2p',
          action: 'gun_profile_remote_update',
          data: { pub: GunIdentityService.getPublicKey() },
          source: 'system',
        });
      }
    });
  } catch (err) {
    console.warn('[GunProfileBridge] listen failed', err);
  }

  return () => { listenerActive = false; };
};

/**
 * Activate the profile bridge. Call once when the app loads
 * and p2pIdentity feature is enabled.
 */
export const startGunProfileBridge = (): void => {
  if (active) return;
  active = true;

  // Listen for identity changes — push profile on login/create
  const unsubIdentity = GunIdentityService.subscribe((identity: GunIdentity | null) => {
    if (!identity) return;
    const profile = OperativeProfileStore.get();
    if (profile) {
      pushProfileToGun(profile);
    }
    // Also start listening for remote changes
    const unsubRemote = listenForRemoteProfile();
    cleanupFns.push(unsubRemote);
  });
  cleanupFns.push(unsubIdentity);

  // Listen for local profile changes — push to Gun
  const unsubStore = OperativeProfileStore.subscribe(() => {
    const identity = GunIdentityService.get();
    if (!identity) return;
    const profile = OperativeProfileStore.get();
    if (profile) {
      pushProfileToGun(profile);
    }
  });
  cleanupFns.push(unsubStore);

  // Sync callsign changes to Gun identity alias
  const unsubCallsign = OperativeProfileStore.subscribe(() => {
    const identity = GunIdentityService.get();
    if (!identity) return;
    const profile = OperativeProfileStore.get();
    if (profile && profile.callsign !== identity.alias) {
      GunIdentityService.updateAlias(profile.callsign);
    }
  });
  cleanupFns.push(unsubCallsign);
};

/**
 * Tear down all listeners. Used for cleanup and testing.
 */
export const stopGunProfileBridge = (): void => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  active = false;
};
