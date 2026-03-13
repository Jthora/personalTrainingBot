/**
 * srScheduler.ts — Modified SM-2 spaced repetition scheduler.
 *
 * Maps the 1-5 self-assessment scale to SM-2 quality grades and computes
 * the next review interval + updated ease factor.
 *
 * Mapping:
 *   selfAssessment 1  → quality 0: total reset (lapse)
 *   selfAssessment 2  → quality 1: reset (lapse)
 *   selfAssessment 3  → quality 2: keep interval, ease −0.15 (hard)
 *   selfAssessment 4  → quality 3: grow interval, ease −0.05 (good)
 *   selfAssessment 5  → quality 5: grow interval, ease +0.10 (easy)
 *
 * New cards: 1 day → 3 days → normal growth.
 * Ease floor: 1.3. Interval cap: 180 days.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SRCardState {
  /** Days until next review. */
  interval: number;
  /** Ease factor (≥ 1.3). */
  easeFactor: number;
  /** Consecutive correct repetitions. */
  repetitions: number;
  /** Total lapses (resets). */
  lapses: number;
}

export interface SRReviewResult extends SRCardState {
  /** ISO timestamp of the scheduled next review. */
  nextReviewAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EASE_FLOOR = 1.3;
const INTERVAL_CAP_DAYS = 180;
const DEFAULT_EASE = 2.5;

/** Self-assessment (1-5) → SM-2 quality grade (0-5). */
const QUALITY_MAP: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 5,
};

// ─── Core ────────────────────────────────────────────────────────────────────

/**
 * Compute the next review state after a card is reviewed.
 *
 * @param current  Current SR state (null/undefined for new/unseen cards).
 * @param selfAssessment  User's self-rated comprehension (1-5).
 * @returns Updated SR state with `nextReviewAt` ISO timestamp.
 */
export function computeNextReview(
  current: SRCardState | null | undefined,
  selfAssessment: number,
): SRReviewResult {
  const quality = QUALITY_MAP[selfAssessment] ?? 3;

  // Defaults for unseen cards
  const prev: SRCardState = current ?? {
    interval: 0,
    easeFactor: DEFAULT_EASE,
    repetitions: 0,
    lapses: 0,
  };

  let { interval, easeFactor, repetitions, lapses } = prev;

  if (quality < 2) {
    // ── Lapse: reset ──
    interval = 1;
    repetitions = 0;
    lapses += 1;
    // Ease drops slightly on lapse
    easeFactor = Math.max(EASE_FLOOR, easeFactor - 0.20);
  } else if (quality === 2) {
    // ── Hard: keep interval, ease drops ──
    interval = Math.max(1, interval); // keep but floor to 1
    easeFactor = Math.max(EASE_FLOOR, easeFactor - 0.15);
    repetitions += 1;
  } else {
    // ── Good (3) / Easy (5): grow interval ──
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;

    // Ease adjustment
    if (quality === 3) {
      easeFactor = Math.max(EASE_FLOOR, easeFactor - 0.05);
    } else {
      // quality 5 (easy)
      easeFactor = easeFactor + 0.10;
    }
  }

  // Cap interval
  interval = Math.min(interval, INTERVAL_CAP_DAYS);

  const nextReviewAt = new Date(
    Date.now() + interval * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { interval, easeFactor, repetitions, lapses, nextReviewAt };
}

/**
 * Default state for an unseen card.
 */
export function defaultCardState(): SRCardState {
  return {
    interval: 0,
    easeFactor: DEFAULT_EASE,
    repetitions: 0,
    lapses: 0,
  };
}

/**
 * Check whether a card is due for review based on its nextReviewAt date.
 *
 * @param nextReviewAt ISO timestamp string of next review.
 * @param now Optional override for current time (defaults to Date.now()).
 * @returns true if the card is due (nextReviewAt ≤ now).
 */
export function isDue(nextReviewAt: string, now?: number): boolean {
  return new Date(nextReviewAt).getTime() <= (now ?? Date.now());
}

/**
 * Classify a card's learning state for UI display.
 */
export function classifyCard(
  state: SRCardState | null | undefined,
): 'new' | 'learning' | 'mature' {
  if (!state || state.repetitions === 0) return 'new';
  if (state.interval < 21) return 'learning';
  return 'mature';
}
