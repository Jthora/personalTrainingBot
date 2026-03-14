# Shell Simplification — Information Architecture

## Current Architecture (10 Tabs)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Brief │ Training │ Triage │ Case │ Signal │ Checklist │ Debrief │ Stats │ Plan │
└─────────────────────────────────────────────────────────────────────┘
     ↑       ↑                                    ↑          ↑       ↑
  Ops    Core value                            Core value   Core   Useful
 shell   proposition                           proposition  value
```

**User testing insight (from March 2026 assessment):** The app "reads like a gym app"
despite being an intelligence/multi-domain training platform. The mission shell adds
friction without adding value for new users.

---

## Proposed Architecture (4 Tabs)

### Tab 1: Train

**Route:** `/train`

**Contains:**
- Module browser (from current Training surface)
- Deck selection and card preview
- Drill execution (from current Checklist surface — DrillRunner)
- Quiz launch (currently a sub-route `/mission/quiz`)
- Today's recommended drills (from TodayLauncher)

**Rationale:** This is the core product. A user opens the app, picks what to study,
does a drill, takes a quiz. All in one tab.

**Sub-routes:**
```
/train                    → Module browser + TodayLauncher
/train/module/:moduleId   → Deck list for module
/train/deck/:deckId       → Card preview + drill start + quiz start
/train/drill              → DrillRunner (currently /mission/checklist with DrillRunner)
/train/quiz               → QuizRunner (currently /mission/quiz)
```

### Tab 2: Review

**Route:** `/review`

**Contains:**
- SR due cards summary (count per module, overdue cards)
- Review quiz (launch quiz from due cards — already exists as `sourceType: 'review'`)
- Quick review mode (future: flashcard-style single-card review)

**Rationale:** Separating "new learning" (Train) from "review/retention" (Review)
is a pedagogical best practice. The SR system is one of the strongest features but
is currently buried inside the Training tab with no dedicated entry point.

**Sub-routes:**
```
/review               → Due cards dashboard
/review/quiz          → Review quiz (SR-prioritized)
/review/flashcards    → (future) Single-card review mode
```

### Tab 3: Progress

**Route:** `/progress`

**Contains:**
- Everything from current Stats surface (StatsSurface.tsx)
- CompetencyChart, ScoreLineChart, ActivityHeatmap
- XP/Level/Streak display
- Badge gallery
- Challenge board

**Rationale:** Unchanged from current Stats — just renamed and promoted to a top-level tab.

**Sub-routes:**
```
/progress             → Full stats dashboard
```

### Tab 4: Profile

**Route:** `/profile`

**Contains:**
- Operative identity card
- Archetype/handler selection (ProfileEditor)
- Settings (guidance mode, notification preferences)
- Data management (export, backup — from Debrief's DataSafetyPanel)
- SovereigntyPanel (feature-flagged)
- AAR Composer (from Debrief surface — moved here as "Journal")
- Mission Mode toggle

**Rationale:** Groups all identity/settings/data in one place. The AAR Composer
is reframed as a "Training Journal" — still the same structured reflection tool
but positioned as a self-improvement feature rather than a military debrief.

**Sub-routes:**
```
/profile              → Identity card + settings
/profile/edit         → ProfileEditor
/profile/journal      → AAR Composer (renamed)
/profile/data         → Export, backup, sovereignty
```

---

## Surface Disposition

Where each current surface goes:

| Current Surface | Current Tab | New Location | Notes |
|-----------------|-------------|-------------|-------|
| BriefSurface | Brief (1) | Mission Mode only | Ops narrative, no training value for default |
| TrainingSurface | Training (2) | **Train tab** | Core — module/deck browser |
| TriageSurface | Triage (3) | Mission Mode only | Ops workflow |
| CaseSurface | Case (4) | Mission Mode only | Ops workflow |
| SignalSurface | Signal (5) | Mission Mode only | Ops workflow |
| ChecklistSurface | Checklist (6) | **Train tab** (drill execution) | DrillRunner is the training loop |
| DebriefSurface | Debrief (7) | **Profile tab** (journal, data) | AAR + data management split out |
| StatsSurface | Stats (8) | **Progress tab** | Renamed, same content |
| PlanSurface | Plan (9) | **Train tab** (today's plan) | Integrated into training home |
| QuizRunner | /mission/quiz | **Train tab** + **Review tab** | Accessible from both contexts |

---

## Mission Mode

When enabled (localStorage toggle), the tab bar expands to show the full mission cycle
as a secondary navigation:

```
Default (4 tabs):
┌──────────┬──────────┬──────────┬──────────┐
│  Train   │  Review  │ Progress │ Profile  │
└──────────┴──────────┴──────────┴──────────┘

Mission Mode (4 tabs + mission sub-nav):
┌──────────┬──────────┬──────────┬──────────┐
│  Train   │  Review  │ Progress │ Profile  │
├──────────┴──────────┴──────────┴──────────┤
│ Brief → Triage → Case → Signal → Debrief  │
└───────────────────────────────────────────┘
```

Mission Mode is:
- **Off by default** for new users
- Toggled via Profile → Settings → "Enable Mission Mode"
- Persisted in localStorage
- When active, adds the 6 mission cycle tabs as a secondary nav bar below the primary tabs
- Mission entity context (operationId, caseId, signalId) is preserved exactly as-is

**Design risk:** Dual-mode navigation means every new feature asks "does this live in
default mode, mission mode, or both?" Mitigate by making mission mode a pure addition —
it never hides anything from the default 4-tab view, only adds the ops surfaces.

---

## Mobile Navigation

Current mobile bottom nav shows 5 icons (subset of tabs, with "Actions" for the palette).

**Proposed mobile bottom nav (4 icons):**
```
┌──────────┬──────────┬──────────┬──────────┐
│  📚      │  🔄      │  📊      │  👤      │
│  Train   │  Review  │ Progress │ Profile  │
└──────────┴──────────┴──────────┴──────────┘
```

In Mission Mode, the palette (⌘K / "Actions" button) provides access to mission
surfaces without adding them to the bottom nav. Mobile screen real estate remains
clean.

---

## Action Palette Updates

The `MissionActionPalette` currently lists all 10 tabs + context actions. Update to:

**Default mode:**
- 4 tab actions (Train, Review, Progress, Profile)
- Quick actions: "Start drill", "Take quiz", "Review due cards"
- Context: last module studied, streak status

**Mission mode:**
- 4 tab actions + 6 mission surface actions
- Mission context actions (operation, case, signal)
- Same quick actions as default

---

## Keyboard Shortcuts

| Current | Proposed (Default) | Proposed (Mission) |
|---------|-------------------|-------------------|
| ⌘1-9 for 9 tabs | ⌘1-4 for 4 tabs | ⌘1-4 + ⌘5-0 for mission tabs |
| ⌘K palette | ⌘K palette (unchanged) | ⌘K palette (unchanged) |
