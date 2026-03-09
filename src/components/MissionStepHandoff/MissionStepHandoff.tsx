import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MissionStepHandoff.module.css';
import { readMissionFlowContext, type MissionRoutePath } from '../../store/missionFlow/continuity';
import { trackEvent } from '../../utils/telemetry';

type MissionStepHandoffProps = {
  stepLabel: string;
  why: string;
  inputs: string[];
  readyCriteria: string[];
  nextStepLabel: string;
  nextPath: MissionRoutePath;
  ctaLabel: string;
};

const MissionStepHandoff: React.FC<MissionStepHandoffProps> = ({
  stepLabel,
  why,
  inputs,
  readyCriteria,
  nextStepLabel,
  nextPath,
  ctaLabel,
}) => {
  const navigate = useNavigate();
  const context = readMissionFlowContext();

  const continuity = [
    `Operation: ${context?.operationId ?? 'none'}`,
    `Case: ${context?.caseId ?? 'none'}`,
    `Signal: ${context?.signalId ?? 'none'}`,
  ].join(' · ');

  return (
    <section className={styles.card} aria-label={`${stepLabel} operational handoff`}>
      <div className={styles.top}>
        <article className={styles.block}>
          <h3 className={styles.title}>Why this step matters</h3>
          <p className={styles.body}>{why}</p>
        </article>

        <article className={styles.block}>
          <h3 className={styles.title}>Inputs required</h3>
          <ul className={styles.list}>
            {inputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.block}>
          <h3 className={styles.title}>Ready-to-proceed criteria</h3>
          <ul className={styles.list}>
            {readyCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className={styles.bottom}>
        <p className={styles.continuity}>Continuity status: {continuity}</p>
        <p className={styles.next}>Next step: {nextStepLabel}</p>
        <button
          type="button"
          className={styles.cta}
          onClick={() => {
            trackEvent({
              category: 'ia',
              action: 'tab_view',
              route: nextPath,
              data: {
                source: 'step-handoff',
                fromStep: stepLabel,
                toStep: nextStepLabel,
              },
              source: 'ui',
            });
            navigate(nextPath);
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
};

export default MissionStepHandoff;
