import React, { useMemo } from 'react';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';
import { computeReadiness } from '../../utils/readiness/model';
import styles from './MissionHeader.module.css';
import { getMissionHeaderModel } from './model';

const MissionHeader: React.FC = () => {
  const collection = useMissionEntityCollection();

  const model = useMemo(() => {
    const fallbackReadinessModel = computeReadiness(undefined, { debriefOutcomes: collection?.debriefOutcomes ?? [] });
    return {
      header: getMissionHeaderModel(collection, readMissionFlowContext(), fallbackReadinessModel.score),
      readiness: fallbackReadinessModel,
    };
  }, [collection]);

  return (
    <section className={styles.card} data-kind={model.header.kind} aria-label="Mission header">
      <div className={styles.topRow}>
        <div>
          <p className={styles.eyebrow}>Mission Header</p>
          <h1 className={styles.title}>{model.header.title}</h1>
        </div>
        <span className={styles.status} data-status={model.header.statusLabel}>{model.header.statusLabel}</span>
      </div>

      <p className={styles.objective}>{model.header.objective}</p>

      <div className={styles.metricRow} aria-label="Mission metrics">
        <span className={styles.metric}>{model.header.readinessLabel}</span>
        <span className={styles.metric}>{model.header.timeboxLabel}</span>
        <span className={styles.metric}>{model.readiness.milestone.tier.label} · {model.readiness.milestone.progressPct}%</span>
      </div>
    </section>
  );
};

export default MissionHeader;