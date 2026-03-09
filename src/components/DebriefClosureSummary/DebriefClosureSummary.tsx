import React, { useMemo } from 'react';
import styles from './DebriefClosureSummary.module.css';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { computeReadiness } from '../../utils/readiness/model';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';
import type { CompetencyDimension } from '../../utils/readiness/competencyModel';

const competencyLabels: Record<CompetencyDimension, string> = {
  triage_execution: 'Triage Execution',
  signal_analysis: 'Signal Analysis',
  artifact_traceability: 'Artifact Traceability',
  decision_quality: 'Decision Quality',
};

const DebriefClosureSummary: React.FC = () => {
  const collection = useMissionEntityCollection();
  const context = readMissionFlowContext();

  const summary = useMemo(() => {
    const outcomes = collection?.debriefOutcomes ?? [];
    const withProgression = computeReadiness(undefined, { debriefOutcomes: outcomes });
    const withoutProgression = computeReadiness(undefined, { debriefOutcomes: [] });
    const readinessDelta = withProgression.score - withoutProgression.score;

    const dimensions = Object.entries(withProgression.competency.dimensionScores) as Array<[CompetencyDimension, number]>;
    const strongest = [...dimensions].sort((a, b) => b[1] - a[1])[0];
    const weakest = [...dimensions].sort((a, b) => a[1] - b[1])[0];

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
        <p className={styles.feedbackLine}>
          <strong>Strongest competency:</strong> {competencyLabels[summary.strongest[0]]} ({Math.round(summary.strongest[1])})
        </p>
        <p className={styles.feedbackLine}>
          <strong>Focus next:</strong> {competencyLabels[summary.weakest[0]]} ({Math.round(summary.weakest[1])})
        </p>
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
