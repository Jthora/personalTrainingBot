# API & Data

## Schemas (key fields)
- Workout: id, name, description, duration, intensity, difficulty_range.
- Category/SubCategory/Group: id, name, child collections, workouts.
- WorkoutSchedule: date, scheduleItems[(WorkoutSet | WorkoutBlock)], difficultySettings.
- WorkoutSet: workouts[[Workout, completedFlag]].
- WorkoutBlock: name, description, duration, intervalDetails.
- CustomWorkoutSchedule: id, name, description, workoutSchedule.
- ScheduleCalendar/Timer: days[{day, scheduleId}], dayStart/End/WakeUp, currentDay.

## Storage Keys & Versioning (proposed)
- Active schedule: `workoutSchedule:vX` (with schema version).
- Selections: `selectedWorkoutCategories:vX`, `selectedWorkoutSubCategories:vX`, `selectedWorkoutGroups:vX`, `selectedWorkouts:vX`, plus data signature key to detect taxonomy changes.
- Custom schedules: `customWorkoutSchedules` (consider version suffix if schema changes).
- Calendar timer: `scheduleCalendarTimer` (version if structure changes).

## Data Signature Strategy
- Build signature from taxonomy IDs (categories/subcategories/groups/workouts) sorted and concatenated.
- On mismatch: clear selection keys and re-seed defaults; optionally regenerate schedule if incompatible.

## Interfaces / Contracts
- Context surface: `loadSchedule`, `createNewSchedule` (unified generator), `completeCurrentWorkout`, `skipCurrentWorkout`, `setCurrentSchedule(customSchedule)`, `scheduleVersion` for subscribers.
- Generator contract: inputs (filtered workouts, difficulty settings), outputs (schedule with interleaved blocks/sets), error modes (empty set).

## Validation & Error Handling
- Parse guards for all storage reads; on failure, clear and regenerate.
- Disallow empty schedule persist unless explicitly representing “no workouts available” state with UI messaging.
- Feature flags: gate calendar surface and generator swap during rollout. Defaults live in `src/config/featureFlags.ts` (generatorSwap on, calendarSurface off, migrationBridge off); override via `VITE_FEATURE_FLAGS` JSON or `localStorage.featureFlagOverrides`.
