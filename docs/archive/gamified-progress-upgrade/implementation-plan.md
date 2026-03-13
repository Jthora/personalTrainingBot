# Implementation Plan

## Phase 1: Core Telemetry & Surfacing
- Add `UserProgressStore` (versioned localStorage) with streak/XP/level/badges/goals/challenges + derived view-model.
- Wire `useWorkoutSchedule` events (complete/skip/timeout, schedule set) to update progress store; ensure idempotency/debounce.
- Add header chips in `WorkoutSelector`: current schedule, difficulty pill, selection summary (counts + est. time), alignment badge, generate/start CTA.
- Home left rail: streak/goal/XP widgets; make `WorkoutList` cards actionable (start/resume). Add minimal alignment to existing styles.
- Basic recap trigger on schedule completion (even if simple toast) to validate data flow.
 - Keep scope tight: one daily/one weekly goal/challenge, minimal badge strip (or none) in Phase 1; no animations.

## Phase 2: Guidance & Generation
- Add presets/filters/search in selector; difficulty-aware recommendations; summary updates live.
- “Today’s plan” banner; schedule preview drawer with replace/shuffle/remove; alignment warnings + quick “swap/adjust range”.
- Improve recap to modal with XP/streak/badges/goals/challenges and suggested next steps.
 - Keep header minimal; secondary controls live in drawer/more menu.

## Phase 3: Gamification Depth
- Badges catalog and unlock rules; badge strip in CoachDialog and `WorkoutCard`.
- Challenges (weekly/daily) with progress and rewards; display in sidebar; claim flow and reward handling.
- Share helper for recap text; optional celebratory animations/confetti for badge unlocks/challenge completion.
 - Enforce rate limits on prompts/animations; truncate badge strip with +N overflow.

## Phase 4: Polish & Controls
- Settings toggles: sounds, prompt frequency, challenge opt-in, alignment warnings, animations on/off.
- Responsive/layout polish for chips/drawers/sidebars; copy polish and prompt variety.
- Telemetry hooks (optional) or logging for QA; finalize feature-flag defaults.
 - Quiet mode toggle; ensure all prompts/animations respect it.

## File Touchpoints (initial)
- Stores: `src/store/UserProgressStore.ts` (new); extend `WorkoutCategoryCache` helpers (duration/focus/summary); consume `DifficultySettingsStore`.
- Hooks: `useWorkoutSchedule` (emit events, completion%, metadata); possible helper hook `useProgress` to read derived state.
- Workouts page: `WorkoutSelector.tsx` (+ CSS), `WorkoutsSidebar.tsx`, `WorkoutsPage.module.css`.
- Home left rail: `CoachDialog.tsx`, `WorkoutList.tsx`, `WorkoutCard.tsx`, `WorkoutDetails.tsx` (+ CSS for chips/bars/badge strip).
- Utilities: `src/utils/share.ts` (new), `src/data/badges.ts`/`challenges.ts` (catalogs), optional `src/config/featureFlags.ts` additions.

## PR Slicing
1) Progress store + event wiring + minimal chips/widgets; smoke recap toast.
2) Presets/filters + generate/start CTA + preview drawer + Today’s plan banner.
3) Badges/challenges + recap modal + badge strip + share helper.
4) Settings/polish (responsive, copy, toggles, animations) and flags hardening.

## Acceptance per Phase
- Phase 1: Events update progress; chips/widgets render correct values; actionable cards; no crashes if storage missing.
- Phase 2: Users generate with presets/filters; misalignment warnings show; preview/edit works; recap modal exists.
- Phase 3: Badges/challenges unlock/display; recap shows earned rewards; share text copies; rewards granted once.
- Phase 4: Toggles functional; layouts responsive; flags default safe; copy varied.
