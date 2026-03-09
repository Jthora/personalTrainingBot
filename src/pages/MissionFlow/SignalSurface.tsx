import React from 'react';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import SignalsPanel from '../../components/Signals/SignalsPanel';
import AlertStream from '../../components/AlertStream/AlertStream';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';

const SignalSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('signal');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-signal" className={styles.surface} aria-label="Signal">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-signal" className={styles.surface} aria-label="Signal">
      <h2 className={styles.title}>Signal</h2>
      <MissionStepHandoff
        stepLabel="Signal"
        why="Signal operations translate case findings into actionable signal handling and coordinated response readiness."
        inputs={[
          'Validated case findings and hypotheses',
          'Active signal queue with severity context',
          'Response constraints for this mission cycle',
        ]}
        readyCriteria={[
          'Signals are acknowledged or resolved with rationale',
          'Outstanding signal risks are documented',
          'Checklist action path is clear and prioritized',
        ]}
        nextStepLabel="Checklist"
        nextPath="/mission/checklist"
        ctaLabel="Proceed to Action Checklist"
      />
      <p className={styles.body}>Create, acknowledge, and resolve operational signals with queued offline continuity.</p>
      <SignalsPanel />
      <AlertStream />
    </section>
  );
};

export default SignalSurface;