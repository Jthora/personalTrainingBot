import React from 'react';
import AARComposer from '../../components/AAR/AARComposer';
import DebriefClosureSummary from '../../components/DebriefClosureSummary/DebriefClosureSummary';
import MissionCycleSummary from '../../components/MissionCycleSummary/MissionCycleSummary';
import ChallengePanel from '../../components/ChallengePanel/ChallengePanel';
import DataSafetyPanel from '../../components/DataSafetyPanel/DataSafetyPanel';
import styles from './MissionFlow.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';

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
      <MissionStepHandoff
        stepLabel="Debrief"
        why="Debrief closes the mission loop by recording lessons learned and readiness implications for the next cycle."
        inputs={[
          'Checklist execution outcomes',
          'Resolved and unresolved signals',
          'Evidence-backed case conclusions',
        ]}
        readyCriteria={[
          'After-action report is complete and saved',
          'Key lessons and gaps are documented',
          'You are ready to launch the next mission brief',
        ]}
        nextStepLabel="Brief"
        nextPath="/mission/brief"
        ctaLabel="Start Next Mission Brief"
      />
      <p className={styles.body}>Capture after-action outcomes, export local records, and verify ops sync posture before the next mission cycle.</p>
      <MissionCycleSummary />
      <DebriefClosureSummary />
      <ChallengePanel />
      <DataSafetyPanel />
      <AARComposer />
    </section>
  );
};

export default DebriefSurface;
