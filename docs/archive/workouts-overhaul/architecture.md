# Architecture

## Current State (brief)
- Workouts data cached in `WorkoutCategoryCache`; selections persisted via `WorkoutScheduleStore` boolean maps.
- Two schedule generators exist (legacy store generator vs `createWorkoutSchedule`), leading to divergent schedule shapes.
- `WorkoutScheduleContext` hydrates from storage, exposes load/complete/skip/create APIs; some consumers call `loadSchedule` redundantly.
- Custom schedules are stored separately and set as current via direct store writes (not reactive to context).
- Calendar timer data is stored but not consumed.

## Target State
- Single schedule generation path (difficulty-aware) used by all entry points.
- Versioned selection storage with data signatures to invalidate stale taxonomy.
- Reactive custom schedules adoption via context setter; scheduleVersion notifies UI.
- Calendar timer either integrated into runtime behavior or feature-flagged off.
- No render-time storage writes; idempotent hydration.

## Component Responsibilities
- **WorkoutCategoryCache**: taxonomy cache, selection toggles, selection hydration/persistence.
- **WorkoutScheduleStore**: single-source persistence for active schedule + selection maps; versioned keys.
- **WorkoutScheduleContext**: runtime state, mutations (complete/skip/setCurrent), lifecycle (load/create), version bumps.
- **Generators**: difficulty-aware schedule creation (interleaved blocks/sets), reusable across random/custom flows.
- **CustomSchedule tooling**: CRUD for bespoke schedules, calendar assignment, adoption into active schedule.

## Data Lifecycle
1. Load taxonomy → hydrate selection state (apply signature/version, clear stale IDs) → persist sanitized state.
2. Generate schedule (difficulty + filters) → persist → expose via context.
3. Mutate (complete/skip/regenerate/set custom) → persist → notify via `scheduleVersion`.
4. On schema/taxonomy change → detect via signature → clear/rehydrate selections and schedule if incompatible.

## Edge Cases & Handling
- Empty filtered set: regenerate with relaxed filters or prompt user to widen selection.
- Corrupt storage: log warn, clear keys, regenerate schedule.
- Missing taxonomy: block schedule generation, show UI prompt/retry.
- Difficulty filter yields zero: fallback to broader range or prompt user.

## Diagrams (to add)
- Data flow: cache → store → context → UI.
- State transitions: schedule mutation lifecycle.
