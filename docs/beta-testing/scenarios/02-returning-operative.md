# Scenario 02: Returning Operative

> Persona: `day-two-cadet` — Came back for day 2. Has archetype, 1 drill completed, level 1, streak 1.

## Purpose

Validates the most common real-world session: a returning user opens the app, browses training modules, trains a deck, completes a drill, and checks their progress. This is the daily loop that must be seamless.

## Preconditions

- Seeded state: archetype `cybercom`, handler `thora`, callsign "Operative-7"
- 1 drill in history, level 1, XP 40, streak count 1
- Enrolled yesterday
- Mobile viewport: 390×844

## Steps

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Training surface loads** | Navigate to `/train` | Module browser renders with 19 domain cards. Archetype-weighted ordering (CyberCom-related modules prioritized). |
| 2 | **Check bottom nav** | Inspect BottomNav | 4 tabs visible: Train (active), Review, Progress, Profile. Correct icons and labels. |
| 3 | **Browse module list** | Scroll through all modules | Each module shows: domain name, card count, deck count, domain score, sparkline trend. No overflow. |
| 4 | **Enter a module** | Click "Cybersecurity" module | DeckBrowser loads. Breadcrumb shows "Training / Cybersecurity". Sub-module list with decks. "Train entire module" button visible. |
| 5 | **Inspect deck details** | Scroll through decks | Each deck shows: card preview (max 5 cards), "Train this deck" button, card count, due-card SR badge if applicable. |
| 6 | **Train a deck** | Click "Train this deck" on first deck | DrillRunner loads with cards from that specific deck. Steps correspond to deck cards. |
| 7 | **Trigger engagement warning** | Complete all steps in <15s each | Engagement warning dialog appears: "You completed this quickly. Are you sure you engaged with the material?" Two options visible. |
| 8 | **Go back and review** | Click "Go back and review" | All steps unchecked. Timer resumes from where it was. |
| 9 | **Complete properly** | Re-toggle steps with proper pacing | No engagement warning this time. Reflection form appears. |
| 10 | **Record with weak cards** | Rate 3/5, submit | XP feedback shown. If any cards scored ≤2: "Retry N weak cards" button visible. |
| 11 | **Navigate to Progress** | Click Progress tab in BottomNav | StatsSurface renders. Level 1 (or 2 if enough XP). Streak should show 2 (yesterday + today). Daily goal progress updated. |
| 12 | **Check activity heatmap** | Scroll to heatmap section | Activity dots for yesterday and today. Correct intensity. |
| 13 | **Navigate to Profile** | Click Profile tab | Callsign "Operative-7", division "CyberCom", instructor, enrolled date. |

## Accessibility Audit Points

- After step 1 (training surface) — primary daily screen
- After step 11 (stats surface) — data-heavy dashboard
- After step 13 (profile surface) — identity screen

## Expected Screenshots

13 screenshots:
- `01-training-surface.png`
- `02-bottom-nav.png`
- `03-module-list-scroll.png`
- `04-deck-browser.png`
- `05-deck-details.png`
- `06-drill-from-deck.png`
- `07-engagement-warning.png`
- `08-steps-unchecked.png`
- `09-reflection-form.png`
- `10-drill-recorded-weak.png`
- `11-stats-surface.png`
- `12-activity-heatmap.png`
- `13-profile-surface.png`

## Key Risks

- Module ordering not reflecting archetype weighting
- DeckBrowser breadcrumb not matching selected module
- Engagement warning threshold miscalculated
- "Go back and review" not properly resetting step state
- Streak calculation incorrect across day boundary
- Weak card retry button not appearing or triggering wrong cards
