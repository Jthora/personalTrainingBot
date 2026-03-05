import React, { useEffect, useMemo } from 'react';
import styles from './ReadinessPanel.module.css';
import { computeReadiness } from '../../utils/readiness/model';
import { trackEvent } from '../../utils/telemetry';
import MissionEntityStore from '../../domain/mission/MissionEntityStore';

const ReadinessPanel: React.FC = () => {
  const debriefOutcomes = MissionEntityStore.getInstance().getCanonicalCollection()?.debriefOutcomes ?? [];
  const readiness = useMemo(() => computeReadiness(undefined, { debriefOutcomes }), [debriefOutcomes]);

  useEffect(() => {
    trackEvent({
      category: 'readiness',
      action: 'score_render',
      data: {
        kitId: readiness.kit.id,
        score: readiness.score,
        confidence: readiness.confidence,
        progressionDelta: readiness.progression.appliedDelta,
        progressionTrend: readiness.progression.trend,
        milestoneTier: readiness.milestone.tier.id,
        milestoneProgressPct: readiness.milestone.progressPct,
      },
      source: 'ui',
    });
  }, [
    readiness.kit.id,
    readiness.score,
    readiness.confidence,
    readiness.progression.appliedDelta,
    readiness.progression.trend,
    readiness.milestone.tier.id,
    readiness.milestone.progressPct,
  ]);

  const handleActionClick = (actionId: string, title: string, index: number) => {
    trackEvent({
      category: 'readiness',
      action: 'next_action_click',
      data: {
        kitId: readiness.kit.id,
        actionId,
        title,
        position: index + 1,
        confidence: readiness.confidence,
        milestoneTier: readiness.milestone.tier.id,
      },
      source: 'ui',
    });
  };

  return (
    <section className={styles.panel} aria-label="Readiness">
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Operational Readiness</p>
          <p className={styles.confidence}>Confidence: {readiness.confidence}</p>
        </div>
        <div className={styles.score}>{readiness.score}</div>
      </div>
      <p className={styles.kitTitle}>{readiness.kit.title}</p>
      <p className={styles.kitTitle}>{readiness.milestone.tier.label} · Progress {readiness.milestone.progressPct}%</p>
      <p className={styles.kitTitle}>{readiness.milestone.nextUnlockHint}</p>
      <div className={styles.actions}>
        {readiness.nextActions.map((action, idx) => (
          <button
            key={action.id}
            type="button"
            className={styles.action}
            onClick={() => handleActionClick(action.id, action.title, idx)}
            aria-label={`Run ${action.title}`}
          >
            <span className={styles.badge}>Next {idx + 1}</span>
            <p className={styles.subtitle}>{action.title}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ReadinessPanel;
