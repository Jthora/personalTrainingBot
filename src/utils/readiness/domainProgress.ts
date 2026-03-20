/**
 * domainProgress.ts — Per-domain progress tracking engine.
 *
 * Replaces the meta-competency model with concrete progress tracking across
 * the 19 training disciplines. Each domain score is derived from actual drill
 * history data: completion count, self-assessment ratings, and recency.
 *
 * Cold-start: a fresh user with no drill history scores 0 across all domains
 * (no pre-seeded baselines).
 */

import DrillHistoryStore from '../../store/DrillHistoryStore';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import dayjs from 'dayjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Progress data for a single training domain. */
export type DomainProgress = {
  domainId: string;
  domainName: string;
  /** 0–100 composite score for this domain. */
  score: number;
  /** Total drill completions in this domain. */
  drillCount: number;
  /** Average self-assessment (1–5) or null if no ratings. */
  avgAssessment: number | null;
  /** Number of unique drills completed in this domain. */
  uniqueDrills: number;
  /** ISO date of most recent drill completion, or null. */
  lastActiveDate: string | null;
  /** Assessment trend: improving, declining, stable, or null if insufficient data. */
  trend: 'improving' | 'declining' | 'stable' | null;
  /** Ratio of unique drills completed vs total decks in domain (0–1). null if module not loaded. */
  coverageRatio: number | null;
};

/** Snapshot of progress across all domains, plus a composite readiness score. */
export type DomainProgressSnapshot = {
  /** Per-domain progress data. */
  domains: DomainProgress[];
  /**
   * Weighted composite score (0–100), suitable for blending into the
   * readiness formula in the same slot as the old competency.weightedScore.
   */
  weightedScore: number;
};

// ---------------------------------------------------------------------------
// Domain catalog — stable mapping of the 19 training modules
// ---------------------------------------------------------------------------

export type DomainEntry = { id: string; name: string };

/**
 * Canonical domain catalog.  IDs match `training_modules_manifest.json`.
 * Human-readable names are used for display.
 */
export const DOMAIN_CATALOG: DomainEntry[] = [
  { id: 'agencies', name: 'Agencies' },
  { id: 'combat', name: 'Combat' },
  { id: 'counter_biochem', name: 'Counter Biochem' },
  { id: 'counter_psyops', name: 'Counter Psyops' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'dance', name: 'Dance' },
  { id: 'equations', name: 'Equations' },
  { id: 'espionage', name: 'Espionage' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'intelligence', name: 'Intelligence' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'martial_arts', name: 'Martial Arts' },
  { id: 'psiops', name: 'Psiops' },
  { id: 'war_strategy', name: 'War Strategy' },
  { id: 'web_three', name: 'Web3' },
  { id: 'self_sovereignty', name: 'Self Sovereignty' },
  { id: 'anti_psn', name: 'Anti-PSN' },
  { id: 'anti_tcs_idc_cbc', name: 'Anti-TCS/IDC/CBC' },
  { id: 'space_force', name: 'Space Force' },
];

// ---------------------------------------------------------------------------
// Scoring tuning knobs
// ---------------------------------------------------------------------------

/** Number of drill completions considered "full activity" in a domain. */
const TARGET_DRILLS = 10;

/** Weight distribution for the three scoring factors (must sum to 100). */
const WEIGHT_ACTIVITY = 40;
const WEIGHT_ASSESSMENT = 40;
const WEIGHT_RECENCY = 20;

