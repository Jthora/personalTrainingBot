import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './DrillRunner.module.css';
import { DrillRunStore, DrillRunState } from '../../store/DrillRunStore';
import { MissionKitStore } from '../../store/MissionKitStore';
import useMissionSchedule from '../../hooks/useMissionSchedule';
import { useTimer } from '../../hooks/useTimer';
import TimerDisplay from '../TimerDisplay/TimerDisplay';
import RestInterval from '../RestInterval/RestInterval';
import DrillHistoryStore from '../../store/DrillHistoryStore';
import { formatTime } from '../TimerDisplay/TimerDisplay';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import type { Card } from '../../types/Card';
import { trackEvent } from '../../utils/telemetry';
import ExerciseRenderer from '../ExerciseRenderer/ExerciseRenderer';
import { buildDrillStepsFromModule } from '../../utils/drillStepBuilder';
import { resolveDomainForDrillCategory } from '../../utils/drillDomainMap';
import UserProgressStore from '../../store/UserProgressStore';
import CardProgressStore from '../../store/CardProgressStore';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import PostDrillArchetypePrompt from './PostDrillArchetypePrompt';

/**
 * Build default steps for a drill. If the drill has an associated moduleId and cards are loaded,
 * generate card-backed steps so the user sees actual training content. Otherwise, fall back to
 * generic procedural steps.
 */
const defaultSteps = (drillId: string, drillTitle: string, moduleId?: string) => {
  if (moduleId) {
    const cardSteps = buildDrillStepsFromModule(moduleId, 10);
    if (cardSteps.length > 0) return cardSteps;
  }
  return [
    { id: `${drillId}-prep`, label: `Prep: review scenario for ${drillTitle}` },
    { id: `${drillId}-execute`, label: 'Execute: run drill steps and capture notes' },
    { id: `${drillId}-debrief`, label: 'Debrief: log findings and mark issues' },
  ];
};

/** Lookup a card by ID from the training module cache. Returns undefined if not loaded or missing. */
const lookupCard = (cardId: string | undefined): Card | undefined => {
  if (!cardId) return undefined;
  try {
    return TrainingModuleCache.getInstance().getCardById(cardId);
  } catch {
    return undefined;
  }
};

