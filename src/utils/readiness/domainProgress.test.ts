import { describe, expect, it, vi, beforeEach } from 'vitest';
import { deriveDomainSnapshot, averageDomainScore, DOMAIN_CATALOG, type DomainProgressSnapshot } from './domainProgress';
import DrillHistoryStore from '../../store/DrillHistoryStore';

vi.mock('../../store/DrillHistoryStore', () => ({
  default: {
    statsForDomain: vi.fn(() => ({ runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null })),
    assessmentTrendForDomain: vi.fn(() => null),
  },
}));

const mockStatsForDomain = DrillHistoryStore.statsForDomain as ReturnType<typeof vi.fn>;
const mockTrendForDomain = DrillHistoryStore.assessmentTrendForDomain as ReturnType<typeof vi.fn>;

describe('deriveDomainSnapshot', () => {
  beforeEach(() => {
    mockStatsForDomain.mockReset();
    mockStatsForDomain.mockReturnValue({ runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null });
    mockTrendForDomain.mockReset();
    mockTrendForDomain.mockReturnValue(null);
  });

  it('returns all 19 domains', () => {
    const snapshot = deriveDomainSnapshot();
    expect(snapshot.domains).toHaveLength(19);
    expect(snapshot.domains.map((d) => d.domainId)).toEqual(DOMAIN_CATALOG.map((d) => d.id));
  });

  it('cold-start: all scores are 0 with no history', () => {
    const snapshot = deriveDomainSnapshot();
    expect(snapshot.weightedScore).toBe(0);
    snapshot.domains.forEach((d) => {
      expect(d.score).toBe(0);
      expect(d.drillCount).toBe(0);
      expect(d.avgAssessment).toBeNull();
    });
  });

  it('scores a domain with drill activity', () => {
    mockStatsForDomain.mockImplementation((domainId: string) => {
      if (domainId === 'combat') {
        return { runs: 5, avgAssessment: 4.0, uniqueDrills: 3, lastActiveDate: new Date().toISOString() };
      }
      return { runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null };
    });

    const snapshot = deriveDomainSnapshot();
    const combat = snapshot.domains.find((d) => d.domainId === 'combat')!;

    // activityFactor: min(5/10, 1) = 0.5 → × 40 = 20
    // assessmentFactor: 4/5 = 0.8 → × 40 = 32
    // recencyFactor: recent (0-2 days) = 1.0 → × 20 = 20
    // total = 72
    expect(combat.score).toBe(72);
    expect(combat.drillCount).toBe(5);
    expect(combat.avgAssessment).toBe(4.0);
    expect(combat.uniqueDrills).toBe(3);
  });

  it('caps activity factor at 1.0 for TARGET_DRILLS+', () => {
    mockStatsForDomain.mockImplementation((domainId: string) => {
      if (domainId === 'fitness') {
        return { runs: 20, avgAssessment: 5.0, uniqueDrills: 10, lastActiveDate: new Date().toISOString() };
      }
      return { runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null };
    });

    const snapshot = deriveDomainSnapshot();
    const fitness = snapshot.domains.find((d) => d.domainId === 'fitness')!;

    // activityFactor: min(20/10, 1) = 1.0 → × 40 = 40
    // assessmentFactor: 5/5 = 1.0 → × 40 = 40
    // recencyFactor: 1.0 → × 20 = 20
    // total = 100
    expect(fitness.score).toBe(100);
  });

  it('applies recency decay for older last-active dates', () => {
    const thirtyDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
    mockStatsForDomain.mockImplementation((domainId: string) => {
      if (domainId === 'espionage') {
        return { runs: 10, avgAssessment: 5.0, uniqueDrills: 5, lastActiveDate: thirtyDaysAgo };
      }
      return { runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null };
    });

    const snapshot = deriveDomainSnapshot();
    const espionage = snapshot.domains.find((d) => d.domainId === 'espionage')!;

    // activityFactor: 1.0 → × 40 = 40
    // assessmentFactor: 1.0 → × 40 = 40
    // recencyFactor: 25 days → 0.5 → × 20 = 10
    // total = 90
    expect(espionage.score).toBe(90);
  });

  it('composite score is 0 when all domains are 0', () => {
    const snapshot = deriveDomainSnapshot();
    expect(snapshot.weightedScore).toBe(0);
  });

  it('applies archetype weighting to composite', () => {
    // Set combat to score 100 and everything else to 0
    mockStatsForDomain.mockImplementation((domainId: string) => {
      if (domainId === 'combat') {
        return { runs: 20, avgAssessment: 5.0, uniqueDrills: 10, lastActiveDate: new Date().toISOString() };
      }
      return { runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null };
    });

    const withoutWeights = deriveDomainSnapshot();
    const withWeights = deriveDomainSnapshot({
      coreDomains: ['combat'],
      secondaryDomains: ['fitness'],
    });

    // Without weights: 100/19 ≈ 5
    // With weights: combat(100×3) + fitness(0×2) + 17×(0×1) = 300/22 ≈ 14
    expect(withWeights.weightedScore).toBeGreaterThan(withoutWeights.weightedScore);
  });

  it('preserves domain metadata from catalog', () => {
    const snapshot = deriveDomainSnapshot();
    const webThree = snapshot.domains.find((d) => d.domainId === 'web_three')!;
    expect(webThree.domainName).toBe('Web3');
    const antiPsn = snapshot.domains.find((d) => d.domainId === 'anti_psn')!;
    expect(antiPsn.domainName).toBe('Anti-PSN');
  });
});

describe('averageDomainScore', () => {
  const snapshot: DomainProgressSnapshot = {
    weightedScore: 50,
    domains: [
      { domainId: 'combat', domainName: 'Combat', score: 80, drillCount: 5, avgAssessment: 4, uniqueDrills: 3, lastActiveDate: null, trend: null, coverageRatio: null },
      { domainId: 'fitness', domainName: 'Fitness', score: 60, drillCount: 3, avgAssessment: 3, uniqueDrills: 2, lastActiveDate: null, trend: null, coverageRatio: null },
      { domainId: 'psiops', domainName: 'Psiops', score: 40, drillCount: 1, avgAssessment: 2, uniqueDrills: 1, lastActiveDate: null, trend: null, coverageRatio: null },
    ],
  };

  it('returns average of specified domains', () => {
    const avg = averageDomainScore(snapshot, ['combat', 'fitness']);
    expect(avg).toBe(70); // (80 + 60) / 2
  });

  it('returns 0 for empty domain list', () => {
    expect(averageDomainScore(snapshot, [])).toBe(0);
  });

  it('returns 0 when no domains match', () => {
    expect(averageDomainScore(snapshot, ['nonexistent'])).toBe(0);
  });

  it('handles single domain', () => {
    expect(averageDomainScore(snapshot, ['psiops'])).toBe(40);
  });
});
