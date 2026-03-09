import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReadinessPanel.module.css';
import { computeReadiness } from '../../utils/readiness/model';
import { trackEvent } from '../../utils/telemetry';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { MissionKitStore } from '../../store/MissionKitStore';
import { AARStore } from '../../store/AARStore';
import { mapAllAARsToDebriefOutcomes } from '../../utils/readiness/aarBridge';

const ReadinessPanel: React.FC = () => {
  const navigate = useNavigate();
  const collection = useMissionEntityCollection();
  const exemplarOutcomes = collection?.debriefOutcomes ?? [];
  const aarOutcomes = useMemo(() => mapAllAARsToDebriefOutcomes(AARStore.list()), []);
  const debriefOutcomes = useMemo(() => [...exemplarOutcomes, ...aarOutcomes], [exemplarOutcomes, aarOutcomes]);

  // Use live kit with persisted drill stats instead of hardcoded defaults
  const primaryKit = useMemo(() => MissionKitStore.getPrimaryKit(), []);
  const readiness = useMemo(() => computeReadiness(primaryKit, { debriefOutcomes }), [primaryKit, debriefOutcomes]);

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

  const handleActionClick = (actionId: string, title: string, index: number, route: string) => {
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
    navigate(route);
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
            onClick={() => handleActionClick(action.id, action.title, idx, action.route)}
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
