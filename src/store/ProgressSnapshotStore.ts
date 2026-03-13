/**
 * ProgressSnapshotStore — Records daily domain score snapshots for trend charts.
 *
 * On first drill completion each day, captures a snapshot of all 19 domain scores.
 * Provides time-series data for line charts, sparklines, and weekly summaries.
 *
 * Storage budget: ~7,000 entries max (≈365 days × 19 domains).
 */

import { createStore } from './createStore';
import { deriveDomainSnapshot, DOMAIN_CATALOG } from '../utils/readiness/domainProgress';
import type { DomainProgressSnapshot } from '../utils/readiness/domainProgress';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyDomainSnapshot {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  /** Domain (module) ID. */
  domainId: string;
  /** Score 0–100 at time of snapshot. */
  score: number;
}

export interface ScoreDataPoint {
  date: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const store = createStore<DailyDomainSnapshot[]>({
  key: 'ptb:progress-snapshots',
  version: 1,
  defaultValue: [],
  maxEntries: 7000,
  validate: (raw) => {
    if (!Array.isArray(raw)) return null;
    // Quick structural check on first entry
    if (raw.length > 0) {
      const first = raw[0];
      if (typeof first !== 'object' || !first.date || !first.domainId) return null;
    }
    return raw as DailyDomainSnapshot[];
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function hasTodaySnapshot(): boolean {
  const today = todayISO();
  const snapshots = store.get();
  return snapshots.some((s) => s.date === today);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record today's domain score snapshot (one row per domain).
 * No-op if a snapshot for today already exists.
 * Returns true if a snapshot was recorded, false if already existed.
 */
export function recordDailySnapshot(snapshotOverride?: DomainProgressSnapshot): boolean {
  if (hasTodaySnapshot()) return false;

  const today = todayISO();
  const snapshot = snapshotOverride ?? deriveDomainSnapshot();

  const entries: DailyDomainSnapshot[] = snapshot.domains.map((d) => ({
    date: today,
    domainId: d.domainId,
    score: Math.round(d.score),
  }));

  store.update((prev) => [...prev, ...entries]);
  return true;
}

/**
 * Get score history for a single domain over the last N days.
 * Returns sorted array of { date, score } datapoints.
 */
export function getScoreHistory(domainId: string, days = 30): ScoreDataPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  return store
    .get()
    .filter((s) => s.domainId === domainId && s.date >= cutoffISO)
    .map(({ date, score }) => ({ date, score }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get the most recent snapshot date, or null if no snapshots.
 */
export function getLatestSnapshotDate(): string | null {
  const entries = store.get();
  if (entries.length === 0) return null;
  return entries[entries.length - 1].date;
}

/**
 * Get score history for ALL domains on a specific date.
 * Returns map of domainId → score.
 */
export function getSnapshotForDate(date: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of store.get()) {
    if (s.date === date) map.set(s.domainId, s.score);
  }
  return map;
}

/**
 * Get weekly score deltas: compare today's scores vs 7 days ago.
 * Returns array of { domainId, domainName, delta } sorted by |delta| desc.
 * Only includes domains with non-zero delta.
 */
export function getWeeklyDeltas(): Array<{ domainId: string; domainName: string; delta: number }> {
  const entries = store.get();
  if (entries.length === 0) return [];

  // Find the latest date and the date ~7 days before
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  const latestDate = dates[dates.length - 1];

  // Find the date closest to 7 days before latest
  const target = new Date(latestDate);
  target.setDate(target.getDate() - 7);
  const targetISO = target.toISOString().slice(0, 10);

  // Find closest date <= targetISO
  const olderDate = dates.filter((d) => d <= targetISO).pop();
  if (!olderDate) return [];

  const latestMap = getSnapshotForDate(latestDate);
  const olderMap = getSnapshotForDate(olderDate);

  const nameMap = new Map(DOMAIN_CATALOG.map((d) => [d.id, d.name]));

  const deltas: Array<{ domainId: string; domainName: string; delta: number }> = [];
  for (const [domainId, latestScore] of latestMap) {
    const olderScore = olderMap.get(domainId) ?? 0;
    const delta = latestScore - olderScore;
    if (delta !== 0) {
      deltas.push({
        domainId,
        domainName: nameMap.get(domainId) ?? domainId,
        delta,
      });
    }
  }

  return deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Total number of snapshot entries stored.
 */
export function getSnapshotCount(): number {
  return store.get().length;
}

/**
 * Subscribe to store changes.
 */
export function subscribe(cb: () => void): () => void {
  return store.subscribe(() => cb());
}

/**
 * Reset all snapshots (for testing).
 */
export function reset(): void {
  store.reset();
}

/** Direct access for advanced usage. */
export default {
  recordDailySnapshot,
  getScoreHistory,
  getLatestSnapshotDate,
  getSnapshotForDate,
  getWeeklyDeltas,
  getSnapshotCount,
  subscribe,
  reset,
};
