import React from 'react';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import TriageBoard from '../../components/TriageBoard/TriageBoard';
import AlertStream from '../../components/AlertStream/AlertStream';

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
      <p className={styles.body}>Prioritize incoming mission signals, apply keyboard-first actions, and maintain alert discipline.</p>
      <TriageBoard />
      <AlertStream />
    </section>
  );
};

export default TriageSurface;