import React from 'react';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import ReadinessPanel from '../../components/Readiness/ReadinessPanel';
import MissionKitPanel from '../../components/MissionKit/MissionKitPanel';
import TimelineBand from '../../components/TimelineBand/TimelineBand';

const BriefSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('brief');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-brief" className={styles.surface} aria-label="Mission Brief">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-brief" className={styles.surface} aria-label="Mission Brief">
      <h2 className={styles.title}>Mission Brief</h2>
      <p className={styles.body}>Review operation status, readiness posture, and active timeline before triage decisions.</p>
      <ReadinessPanel />
      <MissionKitPanel />
      <TimelineBand />
    </section>
  );
};

export default BriefSurface;