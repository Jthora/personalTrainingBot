# Gamified Progress Upgrade — Quick Start

This folder contains the planning and specs for the gamified, personal-training-aligned upgrade to the workouts experience. Start here to navigate the documents and ship Phase 1 quickly.

## What to build first (Phase 1 focus)
- Core telemetry: `UserProgressStore` (streak, XP, level, badges, one daily/one weekly goal/challenge) with localStorage + derived view-model.
- Event wiring: `useWorkoutSchedule` complete/skip/timeout/schedule-set → progress updates (debounced/idempotent).
- Minimal UI surfacing: header chips (schedule, difficulty pill, selection summary, alignment badge), actionable workout cards in Home left rail, streak/XP/goal widgets, basic recap toast on completion.
- Guardrails: memoized/debounced selection summary and alignment checks; graceful fallback if storage fails; no animations/confetti yet.

## Key docs (read in this order)
1) `vision.md` — north star, scope, success criteria.
2) `feature-pillars.md` — pillars with acceptance and guardrails.
3) `architecture.md` — state, events, flags, performance, offline.
4) `implementation-plan.md` — phased delivery, file touchpoints, PR slicing.
5) `user-flows.md` & `ui-wireframes.md` — end-to-end flow and UI surfaces (with minimal header/sidebar guidance).
6) `event-map.md` & `data-models.md` — events, handlers, guardrails, schemas (quiet mode, flags, single daily/weekly challenge).
7) `badge-and-challenge-catalog.md` & `copy-prompts.md` — lean catalog, rate-limited prompts, quiet mode tone.
8) `qa-plan.md` & `rollout-notes.md` — what to test, how to flag/roll out safely.

## Defaults & constraints
- One daily and one weekly goal/challenge visible; badge strip truncated with +N.
- Header stays minimal: chips + primary CTA; secondary controls in drawer/more.
- Prompts rate-limited; quiet mode respected; no confetti/animations in Phase 1.
- Always degrade gracefully if storage is unavailable; never block schedule generation.

## Flag + kill-switch coverage
- `progressEnabled` disables progress surfaces (chips/widgets/toasts); recap toast/modal will not show when off.
- `recapEnabled` gates recap toast+modal triggers; `recapShareEnabled` and `recapAnimationsEnabled` gate share/motion affordances; all respect quiet mode.
- `badgeStripEnabled` and `challengesEnabled` gate badge/challenge surfacing.
- Quiet mode suppresses prompts, sounds, and recap surfacing even when other flags are on.
- Storage drift/reset: schedule + selections clear and regenerate on invalid persistence; taxonomy signature mismatch clears selections.

## Build next
- Implement Phase 1 slice behind flags, validate with recap toast.
- Add quiet mode toggle in Phase 4; only then consider animations/confetti.

## Files in this folder
- Specs: `vision.md`, `feature-pillars.md`, `architecture.md`, `user-flows.md`, `ui-wireframes.md`, `data-models.md`, `event-map.md`, `implementation-plan.md`, `badge-and-challenge-catalog.md`, `copy-prompts.md`, `qa-plan.md`, `rollout-notes.md`.
- Tracker: `progressTracker.md` (hierarchical checklist for stages/phases/steps).
