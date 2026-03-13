import React, { useMemo } from 'react';
import styles from './CompetencyChart.module.css';
import type { DomainProgressSnapshot, DomainProgress } from '../../utils/readiness/domainProgress';

export interface CompetencyChartProps {
  snapshot: DomainProgressSnapshot;
  /** Domain IDs from the active archetype's core + secondary modules. */
  activeDomainIds?: string[];
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** Sort: active-plan domains first, then by score descending. */
const sortDomains = (domains: DomainProgress[], activeSet: Set<string>): DomainProgress[] =>
  [...domains].sort((a, b) => {
    const aActive = activeSet.has(a.domainId) ? 1 : 0;
    const bActive = activeSet.has(b.domainId) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    return b.score - a.score;
  });

const CompetencyChart: React.FC<CompetencyChartProps> = ({ snapshot, activeDomainIds }) => {
  const activeSet = useMemo(() => new Set(activeDomainIds ?? []), [activeDomainIds]);

  const bars = useMemo(
    () =>
      sortDomains(snapshot.domains, activeSet).map((d) => ({
        domainId: d.domainId,
        label: d.domainName,
        score: clamp(d.score),
        drillCount: d.drillCount,
        avgAssessment: d.avgAssessment,
        trend: d.trend,
        coverageRatio: d.coverageRatio,
        isActive: activeSet.has(d.domainId),
      })),
    [snapshot, activeSet],
  );

  return (
    <section className={styles.chart} aria-label="Domain progress">
      <h3 className={styles.heading}>Domain Progress</h3>
      <p className={styles.weighted}>
        Composite Score: <strong>{snapshot.weightedScore}</strong>
      </p>
      <div className={styles.bars}>
        {bars.map((bar) => (
          <div key={bar.domainId} className={styles.barRow}>
            <div className={styles.barLabel}>
              {bar.isActive && <span className={styles.barIcon}>★</span>}
              <span>{bar.label}</span>
              {bar.drillCount > 0 && (
                <span className={styles.barMeta}>
                  {bar.drillCount}d{bar.avgAssessment != null ? ` · ${bar.avgAssessment}★` : ''}
                  {bar.trend === 'improving' && <span className={styles.trendUp} title="Improving"> ↑</span>}
                  {bar.trend === 'declining' && <span className={styles.trendDown} title="Declining"> ↓</span>}
                  {bar.trend === 'stable' && <span className={styles.trendFlat} title="Stable"> →</span>}
                  {bar.coverageRatio != null && (
                    <span className={styles.coverage} title="Deck coverage"> · {Math.round(bar.coverageRatio * 100)}%</span>
                  )}
                </span>
              )}
            </div>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuenow={bar.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${bar.label}: ${bar.score}%`}
            >
              <div className={styles.fill} style={{ width: `${bar.score}%` }} />
            </div>
            <span className={styles.scoreValue}>{bar.score}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CompetencyChart;
