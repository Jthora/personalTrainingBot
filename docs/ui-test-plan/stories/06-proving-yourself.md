# Story 6: Proving Yourself

> *Progression is the reward loop that keeps operatives coming back. Not gamification slapped on top — but a coherent advancement model where XP represents effort, levels represent commitment, badges represent milestones, and competency dimensions represent actual skill growth. If any of these feel arbitrary or broken, the operative stops trusting the system.*

## The Promise

Every drill completion earns XP. XP accumulates into levels. Consecutive daily training builds streaks. Meaningful thresholds unlock badges with names that matter ("Field Initiate", "Persistent Operative", "Iron Protocol"). The Stats surface shows it all — not as vanity metrics, but as an honest accounting of an operative's growth.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Drill completion | XP ticker animates `+55` | Earned — effort recognized |
| Level threshold | Level-up modal appears | Achievement — visible milestone |
| 3-day streak | Badge toast: "Warm Streak 🔥" | Momentum — consistency rewarded |
| Stats surface | Charts, heatmap, badge gallery | Reflective — seeing growth over time |
| Archetype milestone | Tier label advances | Identity — their chosen path progresses |

## Preconditions

- **Persona:** `grinder` — returning operative with specific seeded state:
  - `xp: 485` (15 XP away from level 2 at 500)
  - `streakCount: 2`, `lastActiveDate: yesterday`
  - `totalDrillsCompleted: 9` (1 away from Field Initiate badge)
  - `badges: []` (no badges yet)
- **Starting URL:** `/mission/brief`

## XP Constants

| Source | Amount |
|--------|--------|
| Drill completion | `35 + (steps × 5)` |
| Event recorder (drill) | 35 |
| Event recorder (block) | 20 |
| Schedule complete bonus | 50 |
| Challenge claim | variable |
| **XP per level** | **500** |

## Badge Catalog

| ID | Name | Rarity | Condition |
|----|------|--------|-----------|
| `streak_3` | Warm Streak | common | streak ≥ 3 |
| `streak_7` | Persistent Operative | rare | streak ≥ 7 |
| `streak_30` | Iron Protocol | epic | streak ≥ 30 |
| `minutes_60` | Deep Cover | common | daily ops ≥ 10 |
| `minutes_300` | Extended Op | rare | weekly ops ≥ 40 |
| `completion_10` | Field Initiate | common | drills ≥ 10 |
| `completion_50` | Signal Analyst | rare | drills ≥ 50 |
| `completion_100` | Ace Operative | epic | drills ≥ 100 |
| `difficulty_advance` | Clearance Escalation | rare | difficulty ≥ 3 |
| `share_card` | Signal Beacon | common | explicit unlock |

## Test Checkpoints

### 6.1 — Drill completion awards XP and shows ticker

```
SEED: grinder persona (xp: 485, streak: 2, drills: 9)
Complete a drill (e.g., 4 steps → 35 + 20 = 55 XP)
EXPECT visible: [data-testid="xp-ticker"] with amount
EXPECT animation: ticker counts up
EXPECT: ticker auto-dismisses (2000ms default)
```

**Why this matters:** The XP ticker is the immediate reinforcement loop. Without it, operatives don't know effort was recorded.

### 6.2 — XP crosses level threshold → level-up modal

```
GIVEN: xp was 485, drill awards 55+ XP → new total ≥ 500
EXPECT visible: [data-testid="level-up-modal"]
EXPECT: modal shows new level (Level 2)
```

**Why this matters:** Level-up is the strongest progression signal. If it doesn't fire at 500 XP, the level system feels broken.

### 6.3 — Streak advances to 3 → badge toast appears

```
GIVEN: streakCount was 2, lastActiveDate was yesterday
Drill completion calls recordActivity() → streak becomes 3
EXPECT visible: [data-testid="badge-toast"]
EXPECT: badge toast shows "Warm Streak" (streak_3)
```

**Why this matters:** The 3-day streak badge is the first progression milestone most operatives hit. It's the proof that consistency is tracked.

