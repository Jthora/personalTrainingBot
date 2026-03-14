# Drill Enforcement — Implementation Plan

## Component Map

```
DrillRunner.tsx (468 lines)
├── StepItem (inline, ~50 lines)     ← expansion default, checkbox gating
├── DrillRunStore                     ← toggleStep() predicate
├── ExerciseRenderer.tsx (191 lines)  ← completion signals
│   ├── RecallExercise               ← reveal → "attempted" signal
│   ├── ApplyExercise                ← reveal → "attempted" signal
│   ├── AnalyzeExercise              ← reflect → "attempted" signal
│   └── SelfCheckExercise            ← all checked → "completed" signal (already exists)
└── CardProgressStore                ← per-card quality from interaction data
```

---

## Change 1: Default Expansion + Opened Tracking

**File:** `src/components/DrillRunner/DrillRunner.tsx` — `StepItem`

**Current (L59):**
```tsx
const [expanded, setExpanded] = useState(false);
```

**Target:**
```tsx
const [expanded, setExpanded] = useState(true);
const [hasBeenOpened, setHasBeenOpened] = useState(true);
```

When a user manually collapses and re-expands, `hasBeenOpened` remains true.
The collapse toggle updates both:

```tsx
onClick={(e) => {
  e.preventDefault();
  setExpanded((v) => {
    if (!v) setHasBeenOpened(true);
    return !v;
  });
}}
```

---

## Change 2: Gate Checkbox Behind Expansion

**File:** `src/components/DrillRunner/DrillRunner.tsx` — `StepItem`

**Current (L64-65):**
```tsx
<input type="checkbox" checked={step.done} onChange={onToggle} />
```

**Target:**
```tsx
<input
  type="checkbox"
  checked={step.done}
  onChange={onToggle}
  disabled={hasContent && !hasBeenOpened}
  title={hasContent && !hasBeenOpened ? 'Review card content before checking off' : undefined}
/>
```

For steps without card content (fallback procedural steps), the checkbox remains
ungated since there's nothing to expand.

**Alternative — Store-level guard:**
Add a predicate to `DrillRunStore.toggleStep()` that checks an `openedSteps: Set<string>`
maintained by the component. This is more robust (prevents programmatic toggling) but
couples the store to UI state. Prefer the component-level disable for now.

---

## Change 3: Required Self-Assessment

**File:** `src/components/DrillRunner/DrillRunner.tsx` — reflection form

**Current (L383):**
```tsx
<span className={styles.reflectionLabel}>Self-assessment (optional)</span>
```

**Target:**
```tsx
<span className={styles.reflectionLabel}>Self-assessment <em>(required)</em></span>
```

**Current (L404-409):**
```tsx
<button className={styles.button} onClick={finalizeCompletion}>
  Record drill
</button>
<button className={styles.secondary} onClick={finalizeCompletion}>
  Skip &amp; record
</button>
```

**Target:**
```tsx
<button
  className={styles.button}
  onClick={finalizeCompletion}
  disabled={selfAssessment === null}
  title={selfAssessment === null ? 'Select a self-assessment rating first' : undefined}
>
  Record drill
</button>
```

Remove the "Skip & record" button entirely.

---

## Change 4: Minimum Engagement Threshold

**File:** `src/components/DrillRunner/DrillRunner.tsx`

Add a check before firing `handleComplete()`. If all steps were checked in less than
`stepCount × 15 seconds`, show a confirmation prompt instead of immediately entering
the reflection form.

**New state:**
```tsx
const [showEngagementWarning, setShowEngagementWarning] = useState(false);
```

**Modified auto-complete effect (L255-258):**
```tsx
useEffect(() => {
  if (state?.completed && !completionRecorded) {
    const minSeconds = state.steps.length * 15;
    if (timer.elapsed < minSeconds) {
      setShowEngagementWarning(true);
    } else {
      handleComplete();
    }
  }
}, [state?.completed, completionRecorded, handleComplete]);
```

**New UI block (insert before reflection form):**
```tsx
{showEngagementWarning && !awaitingReflection && (
  <div className={styles.engagementWarning} data-testid="engagement-warning">
    <p>You completed all steps in {formatTime(timer.elapsed)}.
       Did you review the card content?</p>
    <button onClick={() => { setShowEngagementWarning(false); handleComplete(); }}>
      Yes, continue to reflection
    </button>
    <button onClick={() => {
      // Uncheck all steps and reset
      state.steps.forEach(s => { if (s.done) DrillRunStore.toggleStep(s.id); });
      setShowEngagementWarning(false);
    }}>
      Go back and review
    </button>
  </div>
)}
```

