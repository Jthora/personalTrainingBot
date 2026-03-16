# Scenario 01: Fresh Cadet

> Persona: `tabula-rasa` — True first-time visitor. Empty localStorage. No prior state.

## Purpose

Validates that a completely new user can successfully onboard through both available paths and complete their first training drill. This is the most critical scenario — if onboarding is broken, no other scenario matters.

## Preconditions

- Empty localStorage (no keys set)
- Fresh browser context
- Mobile viewport: 390×844 (iPhone 14)

## Steps

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Welcome overlay** | Navigate to `/` | Redirect to route with welcome overlay visible. Two buttons: "Start Training Now" and "Choose Your Focus First". |
| 2 | **Deliberate path entry** | Click "Choose Your Focus First" | Archetype picker renders with 8 archetype cards in a grid. No card selected. Confirm button disabled. |
| 3 | **Select archetype** | Click "CyberCom" card | Card shows selected state (highlighted border/background). Confirm button becomes enabled. Description text visible for CyberCom. |
| 4 | **Confirm → handler picker** | Click confirm button | Handler picker renders with 5 instructor cards. One handler has a "Recommended" badge based on CyberCom archetype selection. |
| 5 | **Select handler + confirm** | Click recommended handler, click confirm | Mission intake panel appears with 3 info blocks: "How it works", "Your first session", "Track your growth". Two buttons: "Start Training" and "Skip". |
| 6 | **Complete intake → brief** | Click "Start Training" | Brief surface renders. TodayLauncher visible with personalized training kit. Identity card shows "CyberCom" division. |
| 7 | **Start first drill** | Click first drill in training kit | DrillRunner renders. Steps list visible with real card content (not placeholder text). Stopwatch timer running. |
| 8 | **Complete drill — toggle all steps** | Click each step checkbox with realistic pacing (>15s between steps) | Each step toggles to completed. Progress indicator updates. |
| 9 | **Reflection flow** | Fill "What went well?", "What was challenging?", "One thing to improve". Select 4/5 rating. | Record button becomes enabled after rating selection. |
| 10 | **Record drill** | Click "Record drill" | XP feedback toast shown (35 + steps × 5 XP). Per-card quality badges visible (weak/ok/strong). |
| 11 | **Rest interval** | Automatic after drill completion | 60-second countdown timer visible. "Skip rest" button visible. Hydration hint text. |
| 12 | **Return to brief** | Click "Skip rest" | Brief surface shows updated stats. "1 drill completed" reflected somewhere. |
| 13 | **Alt: Fast path** | Clear localStorage, reload, click "Start Training Now" | Lands on training surface (`/mission/training` or `/train`). Module browser visible with 19 modules. |
| 14 | **Quick-train a module** | Click "Quick Train" on first module | DrillRunner starts with 10 cards from that module. |
| 15 | **Post-drill archetype prompt** | Complete the quick-train drill | Archetype picker prompt appears (for fast-path users who skipped onboarding). Selecting an archetype persists to profile. |

## Accessibility Audit Points

- After step 2 (archetype picker) — complex interactive grid
- After step 6 (brief surface) — first real app screen
- After step 7 (drill runner) — primary training interface
- After step 13 (fast path landing) — alternate entry point

## Expected Screenshots

14 screenshots (one per step except the a11y audit step):
- `01-welcome-overlay.png`
- `02-archetype-picker.png`
- `03-archetype-selected.png`
- `04-handler-picker.png`
- `05-intake-panel.png`
- `06-brief-with-identity.png`
- `07-drill-started.png`
- `08-steps-toggled.png`
- `09-reflection-form.png`
- `10-drill-recorded.png`
- `11-rest-interval.png`
- `12-return-to-brief.png`
- `13-fast-path-landing.png`
- `14-post-drill-archetype.png`

## Key Risks

- Welcome overlay not triggering on empty state
- Archetype selection not persisting through confirm
- Handler recommendation logic not matching archetype
- DrillRunner rendering with placeholder data instead of real cards
- XP calculation off
- Fast-path localStorage key not being set correctly
- Post-drill archetype prompt not appearing for fast-path users
