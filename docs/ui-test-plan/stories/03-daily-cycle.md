# Story 3: The Daily Cycle

> *An operative opens the app at 6 AM. They know the rhythm: check the brief, start today's kit, complete a drill with intention, see their XP rise, note they're on a 7-day streak. The app rewards consistency — and the operative's morning just works.*

## The Promise

A returning operative's daily routine works end-to-end. The brief is personalized, the drill is real, the reflection is meaningful, and the progression is visible.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Brief surface | Archetype-weighted kit, drill count, module names | Oriented — today's mission is clear |
| TodayLauncher CTA | "🔮 Psi Operative Training" | Recognized — the app knows who they are |
| Drill steps | Real card content with descriptions, bullet points | Engaged — actual learning, not placeholder text |
| Step completion | Checkboxes, timer running | Progressing — visible movement through the drill |
| Reflection | Notes field, 1-5 self-assessment | Thoughtful — forced slowdown before moving on |
| XP feedback | "+85 XP · Level 5 (72%)" | Rewarded — effort quantified |
| Rest interval | "Hydrate and reset focus" with countdown | Cared for — the app paces them |
| Weekly summary | Domain gains in green, losses in orange | Accountable — they can see the trend |

## Preconditions

- **Persona:** `returning-operative` (Psi Operative, Level 5, 7-day streak, 47 drills completed)
- **Starting URL:** `/mission/brief`

## Test Checkpoints

### 3.1 — Brief surface shows personalized training kit

```
Navigate to /mission/brief
EXPECT visible: TodayLauncher (data-testid="today-launcher")
EXPECT button text contains: "Psi Operative Training" (data-testid="today-launch-btn")
EXPECT visible: drill count (e.g., "N of N drills remaining")
EXPECT visible: archetype kit label "Psi Operative kit" (data-testid="archetype-kit-label")
```

### 3.2 — Kit modules reflect archetype weighting

```
EXPECT visible: module names in kit summary
EXPECT: at least one of "Psiops", "Counter Psyops", "Self Sovereignty", "Martial Arts" (core modules)
```

**Why this matters:** The missionKitGenerator weights core modules 3x. If the kit shows random modules instead of archetype-aligned ones, the identity system is cosmetic only.

### 3.3 — Starting training navigates to DrillRunner

```
CLICK: TodayLauncher button (data-testid="today-launch-btn")
EXPECT URL: /mission/checklist
EXPECT visible: "Drill in progress" label
EXPECT visible: drill title
EXPECT visible: timer display (data-testid="timer-display")
EXPECT visible: at least one step with a checkbox
```

### 3.4 — Drill steps have real content (not placeholder)

```
EXPECT: first step has a label that is NOT "Step one" or "Step two" (generic fallback)
EXPAND first step (if expandable toggle present)
IF expanded:
  EXPECT visible: card description text (more than 10 characters)
```

**Why this matters:** The DrillRunner falls back to generic steps ("Step one", "Step two") when card data isn't loaded. A daily user should always see real card-backed content.

### 3.5 — Completing all steps triggers reflection

```
CHECK all step checkboxes
EXPECT visible: reflection form (data-testid="drill-reflection")
EXPECT visible: "Reflect before recording" or similar prompt
EXPECT visible: notes textarea
EXPECT visible: 1-5 rating buttons
```

### 3.6 — Recording drill shows XP feedback

```
CLICK: rating button "4"
CLICK: "Record drill"
EXPECT visible: XP text (data-testid="drill-completion-xp")
EXPECT text matches pattern: /Drill complete.*\+\d+ XP.*Level \d+/
```

### 3.7 — Rest interval appears after recording

```
EXPECT visible: rest interval (data-testid="rest-interval")
EXPECT visible: "Hydrate and reset focus" or similar hint
EXPECT visible: countdown timer
```

### 3.8 — Review quiz button visible when SR cards are due

```
Navigate to /mission/brief
IF review-quiz-btn visible (data-testid="review-quiz-btn"):
  EXPECT text matches: /Review \d+ Due Cards?/
```

**Why this matters:** The SR system generates due-card counts. If the review button never appears for a returning operative who has studied before, the retention promise is broken (tested more deeply in Story 5).

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| TodayLauncher shows generic CTA despite profile | Identity feels meaningless |
| Kit modules don't reflect archetype | Archetype selection is cosmetic |
| DrillRunner shows placeholder steps | Training content pipeline broken |
| Reflection form never appears | Operatives can't record learning notes |
| XP feedback missing or wrong | Progression feels invisible |
| Rest interval missing | Operatives burn out without pacing |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| TodayLauncher | `data-testid="today-launcher"` |
| Launch button | `data-testid="today-launch-btn"` |
| Timer display | `data-testid="timer-display"` |
| Drill reflection | `data-testid="drill-reflection"` |
| XP feedback | `data-testid="drill-completion-xp"` |
| Rest interval | `data-testid="rest-interval"` |
| Review quiz button | `data-testid="review-quiz-btn"` |
| Weekly summary | `data-testid="weekly-summary"` |

## Spec File

`e2e/flows/03-daily-cycle.spec.ts`

## Estimated Duration

~20–25 seconds (brief + drill execution + reflection + rest)
