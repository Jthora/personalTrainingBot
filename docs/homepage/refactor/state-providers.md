# State Providers

## Scope
- InitialDataLoader stays at app root.
- Schedule hooks (useWorkoutSchedule) shared by Plan, Progress, Coach; not re-mounted per tab.
- CardProvider scoped to Cards route/tab only to avoid unnecessary load elsewhere.
- CoachSelection/WorkoutSchedule providers remain at app root (as today) unless perf dictates narrower scope.

## Loading
- CardProvider renders skeleton in Cards until TrainingModuleCache is ready.
- Plan/Progress/Coach show schedule-loading skeletons driven by schedule hook state.

## Persistence
- Cards retain dealt state while switching tabs (provider stays mounted under Cards). Leaving Cards drops UI but state lives in CardDealer if desired; decide whether to reset on re-entry.
- Mode switch (Plan focus) can store last mode in local storage.

## Selection changes
- cardSlug applied on /home/cards replaces slot 0 and highlights; unknown slug shows warning without breaking other cards.
- Cache subscription remains to reseed cards on selection changes.
