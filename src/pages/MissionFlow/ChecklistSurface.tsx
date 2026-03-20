import React from 'react';
import DrillRunner from '../../components/DrillRunner/DrillRunner';
import styles from './MissionSurfaces.module.css';
import { getMissionSurfaceState } from '../../store/missionFlow/routeState';
import MissionRouteState from '../../components/MissionRouteState/MissionRouteState';
import MissionStepHandoff from '../../components/MissionStepHandoff/MissionStepHandoff';
import useMissionSchedule from '../../hooks/useMissionSchedule';
import { DrillRunStore } from '../../store/DrillRunStore';

const ChecklistSurface: React.FC = () => {
  const routeState = getMissionSurfaceState('checklist');
  const { schedule, completeCurrentDrill } = useMissionSchedule();

  if (routeState.kind !== 'ready') {
    return (
      <section id="section-mission-checklist" className={styles.surface} aria-label="Action Checklist">
        <MissionRouteState state={routeState} />
      </section>
    );
  }

  const remainingItems = schedule?.scheduleItems?.length ?? 0;
  // Disable manual completion button while DrillRunner has an active (incomplete) run
  // to prevent double-completion — DrillRunner fires its own completeCurrentDrill on finish.
  const drillRunActive = (() => {
    const run = DrillRunStore.get();
    return run !== null && !run.completed;
  })();

  return (
    <section id="section-mission-checklist" className={styles.surface} aria-label="Action Checklist">
      <h2 className={styles.title}>Action Checklist</h2>
      <MissionStepHandoff
        stepLabel="Checklist"
        why="Checklist execution converts analysis into disciplined action with traceable completion signals."
        inputs={[
          'Prioritized actions from signal operations',
          'Execution sequence and ownership',
          'Readiness and offline continuity posture',
        ]}
        readyCriteria={[
          'Critical actions are executed or intentionally deferred',
          'Execution outcomes are captured',
          'Debrief has enough evidence for after-action review',
        ]}
        nextStepLabel="Debrief"
        nextPath="/mission/debrief"
        ctaLabel="Proceed to Debrief"
      />
      <p className={styles.body}>Run or resume the active drill checklist. Completion and telemetry stay local-first and resume offline when synced.</p>

      {remainingItems > 0 && (
        <div className={styles.completeBar}>
          <span className={styles.remainingCount}>{remainingItems} item{remainingItems !== 1 ? 's' : ''} remaining</span>
          <button className={styles.completeButton} onClick={() => completeCurrentDrill()} disabled={drillRunActive}>
            {drillRunActive ? 'Drill in progress — auto-completes' : 'Mark current item complete'}
          </button>
        </div>
      )}
      {remainingItems === 0 && (
        <div className={styles.completeBar}>
          <span className={styles.remainingCount}>Schedule complete — proceed to Debrief</span>
        </div>
      )}

      <DrillRunner />
    </section>
  );
};

export default ChecklistSurface;
