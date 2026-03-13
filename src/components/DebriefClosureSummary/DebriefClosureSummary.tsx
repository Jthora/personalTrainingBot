import React, { useMemo } from 'react';
import styles from './DebriefClosureSummary.module.css';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { computeReadiness } from '../../utils/readiness/model';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';

const DebriefClosureSummary: React.FC = () => {
  const collection = useMissionEntityCollection();
  const context = readMissionFlowContext();

  const summary = useMemo(() => {
    const outcomes = collection?.debriefOutcomes ?? [];
    const withProgression = computeReadiness(undefined, { debriefOutcomes: outcomes });
    const withoutProgression = computeReadiness(undefined, { debriefOutcomes: [] });
    const readinessDelta = withProgression.score - withoutProgression.score;

    const activeDomains = withProgression.domainProgress.domains
      .filter((d) => d.drillCount > 0)
      .sort((a, b) => b.score - a.score);
    const strongest = activeDomains[0] ?? null;
    const weakest = activeDomains.length > 1 ? activeDomains[activeDomains.length - 1] : null;

    const operations = collection?.operations ?? [];
    const currentOperationId = context?.operationId ?? null;
    const recommendedOperation = operations
      .filter((operation) => operation.id !== currentOperationId)
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return a.readinessScore - b.readinessScore;
      })[0] ?? operations.find((operation) => operation.id === currentOperationId) ?? null;

    return {
      readinessDelta,
      readinessScore: withProgression.score,
      strongest,
      weakest,
      recommendedOperation,
    };
  }, [collection?.debriefOutcomes, collection?.operations, context?.operationId]);

  return (
    <section className={styles.card} aria-label="Debrief closure summary">
      <h3 className={styles.title}>Closure Summary</h3>

      <div className={styles.metrics}>
        <article className={styles.metric}>
          <p className={styles.metricLabel}>Readiness Score</p>
          <p className={styles.metricValue}>{summary.readinessScore}</p>
        </article>
        <article className={styles.metric}>
          <p className={styles.metricLabel}>Readiness Delta</p>
          <p className={styles.metricValue} data-state={summary.readinessDelta >= 0 ? 'up' : 'down'}>
            {summary.readinessDelta >= 0 ? '+' : ''}{summary.readinessDelta}
          </p>
        </article>
      </div>

      <div className={styles.feedback}>
        {summary.strongest && (
          <p className={styles.feedbackLine}>
            <strong>Strongest domain:</strong> {summary.strongest.domainName} ({Math.round(summary.strongest.score)})
          </p>
        )}
        {summary.weakest && (
          <p className={styles.feedbackLine}>
            <strong>Focus next:</strong> {summary.weakest.domainName} ({Math.round(summary.weakest.score)})
          </p>
        )}
        {!summary.strongest && (
          <p className={styles.feedbackLine}>Complete drills to establish domain progress.</p>
        )}
      </div>

      <div className={styles.recommendation}>
        <p className={styles.metricLabel}>Recommended Next Mission</p>
        {summary.recommendedOperation ? (
          <>
            <p className={styles.recommendationTitle}>{summary.recommendedOperation.codename}</p>
            <p className={styles.feedbackLine}>Objective: {summary.recommendedOperation.objective}</p>
            <p className={styles.feedbackLine}>Status: {summary.recommendedOperation.status} · Readiness: {summary.recommendedOperation.readinessScore}</p>
          </>
        ) : (
          <p className={styles.feedbackLine}>No alternate operation available. Re-open Mission Brief for next cycle planning.</p>
        )}
      </div>
    </section>
  );
};

export default DebriefClosureSummary;
