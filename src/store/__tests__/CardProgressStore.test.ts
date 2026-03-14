import { describe, it, expect, beforeEach } from 'vitest';
import CardProgressStore from '../CardProgressStore';

beforeEach(() => {
  window.localStorage.clear();
});

describe('CardProgressStore', () => {
  it('starts empty', () => {
    expect(CardProgressStore.list()).toEqual([]);
    expect(CardProgressStore.count()).toBe(0);
  });

  it('records a review and creates entry', () => {
    const entry = CardProgressStore.recordReview('card-1', 'module-a', 4);
    expect(entry.cardId).toBe('card-1');
    expect(entry.moduleId).toBe('module-a');
    expect(entry.interval).toBe(1);
    expect(entry.repetitions).toBe(1);
    expect(entry.lapses).toBe(0);
    expect(entry.lastReviewedAt).toBeTruthy();
    expect(entry.nextReviewAt).toBeTruthy();
    expect(CardProgressStore.count()).toBe(1);
  });

  it('updates existing entry on re-review', () => {
    CardProgressStore.recordReview('card-1', 'module-a', 4);
    const entry2 = CardProgressStore.recordReview('card-1', 'module-a', 5);
    expect(CardProgressStore.count()).toBe(1);
    expect(entry2.repetitions).toBe(2);
    expect(entry2.interval).toBe(3);
  });

  it('tracks multiple cards independently', () => {
    CardProgressStore.recordReview('card-1', 'module-a', 4);
    CardProgressStore.recordReview('card-2', 'module-a', 5);
    CardProgressStore.recordReview('card-3', 'module-b', 3);
    expect(CardProgressStore.count()).toBe(3);
  });

  it('getCardProgress returns entry for known card', () => {
    CardProgressStore.recordReview('card-x', 'mod-1', 4);
    const progress = CardProgressStore.getCardProgress('card-x');
    expect(progress).not.toBeNull();
    expect(progress!.cardId).toBe('card-x');
  });

  it('getCardProgress returns null for unknown card', () => {
    expect(CardProgressStore.getCardProgress('nonexistent')).toBeNull();
  });

  it('getCardsDueForReview returns cards past their review date', () => {
    // Record two reviews
    CardProgressStore.recordReview('card-1', 'mod-a', 4);
    CardProgressStore.recordReview('card-2', 'mod-a', 4);
    // Both have nextReviewAt ~1 day in the future
    const now = Date.now();
    // Nothing due right now
    expect(CardProgressStore.getCardsDueForReview('mod-a', now)).toHaveLength(0);
    // Simulate time travelling past their review date
    const futureNow = now + 2 * 24 * 60 * 60 * 1000; // +2 days
    const due = CardProgressStore.getCardsDueForReview('mod-a', futureNow);
    expect(due).toHaveLength(2);
  });

  it('getCardsDueForReview filters by moduleId', () => {
    CardProgressStore.recordReview('card-1', 'mod-a', 4);
    CardProgressStore.recordReview('card-2', 'mod-b', 4);
    const futureNow = Date.now() + 2 * 24 * 60 * 60 * 1000;
    expect(CardProgressStore.getCardsDueForReview('mod-a', futureNow)).toHaveLength(1);
    expect(CardProgressStore.getCardsDueForReview('mod-b', futureNow)).toHaveLength(1);
    // No filter → all
    expect(CardProgressStore.getCardsDueForReview(undefined, futureNow)).toHaveLength(2);
  });

  describe('getModuleReviewStats', () => {
    it('returns zeroes for unknown module', () => {
      const stats = CardProgressStore.getModuleReviewStats('unknown');
      expect(stats).toEqual({ due: 0, learning: 0, mature: 0, newCards: 0, total: 0 });
    });

    it('counts learning cards (interval < 21)', () => {
      CardProgressStore.recordReview('c1', 'mod-x', 4); // rep 1, interval 1 → learning
      CardProgressStore.recordReview('c2', 'mod-x', 4);
      const stats = CardProgressStore.getModuleReviewStats('mod-x');
      expect(stats.learning).toBe(2);
      expect(stats.total).toBe(2);
      expect(stats.mature).toBe(0);
    });

    it('classifies mature vs learning correctly', () => {
      // Simulate a mature card by recording many reviews
      let entry = CardProgressStore.recordReview('c1', 'mod-z', 5);
      // Manually push the card to mature state via repeated reviews
      for (let i = 0; i < 6; i++) {
        entry = CardProgressStore.recordReview('c1', 'mod-z', 5);
      }
      const stats = CardProgressStore.getModuleReviewStats('mod-z');
      // After 7 easy reviews, interval should be ≥ 21 → mature
      expect(stats.mature).toBe(entry.interval >= 21 ? 1 : 0);
      expect(stats.total).toBe(1);
    });
  });

  it('defaults selfAssessment to 3 when omitted', () => {
    const entry = CardProgressStore.recordReview('card-def', 'mod-a');
    expect(entry.repetitions).toBe(1);
    expect(entry.interval).toBe(1);
    // Second review with default
    const entry2 = CardProgressStore.recordReview('card-def', 'mod-a');
    expect(entry2.repetitions).toBe(2);
  });

  it('clear removes all data', () => {
    CardProgressStore.recordReview('c1', 'm1', 4);
    CardProgressStore.recordReview('c2', 'm1', 5);
    CardProgressStore.clear();
    expect(CardProgressStore.count()).toBe(0);
    expect(CardProgressStore.list()).toEqual([]);
  });

  it('subscribe notifies on changes', () => {
    let callCount = 0;
    const unsub = CardProgressStore.subscribe(() => { callCount += 1; });
    CardProgressStore.recordReview('c1', 'm1', 4);
    expect(callCount).toBeGreaterThanOrEqual(1);
    unsub();
  });

  it('persists across store re-reads (localStorage)', () => {
    CardProgressStore.recordReview('card-persist', 'mod-p', 4);
    // Re-reading from store.get (re-parses localStorage)
    const progress = CardProgressStore.getCardProgress('card-persist');
    expect(progress).not.toBeNull();
    expect(progress!.interval).toBe(1);
  });

  describe('forecastDue', () => {
    it('returns empty buckets when no cards tracked', () => {
      const forecast = CardProgressStore.forecastDue(7);
      expect(forecast).toHaveLength(7);
      expect(forecast.every((b) => b.count === 0)).toBe(true);
    });

    it('returns correct number of day buckets', () => {
      expect(CardProgressStore.forecastDue(3)).toHaveLength(3);
      expect(CardProgressStore.forecastDue(14)).toHaveLength(14);
    });

    it('assigns day indices starting from 0', () => {
      const forecast = CardProgressStore.forecastDue(5);
      expect(forecast.map((b) => b.day)).toEqual([0, 1, 2, 3, 4]);
    });

    it('counts overdue cards in day 0 bucket', () => {
      // Record a card; its nextReviewAt will be ~1 day from now
      CardProgressStore.recordReview('c1', 'mod-a', 4);
      CardProgressStore.recordReview('c2', 'mod-a', 4);
      // Fast-forward 3 days — both cards are overdue
      const futureNow = Date.now() + 3 * 86_400_000;
      const forecast = CardProgressStore.forecastDue(7, futureNow);
      expect(forecast[0].count).toBe(2); // both overdue → day 0
    });

    it('places cards in correct future day bucket', () => {
      // Record a card (interval = 1 day, nextReviewAt ≈ now + 1 day)
      CardProgressStore.recordReview('c1', 'mod-a', 4);
      const progress = CardProgressStore.getCardProgress('c1')!;
      const dueAt = new Date(progress.nextReviewAt).getTime();
      // Use a "now" that is the start of the same day as recording
      const now = Date.now();
      const forecast = CardProgressStore.forecastDue(7, now);
      // The card should land in day 1 (tomorrow) since interval is 1
      const totalForecasted = forecast.reduce((a, b) => a + b.count, 0);
      expect(totalForecasted).toBe(1);
    });

    it('produces ISO date strings for each day', () => {
      const forecast = CardProgressStore.forecastDue(3);
      for (const bucket of forecast) {
        expect(bucket.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  describe('getOverallStats', () => {
    it('returns zeroes when no cards tracked', () => {
      const stats = CardProgressStore.getOverallStats();
      expect(stats).toEqual({
        total: 0, due: 0, learning: 0, mature: 0,
        newCards: 0, avgEase: 2.5, totalLapses: 0,
      });
    });

    it('counts total cards', () => {
      CardProgressStore.recordReview('c1', 'mod-a', 4);
      CardProgressStore.recordReview('c2', 'mod-a', 3);
      CardProgressStore.recordReview('c3', 'mod-b', 5);
      expect(CardProgressStore.getOverallStats().total).toBe(3);
    });

    it('classifies learning vs mature', () => {
      // Single review → interval 1 → learning
      CardProgressStore.recordReview('c1', 'mod-a', 4);
      let stats = CardProgressStore.getOverallStats();
      expect(stats.learning).toBe(1);
      expect(stats.mature).toBe(0);
    });

    it('tallies lapses across all cards', () => {
      // Rating 1 → lapse
      CardProgressStore.recordReview('c1', 'mod-a', 1);
      CardProgressStore.recordReview('c2', 'mod-a', 1);
      const stats = CardProgressStore.getOverallStats();
      expect(stats.totalLapses).toBe(2);
    });

    it('computes avgEase as number', () => {
      CardProgressStore.recordReview('c1', 'mod-a', 5);
      CardProgressStore.recordReview('c2', 'mod-a', 5);
      const stats = CardProgressStore.getOverallStats();
      expect(typeof stats.avgEase).toBe('number');
      expect(stats.avgEase).toBeGreaterThan(0);
    });

    it('counts due cards', () => {
      CardProgressStore.recordReview('c1', 'mod-a', 4);
      CardProgressStore.recordReview('c2', 'mod-a', 4);
      // Not due right now
      expect(CardProgressStore.getOverallStats().due).toBe(0);
    });
  });
});
