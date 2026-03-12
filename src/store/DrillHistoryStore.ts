/**
 * DrillHistoryStore — persists a log of completed drill runs.
 * Each entry records the drillId, title, durationSec, step count, and timestamp.
 * Stored in localStorage as a capped rolling array (most-recent-first).
 */

import { createStore } from './createStore';

export interface DrillHistoryEntry {
  id: string;       // unique entry id (drillId + timestamp)
  drillId: string;
  title: string;
  elapsedSec: number;
  stepCount: number;
  completedAt: string; // ISO date
}

const MAX_ENTRIES = 100;

const store = createStore<DrillHistoryEntry[]>({
  key: 'ptb:drill-history:v1',
  defaultValue: [],
  validate: (raw) => Array.isArray(raw) ? raw as DrillHistoryEntry[] : null,
  maxEntries: MAX_ENTRIES,
});

// Stateless listener adapter: existing consumers use () => void callbacks
// and a version counter instead of receiving state directly.
type StatelessListener = () => void;
const statelessListeners = new Set<StatelessListener>();
let version = 0;

// Bridge: the factory's stateful listener increments version and notifies
// the stateless subscribers. Subscribed once at module load.
store.subscribe(() => {
  version += 1;
  statelessListeners.forEach((fn) => fn());
});

const DrillHistoryStore = {
  /** Return all entries, most-recent-first. */
  list(): DrillHistoryEntry[] {
    return store.get();
  },

  /** Total number of recorded runs. */
  count(): number {
    return store.get().length;
  },

  /** Record a completed drill run. */
  record(entry: Omit<DrillHistoryEntry, 'id'>): DrillHistoryEntry {
    const id = `${entry.drillId}:${Date.now()}`;
    const full: DrillHistoryEntry = { id, ...entry };
    // Prepend new entry (most-recent-first). maxEntries cap is applied by factory.
    store.update((prev) => [full, ...prev]);
    return full;
  },

  /** Get the most recent entry for a specific drillId. */
  lastForDrill(drillId: string): DrillHistoryEntry | null {
    return store.get().find((e) => e.drillId === drillId) ?? null;
  },

  /** Compute aggregate stats for a specific drillId. */
  statsForDrill(drillId: string): { runs: number; avgElapsedSec: number; bestElapsedSec: number } {
    const entries = store.get().filter((e) => e.drillId === drillId);
    if (entries.length === 0) return { runs: 0, avgElapsedSec: 0, bestElapsedSec: 0 };
    const total = entries.reduce((sum, e) => sum + e.elapsedSec, 0);
    const best = Math.min(...entries.map((e) => e.elapsedSec));
    return { runs: entries.length, avgElapsedSec: Math.round(total / entries.length), bestElapsedSec: best };
  },

  /** Clear all history. */
  clear(): void {
    store.reset();
  },

  subscribe(cb: StatelessListener): () => void {
    statelessListeners.add(cb);
    return () => { statelessListeners.delete(cb); };
  },

  getVersion(): number {
    return version;
  },
};

export default DrillHistoryStore;
