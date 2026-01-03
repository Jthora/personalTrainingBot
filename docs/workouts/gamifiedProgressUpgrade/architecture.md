# Architecture

## State & Data Layers
- `WorkoutSchedule`: active schedule with items (sets/blocks), metadata (name/date), completion states, and derived completion%.
- `WorkoutCategoryCache`: selection tree; add helpers for estimated total duration, focus tags (cardio/strength/mixed), and selection stats.
- `DifficultySettingsStore`: chosen difficulty level/range; used for recommendations and alignment checks.
- `UserProgressStore` (new): streaks, XP/level, badges, goals (daily/weekly), challenges; versioned localStorage; exposes derived view-model (streak status, level thresholds, goal percentages).
- Optional catalogs: badges and challenges as static configs (`src/data/badges.ts`, `src/data/challenges.ts`).

## Event Flows
- Complete/skip/timeout -> `useWorkoutSchedule` updates schedule state and emits a progress event -> `UserProgressStore` updates streak/XP/badges/goals/challenges -> UI surfaces refresh chips/bars/prompts (rate-limited).
- Selection changes -> recompute summary (counts, duration) with memoization/debounce -> drive CTA state and recommendations.
- Difficulty changes -> rerun alignment checks (debounced) and adjust recommendations/presets.
- Schedule set/generate -> cache schedule metadata (name/date/completion%) and reset session state.

## UI Surfaces & Boundaries
- Workouts page: selector header chips, summary, presets/filters/search, generate/start CTA, preview drawer; sidebar with goals/streak/XP/difficulty/challenges.
- Home left rail: coach dialog (prompts, badges, streak/XP chips, focus text, quick actions), actionable upcoming list, recap entry.
- Recap modal: XP gained, streak delta, badges unlocked, goal/challenge progress, suggested next steps, share.

## Extensibility & Flags
- Feature flags: recap, challenges, badge strip, alignment warnings, animations/confetti, share.
- Versioned storage keys and migration helpers for `UserProgressStore`.
- Pluggable badge/challenge definitions; add without code churn in core logic.
- Kill switch: ability to disable progress UI surfaces if storage or flags are off.

## Performance & Offline
- Memoize selection summaries; avoid recomputing the tree on every render; debounce alignment checks.
- Graceful degradation: if storage unavailable, use in-memory defaults and hide reward UI as needed; never block schedule generation.
- Keep data local; no network dependency for core flows; minimize rerenders to keep header responsive.
