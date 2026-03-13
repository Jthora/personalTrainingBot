/**
 * DrillHistoryStore — persists a log of completed drill runs.
 * Each entry records the drillId, title, durationSec, step count, and timestamp.
 * Stored in localStorage as a capped rolling array (most-recent-first).
 */

import { createStore } from './createStore';
import { scheduleBackup } from '../utils/backupManager';

export interface DrillHistoryEntry {
  id: string;       // unique entry id (drillId + timestamp)
  drillId: string;
  title: string;
  elapsedSec: number;
  stepCount: number;
  completedAt: string; // ISO date
  notes?: string;           // free-text reflection from drill run
  selfAssessment?: number;  // 1-5 self-rated comprehension
  domainId?: string;        // training module identifier
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
    scheduleBackup();
    // Record daily progress snapshot on first drill each day
    import('./ProgressSnapshotStore').then((mod) => mod.recordDailySnapshot()).catch(() => {});
    return full;
  },

  /** Get the most recent entry for a specific drillId. */
  lastForDrill(drillId: string): DrillHistoryEntry | null {
    return store.get().find((e) => e.drillId === drillId) ?? null;
  },

  /** Compute aggregate stats for a specific drillId. */
  statsForDrill(drillId: string): { runs: number; avgElapsedSec: number; bestElapsedSec: number; avgAssessment: number | null } {
    const entries = store.get().filter((e) => e.drillId === drillId);
    if (entries.length === 0) return { runs: 0, avgElapsedSec: 0, bestElapsedSec: 0, avgAssessment: null };
    const total = entries.reduce((sum, e) => sum + e.elapsedSec, 0);
    const best = Math.min(...entries.map((e) => e.elapsedSec));
    const rated = entries.filter((e) => e.selfAssessment != null);
    const avgAssessment = rated.length > 0
      ? Math.round((rated.reduce((sum, e) => sum + e.selfAssessment!, 0) / rated.length) * 10) / 10
      : null;
    return { runs: entries.length, avgElapsedSec: Math.round(total / entries.length), bestElapsedSec: best, avgAssessment };
  },

  /** Compute aggregate stats for a specific domainId. */
  statsForDomain(domainId: string): { runs: number; avgAssessment: number | null; uniqueDrills: number; lastActiveDate: string | null } {
    const entries = store.get().filter((e) => e.domainId === domainId);
    if (entries.length === 0) return { runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null };
    const rated = entries.filter((e) => e.selfAssessment != null);
    const avgAssessment = rated.length > 0
      ? Math.round((rated.reduce((sum, e) => sum + e.selfAssessment!, 0) / rated.length) * 10) / 10
      : null;
    const uniqueDrills = new Set(entries.map((e) => e.drillId)).size;
    const lastActiveDate = entries[0]?.completedAt ?? null; // entries are most-recent-first
    return { runs: entries.length, avgAssessment, uniqueDrills, lastActiveDate };
  },

  /**
   * Compute assessment trend for a domain: 'improving' | 'declining' | 'stable' | null.
   * Splits rated entries into a recent half and an older half and compares averages.
   * Requires at least 4 rated entries to determine a trend.
   */
  assessmentTrendForDomain(domainId: string): 'improving' | 'declining' | 'stable' | null {
    const entries = store.get().filter((e) => e.domainId === domainId && e.selfAssessment != null);
    if (entries.length < 4) return null; // not enough data
    // entries are most-recent-first
    const mid = Math.floor(entries.length / 2);
    const recentHalf = entries.slice(0, mid);
    const olderHalf = entries.slice(mid);
    const recentAvg = recentHalf.reduce((s, e) => s + e.selfAssessment!, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((s, e) => s + e.selfAssessment!, 0) / olderHalf.length;
    const delta = recentAvg - olderAvg;
    if (delta > 0.3) return 'improving';
    if (delta < -0.3) return 'declining';
    return 'stable';
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
