/**
 * useSyncStatus — React hook exposing live P2P sync state per namespace.
 *
 * Subscribes to syncStatusStore (in-memory, ephemeral) and re-renders
 * whenever any namespace status changes.
 *
 * Returns a helper function for reading individual namespace state and
 * a convenience array of all known namespaces with their current entry.
 */
import { useSyncExternalStore } from 'react';
import {
  subscribe,
  getSnapshot,
  getEntry,
  type SyncEntry,
  type SyncState,
} from '../services/syncStatusStore';

export interface SyncStatusEntry extends SyncEntry {
  namespace: string;
}

export interface UseSyncStatusReturn {
  /** Full sync state snapshot, keyed by namespace */
  state: SyncState;
  /** Get the current entry for a specific namespace */
  get: (namespace: string) => SyncEntry;
  /** All namespaces that have been touched (have non-idle entries) */
  active: SyncStatusEntry[];
}

export function useSyncStatus(): UseSyncStatusReturn {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  const get = (namespace: string): SyncEntry => getEntry(namespace);

  const active: SyncStatusEntry[] = Object.entries(state).map(
    ([namespace, entry]) => ({ namespace, ...entry }),
  );

  return { state, get, active };
}
