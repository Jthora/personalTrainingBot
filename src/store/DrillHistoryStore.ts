/**
 * DrillHistoryStore — persists a log of completed drill runs.
 * Each entry records the drillId, title, durationSec, step count, and timestamp.
 * Stored in localStorage as a capped rolling array (most-recent-first).
 */

export interface DrillHistoryEntry {
  id: string;       // unique entry id (drillId + timestamp)
  drillId: string;
  title: string;
  elapsedSec: number;
  stepCount: number;
  completedAt: string; // ISO date
}

const STORE_KEY = 'ptb:drill-history:v1';
const MAX_ENTRIES = 100;

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

const notify = () => {
  version += 1;
  listeners.forEach((fn) => fn());
};

const readAll = (): DrillHistoryEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (entries: DrillHistoryEntry[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('[DrillHistoryStore] write failed', err);
  }
};

const DrillHistoryStore = {
  /** Return all entries, most-recent-first. */
  list(): DrillHistoryEntry[] {
    return readAll();
  },

  /** Total number of recorded runs. */
  count(): number {
    return readAll().length;
  },

  /** Record a completed drill run. */
  record(entry: Omit<DrillHistoryEntry, 'id'>): DrillHistoryEntry {
    const id = `${entry.drillId}:${Date.now()}`;
    const full: DrillHistoryEntry = { id, ...entry };
    const existing = readAll();
    const next = [full, ...existing].slice(0, MAX_ENTRIES);
    writeAll(next);
    notify();
    return full;
  },

  /** Get the most recent entry for a specific drillId. */
  lastForDrill(drillId: string): DrillHistoryEntry | null {
    return readAll().find((e) => e.drillId === drillId) ?? null;
  },

  /** Compute aggregate stats for a specific drillId. */
  statsForDrill(drillId: string): { runs: number; avgElapsedSec: number; bestElapsedSec: number } {
    const entries = readAll().filter((e) => e.drillId === drillId);
    if (entries.length === 0) return { runs: 0, avgElapsedSec: 0, bestElapsedSec: 0 };
    const total = entries.reduce((sum, e) => sum + e.elapsedSec, 0);
    const best = Math.min(...entries.map((e) => e.elapsedSec));
    return { runs: entries.length, avgElapsedSec: Math.round(total / entries.length), bestElapsedSec: best };
  },

  /** Clear all history. */
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch { /* ignore */ }
    notify();
  },

  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },

  getVersion(): number {
    return version;
  },
};

export default DrillHistoryStore;
