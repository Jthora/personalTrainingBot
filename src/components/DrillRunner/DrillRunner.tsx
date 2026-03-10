import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './DrillRunner.module.css';
import { DrillRunStore, DrillRunState } from '../../store/DrillRunStore';
import { MissionKitStore } from '../../store/MissionKitStore';
import useMissionSchedule from '../../hooks/useMissionSchedule';
import { useTimer } from '../../hooks/useTimer';
import TimerDisplay from '../TimerDisplay/TimerDisplay';
import RestInterval from '../RestInterval/RestInterval';
import DrillHistoryStore from '../../store/DrillHistoryStore';
import { isFeatureEnabled } from '../../config/featureFlags';
import { formatTime } from '../TimerDisplay/TimerDisplay';

const defaultSteps = (drillId: string, drillTitle: string) => {
  return [
    { id: `${drillId}-prep`, label: `Prep: review scenario for ${drillTitle}` },
    { id: `${drillId}-execute`, label: 'Execute: run drill steps and capture notes' },
    { id: `${drillId}-debrief`, label: 'Debrief: log findings and mark issues' },
  ];
};

const DrillRunner: React.FC = () => {
  const [state, setState] = useState<DrillRunState | null>(() => DrillRunStore.get());
  const [completionRecorded, setCompletionRecorded] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const { completeCurrentDrill } = useMissionSchedule();
  const enhanced = isFeatureEnabled('drillRunnerUpgrade');

  const timer = useTimer({
    durationSec: 0, // stopwatch mode
    autoStart: false,
  });

  useEffect(() => {
    const unsubscribe = DrillRunStore.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Start timer when a new drill starts; reset completion flag
  useEffect(() => {
    if (state && !state.completed) {
      setCompletionRecorded(false);
      setShowRest(false);
      if (enhanced && timer.state === 'idle') {
        timer.start();
      }
    }
  }, [state?.drillId, state?.completed]); // eslint-disable-line react-hooks/exhaustive-deps

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
    DrillRunStore.start(drill.id, drill.title, drill.steps?.length ? drill.steps : defaultSteps(drill.id, drill.title));
  };

  const handleComplete = useCallback(() => {
    if (!state || completionRecorded) return;
    // Record to drill history
    if (enhanced) {
      DrillHistoryStore.record({
        drillId: state.drillId,
        title: state.title,
        elapsedSec: timer.elapsed,
        stepCount: state.steps.length,
        completedAt: new Date().toISOString(),
      });
    }
    // Record drill stats (success = all steps checked)
    MissionKitStore.recordDrillCompletion(state.drillId, true);
    // Fire the XP/progression loop
    completeCurrentDrill();
    setCompletionRecorded(true);
    // Show rest interval if enhanced
    if (enhanced) {
      setShowRest(true);
    }
  }, [state, completionRecorded, completeCurrentDrill, enhanced, timer.elapsed]);

  // Auto-fire completion when all steps are checked
  useEffect(() => {
    if (state?.completed && !completionRecorded) {
      handleComplete();
    }
  }, [state?.completed, completionRecorded, handleComplete]);

  // History stats for the active drill
  const historyStats = useMemo(() => {
    if (!enhanced || !state) return null;
    return DrillHistoryStore.statsForDrill(state.drillId);
  }, [enhanced, state?.drillId, completionRecorded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) {
    return (
      <div className={styles.empty}>
        <p className={styles.title}>No active drill</p>
        <p className={styles.body}>Start a drill from the mission kit to stage offline steps and preserve continuity.</p>
        <button className={styles.button} onClick={startFromKit}>Start drill</button>
      </div>
    );
  }

  // Rest interval between drills
  if (showRest && enhanced) {
    return (
      <div className={styles.runner}>
        <RestInterval
          durationSec={60}
          onComplete={() => {
            setShowRest(false);
            timer.reset();
            DrillRunStore.clear();
          }}
          hint="Hydrate and reset focus before the next drill."
        />
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

      {/* Stopwatch timer */}
      {enhanced && !state.completed && (
        <TimerDisplay
          seconds={timer.elapsed}
          state={timer.state}
          label="Elapsed"
          onPause={timer.pause}
          onResume={timer.resume}
          onReset={timer.reset}
        />
      )}

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

      {state.completed && completionRecorded ? (
        <div className={styles.success}>
          Drill complete · XP awarded · record queued
          {enhanced && <span className={styles.elapsed}> · {formatTime(timer.elapsed)}</span>}
        </div>
      ) : state.completed ? (
        <div className={styles.success}>Drill complete · recording…</div>
      ) : null}

      {/* History stats */}
      {enhanced && historyStats && historyStats.runs > 0 && (
        <div className={styles.history} data-testid="drill-history-stats">
          <span className={styles.label}>History</span>
          <span className={styles.historyDetail}>
            {historyStats.runs} run{historyStats.runs !== 1 ? 's' : ''} · avg {formatTime(historyStats.avgElapsedSec)} · best {formatTime(historyStats.bestElapsedSec)}
          </span>
        </div>
      )}
    </div>
  );
};

export default DrillRunner;
