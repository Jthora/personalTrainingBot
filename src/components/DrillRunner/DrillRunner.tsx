import React, { useEffect, useMemo, useState } from 'react';
import styles from './DrillRunner.module.css';
import { DrillRunStore, DrillRunState } from '../../store/DrillRunStore';
import { MissionKitStore } from '../../store/MissionKitStore';

const defaultSteps = (drillId: string, drillTitle: string) => {
  return [
    { id: `${drillId}-prep`, label: `Prep: review scenario for ${drillTitle}` },
    { id: `${drillId}-execute`, label: 'Execute: run drill steps and capture notes' },
    { id: `${drillId}-debrief`, label: 'Debrief: log findings and mark issues' },
  ];
};

const DrillRunner: React.FC = () => {
  const [state, setState] = useState<DrillRunState | null>(() => DrillRunStore.get());

  useEffect(() => {
    const unsubscribe = DrillRunStore.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  const activeDrill = useMemo(() => {
    if (!state) return null;
    const kit = MissionKitStore.getPrimaryKit();
    const found = kit?.drills.find((d) => d.id === state.drillId);
    return found ?? null;
  }, [state]);

  const missingDrill = Boolean(state && !activeDrill);

  const startFromKit = () => {
    const kit = MissionKitStore.getPrimaryKit();
    const drill = kit?.drills[0];
    if (!drill) return;
    DrillRunStore.start(drill.id, drill.title, defaultSteps(drill.id, drill.title));
  };

  if (!state) {
    return (
      <div className={styles.empty}>
        <p className={styles.title}>No active drill</p>
        <p className={styles.body}>Start a starter drill to stage offline steps and preserve continuity.</p>
        <button className={styles.button} onClick={startFromKit}>Start starter drill</button>
      </div>
    );
  }

  return (
    <div className={styles.runner}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>Drill in progress</p>
          <h3 className={styles.title}>{state.title}</h3>
          {activeDrill?.durationMinutes ? <p className={styles.meta}>{activeDrill.durationMinutes} min · {activeDrill.type}</p> : null}
          <p className={styles.meta}>Started {new Date(state.startedAt).toLocaleString()}</p>
        </div>
        <button className={styles.secondary} onClick={() => DrillRunStore.clear()}>Reset</button>
      </header>

      {missingDrill ? (
        <div className={styles.fallback}>
          <p className={styles.fallbackTitle}>Sync required</p>
          <p className={styles.body}>Drill metadata is unavailable. Continue with cached steps and sync online when available.</p>
        </div>
      ) : null}

      <ul className={styles.stepList}>
        {state.steps.map((step) => (
          <li key={step.id} className={styles.step}>
            <label className={styles.stepLabel}>
              <input type="checkbox" checked={step.done} onChange={() => DrillRunStore.toggleStep(step.id)} />
              <span className={styles.stepText}>{step.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {state.completed ? <div className={styles.success}>Drill complete · offline record queued</div> : null}
    </div>
  );
};

export default DrillRunner;
