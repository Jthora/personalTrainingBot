import React from 'react';
import styles from './MissionSurfaces.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import ArtifactList from '../../components/ArtifactList/ArtifactList';
import TimelineBand from '../../components/TimelineBand/TimelineBand';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';

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
      <MissionStepHandoff
        stepLabel="Case"
        why="Case analysis converts triage decisions into evidence-backed findings before action execution."
        inputs={[
          'Selected case context and linked artifacts',
          'Timeline evidence and dependency chain',
          'Signal hypotheses from triage',
        ]}
        readyCriteria={[
          'Key artifacts are reviewed and tagged',
          'Findings are traceable to evidence',
          'Signal-level action recommendations are drafted',
        ]}
        nextStepLabel="Signal"
        nextPath="/mission/signal"
        ctaLabel="Proceed to Signal Operations"
      />
      <p className={styles.body}>Review evidence, trace artifact dependencies, and promote validated outputs for decision support.</p>
      <ArtifactList />
      <TimelineBand />
    </section>
  );
};

export default CaseSurface;