# Mobile-First Failure Modes

> *The plan originally treated mobile as a post-hoc checkbox: "Verify on mobile viewport." This document defines what SPECIFICALLY can break at 390×844 (iPhone 14) and adds concrete mobile checkpoints to each story.*

## Global Breakpoint Map

| Breakpoint | Components Affected |
|------------|-------------------|
| **768px** | MissionShell, Header, ArchetypePicker, HandlerPicker, MissionIntakePanel, MissionStepHandoff, PlanSurface |
| **900px** | TriageBoard, ArtifactList |
| **640px** | ShareCard |
| **480px** | CompetencyChart, Header (extra-small) |

At 390px, ALL components below 768px are in their mobile layout.

## Known Risks at 390×844

### 1. MissionShell stepActions button stacking

The 5 action buttons (`Assist Mode`, `Ops Mode`, `Mark Step Complete`, `Continue to X`, `Actions`) use `flex-wrap: wrap`. At 390px, all 5 stack vertically, consuming ~250px+ before the `<Outlet>` content even begins.

**Mobile checkpoint:** After navigating to any mission step, verify the main content area is scrollable and the Outlet content is visible (not pushed below the fold by buttons).

### 2. ArchetypePicker tight 2-column grid

At ≤768px, the grid forces `repeat(2, 1fr)`. At 390px content width (~362px after padding), each column is ~171px. Card descriptions are 3-line clamped, but archetype names and descriptions may feel cramped.

**Mobile checkpoint (Story 01):** All 8 archetype cards are visible via scroll. Card text is not truncated to unreadable length. Confirm and Skip buttons have `min-height: 44px`.

### 3. DrillRunner subminimum touch targets

`.ratingBtn` is 36×36px — below Apple's 44×44px HIG minimum. On a real phone, the self-assessment rating buttons may be hard to tap accurately.

**Mobile checkpoint (Story 03):** The drill reflection/self-assessment buttons are tappable. Verify by clicking each rating option without misfire.

### 4. PlanSurface 7-column day grid

At ≤768px, the 7-column grid (`repeat(7, 1fr)`) with `gap: 0.25rem` means each column is ~50px wide. Day labels at `0.6rem` may be barely readable.

**Mobile checkpoint:** Not directly tested in user stories (PlanSurface doesn't have a dedicated story). Add to Story 06 Stats verification as a spot check.

### 5. No safe-area-inset-bottom

No component uses `env(safe-area-inset-bottom)`. On iPhone 14/15 with the home indicator bar, bottom-fixed elements (like the stepActions row) may be partially obscured.

**Mobile checkpoint:** After reaching any mission step, verify the bottom action buttons are not obscured. In Playwright, this can't be tested natively (no real home bar), but we can verify button clickability at the viewport bottom.

### 6. QuizRunner primary button not full-width

Option buttons (`[data-testid="option-N"]`) are full-width, but the "Next Question" button is centered with `align-self: center`. This creates an inconsistent tap target size.

**Mobile checkpoint (Story 05):** Verify the next button is clickable on all quiz progression steps.

## Per-Story Mobile Addenda

These checkpoints augment the existing stories. They do NOT replace the generic "Verify on mobile viewport" task — they define what that task must actually check.

### Story 01 — First Contact
- [ ] 8 archetype cards visible via scroll in 2-column grid
- [ ] Archetype confirm/skip buttons have adequate tap target (44px+)
- [ ] Handler cards are single-column — verify all 5 are scrollable
- [ ] Welcome overlay buttons are full-width and tappable

### Story 02 — Impatient Recruit
- [ ] "Start Training Now" button is tappable at the bottom of the welcome overlay
- [ ] Fast-path drill content is not pushed below fold by stepActions stacking

### Story 03 — Daily Cycle
- [ ] DrillRunner card content is scrollable (not clipped)
- [ ] Self-assessment rating buttons are tappable despite 36px size
- [ ] Rest interval display is visible without scrolling

### Story 04 — Mission Loop
- [ ] stepActions row stacking doesn't obscure handoff CTA
- [ ] Both "Mark Step Complete" and "Proceed to X" buttons are visible (may require scroll)
- [ ] Signal form inputs are full-width and the keyboard doesn't cover the "Add signal" button

### Story 05 — Knowledge Retention
- [ ] Quiz option buttons are full-width and tappable
- [ ] Fill-blank input has adequate size for mobile keyboard
- [ ] "Next Question" button is reachable after keyboard dismissal

### Story 06 — Proving Yourself
- [ ] XP ticker is visible (not clipped by notch or status bar)
- [ ] Badge toast is readable at mobile width
- [ ] Stats surface charts render without horizontal overflow
- [ ] Activity heatmap cells are distinguishable at mobile width

### Story 07 — Data Sovereignty
- [ ] Export/Import buttons wrap naturally (not clipped)
- [ ] File picker overlay works on mobile (Playwright simulates via `setInputFiles`)

### Story 08 — Offline Operative
- [ ] Offline indicator is visible at bottom-left (not obscured by home bar area)
- [ ] Navigation between routes works via header hamburger menu (not hidden tab bar)
