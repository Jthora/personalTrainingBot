import React from 'react';
import AARComposer from '../../components/AAR/AARComposer';
import SettingsSection from '../HomePage/sections/SettingsSection';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';

const DebriefSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('debrief');
  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-debrief" className={styles.surface} aria-label="Debrief">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  return (
    <section id="section-mission-debrief" className={styles.surface} aria-label="Debrief">
      <h2 className={styles.title}>Debrief</h2>
      <p className={styles.body}>Capture after-action outcomes, export local records, and verify ops sync posture before the next mission cycle.</p>
      <AARComposer />
      <SettingsSection />
    </section>
  );
};

export default DebriefSurface;
