import React from 'react';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import ArtifactList from '../../components/ArtifactList/ArtifactList';
import TimelineBand from '../../components/TimelineBand/TimelineBand';

const CaseSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('case');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-case" className={styles.surface} aria-label="Case">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-case" className={styles.surface} aria-label="Case">
      <h2 className={styles.title}>Case</h2>
      <p className={styles.body}>Review evidence, trace artifact dependencies, and promote validated outputs for decision support.</p>
      <ArtifactList />
      <TimelineBand />
    </section>
  );
};

export default CaseSurface;