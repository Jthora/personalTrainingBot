import React, { useMemo } from 'react';
import styles from './CompetencyChart.module.css';
import type { CompetencyDimension, CompetencySnapshot } from '../../utils/readiness/competencyModel';

export interface CompetencyChartProps {
  snapshot: CompetencySnapshot;
}

const DIMENSION_META: Record<CompetencyDimension, { label: string; icon: string }> = {
  triage_execution: { label: 'Triage Execution', icon: '🧭' },
  signal_analysis: { label: 'Signal Analysis', icon: '📡' },
  artifact_traceability: { label: 'Artifact Traceability', icon: '🧾' },
  decision_quality: { label: 'Decision Quality', icon: '⚖️' },
};

const DIMENSIONS: CompetencyDimension[] = [
  'triage_execution',
  'signal_analysis',
  'artifact_traceability',
  'decision_quality',
];

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const CompetencyChart: React.FC<CompetencyChartProps> = ({ snapshot }) => {
  const bars = useMemo(() =>
    DIMENSIONS.map(dim => ({
      dim,
      ...DIMENSION_META[dim],
      score: clamp(snapshot.dimensionScores[dim]),
    })),
    [snapshot],
  );

  return (
    <section className={styles.chart} aria-label="Competency breakdown">
      <h3 className={styles.heading}>Competency Breakdown</h3>
      <p className={styles.weighted}>
        Weighted Score: <strong>{snapshot.weightedScore}</strong>
      </p>
      <div className={styles.bars}>
        {bars.map(bar => (
          <div key={bar.dim} className={styles.barRow}>
            <div className={styles.barLabel}>
              <span className={styles.barIcon}>{bar.icon}</span>
              <span>{bar.label}</span>
            </div>
            <div className={styles.track} role="progressbar" aria-valuenow={bar.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${bar.label}: ${bar.score}%`}>
              <div
                className={styles.fill}
                style={{ width: `${bar.score}%` }}
              />
            </div>
            <span className={styles.scoreValue}>{bar.score}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CompetencyChart;
