# Shell Simplification

> **Dimension: Onboarding · Current: 7/10 · Target: 9/10**

## Problem Statement

The Training Console wraps a training app in a 10-tab mission operations shell:

```
Brief → Training → Triage → Case → Signal → Checklist → Debrief → Stats → Plan
```

This creates three issues:

### 1. Cognitive Overload
10 tabs is too many for a new user to parse. The mission terminology (Brief, Triage,
Case, Signal, Debrief) means nothing to someone who opened the app to learn cybersecurity.

### 2. Training Buried in Navigation
The actual training value lives in 3 surfaces: **Training** (browse/select modules),
**Checklist** (drill execution), and **Quiz** (outside the tab bar). A user must
figure out that "Checklist" means "do your drill" and that quizzes are launched from
within decks, not from any tab.

### 3. Shell Chrome Overhead
`MissionShell.tsx` (654 lines) renders:
- MissionHeader (step indicators, context)
- stepTools (complete/continue buttons, guidance mode toggle)
- assistantCard (SOP prompts, context hints, archetype-specific guidance)
- Action Palette (⌘K command palette with tab navigation)
- Onboarding gates (guidance overlay, archetype picker, handler picker, intake)

Most of this chrome is navigation scaffolding, not training content.

## What "Fixed" Looks Like

### Proposed: 4 Primary Tabs

| Tab | Contains | Maps From (Current) |
|-----|----------|---------------------|
| **Train** | Module browser, deck selection, drill execution, quiz launch | Training + Checklist + Quiz |
| **Review** | SR due cards, review quizzes, flashcard-style review | (new — currently split across Training and Quiz) |
| **Progress** | Stats dashboard, competency chart, activity heatmap, XP/streak | Stats |
| **Profile** | Operative identity, archetype/handler, settings, data management | (parts of Stats + Debrief) |

### Optional: "Mission Mode" Toggle

For users who want the operative framework, a toggle in Profile restores the full
10-tab mission cycle (Brief → Triage → Case → Signal → Checklist → Debrief + Train/Review/Progress/Profile).

This preserves the narrative system for engaged users while defaulting new users
to a clean training experience.

## Key Finding: No State Machine

The audit confirmed that the mission cycle has **no enforced step ordering**. The
`completedSteps` tracking is a simple localStorage `Record<string, boolean>` toggled
by a "Mark Step Complete" button. There's no state machine preventing a user from
visiting Debrief before Brief. Tabs are a soft array in a `useMemo`.

This means tab reduction is an **information architecture change**, not a state machine
refactor. The continuity store tracks entity-based context (operationId, caseId,
signalId), not step progression.

## Effort Estimate

| Component | Work | Days |
|-----------|------|------|
| Tab restructure + route mapping | Redesign tab array, new routes | 2-3 |
| Mission Mode toggle | Profile setting, conditional tab rendering | 2-3 |
| Route migration | Update nested routes in Routes.tsx | 1 |
| Telemetry updates | ~15-20 route-path references in events | 2-3 |
| Navigate call updates | ~30-40 `navigate()` calls across components | 1-2 |
| Mobile bottom nav | Update mobile tab bar component | 1-2 |
| Keyboard shortcuts | Update ⌘+1-0 tab mappings | 0.5 |
| E2E test updates (7 spec files) | Tab selectors, URL assertions | 3-5 |
| Unit test updates (~8 MissionShell tests) | Route/tab assertions | 1 |
| Existing user migration | localStorage path preferences | 1 |
| **Total** | | **15-22 days** |

## Documents

| Document | Purpose |
|----------|---------|
| [information-architecture.md](information-architecture.md) | Tab mapping, surface organization, Mission Mode design |
| [implementation-plan.md](implementation-plan.md) | Routes, MissionShell, telemetry, navigate() calls |
| [migration-plan.md](migration-plan.md) | localStorage compat, existing user data, backwards compat |