### 6.4 — Drill count reaches 10 → "Field Initiate" badge

```
GIVEN: totalDrillsCompleted was 9
Drill completion increments to 10
EXPECT visible: [data-testid="badge-toast"] for "Field Initiate" (completion_10)
NOTE: badge toast may queue — two badges in one session (streak_3 + completion_10)
```

### 6.5 — Badges persist in localStorage

```
READ localStorage: userProgress:v1
EXPECT: badges includes "streak_3" and "completion_10"
EXPECT: badgeUnlocks has entries with unlockedAt timestamps
```

### 6.6 — Stats surface renders progression data

```
Navigate to /mission/stats
EXPECT visible: [data-testid="score-line-chart"]
EXPECT visible: [data-testid="activity-heatmap"]
EXPECT visible: element with aria-label="Badge gallery"
EXPECT: badge gallery includes "Warm Streak" and "Field Initiate"
EXPECT visible: level indicator showing Level 2
EXPECT visible: XP amount (≥ 500)
EXPECT visible: streak count (3)
```

**Why this matters:** The Stats surface is the operative's mirror — where they see their growth. If charts are empty or badges don't show, progression feels hollow.

### 6.7 — Activity heatmap shows today's activity

```
EXPECT: [data-testid="activity-heatmap"] has today's cell highlighted
EXPECT: heatmap is not empty (at least 1 active day)
```

### 6.8 — Weekly summary reflects progress

```
EXPECT visible: [data-testid="weekly-summary"]
EXPECT: summary shows domain score deltas or drill counts
```

### 6.9 — Archetype milestone tier reflects competency

```
IF archetype is set:
  EXPECT visible: milestone tier label (e.g., "Tier I · Cadet" for rescue_ranger)
  EXPECT: tier reflects current competency score
```

**Why this matters:** Archetype milestones tie progression to identity. "Tier II · Field Medic" means more than "Level 2" because it maps to the operative's chosen path.

## Celebration Event Pipeline

The test verifies this full pipeline works end-to-end:

```
DrillRunner.handleComplete()
  → UserProgressStore.recordActivity({ xpGained, drillsCompleted })
    → streak update
    → badge evaluation (applyBadgeUnlocks)
    → emitCelebration()
      → CelebrationLayer renders:
        → XPTicker (xp-gain event)
        → LevelUpModal (level-up event)
        → BadgeToast (badge-unlock event)
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| XP ticker doesn't appear | Effort goes unrecognized — operative doesn't know they earned anything |
| Level-up modal doesn't fire at threshold | Level feels static — no milestone moment |
| Badge evaluation skipped | Streaks and drill counts hit thresholds but no badge unlocks |
| Badge toast doesn't render | Badge earned silently — no celebration |
| Stats surface empty | Growth invisible — operative can't review history |
| Heatmap not updating | Today's effort not reflected in visual |
| Multiple badges in one session lost | Only first badge shown, second swallowed |
| Archetype milestone label stuck at Tier I | Progression ignoring competency growth |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| XP ticker | `[data-testid="xp-ticker"]` |
| Level-up modal | `[data-testid="level-up-modal"]` |
| Badge toast | `[data-testid="badge-toast"]` |
| Score chart | `[data-testid="score-line-chart"]` |
| Activity heatmap | `[data-testid="activity-heatmap"]` |
| Badge gallery | `getByRole('region', { name: /Badge gallery/i })` |
| Challenges | `getByRole('region', { name: /Challenges/i })` |
| Weekly summary | `[data-testid="weekly-summary"]` |
| Sparkline | `[data-testid="sparkline"]` |

## Spec File

`e2e/flows/06-proving-yourself.spec.ts`

## Estimated Duration

~25–35 seconds (drill completion + celebration events + stats navigation)

## Dependencies

- Story 03 (Daily Cycle) establishes drill completion
- Celebration pipeline components (CelebrationLayer, BadgeToast, XPTicker, LevelUpModal) must be mounted in the app shell
