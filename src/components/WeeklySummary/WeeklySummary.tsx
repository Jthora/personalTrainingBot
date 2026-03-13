/**
 * WeeklySummary — Shows score changes over the past 7 days.
 *
 * Displays domain improvements/regressions in a compact summary format.
 * "This week: +12 pts Cybersecurity, +8 pts Fitness, started OSINT"
 */

import React, { useMemo } from 'react';
import ProgressSnapshotStore from '../../store/ProgressSnapshotStore';
import styles from './WeeklySummary.module.css';

const WeeklySummary: React.FC = () => {
  const deltas = useMemo(() => ProgressSnapshotStore.getWeeklyDeltas(), []);

  if (deltas.length === 0) return null;

  const gains = deltas.filter((d) => d.delta > 0);
  const losses = deltas.filter((d) => d.delta < 0);

  return (
    <div className={styles.summary} data-testid="weekly-summary">
      <h3 className={styles.heading}>This Week</h3>
      <div className={styles.items}>
        {gains.slice(0, 4).map((d) => (
          <span key={d.domainId} className={styles.gain}>
            +{d.delta} {d.domainName}
          </span>
        ))}
        {losses.slice(0, 2).map((d) => (
          <span key={d.domainId} className={styles.loss}>
            {d.delta} {d.domainName}
          </span>
        ))}
        {deltas.length === 0 && (
          <span className={styles.neutral}>Complete a few drills to see weekly progress.</span>
        )}
      </div>
    </div>
  );
};

export default WeeklySummary;
