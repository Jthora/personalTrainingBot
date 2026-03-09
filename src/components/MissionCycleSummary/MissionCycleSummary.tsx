import React from 'react';
import styles from './MissionCycleSummary.module.css';
import { TriageActionStore } from '../../store/TriageActionStore';
import { ArtifactActionStore } from '../../store/ArtifactActionStore';
import { SignalsStore } from '../../store/SignalsStore';

export interface MissionCycleSummaryData {
  triage: { ack: number; escalate: number; defer: number; resolve: number; total: number };
  artifacts: { reviewed: number; promoted: number };
  signals: { total: number; open: number; acknowledged: number; resolved: number };
}

/** Gather live counts from persisted stores. */
export const collectCycleSummary = (): MissionCycleSummaryData => {
  const byAction = TriageActionStore.byAction();
  const triageTotal = TriageActionStore.count();

  const signals = SignalsStore.list();
  const signalCounts = signals.reduce(
    (acc, s) => {
      if (s.status === 'open') acc.open++;
      else if (s.status === 'ack') acc.acknowledged++;
      else if (s.status === 'resolved') acc.resolved++;
      return acc;
    },
    { open: 0, acknowledged: 0, resolved: 0 },
  );

  return {
    triage: {
      ack: byAction.ack.length,
      escalate: byAction.escalate.length,
      defer: byAction.defer.length,
      resolve: byAction.resolve.length,
      total: triageTotal,
    },
    artifacts: {
      reviewed: ArtifactActionStore.reviewedCount(),
      promoted: ArtifactActionStore.promotedCount(),
    },
    signals: {
      total: signals.length,
      ...signalCounts,
    },
  };
};

const MissionCycleSummary: React.FC = () => {
  const data = collectCycleSummary();

  return (
    <section className={styles.card} aria-label="Mission Cycle Summary">
      <h3 className={styles.title}>Mission Cycle Summary</h3>
      <p className={styles.subtitle}>Actions taken during this mission cycle</p>

      <p className={styles.sectionLabel}>Triage</p>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Acknowledged</p>
          <p className={styles.metricValue}>{data.triage.ack}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Escalated</p>
          <p className={styles.metricValue}>{data.triage.escalate}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Deferred</p>
          <p className={styles.metricValue}>{data.triage.defer}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Resolved</p>
          <p className={styles.metricValue}>{data.triage.resolve}</p>
        </div>
      </div>

      <p className={styles.sectionLabel}>Artifacts</p>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Reviewed</p>
          <p className={styles.metricValue}>{data.artifacts.reviewed}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Promoted</p>
          <p className={styles.metricValue}>{data.artifacts.promoted}</p>
        </div>
      </div>

      <p className={styles.sectionLabel}>Signals</p>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Total</p>
          <p className={styles.metricValue}>{data.signals.total}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Open</p>
          <p className={styles.metricValue}>{data.signals.open}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Acknowledged</p>
          <p className={styles.metricValue}>{data.signals.acknowledged}</p>
        </div>
        <div className={styles.metric}>
          <p className={styles.metricLabel}>Resolved</p>
          <p className={styles.metricValue}>{data.signals.resolved}</p>
        </div>
      </div>
    </section>
  );
};

export default MissionCycleSummary;