---

## Change 5: ExerciseRenderer Completion Signals

**File:** `src/components/ExerciseRenderer/ExerciseRenderer.tsx`

The `onInteraction` callback already exists but only fires on reveal/complete. Extend it
to track per-exercise completion:

**Current interface:**
```tsx
export interface ExerciseRendererProps {
  exercises: Exercise[];
  onInteraction?: (exerciseIndex: number, action: 'attempted' | 'skipped') => void;
}
```

**Target interface:**
```tsx
export interface ExerciseRendererProps {
  exercises: Exercise[];
  onInteraction?: (exerciseIndex: number, action: 'attempted' | 'skipped') => void;
  /** Fires when all exercises in this renderer have been attempted/completed. */
  onAllCompleted?: () => void;
}
```

Track completion count internally:
```tsx
const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());

const handleInteraction = (index: number) => {
  onInteraction?.(index, 'attempted');
  setCompletedSet(prev => {
    const next = new Set(prev);
    next.add(index);
    if (next.size === exercises.length) {
      onAllCompleted?.();
    }
    return next;
  });
};
```

---

## Change 6: Per-Card SR Quality

**File:** `src/components/DrillRunner/DrillRunner.tsx` — `finalizeCompletion()`

**Current (L227-237):** All cards receive `selfAssessment ?? 3`:
```tsx
CardProgressStore.recordReview(
  step.cardId,
  meta?.moduleId ?? domainId ?? 'unknown',
  selfAssessment ?? 3,
);
```

**Target:** Use per-card interaction data to adjust quality:
```tsx
const cardQuality = computeCardQuality(step.id, selfAssessment);
CardProgressStore.recordReview(
  step.cardId,
  meta?.moduleId ?? domainId ?? 'unknown',
  cardQuality,
);
```

Where `computeCardQuality` uses:
- Was the card content expanded? (+0 or -1)
- Were exercises attempted? (+1 per exercise)
- Time spent on this step (via step-level timestamps)
- Base from self-assessment

This requires StepItem to report interaction data upward. Options:
1. **Lift state to DrillRunner** — maintain a `Map<string, StepInteraction>` in the parent
2. **Use a ref-based registry** — steps register their interaction data via callback

Option 1 is cleaner. Add:
```tsx
const [stepInteractions, setStepInteractions] = useState<Map<string, {
  expanded: boolean;
  exercisesAttempted: number;
  exercisesTotal: number;
  timeSpentMs: number;
}>>(new Map());
```

Pass an `onInteractionUpdate` callback to each `StepItem`.

---

## Change 7: Quiz Explanation Field

**File:** `src/types/Quiz.ts`

Add to `QuizQuestion`:
```tsx
/** Explanation shown after answering — why the correct answer is correct. */
explanation?: string;
```

**File:** `src/utils/quizGenerator.ts`

Auto-derive explanation from card data in each generator function:
```tsx
// In generateMCFromExercise:
explanation: card.summaryText
  ?? `${card.description} Key points: ${card.bulletpoints.join('; ')}.`

// In generateTrueFalse:
explanation: `From "${card.title}": ${bp}`

// In generateFillBlank:
explanation: card.summaryText
  ?? `The complete statement is: "${obj}"`

// In generateTermMatch:
explanation: `Terms are matched to their descriptions from the training material.`
```

**File:** `src/components/QuizRunner/QuizRunner.tsx`

In the feedback phase, add explanation rendering:
```tsx
{phase === 'feedback' && (
  <div className={styles.feedback}>
    <p className={...}>
      {answers[answers.length - 1]?.correct ? '✓ Correct!' : '✗ Incorrect'}
    </p>
    {!answers[answers.length - 1]?.correct && question.explanation && (
      <p className={styles.explanation}>{question.explanation}</p>
    )}
    <button onClick={handleNext}>
      {isLastQuestion ? 'See Results' : 'Next Question'}
    </button>
  </div>
)}
```

In the results review, add per-question explanations:
```tsx
{!ans?.correct && q.explanation && (
  <p className={styles.reviewExplanation}>{q.explanation}</p>
)}
```