/** Expandable step item — shows card content when a cardId is present and the step is expanded. */
const StepItem: React.FC<{
  step: { id: string; label: string; done: boolean; cardId?: string; routePath?: string };
  onToggle: () => void;
}> = ({ step, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const card = useMemo(() => lookupCard(step.cardId), [step.cardId]);
  const hasContent = Boolean(card);

  return (
    <li className={`${styles.step} ${expanded ? styles.stepExpanded : ''}`}>
      <label className={styles.stepLabel}>
        <input type="checkbox" checked={step.done} onChange={onToggle} />
        <span className={styles.stepText}>{step.label}</span>
        {hasContent && (
          <button
            type="button"
            className={styles.expandToggle}
            onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse card content' : 'Expand card content'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        )}
      </label>
      {expanded && card && (
        <div className={styles.cardContent} data-testid={`card-content-${step.id}`}>
          <p className={styles.cardDescription}>{card.description}</p>
          {card.bulletpoints.length > 0 && (
            <ul className={styles.cardBullets}>
              {card.bulletpoints.map((bp, i) => (
                <li key={i}>{bp}</li>
              ))}
            </ul>
          )}
          {card.summaryText && (
            <blockquote className={styles.cardSummary}>{card.summaryText}</blockquote>
          )}
          {card.exercises && card.exercises.length > 0 && (
            <ExerciseRenderer exercises={card.exercises} />
          )}
          {card.learningObjectives && card.learningObjectives.length > 0 && (
            <div className={styles.learningObjectives} data-testid={`objectives-${step.id}`}>
              <span className={styles.sectionLabel}>Learning Objectives</span>
              <ul>
                {card.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}
          {card.keyTerms && card.keyTerms.length > 0 && (
            <div className={styles.keyTerms} data-testid={`keyterms-${step.id}`}>
              <span className={styles.sectionLabel}>Key Terms</span>
              <div className={styles.keyTermsList}>
                {card.keyTerms.map((term, i) => (
                  <span key={i} className={styles.keyTerm}>{term}</span>
                ))}
              </div>
            </div>
          )}
          <div className={styles.cardMeta}>
            <span className={styles.cardDifficulty}>{card.difficulty}</span>
            {card.duration > 0 && <span>{card.duration} min</span>}
          </div>
        </div>
      )}
    </li>
  );
};

const DrillRunner: React.FC = () => {
  const [state, setState] = useState<DrillRunState | null>(() => DrillRunStore.get());
  const [completionRecorded, setCompletionRecorded] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [notes, setNotes] = useState('');
  const [selfAssessment, setSelfAssessment] = useState<number | null>(null);
  const [awaitingReflection, setAwaitingReflection] = useState(false);
  const [lastXpDelta, setLastXpDelta] = useState<{ xp: number; levelBefore: number; levelAfter: number; pctBefore: number; pctAfter: number } | null>(null);
  const [showArchetypePrompt, setShowArchetypePrompt] = useState(false);
  const { completeCurrentDrill } = useMissionSchedule();
  const enhanced = true;

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

  // Reset reflection state when a new drill starts
  useEffect(() => {
    if (state && !state.completed) {
      setCompletionRecorded(false);
      setShowRest(false);
      setShowArchetypePrompt(false);
      setNotes('');
      setSelfAssessment(null);
      setAwaitingReflection(false);
      setLastXpDelta(null);
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
    const steps = drill.steps?.length
      ? drill.steps
      : defaultSteps(drill.id, drill.title, (drill as { moduleId?: string }).moduleId);
    DrillRunStore.start(drill.id, drill.title, steps);
  };

  /**
   * Resolve the domainId (training module ID) from the active drill context.
   * Priority:
   *   1. First step's cardId → look up CardMeta → moduleId (Training Tab card drills)
   *   2. Explicit moduleId on the drill object (from dynamic kit generation)
   *   3. DrillCategoryCache parent category (physical/plan drills)
   *   4. undefined (unknown drill — no domain attribution)
   */
  const resolveDomainId = useCallback((): string | undefined => {
    if (!state) return undefined;
    // Try to derive from step cards
    const cache = TrainingModuleCache.getInstance();
    if (cache.isLoaded()) {
      for (const step of state.steps) {
        if (step.cardId) {
          const meta = cache.getCardMeta(step.cardId);
          if (meta?.moduleId) return meta.moduleId;
        }
      }
    }
    // Try explicit moduleId on the drill (if set by dynamic kit generation)
    if (activeDrill && 'moduleId' in activeDrill) {
      return (activeDrill as { moduleId?: string }).moduleId;
    }
    // Fall back to DrillCategoryCache hierarchy (physical/plan drills)
    return resolveDomainForDrillCategory(state.drillId);
  }, [state, activeDrill]);

  /** Record the drill to history and fire the progression loop. */
  const finalizeCompletion = useCallback(() => {
    if (!state || completionRecorded) return;
    if (enhanced) {
      DrillHistoryStore.record({
        drillId: state.drillId,
        title: state.title,
        elapsedSec: timer.elapsed,
        stepCount: state.steps.length,
        completedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        selfAssessment: selfAssessment ?? undefined,
        domainId: resolveDomainId(),
      });
    }
    // ── Spaced repetition: record per-card review progress ──
    const domainId = resolveDomainId();
    const cache = TrainingModuleCache.getInstance();
    for (const step of state.steps) {
      if (step.cardId) {
        const meta = cache.isLoaded() ? cache.getCardMeta(step.cardId) : undefined;
        CardProgressStore.recordReview(
          step.cardId,
          meta?.moduleId ?? domainId ?? 'unknown',
          selfAssessment ?? 3,
        );
      }
    }
    // Award XP: base 35 + 5 per step (mirrors ProgressEventRecorder.XP_REWARDS.drill)
    const xpAwarded = 35 + state.steps.length * 5;
    const progressBefore = UserProgressStore.get();
    UserProgressStore.recordActivity({
      xp: xpAwarded,
      completedDrills: 1,
      goalDeltaMinutes: Math.max(1, Math.round(timer.elapsed / 60)),
    });
    const progressAfter = UserProgressStore.get();
    setLastXpDelta({ xp: xpAwarded, levelBefore: progressBefore.level, levelAfter: progressAfter.level, pctBefore: Math.round((progressBefore.xp % 500) / 5), pctAfter: Math.round((progressAfter.xp % 500) / 5) });
    MissionKitStore.recordDrillCompletion(state.drillId, true);
    completeCurrentDrill(state.drillId);
    trackEvent({
      category: 'drills',
      action: 'drill_reflection',
      data: {
        drillId: state.drillId,
        selfAssessment: selfAssessment ?? undefined,
        domainId: resolveDomainId(),
        hasNotes: notes.trim().length > 0,
        elapsedSec: timer.elapsed,
        xpAwarded,
      },
      source: 'ui',
    });
    setCompletionRecorded(true);
    setAwaitingReflection(false);

    // 5.4.1.4: Prompt fast-path users to pick an archetype after their first drill
    const isFastPath = typeof window !== 'undefined' && window.localStorage.getItem('mission:fast-path:v1') === 'active';
    const noProfile = !OperativeProfileStore.get();
    if (isFastPath && noProfile && enhanced) {
      setShowArchetypePrompt(true);
    } else if (enhanced) {
      setShowRest(true);
    }
  }, [state, completionRecorded, completeCurrentDrill, enhanced, timer.elapsed, notes, selfAssessment, resolveDomainId]);

  /** When all steps are checked, pause the timer and show the reflection form. */
  const handleComplete = useCallback(() => {
    if (!state || completionRecorded || awaitingReflection) return;
    if (enhanced) {
      timer.pause();
      setAwaitingReflection(true);
    } else {
      // Non-enhanced path: record immediately (legacy behavior)
      finalizeCompletion();
    }
  }, [state, completionRecorded, awaitingReflection, enhanced, timer, finalizeCompletion]);

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

  // 5.4.1.4: Post-drill archetype prompt for fast-path users
  if (showArchetypePrompt) {
    return (
      <div className={styles.runner}>
        <PostDrillArchetypePrompt
          onComplete={() => {
            setShowArchetypePrompt(false);
            if (enhanced) {
              setShowRest(true);
            }
          }}
        />
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
          <StepItem
            key={step.id}
            step={step}
            onToggle={() => DrillRunStore.toggleStep(step.id)}
          />
        ))}
      </ul>

      {/* Reflection form — shown after all steps checked, before recording */}
      {awaitingReflection && !completionRecorded && (
        <div className={styles.reflection} data-testid="drill-reflection">
          <p className={styles.reflectionTitle}>Drill complete — reflect before recording</p>
          <div className={styles.reflectionField}>
            <label className={styles.reflectionLabel} htmlFor="drill-notes">Notes (optional)</label>
            <textarea
              id="drill-notes"
              className={styles.notesInput}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? What was difficult?"
              rows={3}
            />
          </div>
          <div className={styles.reflectionField}>
            <span className={styles.reflectionLabel}>Self-assessment (optional)</span>
            <div className={styles.ratingGroup} role="radiogroup" aria-label="Self-assessment rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.ratingBtn} ${selfAssessment === n ? styles.ratingBtnActive : ''}`}
                  onClick={() => setSelfAssessment(selfAssessment === n ? null : n)}
                  aria-pressed={selfAssessment === n}
                  aria-label={`Rate ${n} out of 5`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.reflectionActions}>
            <button className={styles.button} onClick={finalizeCompletion}>
              Record drill
            </button>
            <button className={styles.secondary} onClick={finalizeCompletion}>
              Skip &amp; record
            </button>
          </div>
          {enhanced && <span className={styles.elapsed}>Elapsed: {formatTime(timer.elapsed)}</span>}
        </div>
      )}

      {state.completed && completionRecorded ? (
        <div className={styles.success} data-testid="drill-completion-xp">
          Drill complete{lastXpDelta ? ` · +${lastXpDelta.xp} XP` : ' · XP awarded'}
          {lastXpDelta && lastXpDelta.levelBefore !== lastXpDelta.levelAfter
            ? ` · Level Up! → Level ${lastXpDelta.levelAfter}`
            : lastXpDelta
              ? ` · Level ${lastXpDelta.levelAfter} (${lastXpDelta.pctAfter}%)`
              : ''}
          {enhanced && <span className={styles.elapsed}> · {formatTime(timer.elapsed)}</span>}
        </div>
      ) : state.completed && !awaitingReflection ? (
        <div className={styles.success}>Drill complete · recording…</div>
      ) : null}

      {/* History stats */}
      {enhanced && historyStats && historyStats.runs > 0 && (
        <div className={styles.history} data-testid="drill-history-stats">
          <span className={styles.label}>History</span>
          <span className={styles.historyDetail}>
            {historyStats.runs} run{historyStats.runs !== 1 ? 's' : ''} · avg {formatTime(historyStats.avgElapsedSec)} · best {formatTime(historyStats.bestElapsedSec)}
            {historyStats.avgAssessment != null && ` · avg rating ${historyStats.avgAssessment}/5`}
          </span>
        </div>
      )}

      {/* Last run notes preview */}
      {enhanced && state && (() => {
        const last = DrillHistoryStore.lastForDrill(state.drillId);
        if (!last?.notes) return null;
        return (
          <div className={styles.lastNotes} data-testid="drill-last-notes">
            <span className={styles.label}>Last notes</span>
            <p className={styles.lastNotesText}>{last.notes}</p>
          </div>
        );
      })()}
    </div>
  );
};

export default DrillRunner;
