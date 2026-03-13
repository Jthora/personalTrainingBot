/**
 * CardProgressStore — per-card spaced repetition state.
 *
 * Tracks review history for every card the user has studied.
 * Uses createStore with a 10 000-entry LRU cap (oldest entries evicted).
 *
 * Key APIs:
 *   recordReview(cardId, moduleId, selfAssessment)  — schedule next review
 *   getCardProgress(cardId)                         — current SR state
 *   getCardsDueForReview(moduleId?, now?)            — due cards
 *   getModuleReviewStats(moduleId)                   — { due, learning, mature, total }
 */

import { createStore } from './createStore';
import { scheduleBackup } from '../utils/backupManager';
import {
  computeNextReview,
  classifyCard,
  isDue,
  defaultCardState,
  type SRCardState,
} from '../utils/srScheduler';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CardProgressEntry extends SRCardState {
  cardId: string;
  moduleId: string;
  /** ISO date of last review. */
  lastReviewedAt: string;
  /** ISO date of next scheduled review. */
  nextReviewAt: string;
}

export interface ModuleReviewStats {
  due: number;
  learning: number;
  mature: number;
  newCards: number;
  total: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 10_000;

const store = createStore<CardProgressEntry[]>({
  key: 'ptb:card-progress:v1',
  defaultValue: [],
  validate: (raw) => (Array.isArray(raw) ? (raw as CardProgressEntry[]) : null),
  maxEntries: MAX_ENTRIES,
});

// Stateless listener bridge (same pattern as DrillHistoryStore)
type StatelessListener = () => void;
const statelessListeners = new Set<StatelessListener>();
let version = 0;

store.subscribe(() => {
  version += 1;
  statelessListeners.forEach((fn) => fn());
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findIndex(entries: CardProgressEntry[], cardId: string): number {
  return entries.findIndex((e) => e.cardId === cardId);
}

// ─── Public API ──────────────────────────────────────────────────────────────

const CardProgressStore = {
  /**
   * Record a review for a card and compute the next review date (SM-2).
   *
   * @param cardId         Unique card identifier.
   * @param moduleId       Training module this card belongs to.
   * @param selfAssessment 1-5 comprehension rating (defaults to 3 if missing).
   * @returns The updated (or newly created) CardProgressEntry.
   */
  recordReview(
    cardId: string,
    moduleId: string,
    selfAssessment?: number,
  ): CardProgressEntry {
    const rating = selfAssessment ?? 3;
    const now = new Date().toISOString();

    const entries = store.get();
    const idx = findIndex(entries, cardId);
    const existing = idx >= 0 ? entries[idx] : null;

    const prev: SRCardState | null = existing
      ? {
          interval: existing.interval,
          easeFactor: existing.easeFactor,
          repetitions: existing.repetitions,
          lapses: existing.lapses,
        }
      : null;

    const result = computeNextReview(prev, rating);

    const entry: CardProgressEntry = {
      cardId,
      moduleId,
      lastReviewedAt: now,
      nextReviewAt: result.nextReviewAt,
      interval: result.interval,
      easeFactor: result.easeFactor,
      repetitions: result.repetitions,
      lapses: result.lapses,
    };

    // Replace existing or append new entry
    if (idx >= 0) {
      const updated = [...entries];
      updated[idx] = entry;
      store.set(updated);
    } else {
      store.update((prev) => [...prev, entry]);
    }

    scheduleBackup();
    return entry;
  },

  /**
   * Look up the current progress for a specific card.
   */
  getCardProgress(cardId: string): CardProgressEntry | null {
    return store.get().find((e) => e.cardId === cardId) ?? null;
  },

  /**
   * Get all cards that are due for review (nextReviewAt ≤ now).
   *
   * @param moduleId Optional — filter to a single module.
   * @param now      Optional — override for current time (test-friendly).
   */
  getCardsDueForReview(moduleId?: string, now?: number): CardProgressEntry[] {
    const ts = now ?? Date.now();
    return store.get().filter((e) => {
      if (moduleId && e.moduleId !== moduleId) return false;
      return isDue(e.nextReviewAt, ts);
    });
  },

  /**
   * Aggregate review stats for a given module.
   */
  getModuleReviewStats(moduleId: string): ModuleReviewStats {
    const entries = store.get().filter((e) => e.moduleId === moduleId);
    const now = Date.now();
    let due = 0;
    let learning = 0;
    let mature = 0;
    let newCards = 0;

    for (const e of entries) {
      const cls = classifyCard(e);
      if (cls === 'learning') learning += 1;
      else if (cls === 'mature') mature += 1;
      else newCards += 1;
      if (isDue(e.nextReviewAt, now)) due += 1;
    }

    return { due, learning, mature, newCards, total: entries.length };
  },

  /**
   * Get all tracked entries. Returns a shallow copy.
   */
  list(): CardProgressEntry[] {
    return store.get();
  },

  /**
   * Total tracked cards.
   */
  count(): number {
    return store.get().length;
  },

  /**
   * Clear all card progress.
   */
  clear(): void {
    store.reset();
  },

  subscribe(cb: StatelessListener): () => void {
    statelessListeners.add(cb);
    return () => {
      statelessListeners.delete(cb);
    };
  },

  getVersion(): number {
    return version;
  },
};

export { defaultCardState };
export default CardProgressStore;
