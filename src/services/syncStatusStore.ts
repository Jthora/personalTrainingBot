/**
 * SyncStatusStore — Observable, ephemeral store tracking the current P2P sync
 * state for each Gun namespace.
 *
 * "Ephemeral" means this is session-only in memory — it reflects the live
 * runtime state of active sync adapters, not something that needs to be
 * persisted between page loads.
 *
 * Compatible with React's useSyncExternalStore via the subscribe/getSnapshot
 * interface. Used by useSyncStatus() and the SovereigntyPanel.
 *
 * Namespaces correspond to the Gun store namespaces defined in gunStoreSyncs:
 *   'progress' | 'drillRun' | 'aar'
 */

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncEntry {
  /** Current operational status of this namespace's sync */
  status: SyncStatus;
  /** Unix ms timestamp of the last successful sync, or null if never synced */
  lastSyncedAt: number | null;
  /** Human-readable error detail, set only when status === 'error' */
  errorMessage: string | null;
}

export type SyncState = Record<string, SyncEntry>;

// ─── Internal state ────────────────────────────────────────────────────────────

const DEFAULT_ENTRY: SyncEntry = {
  status: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
};

let state: SyncState = {};
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

const getOrCreate = (namespace: string): SyncEntry =>
  state[namespace] ?? { ...DEFAULT_ENTRY };

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Mark a namespace as actively syncing (in-flight network operation).
 */
export const markSyncing = (namespace: string): void => {
  state = {
    ...state,
    [namespace]: {
      ...getOrCreate(namespace),
      status: 'syncing',
      errorMessage: null,
    },
  };
  notify();
};

/**
 * Mark a namespace as successfully synced. Updates lastSyncedAt.
 */
export const markSynced = (namespace: string): void => {
  state = {
    ...state,
    [namespace]: {
      status: 'synced',
      lastSyncedAt: Date.now(),
      errorMessage: null,
    },
  };
  notify();
};

/**
 * Mark a namespace as having encountered a sync error.
 */
export const markError = (namespace: string, message?: string): void => {
  state = {
    ...state,
    [namespace]: {
      ...getOrCreate(namespace),
      status: 'error',
      errorMessage: message ?? 'Sync failed',
    },
  };
  notify();
};

/**
 * Get the current sync entry for a namespace.
 */
export const getEntry = (namespace: string): SyncEntry =>
  state[namespace] ?? { ...DEFAULT_ENTRY };

/**
 * Get a snapshot of the full sync state.
 * Stable reference changes only when state changes — safe for useSyncExternalStore.
 */
export const getSnapshot = (): SyncState => state;

/**
 * Subscribe to any state change. Returns an unsubscribe function.
 * Compatible with React's useSyncExternalStore subscribe parameter.
 */
export const subscribe = (callback: () => void): (() => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

/**
 * Reset all state — intended for use in tests only.
 */
export const _resetSyncStatusStore = (): void => {
  state = {};
  listeners.clear();
};
