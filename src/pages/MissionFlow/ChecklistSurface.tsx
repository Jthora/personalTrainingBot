import React from 'react';
import DrillRunner from '../../components/DrillRunner/DrillRunner';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';

const ChecklistSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('checklist');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-checklist" className={styles.surface} aria-label="Action Checklist">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-checklist" className={styles.surface} aria-label="Action Checklist">
      <h2 className={styles.title}>Action Checklist</h2>
      <p className={styles.body}>Run or resume the active drill checklist. Completion and telemetry stay local-first and resume offline when synced.</p>
      <DrillRunner />
    </section>
  );
};

export default ChecklistSurface;
