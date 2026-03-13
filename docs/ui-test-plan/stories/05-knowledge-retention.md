# Story 5: Knowledge Retention

> *Spaced repetition is the invisible engine that turns surface-level exposure into deep retention. The operative never sees the algorithm — they just notice that cards they struggled with keep coming back, and cards they mastered fade into longer intervals. If this loop breaks, training becomes a firehose with no memory.*

## The Promise

Cards the operative studies are tracked. Cards they struggle with return sooner. Cards they master return later. When due cards accumulate, a review quiz appears. The quiz feels different from drilling — it's a test, not a lesson.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| First drill | Completing cards, reflection | Learning — new material |
| Post-drill | XP, card progress recorded silently | Satisfied — session counted |
| Return visit | "Review N Due Cards" button appears | Prompted — the system remembers |
| Review quiz | Multiple-choice, true/false, fill-blank | Tested — this is recall, not reading |
| Quiz results | Score, per-card feedback | Informed — strengths and gaps visible |
| Post-quiz | Due count drops, intervals grow | Confident — the system adapts |

## Preconditions

- **Persona:** `returning-operative` (has archetype + handler, has completed at least one drill)
- **Seed:** CardProgressStore with 5+ entries where `nextReviewAt ≤ now` (cards are due)
- **Starting URL:** `/mission/brief` or wherever TodayLauncher renders

## SM-2 Constants (for assertion reference)

| Constant | Value |
|----------|-------|
| Default ease factor | 2.5 |
| Ease floor | 1.3 |
| Interval cap | 180 days |
| Rep 0 interval | 1 day |
| Rep 1 interval | 3 days |
| Rep 2+ interval | `round(interval × easeFactor)` |

### Self-assessment → Quality mapping

| Self-Assessment (1-5) | Quality | Behavior |
|------------------------|---------|----------|
| 1 | 0 | Lapse — reset interval to 1, reps to 0, lapses+1, ease −0.20 |
| 2 | 1 | Lapse — same as above |
| 3 | 2 | Hard — keep interval (floor 1), ease −0.15, reps+1 |
| 4 | 3 | Good — grow interval, ease −0.05, reps+1 |
| 5 | 5 | Easy — grow interval, ease +0.10, reps+1 |

### Quiz score → Quality mapping

| Quiz Score | Quality |
|------------|---------|
| ≥ 90% | 5 |
| ≥ 70% | 4 |
| ≥ 50% | 3 |
| ≥ 30% | 2 |
| < 30% | 1 |

## Test Checkpoints

### 5.1 — Drill completion records card progress

```
SEED: returning-operative (no card progress yet for target cards)
Navigate to drill with known cardIds
Complete drill (all steps)
READ localStorage: ptb:card-progress:v1
EXPECT: entries for each cardId in the drill
EXPECT each entry: {
  interval: 1,          // first review → 1 day
  easeFactor: 2.5,      // default (selfAssessment defaults to 3 → quality 2 → ease -0.15 = 2.35... but let's verify)
  repetitions: 1,
  lapses: 0,
  nextReviewAt: <~1 day from now>
}
```

**Why this matters:** This is the invisible moment where surface exposure becomes tracked learning. If `recordReview` doesn't fire, the entire SR system is dead.

### 5.2 — Due cards trigger review quiz button

```
SEED: CardProgressStore with 5 entries where nextReviewAt = yesterday
Navigate to /mission/brief (TodayLauncher renders)
EXPECT visible: [data-testid="review-quiz-btn"]
EXPECT text: contains "Review" and a number (the due count)
```

**Why this matters:** The review button is the UI surface of the retention promise. Without it, operatives never know cards are due.

### 5.3 — Review quiz loads correct cards

```
CLICK: [data-testid="review-quiz-btn"]
EXPECT URL: /mission/quiz?mode=review
EXPECT visible: [data-testid="quiz-runner"]
EXPECT: quiz has questions (not empty state)
EXPECT: question count ≤ 10 (maxQuestions default)
EXPECT: each question's cardId matches one of the seeded due cards
```

### 5.4 — Quiz presents multiple question types

```
DURING quiz:
EXPECT at least 2 different question types from:
  - Multiple choice (radio/button options)
  - True/false (two options)
  - Fill-in-the-blank (text input)
  - Term match (matching pairs)
```

