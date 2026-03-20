import React from 'react';
import styles from './MissionSurfaces.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import TriageBoard from '../../components/TriageBoard/TriageBoard';
import AlertStream from '../../components/AlertStream/AlertStream';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';

const TriageSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('triage');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-triage" className={styles.surface} aria-label="Triage">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-triage" className={styles.surface} aria-label="Triage">
      <h2 className={styles.title}>Triage</h2>
      <MissionStepHandoff
        stepLabel="Triage"
        why="Triage determines what matters now, preventing noise from consuming case-analysis capacity."
        inputs={[
          'Incoming alert priority and confidence',
          'Case ownership and active signal mapping',
          'Readiness and operational timebox constraints',
        ]}
        readyCriteria={[
          'Critical signals are prioritized',
          'A primary case focus is selected',
          'Escalations and deferrals are explicitly assigned',
        ]}
        nextStepLabel="Case"
        nextPath="/mission/case"
        ctaLabel="Proceed to Case Analysis"
      />
      <p className={styles.body}>Prioritize incoming mission signals, apply keyboard-first actions, and maintain alert discipline.</p>
      <TriageBoard />
      <AlertStream />
    </section>
  );
};

export default TriageSurface;