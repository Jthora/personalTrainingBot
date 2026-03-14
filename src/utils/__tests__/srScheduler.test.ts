import { describe, it, expect } from 'vitest';
import {
  computeNextReview,
  defaultCardState,
  isDue,
  classifyCard,
  type SRCardState,
} from '../srScheduler';

describe('srScheduler', () => {
  // ─── computeNextReview ─────────────────────────────────────────────────────

  describe('computeNextReview', () => {
    it('new card rated "good" (4) → interval 1 day, repetitions 1', () => {
      const result = computeNextReview(null, 4);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.lapses).toBe(0);
      expect(result.easeFactor).toBeCloseTo(2.45, 2);
      expect(result.nextReviewAt).toBeTruthy();
    });

    it('new card rated "easy" (5) → interval 1 day, ease goes up', () => {
      const result = computeNextReview(null, 5);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.6, 2);
    });

    it('second review rated "good" (4) → interval 3 days', () => {
      const after1 = computeNextReview(null, 4);
      const after2 = computeNextReview(after1, 4);
      expect(after2.interval).toBe(3);
      expect(after2.repetitions).toBe(2);
    });

    it('third review rated "good" (4) → interval grows by ease factor', () => {
      let state: SRCardState | null = null;
      state = computeNextReview(state, 4); // rep 1, interval 1
      state = computeNextReview(state, 4); // rep 2, interval 3
      const after3 = computeNextReview(state, 4); // rep 3, interval = round(3 * ease)
      expect(after3.interval).toBeGreaterThan(3);
      expect(after3.repetitions).toBe(3);
    });

    it('lapse (assessment 1) resets interval and increments lapses', () => {
      const mature: SRCardState = {
        interval: 30,
        easeFactor: 2.5,
        repetitions: 5,
        lapses: 0,
      };
      const result = computeNextReview(mature, 1);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.lapses).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.3, 2);
    });

    it('lapse (assessment 2) also resets', () => {
      const mature: SRCardState = {
        interval: 30,
        easeFactor: 2.5,
        repetitions: 5,
        lapses: 0,
      };
      const result = computeNextReview(mature, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.lapses).toBe(1);
    });

    it('hard (assessment 3) keeps interval but drops ease', () => {
      const state: SRCardState = {
        interval: 10,
        easeFactor: 2.5,
        repetitions: 3,
        lapses: 0,
      };
      const result = computeNextReview(state, 3);
      expect(result.interval).toBe(10); // kept
      expect(result.easeFactor).toBeCloseTo(2.35, 2);
      expect(result.repetitions).toBe(4);
    });

    it('ease factor never drops below 1.3', () => {
      let state: SRCardState = {
        interval: 5,
        easeFactor: 1.35,
        repetitions: 3,
        lapses: 2,
      };
      // Repeated hard reviews
      state = computeNextReview(state, 3);
      expect(state.easeFactor).toBe(1.3);
      state = computeNextReview(state, 3);
      expect(state.easeFactor).toBe(1.3);
    });

    it('interval is capped at 180 days', () => {
      const state: SRCardState = {
        interval: 170,
        easeFactor: 2.5,
        repetitions: 10,
        lapses: 0,
      };
      const result = computeNextReview(state, 5);
      expect(result.interval).toBeLessThanOrEqual(180);
    });

    it('nextReviewAt is a valid future ISO timestamp', () => {
      const before = Date.now();
      const result = computeNextReview(null, 4);
      const reviewTime = new Date(result.nextReviewAt).getTime();
      // Should be roughly 1 day from now (± 2 seconds for test timing)
      expect(reviewTime).toBeGreaterThan(before);
      expect(reviewTime).toBeLessThan(before + 2 * 24 * 60 * 60 * 1000);
    });

    it('defaults to quality 3 for unknown assessment values', () => {
      const result = computeNextReview(null, 99 as number);
      // quality 3 → good → interval 1, ease −0.05
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.45, 2);
    });
  });

  // ─── defaultCardState ──────────────────────────────────────────────────────

  describe('defaultCardState', () => {
    it('returns fresh state with ease 2.5', () => {
      const state = defaultCardState();
      expect(state.interval).toBe(0);
      expect(state.easeFactor).toBe(2.5);
      expect(state.repetitions).toBe(0);
      expect(state.lapses).toBe(0);
    });
  });

  // ─── isDue ─────────────────────────────────────────────────────────────────

  describe('isDue', () => {
    it('returns true when nextReviewAt is in the past', () => {
      const pastDate = new Date(Date.now() - 3600_000).toISOString();
      expect(isDue(pastDate)).toBe(true);
    });

    it('returns false when nextReviewAt is in the future', () => {
      const futureDate = new Date(Date.now() + 86400_000).toISOString();
      expect(isDue(futureDate)).toBe(false);
    });

    it('returns true when nextReviewAt equals now', () => {
      const now = Date.now();
      const date = new Date(now).toISOString();
      expect(isDue(date, now)).toBe(true);
    });

    it('accepts custom now for testing', () => {
      const reviewAt = '2026-06-15T12:00:00.000Z';
      const before = new Date('2026-06-15T11:59:59.000Z').getTime();
      const after = new Date('2026-06-15T12:00:01.000Z').getTime();
      expect(isDue(reviewAt, before)).toBe(false);
      expect(isDue(reviewAt, after)).toBe(true);
    });
  });

  // ─── classifyCard ──────────────────────────────────────────────────────────

  describe('classifyCard', () => {
    it('null state → "new"', () => {
      expect(classifyCard(null)).toBe('new');
    });

    it('undefined state → "new"', () => {
      expect(classifyCard(undefined)).toBe('new');
    });

    it('0 repetitions → "new"', () => {
      expect(classifyCard({ interval: 0, easeFactor: 2.5, repetitions: 0, lapses: 0 })).toBe('new');
    });

    it('interval < 21 with repetitions → "learning"', () => {
      expect(classifyCard({ interval: 10, easeFactor: 2.5, repetitions: 3, lapses: 0 })).toBe('learning');
    });

    it('interval ≥ 21 → "mature"', () => {
      expect(classifyCard({ interval: 21, easeFactor: 2.5, repetitions: 5, lapses: 0 })).toBe('mature');
    });

    it('high interval → "mature"', () => {
      expect(classifyCard({ interval: 90, easeFactor: 2.5, repetitions: 8, lapses: 1 })).toBe('mature');
    });
  });

  // ─── Multi-step progression ────────────────────────────────────────────────

  describe('progression', () => {
    it('consistent "good" reviews show intervals: 1 → 3 → ~7 → ~17', () => {
      let state: SRCardState | null = null;
      const intervals: number[] = [];

      for (let i = 0; i < 4; i++) {
        const result = computeNextReview(state, 4);
        intervals.push(result.interval);
        state = result;
      }
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(3);
      expect(intervals[2]).toBeGreaterThanOrEqual(6);
      expect(intervals[3]).toBeGreaterThan(intervals[2]);
    });

    it('lapse after long progression resets to 1 then rebuilds', () => {
      let state: SRCardState | null = null;
      // Build up
      for (let i = 0; i < 5; i++) {
        state = computeNextReview(state, 4);
      }
      expect(state!.interval).toBeGreaterThan(10);

      // Lapse
      state = computeNextReview(state, 1);
      expect(state!.interval).toBe(1);
      expect(state!.repetitions).toBe(0);
      expect(state!.lapses).toBe(1);

      // Rebuild: should follow 1 → 3 → growth again
      state = computeNextReview(state, 4);
      expect(state!.interval).toBe(1);
      state = computeNextReview(state, 4);
      expect(state!.interval).toBe(3);
    });
  });

  // ─── Quality-weighted interval differences ─────────────────────────────

  describe('quality-weighted intervals', () => {
    it('quality 1 vs 5 produces drastically different intervals after 3 reviews', () => {
      // Path A: always quality 5 (easy)
      let easyPath: SRCardState | null = null;
      for (let i = 0; i < 3; i++) easyPath = computeNextReview(easyPath, 5);

      // Path B: always quality 1 (lapse)
      let lapsePath: SRCardState | null = null;
      for (let i = 0; i < 3; i++) lapsePath = computeNextReview(lapsePath, 1);

      // Easy path should have long interval; lapse path stays at 1
      expect(easyPath!.interval).toBeGreaterThan(3);
      expect(lapsePath!.interval).toBe(1);
      expect(lapsePath!.lapses).toBe(3);
    });

    it('quality 4 grows faster than quality 3 over same number of reviews', () => {
      let goodPath: SRCardState | null = null;
      let hardPath: SRCardState | null = null;
      for (let i = 0; i < 5; i++) {
        goodPath = computeNextReview(goodPath, 4);
        hardPath = computeNextReview(hardPath, 3);
      }
      expect(goodPath!.interval).toBeGreaterThan(hardPath!.interval);
      expect(goodPath!.easeFactor).toBeGreaterThan(hardPath!.easeFactor);
    });

    it('single low quality review in a good sequence reduces next interval', () => {
      // Build up with quality 4
      let state: SRCardState | null = null;
      for (let i = 0; i < 4; i++) state = computeNextReview(state, 4);
      const intervalBeforeLapse = state!.interval;

      // Lapse
      state = computeNextReview(state, 1);
      expect(state!.interval).toBe(1); // reset
      expect(state!.interval).toBeLessThan(intervalBeforeLapse);
    });

    it('quality 2 (hard) keeps interval but reduces ease', () => {
      let state: SRCardState | null = null;
      state = computeNextReview(state, 4); // interval 1
      state = computeNextReview(state, 4); // interval 3
      const easeBeforeHard = state!.easeFactor;
      state = computeNextReview(state, 3); // hard: keeps interval, ease drops
      expect(state!.easeFactor).toBeLessThan(easeBeforeHard);
    });

    it('mixed quality sequence produces intermediate intervals', () => {
      // All-good path
      let allGood: SRCardState | null = null;
      for (let i = 0; i < 4; i++) allGood = computeNextReview(allGood, 4);

      // Mixed path: good, hard, good, good
      let mixed: SRCardState | null = null;
      mixed = computeNextReview(mixed, 4);
      mixed = computeNextReview(mixed, 3); // hard review
      mixed = computeNextReview(mixed, 4);
      mixed = computeNextReview(mixed, 4);

      // Mixed should have shorter intervals due to hard review reducing ease
      expect(mixed!.interval).toBeLessThanOrEqual(allGood!.interval);
      expect(mixed!.easeFactor).toBeLessThan(allGood!.easeFactor);
    });

    it('per-card quality differences after same number of reviews diverge intervals', () => {
      // Simulate two cards from the same drill:
      // Card A: user engaged well → quality 5
      // Card B: user skipped content → quality 2 (from computeCardQuality: base 4 - 2 penalties)
      let cardA: SRCardState | null = null;
      let cardB: SRCardState | null = null;

      // First review
      cardA = computeNextReview(cardA, 5);
      cardB = computeNextReview(cardB, 2);

      // Second review (same quality pattern)
      cardA = computeNextReview(cardA, 5);
      cardB = computeNextReview(cardB, 2);

      // Card A should be progressing; Card B should have lapsed
      expect(cardA!.interval).toBeGreaterThan(1);
      expect(cardB!.interval).toBe(1); // quality 2 → lapse
      expect(cardA!.easeFactor).toBeGreaterThan(cardB!.easeFactor);
    });
  });
});
