# Content Pipeline — Schema Changes

## 1. Quiz Explanation Field

### Problem

When a user gets a quiz question wrong, they see "✗ Incorrect" and the correct answer
text — but no explanation of WHY. The `QuizQuestion` type has no `explanation` field.

### Schema Change

**File:** `src/types/Quiz.ts`

Add to `QuizQuestion`:
```typescript
/** Explanation shown after answering — why the correct answer is correct.
 *  Auto-derived from source card data or manually authored. */
explanation?: string;
```

### Generator Changes

**File:** `src/utils/quizGenerator.ts`

Each generator function derives explanation from card data:

| Generator | Explanation Source |
|-----------|-------------------|
| `generateMCFromExercise()` | `card.summaryText ?? card.description + '. Key points: ' + card.bulletpoints.join('; ')` |
| `generateTrueFalse()` | `'From "' + card.title + '": ' + originalBulletpoint` |
| `generateFillBlank()` | `card.summaryText ?? 'The complete statement: "' + fullObjective + '"'` |
| `generateTermMatch()` | `'Terms matched to descriptions from the training material.'` |

**Coverage estimate:** Auto-derivation provides explanations for ~100% of questions.
Quality is bounded by card content quality — a card with 3-word bulletpoints produces
a 3-word explanation. As card content improves (content pipeline), explanations improve
automatically.

### UI Changes

**File:** `src/components/QuizRunner/QuizRunner.tsx`

In the per-question feedback phase:
```tsx
{phase === 'feedback' && !lastAnswer?.correct && question.explanation && (
  <p className={styles.explanation}>{question.explanation}</p>
)}
```

In the results review:
```tsx
{!ans?.correct && q.explanation && (
  <p className={styles.reviewExplanation}>{q.explanation}</p>
)}
```

**New CSS classes:** `styles.explanation`, `styles.reviewExplanation` — styled as
muted, smaller text below the correct answer indicator.

---

## 2. New Exercise Type: `scenario`

### Problem

Current exercise types (recall, apply, analyze, self-check) all follow a
prompt → reveal pattern. None present a realistic situation with decision points.

### Schema Change

**File:** `src/types/Card.ts`

Expand the Exercise type union:
```typescript
type: 'recall' | 'apply' | 'analyze' | 'self-check' | 'scenario';
```

Add optional fields to Exercise:
```typescript
export type Exercise = {
  type: 'recall' | 'apply' | 'analyze' | 'self-check' | 'scenario';
  prompt: string;
  hints?: string[];
  expectedOutcome?: string;
  /** For scenario type: decision choices the user can pick from. */
  choices?: string[];
  /** For scenario type: index of the best choice (if choices provided). */
  correctChoiceIndex?: number;
};
```

### Renderer Changes

**File:** `src/components/ExerciseRenderer/ExerciseRenderer.tsx`

Add `ScenarioExercise` component:
```tsx
const ScenarioExercise: React.FC<{ ex: Exercise; onComplete: () => void }> = ({ ex, onComplete }) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (ex.choices && ex.choices.length > 0) {
    // Choice-based scenario
    return (
      <div className={styles.exercise} data-type="scenario">
        <p className={styles.prompt}>{ex.prompt}</p>
        <div className={styles.choiceList}>
          {ex.choices.map((choice, i) => (
            <button key={i}
              className={`${styles.choiceBtn} ${selectedChoice === i ? styles.choiceSelected : ''}`}
              onClick={() => { setSelectedChoice(i); onComplete(); }}
              disabled={selectedChoice !== null}
            >
              {choice}
            </button>
          ))}
        </div>
        {selectedChoice !== null && ex.expectedOutcome && (
          <div className={styles.outcome}>
            {ex.correctChoiceIndex !== undefined && (
              <p className={selectedChoice === ex.correctChoiceIndex ? styles.correct : styles.incorrect}>
                {selectedChoice === ex.correctChoiceIndex ? '✓ Good call.' : '✗ Not ideal.'}
              </p>
            )}
            <strong>Analysis:</strong> {ex.expectedOutcome}
          </div>
        )}
      </div>
    );
  }

  // Open-ended scenario (no choices)
  return (
    <div className={styles.exercise} data-type="scenario">
      <p className={styles.prompt}>{ex.prompt}</p>
      {!revealed ? (
        <button className={styles.revealBtn} onClick={() => { setRevealed(true); onComplete(); }}>
          Show recommended response
        </button>
      ) : (
        ex.expectedOutcome && (
          <div className={styles.outcome}>
            <strong>Recommended:</strong> {ex.expectedOutcome}
          </div>
        )
      )}
    </div>
  );
};
```