/** Recency decay curve — how much recent activity matters. */
const recencyFactor = (isoDate: string | null): number => {
  if (!isoDate) return 0;
  const days = dayjs().diff(dayjs(isoDate), 'day');
  if (days <= 2) return 1.0;
  if (days <= 7) return 0.85;
  if (days <= 14) return 0.7;
  if (days <= 30) return 0.5;
  return 0.3;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

/**
 * Compute per-domain score from drill history stats.
 *
 * Formula:
 *   score = activityFactor × 40 + assessmentFactor × 40 + recencyFactor × 20
 *
 * - activityFactor: min(drillCount / TARGET_DRILLS, 1.0)
 * - assessmentFactor: avgAssessment / 5.0  (0 if no ratings)
 * - recencyFactor: decay based on days since last drill
 *
 * Cold-start: 0 drills → all factors 0 → score 0.
 */
const computeDomainScore = (
  drillCount: number,
  avgAssessment: number | null,
  lastActiveDate: string | null,
): number => {
  const activity = Math.min(drillCount / TARGET_DRILLS, 1.0);
  const assessment = avgAssessment != null ? avgAssessment / 5.0 : 0;
  const recency = recencyFactor(lastActiveDate);

  const raw = activity * WEIGHT_ACTIVITY + assessment * WEIGHT_ASSESSMENT + recency * WEIGHT_RECENCY;
  return Math.round(clamp(raw, 0, 100));
};

// ---------------------------------------------------------------------------
// Archetype weighting
// ---------------------------------------------------------------------------

export type DomainWeightProfile = {
  /** Domain IDs that receive the highest weight. */
  coreDomains: string[];
  /** Domain IDs that receive medium weight. */
  secondaryDomains: string[];
};

/**
 * Compute the weighted composite across all domains.
 * Core domains get 3× weight, secondary get 2×, others get 1×.
 * Without a weight profile, all domains are weighted equally.
 */
const computeWeightedComposite = (
  domains: DomainProgress[],
  weights?: DomainWeightProfile,
): number => {
  if (domains.length === 0) return 0;

  const coreSet = new Set(weights?.coreDomains ?? []);
  const secondarySet = new Set(weights?.secondaryDomains ?? []);

  let totalWeight = 0;
  let totalScore = 0;

  for (const d of domains) {
    const w = coreSet.has(d.domainId) ? 3 : secondarySet.has(d.domainId) ? 2 : 1;
    totalWeight += w;
    totalScore += d.score * w;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derive a domain progress snapshot from drill history.
 * Consumes `DrillHistoryStore` entries grouped by `domainId`.
 *
 * @param weights — Optional archetype-derived domain weight profile.
 *                  Core domains contribute more to the composite score.
 */
export function deriveDomainSnapshot(
  weights?: DomainWeightProfile,
): DomainProgressSnapshot {
  const cache = TrainingModuleCache.getInstance();
  const domains: DomainProgress[] = DOMAIN_CATALOG.map((entry) => {
    const stats = DrillHistoryStore.statsForDomain(entry.id);
    const moduleStats = cache.isLoaded() ? cache.getModuleStats(entry.id) : null;
    const coverageRatio = moduleStats && moduleStats.totalDecks > 0
      ? Math.min(stats.uniqueDrills / moduleStats.totalDecks, 1)
      : null;

    return {
      domainId: entry.id,
      domainName: entry.name,
      score: computeDomainScore(stats.runs, stats.avgAssessment, stats.lastActiveDate),
      drillCount: stats.runs,
      avgAssessment: stats.avgAssessment,
      uniqueDrills: stats.uniqueDrills,
      lastActiveDate: stats.lastActiveDate,
      trend: DrillHistoryStore.assessmentTrendForDomain(entry.id),
      coverageRatio,
    };
  });

  const weightedScore = computeWeightedComposite(domains, weights);

  return { domains, weightedScore };
}

/**
 * Compute average score across a specific set of domain IDs.
 * Useful for archetype tier gate checks.
 */
export function averageDomainScore(
  snapshot: DomainProgressSnapshot,
  domainIds: string[],
): number {
  if (domainIds.length === 0) return 0;
  const idSet = new Set(domainIds);
  const matching = snapshot.domains.filter((d) => idSet.has(d.domainId));
  if (matching.length === 0) return 0;
  return Math.round(matching.reduce((sum, d) => sum + d.score, 0) / matching.length);
}
