import React from 'react';
import styles from './MissionSurfaces.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import ReadinessPanel from '../../components/Readiness/ReadinessPanel';
import MissionKitPanel from '../../components/MissionKit/MissionKitPanel';
import TimelineBand from '../../components/TimelineBand/TimelineBand';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';
import TodayLauncher from '../../components/TodayLauncher/TodayLauncher';
import WeeklySummary from '../../components/WeeklySummary/WeeklySummary';

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
      <TodayLauncher />
      <WeeklySummary />
      <MissionStepHandoff
        stepLabel="Brief"
        why="The brief establishes operational intent, constraints, and mission priority before any triage action starts."
        inputs={[
          'Current operation objective',
          'Readiness posture and timeline status',
          'Mission kit context and constraints',
        ]}
        readyCriteria={[
          'Objective is understood in one sentence',
          'Primary constraints are identified',
          'You are ready to prioritize incoming signals',
        ]}
        nextStepLabel="Triage"
        nextPath="/mission/triage"
        ctaLabel="Proceed to Triage"
      />
      <p className={styles.body}>Review operation status, readiness posture, and active timeline before triage decisions.</p>
      <ReadinessPanel />
      <MissionKitPanel />
      <TimelineBand />
    </section>
  );
};

export default BriefSurface;