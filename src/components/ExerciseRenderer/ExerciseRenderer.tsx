import React, { useState } from 'react';
import styles from './ExerciseRenderer.module.css';
import type { Exercise } from '../../types/Card';

export interface ExerciseRendererProps {
  exercises: Exercise[];
  /** Callback when the user interacts with any exercise. */
  onInteraction?: (exerciseIndex: number, action: 'attempted' | 'skipped') => void;
  /** Fires when all exercises in this renderer have been attempted/completed. */
  onAllCompleted?: () => void;
}

// ---------------------------------------------------------------------------
// Per-type renderers
// ---------------------------------------------------------------------------

const RecallExercise: React.FC<{ ex: Exercise; onReveal: () => void }> = ({ ex, onReveal }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={styles.exercise} data-type="recall">
      <p className={styles.prompt}>{ex.prompt}</p>
      {!revealed ? (
        <button
          className={styles.revealBtn}
          onClick={() => { setRevealed(true); onReveal(); }}
          type="button"
        >
          Reveal Answer
        </button>
      ) : (
        ex.expectedOutcome && (
          <div className={styles.outcome}>
            <strong>Answer:</strong> {ex.expectedOutcome}
          </div>
        )
      )}
    </div>
  );
};

const ApplyExercise: React.FC<{ ex: Exercise; onReveal: () => void }> = ({ ex, onReveal }) => {
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const hints = ex.hints ?? [];

  return (
    <div className={styles.exercise} data-type="apply">
      <p className={styles.prompt}>{ex.prompt}</p>
      {hints.length > 0 && hintsShown < hints.length && (
        <button
          className={styles.hintBtn}
          onClick={() => setHintsShown((n) => n + 1)}
          type="button"
        >
          Show Hint ({hintsShown}/{hints.length})
        </button>
      )}
      {hintsShown > 0 && (
        <ul className={styles.hintList}>
          {hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className={styles.hint}>{h}</li>
          ))}
        </ul>
      )}
      {!revealed && ex.expectedOutcome && (
        <button
          className={styles.revealBtn}
          onClick={() => { setRevealed(true); onReveal(); }}
          type="button"
        >
          Show Expected Outcome
        </button>
      )}
      {revealed && ex.expectedOutcome && (
        <div className={styles.outcome}>
          <strong>Expected:</strong> {ex.expectedOutcome}
        </div>
      )}
    </div>
  );
};

const AnalyzeExercise: React.FC<{ ex: Exercise; onReveal: () => void }> = ({ ex, onReveal }) => {
  const [reflected, setReflected] = useState(false);
  return (
    <div className={styles.exercise} data-type="analyze">
      <p className={styles.prompt}>{ex.prompt}</p>
      {!reflected ? (
        <button
          className={styles.revealBtn}
          onClick={() => { setReflected(true); onReveal(); }}
          type="button"
        >
          I've reflected on this
        </button>
      ) : (
        <>
          {ex.expectedOutcome && (
            <div className={styles.outcome}>
              <strong>Key insight:</strong> {ex.expectedOutcome}
            </div>
          )}
          {ex.hints && ex.hints.length > 0 && (
            <div className={styles.guidedReflection}>
              <strong>Consider:</strong>
              <ul>
                {ex.hints.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SelfCheckExercise: React.FC<{ ex: Exercise; onComplete: () => void }> = ({ ex, onComplete }) => {
  const items = ex.hints ?? [];
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      if (next.size === items.length) onComplete();
      return next;
    });
  };

  return (
    <div className={styles.exercise} data-type="self-check">
      <p className={styles.prompt}>{ex.prompt}</p>
      {items.length > 0 && (
        <ul className={styles.checkList}>
          {items.map((item, i) => (
            <li key={i}>
              <label className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={() => toggle(i)}
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {ex.expectedOutcome && checked.size === items.length && (
        <div className={styles.outcome}>
          <strong>Summary:</strong> {ex.expectedOutcome}
        </div>
      )}
    </div>
  );
};

const ScenarioExercise: React.FC<{ ex: Exercise; onComplete: () => void }> = ({ ex, onComplete }) => {
  const choices = ex.choices ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onComplete();
  };

  return (
    <div className={styles.exercise} data-type="scenario">
      <p className={styles.prompt}>{ex.prompt}</p>
      {choices.length > 0 && (
        <ul className={styles.checkList}>
          {choices.map((choice, i) => (
            <li key={i}>
              <label className={styles.checkItem}>
                <input
                  type="radio"
                  name="scenario-choice"
                  checked={selected === i}
                  onChange={() => { if (!submitted) setSelected(i); }}
                  disabled={submitted}
                />
                <span
                  style={submitted ? {
                    fontWeight: i === ex.correctChoiceIndex ? 'bold' : undefined,
                    color: i === ex.correctChoiceIndex
                      ? 'var(--color-success, green)'
                      : selected === i ? 'var(--color-error, red)' : undefined,
                  } : undefined}
                >
                  {choice}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {!submitted && selected !== null && (
        <button className={styles.revealBtn} type="button" onClick={handleSubmit}>
          Submit Answer
        </button>
      )}
      {submitted && (
        <div className={styles.outcome}>
          <strong>{selected === ex.correctChoiceIndex ? '✓ Correct!' : '✗ Incorrect.'}</strong>
          {ex.expectedOutcome && <p>{ex.expectedOutcome}</p>}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

const EXERCISE_LABELS: Record<Exercise['type'], string> = {
  recall: '🧠 Recall',
  apply: '🔧 Apply',
  analyze: '🔍 Analyze',
  'self-check': '✅ Self-Check',
  scenario: '🎯 Scenario',
};

const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercises, onInteraction, onAllCompleted }) => {
  if (!exercises || exercises.length === 0) return null;

  const [_completedSet, setCompletedSet] = useState<Set<number>>(new Set());

  const handleInteraction = (index: number) => {
    onInteraction?.(index, 'attempted');
    setCompletedSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === exercises.length) {
        onAllCompleted?.();
      }
      return next;
    });
  };

  return (
    <div className={styles.container} data-testid="exercise-renderer">
      <h4 className={styles.heading}>Exercises</h4>
      {exercises.map((ex, i) => (
        <div key={i} className={styles.exerciseWrapper}>
          <span className={styles.typeLabel}>{EXERCISE_LABELS[ex.type] ?? ex.type}</span>
          {ex.type === 'recall' && <RecallExercise ex={ex} onReveal={() => handleInteraction(i)} />}
          {ex.type === 'apply' && <ApplyExercise ex={ex} onReveal={() => handleInteraction(i)} />}
          {ex.type === 'analyze' && <AnalyzeExercise ex={ex} onReveal={() => handleInteraction(i)} />}
          {ex.type === 'self-check' && <SelfCheckExercise ex={ex} onComplete={() => handleInteraction(i)} />}
          {ex.type === 'scenario' && <ScenarioExercise ex={ex} onComplete={() => handleInteraction(i)} />}
        </div>
      ))}
    </div>
  );
};

export default ExerciseRenderer;