Update the `EXERCISE_LABELS` map:
```typescript
const EXERCISE_LABELS: Record<Exercise['type'], string> = {
  recall: '🧠 Recall',
  apply: '🔧 Apply',
  analyze: '🔍 Analyze',
  'self-check': '✅ Self-Check',
  scenario: '🎯 Scenario',
};
```

### Quiz Generator Impact

The quiz generator currently builds questions from exercises. New scenario exercises
with `choices` + `correctChoiceIndex` can generate MC questions directly:

```typescript
// In quizGenerator.ts — new generator
export function generateMCFromScenario(card: Card): QuizQuestion | null {
  const scenario = card.exercises?.find(
    ex => ex.type === 'scenario' && ex.choices && ex.correctChoiceIndex !== undefined
  );
  if (!scenario?.choices || scenario.correctChoiceIndex === undefined) return null;

  return {
    id: nextId(card.id),
    cardId: card.id,
    type: 'multiple-choice',
    prompt: scenario.prompt,
    options: scenario.choices,
    correctIndex: scenario.correctChoiceIndex,
    correctAnswer: scenario.choices[scenario.correctChoiceIndex],
    explanation: scenario.expectedOutcome,
    hints: scenario.hints ?? [],
    source: card.title,
  };
}
```

---

## 3. keyTerm Curation

### Problem

keyTerms are auto-generated fragments: `"Keep arms"`, `"Move beat"`, `"Implement controlled"`.
These produce bad term-match quiz questions and provide no learning value.

### Schema Change

No schema change needed — `keyTerms: string[]` is already correct. This is a
**content quality** issue, not a schema issue.

### Validation Rule

Add to the content validation script:

```typescript
function validateKeyTerms(card: Card): string[] {
  const issues: string[] = [];
  if (!card.keyTerms || card.keyTerms.length < 3) {
    issues.push('keyTerms: fewer than 3 terms');
  }
  if (card.keyTerms && card.keyTerms.length > 8) {
    issues.push('keyTerms: more than 8 terms');
  }
  for (const term of card.keyTerms ?? []) {
    // Detect 2-word fragments of bulletpoints
    if (card.bulletpoints.some(bp => {
      const words = bp.split(/\s+/);
      return words.length > 2 && bp.includes(term) && term.split(/\s+/).length <= 2;
    })) {
      issues.push(`keyTerms: "${term}" appears to be a fragment of a bulletpoint`);
    }
    // Check for single common words
    if (term.split(/\s+/).length === 1 && term.length < 6) {
      issues.push(`keyTerms: "${term}" is too short/generic for a key term`);
    }
  }
  return issues;
}
```

---

## 4. `summaryText` Population

### Problem

`summaryText` is optional and sparsely populated. It's the best source for quiz
explanations and social sharing (140-280 chars).

### Approach

For cards without `summaryText`, auto-derive from description + first bulletpoint:
```typescript
const deriveSummaryText = (card: Card): string => {
  if (card.summaryText) return card.summaryText;
  const base = card.description;
  const first = card.bulletpoints[0] ?? '';
  const combined = `${base} ${first}`.trim();
  return combined.length > 280 ? combined.slice(0, 277) + '...' : combined;
};
```

This can be done as a build-time transformation in the content pipeline, or as a
runtime fallback in the quiz generator.

---

## Migration Path

These schema changes are **additive** (new optional fields) and require no data migration:

1. Add `explanation?: string` to `QuizQuestion` — existing code ignores it
2. Add `'scenario'` to Exercise type union — existing cards don't use it
3. Add `choices?`, `correctChoiceIndex?` to Exercise — existing exercises don't have them
4. UI changes only render new fields when present

The changes can ship before any content is updated. As content improves, the new
fields get populated and automatically surface in the UI.
