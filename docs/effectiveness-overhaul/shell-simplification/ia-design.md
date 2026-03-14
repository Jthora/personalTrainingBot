# Phase 3.1 — Information Architecture Design

> Shell Simplification: 9-tab mission-ops shell → 4-tab clean default + 5-tab Mission Mode

## Current State

- **9 tabs** in MissionShell (Brief, Training, Triage, Case, Signal, Checklist, Debrief, Stats, Plan)
- **653-line** MissionShell.tsx with embedded onboarding, step tools, assistant card
- **No mobile bottom nav** — mobile uses hamburger drawer + dropdown `<select>`
- **All routes** under `/mission/*` namespace

## Target State

- **4 primary tabs** (Train, Review, Progress, Profile)
- **5 mission tabs** appear only when Mission Mode is enabled
- **Mobile bottom nav** with 4 icon tabs
- **Routes** split: `/train/*`, `/review/*`, `/progress`, `/profile/*` + `/mission/*`

---

## Task 180 — Train Tab Surface

The Train tab is the **primary value proposition**: browse → select → drill → quiz.

### Components
| Surface | Component | Source |
|---------|-----------|--------|
| Module Browser | `TrainingSurface` (existing) | Currently at `/mission/training` |
| Deck Selection | `TrainingSurface` (card list) | Same component |
| Drill Runner | `DrillRunner` | Currently modal/inline in TrainingSurface |
| Quiz Runner | `QuizSurface` (existing) | Currently at `/mission/quiz` |
| Today Launcher | `TodayLauncher` | Currently in BriefSurface |

### Behavior
- Default landing tab for new users
- TodayLauncher shows at top when SR cards are due
- Module browser shows all 19 modules with deck counts
- Deck selection shows cards with progress indicators

## Task 181 — Train Tab Routes

```
/train                    → TrainingSurface (module browser)
/train/module/:moduleId   → Deck list for module
/train/deck/:deckId       → Card list for deck
/train/drill              → DrillRunner
/train/quiz               → QuizSurface
```

## Task 182 — Review Tab Surface

The Review tab surfaces **spaced repetition due items** and review-mode quizzes.

### Components
| Surface | Component | Source |
|---------|-----------|--------|
| SR Due Cards | New: `ReviewDashboard` | Reads from CardProgressStore |
| Review Quiz | `QuizSurface` (review mode) | Existing, filtered to due cards |
| Flashcard Mode | Future: `FlashcardRunner` | Placeholder for Phase 3+ |

### Behavior
- Shows count of due cards grouped by module
- "Start Review" → QuizSurface filtered to due cards only
- Badge on tab icon when due cards > 0

## Task 183 — Review Tab Routes

```
/review                   → ReviewDashboard
/review/quiz              → QuizSurface (review mode)
/review/flashcards        → FlashcardRunner (future)
```

## Task 184 — Progress Tab Surface

Single surface showing stats, achievements, challenges.

### Components
| Surface | Component | Source |
|---------|-----------|--------|
| Stats Dashboard | `StatsSurface` (existing) | Currently at `/mission/stats` |
| XP & Badges | `CelebrationLayer` triggers | Existing |
| Module Completion | Progress bars per module | In StatsSurface |

## Task 185 — Profile Tab Surface

Identity, settings, data management, journal.

### Components
| Surface | Component | Source |
|---------|-----------|--------|
| Identity | `SovereigntyPanel` | Currently in DebriefSurface |
| Settings | New: `SettingsPanel` | Extract from DebriefSurface |
| Data Management | Export/Import/Reset | Currently in DebriefSurface |
| Mission Mode Toggle | New toggle | See Task 188 |
| Journal | Existing journal view | Currently in CaseSurface |

## Task 186 — Profile Routes

```
/profile                  → ProfileSurface (identity + settings)
/profile/edit             → Identity editor
/profile/journal          → Journal view
/profile/data             → Data management (export/import/reset)
```

## Task 187 — Surface Disposition Map

| Current Surface | Current Path | New Location | Notes |
|----------------|-------------|--------------|-------|
| BriefSurface | `/mission/brief` | Train tab (TodayLauncher extracted) | Mission Mode only |
| TrainingSurface | `/mission/training` | `/train` | Primary tab |
| QuizSurface | `/mission/quiz` | `/train/quiz` + `/review/quiz` | Dual-purpose |
| TriageSurface | `/mission/triage` | Mission Mode only | |
| CaseSurface | `/mission/case` | Mission Mode only (journal → Profile) | |
| SignalSurface | `/mission/signal` | Mission Mode only | |
| ChecklistSurface | `/mission/checklist` | Mission Mode only | |
| DebriefSurface | `/mission/debrief` | Profile tab (split into components) | |
| StatsSurface | `/mission/stats` | `/progress` | Primary tab |
| PlanSurface | `/mission/plan` | Profile or removed | Low usage |

---

## Task 188 — Mission Mode Toggle

- **Default**: OFF
- **Location**: Profile → Settings → "Enable Mission Mode"
- **Storage**: `ptb:mission-mode:v1` = `'enabled'` | absent
- **Effect**: Shows 5 additional tabs (Brief, Triage, Case, Signal, Debrief) in navigation
- **Routes**: Mission routes always accessible via URL; toggle only controls tab visibility

## Task 189 — Mission Mode Navigation

When Mission Mode is enabled, secondary nav appears:

```
[Brief] [Triage] [Case] [Signal] [Debrief]
```

Positioned below primary tabs or as expandable section on mobile.

## Task 190 — Route Accessibility Policy

**RECOMMENDED: Routes always accessible, toggle controls tab visibility.**

Rationale:
- Deep links to `/mission/*` always work
- Shared URLs don't break for users with Mission Mode off
- Simpler implementation (no route guards needed)
- Mission Mode toggle only affects navigation chrome

---

## Task 191 — Mobile Bottom Nav

4-icon bottom nav bar replacing current hamburger-only mobile navigation:

```
┌─────┬─────┬─────┬─────┐
│ 📚  │ 🔄  │ 📊  │ 👤  │
│Train│Review│Prog │Prof │
└─────┴─────┴─────┴─────┘
```

- Fixed position bottom
- Active tab highlighted
- Badge dot on Review when SR due > 0
- Hamburger drawer retained for overflow (Mission Mode tabs, search)

## Task 192 — Action Palette Updates

Default mode palette actions:
- Start Training → `/train`
- Start Review → `/review`
- View Progress → `/progress`
- Open Settings → `/profile`
- Search Modules → Module search

Mission Mode adds:
- Brief Operative → `/mission/brief`
- Triage Leads → `/mission/triage`
- Case Files → `/mission/case`
- Signal Intel → `/mission/signal`
- Debrief → `/mission/debrief`

## Task 193 — Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘1` / `Ctrl+1` | Train tab |
| `⌘2` / `Ctrl+2` | Review tab |
| `⌘3` / `Ctrl+3` | Progress tab |
| `⌘4` / `Ctrl+4` | Profile tab |
| `⌘5` / `Ctrl+5` | Brief (Mission Mode only) |
| `⌘6` / `Ctrl+6` | Triage (Mission Mode only) |
| `⌘7` / `Ctrl+7` | Case (Mission Mode only) |
| `⌘8` / `Ctrl+8` | Signal (Mission Mode only) |
| `⌘9` / `Ctrl+9` | Debrief (Mission Mode only) |
| `⌘K` | Action Palette (unchanged) |
