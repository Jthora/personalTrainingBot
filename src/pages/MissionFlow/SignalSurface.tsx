import React from 'react';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import SignalsPanel from '../../components/Signals/SignalsPanel';
import AlertStream from '../../components/AlertStream/AlertStream';

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
      <p className={styles.body}>Create, acknowledge, and resolve operational signals with queued offline continuity.</p>
      <SignalsPanel />
      <AlertStream />
    </section>
  );
};

export default SignalSurface;