**Why this matters:** Variety in question types tests different recall pathways. If the generator only produces one type, retention testing is shallow.

### 5.5 — Answering questions progresses the quiz

```
FOR each question:
  IF multiple-choice or true/false:
    CLICK: [data-testid="option-0"] (or correct answer)
  IF fill-blank:
    FILL: [data-testid="fill-input"] with answer text
    SUBMIT
  EXPECT: feedback shown (correct/incorrect indicator)
  EXPECT visible: [data-testid="running-score"] with updated score
  CLICK: [data-testid="next-btn"] ("Next Question" or "See Results")
```

### 5.6 — Quiz results screen shows score and breakdown

```
AFTER answering all questions:
EXPECT visible: [data-testid="quiz-results"]
EXPECT: score percentage displayed
EXPECT: per-question breakdown (which were correct/incorrect)
EXPECT visible: button to return to training or continue
```

### 5.7 — Quiz completion updates card progress (SR round-trip)

```
READ localStorage: ptb:card-progress:v1 AFTER quiz completion
FOR each answered card:
  EXPECT: entry updated with new interval, easeFactor, repetitions
  IF answered correctly (score ≥ 70% → quality 4):
    EXPECT: interval grew (> previous interval)
    EXPECT: repetitions incremented
  IF answered incorrectly (score < 30% → quality 1):
    EXPECT: interval reset to 1
    EXPECT: lapses incremented
```

**Why this matters:** This is the SR round-trip — drill creates entries, time passes, quiz reviews them, intervals adjust. If the quiz doesn't write back to CardProgressStore, the system forgets what the operative reviewed.

### 5.8 — Due count decreases after review

```
Navigate back to /mission/brief (TodayLauncher)
EXPECT: [data-testid="review-quiz-btn"] either:
  - Shows lower due count than before, OR
  - Is hidden (all due cards reviewed)
```

### 5.9 — Module-scoped quiz works from DeckBrowser

```
Navigate to /mission/training (DeckBrowser lives inside TrainingSurface)
SELECT a module to expand DeckBrowser
EXPECT visible: [data-testid="deck-browser"]
CLICK: [data-testid="quiz-module-btn"] for a module with cards
EXPECT URL: /mission/quiz?module=<moduleId>
EXPECT visible: [data-testid="quiz-runner"]
EXPECT: quiz generates from module cards (not just due cards)
```

### 5.10 — Deck-scoped quiz works from DeckBrowser

```
CLICK: [data-testid="quiz-deck-<deckId>"] for a specific deck
EXPECT URL: /mission/quiz?deck=<deckId>&module=<moduleId>
EXPECT: quiz generates from deck cards only
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| DrillRunner doesn't call `recordReview` | SR system has no data — cards never become "due" |
| `getCardsDueForReview` filter broken | Due cards invisible — review button never appears |
| Quiz loads empty (no questions generated) | Operative clicks review, sees nothing |
| Quiz doesn't write back to CardProgressStore | Reviews don't update intervals — same cards due forever |
| Single question type only | Recall testing is shallow — only one cognitive pathway exercised |
| Due count unchanged after review | Operative feels review was pointless — system didn't register effort |
| Module/deck quiz scope wrong | Wrong cards appear — operative reviews material they didn't intend |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Review quiz button | `[data-testid="review-quiz-btn"]` |
| Quiz runner | `[data-testid="quiz-runner"]` |
| Quiz results | `[data-testid="quiz-results"]` |
| Answer option | `[data-testid="option-0"]` through `option-3` |
| Fill-blank input | `[data-testid="fill-input"]` |
| Hint button | `[data-testid="hint-btn"]` |
| Next button | `[data-testid="next-btn"]` |
| Running score | `[data-testid="running-score"]` |
| Module quiz button | `[data-testid="quiz-module-btn"]` |
| Deck quiz button | `[data-testid="quiz-deck-<id>"]` |
| Deck browser | `[data-testid="deck-browser"]` |

## Spec File

`e2e/flows/05-knowledge-retention.spec.ts`

## Estimated Duration

~45–60 seconds (drill + quiz + localStorage verification)

## Dependencies

- Story 03 (Daily Cycle) should pass first — drill completion is prerequisite for SR data
- Seed utility must support `seedCardProgress()` with configurable `nextReviewAt` dates
