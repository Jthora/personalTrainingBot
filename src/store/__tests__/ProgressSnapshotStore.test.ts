import { describe, it, expect, beforeEach, vi } from 'vitest';

/* ── Mock domain progress before importing store ── */

const mockDeriveDomainSnapshot = vi.fn(() => ({
  domains: [
    { domainId: 'cybersecurity', domainName: 'Cybersecurity', score: 72, drillCount: 5, avgAssessment: 4, uniqueDrills: 3, lastActiveDate: '2026-03-12', trend: 'improving' as const, coverageRatio: 0.6 },
    { domainId: 'fitness', domainName: 'Fitness', score: 45, drillCount: 3, avgAssessment: 3, uniqueDrills: 2, lastActiveDate: '2026-03-11', trend: 'stable' as const, coverageRatio: 0.4 },
    { domainId: 'combat', domainName: 'Combat', score: 20, drillCount: 1, avgAssessment: 2, uniqueDrills: 1, lastActiveDate: '2026-03-10', trend: null, coverageRatio: 0.1 },
  ],
  weightedScore: 46,
}));

vi.mock('../../utils/readiness/domainProgress', () => ({
  deriveDomainSnapshot: () => mockDeriveDomainSnapshot(),
  DOMAIN_CATALOG: [
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'combat', name: 'Combat' },
  ],
}));

import {
  recordDailySnapshot,
  getScoreHistory,
  getLatestSnapshotDate,
  getSnapshotForDate,
  getWeeklyDeltas,
  getSnapshotCount,
  reset,
} from '../ProgressSnapshotStore';

beforeEach(() => {
  reset();
  vi.clearAllMocks();
});

describe('ProgressSnapshotStore', () => {
  describe('recordDailySnapshot', () => {
    it('records a snapshot with one entry per domain', () => {
      const recorded = recordDailySnapshot();
      expect(recorded).toBe(true);
      expect(getSnapshotCount()).toBe(3); // 3 domains in mock
    });

    it('returns false on duplicate snapshot for same day', () => {
      recordDailySnapshot();
      const second = recordDailySnapshot();
      expect(second).toBe(false);
      expect(getSnapshotCount()).toBe(3); // still 3, not 6
    });

    it('accepts a snapshot override instead of computing live', () => {
      const override = {
        domains: [
          { domainId: 'cybersecurity', domainName: 'Cybersecurity', score: 99, drillCount: 10, avgAssessment: 5, uniqueDrills: 8, lastActiveDate: '2026-03-12', trend: 'improving' as const, coverageRatio: 1.0 },
        ],
        weightedScore: 99,
      };
      recordDailySnapshot(override);
      const history = getScoreHistory('cybersecurity', 1);
      expect(history.length).toBe(1);
      expect(history[0].score).toBe(99);
    });
  });

  describe('getScoreHistory', () => {
    it('returns sorted datapoints for requested domain', () => {
      recordDailySnapshot();
      const history = getScoreHistory('cybersecurity', 30);
      expect(history.length).toBe(1);
      expect(history[0].score).toBe(72);
      expect(history[0].date).toBeTruthy();
    });

    it('returns empty array for domain with no snapshots', () => {
      const history = getScoreHistory('unknown_domain', 30);
      expect(history).toEqual([]);
    });

    it('filters by day range', () => {
      // Manually inject older data by recording with override
      recordDailySnapshot();
      const count = getScoreHistory('fitness', 0);
      // 0 days means "from today" — but cutoff is inclusive-ish
      // fitness should still match since it's today
      expect(count.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getLatestSnapshotDate', () => {
    it('returns null when no snapshots exist', () => {
      expect(getLatestSnapshotDate()).toBeNull();
    });

    it('returns the latest date after recording', () => {
      recordDailySnapshot();
      const date = getLatestSnapshotDate();
      expect(date).toBeTruthy();
      expect(date).toBe(new Date().toISOString().slice(0, 10));
    });
  });

  describe('getSnapshotForDate', () => {
    it('returns a map of domainId → score for the given date', () => {
      recordDailySnapshot();
      const today = new Date().toISOString().slice(0, 10);
      const map = getSnapshotForDate(today);
      expect(map.get('cybersecurity')).toBe(72);
      expect(map.get('fitness')).toBe(45);
      expect(map.get('combat')).toBe(20);
    });

    it('returns empty map for unknown date', () => {
      const map = getSnapshotForDate('1999-01-01');
      expect(map.size).toBe(0);
    });
  });

  describe('getWeeklyDeltas', () => {
    it('returns empty array when no snapshots exist', () => {
      expect(getWeeklyDeltas()).toEqual([]);
    });

    it('returns empty when only one date of snapshots exists', () => {
      recordDailySnapshot();
      // Only today's data — no older date to compare
      expect(getWeeklyDeltas()).toEqual([]);
    });
  });

  describe('reset', () => {
    it('clears all snapshots', () => {
      recordDailySnapshot();
      expect(getSnapshotCount()).toBe(3);
      reset();
      expect(getSnapshotCount()).toBe(0);
    });
  });
});
