# Legacy Retirement Inventory (Stage 11 / Task 10.2.2.1)

## Scope
Inventory legacy schemas/services after mission-default cutover to determine safe removals in Task 10.2.2.2.

## Runtime usage findings
### Legacy route aliases (retired)
- `'/schedules' -> '/mission/brief'`
- `'/workouts' -> '/mission/triage'`
- `'/training' -> '/mission/checklist'`
- `'/training/run' -> '/mission/checklist'`
- `'/settings' -> '/mission/debrief'`
- Source: `src/routes/missionCutover.ts`

### Legacy home sections (still active; not dead)
- `PlanSection`, `CardsSection`, `ProgressSection`, `CoachSection`, `SettingsSection` are still mounted:
  - under `/home/*` for fallback/rollback continuity
  - under `/mission/*` for mission surfaces (`brief`, `triage`, `case`, `signal`, `debrief`)
- Source: `src/routes/Routes.tsx`

### Workout schedule/filter services (still active; not dead)
- `WorkoutScheduleStore` remains referenced by initialization, context, header, cookie settings, and workout result workflows.
- `WorkoutFilterStore` remains referenced by workout list/filter/result flows and filtering utils.
- Sources:
  - `src/utils/InitialDataLoader.ts`
  - `src/context/WorkoutScheduleContext.tsx`
  - `src/components/WorkoutResultsPanel/WorkoutResultsPanel.tsx`
  - `src/components/WorkoutList/WorkoutList.tsx`
  - `src/components/WorkoutFilters/WorkoutFilters.tsx`

### Legacy training-module adapter bridge (still active; not dead)
- `mapTrainingModulesToMissionEntities` remains part of canonical hydration path in `MissionEntityStore`.
- Source: `src/domain/mission/MissionEntityStore.ts`

## Dead-code removals already applied during inventory
- Removed dead home-branch alias logic in `resolveLegacyAliasPath` (no longer needed after alias retirement).
- Source: `src/routes/missionCutover.ts`

## Removal candidates for Task 10.2.2.2
- No additional runtime-safe schema/service removals identified in this pass.
- Next pass should target internal duplication and fallback ownership only after Step 10.3 rollback automation is complete.
