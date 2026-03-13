# Workout Feature Audit (2025-11-20)

## Scope & Method
- Reviewed workout-specific UI (WorkoutsPage, WorkoutsWindow, WorkoutSelector, WorkoutList, WorkoutCard) plus the supporting sidebar widgets.
- Traced cache/store/data-loader flow: `InitialDataLoader` ➜ `WorkoutDataLoader` ➜ `WorkoutCategoryCache` ➜ `WorkoutScheduleStore`/`WorkoutScheduleProvider` ➜ consumer components.
- Inspected supporting utilities (`WorkoutScheduleCreator`, `DifficultySettingsStore`) and JSON loaders to understand schedule generation.
- Exercised automated tests (Vitest) after code tweaks to ensure regressions are caught.

## Architecture Snapshot
1. **Bootstrapping** – `InitialDataLoader` blocks UI until card decks, training modules, and workout categories are loaded. Once `WorkoutCategoryCache` finishes caching, it calls `WorkoutScheduleCreator` to materialize the first schedule and persists it through `WorkoutScheduleStore`.
2. **Data Layer** – `WorkoutDataLoader` pulls structured JSON (categories → subcategories → groups → workouts) and hands typed entities to the cache. The cache keeps both the hierarchy (`Map<string, WorkoutCategory>`) and four selection sets representing user filters.
3. **State & Persistence** – `WorkoutScheduleStore` uses `localStorage` to persist both the latest generated schedule and every selection layer. Most consumers (selectors, schedule creator) pull from the cache, which mirrors the store while the app is running.
4. **UI Consumption** – `WorkoutSelector` reads the cache directly to render nested checklists. `WorkoutScheduleProvider` exposes schedule management hooks (load, skip, complete, regenerate) to UI like `WorkoutList`, `CoachDialog`, and scheduler popups.
5. **Schedule Generation** – `WorkoutScheduleCreator` filters cached workouts using persisted selections + difficulty weighting, stitches random sets/blocks, and hydrates the provider/store for UI consumption.

## Key Findings
| # | Area | Status | Impact | Recommendation |
|---|------|--------|--------|----------------|
| 1 | `WorkoutScheduleStore.createNewSchedule*` | ✅ Fixed | Mismatched argument order (`selectedGroups` passed where subcategories were expected) meant fallback schedules were often empty when `localStorage` lacked data, forcing redundant regeneration. | Preserve the corrected parameter order and add a tiny unit test around `getAllWorkoutsFilteredBy` usage in future work. |
| 2 | Workout selector bulk actions | ✅ Fixed | `Select All`/`Unselect All` mutated cache sets but never synced `WorkoutScheduleStore`, so regenerated schedules ignored the UI’s bulk actions. | Centralized the logic inside `WorkoutCategoryCache.selectAll()` / `.unselectAll()` which now persist every layer before the UI re-renders. |
| 3 | Selection rehydration on load | ⚠️ Open | After a refresh, the cache blindly marks every category/subcategory/group/workout as selected, even if `localStorage` stores a narrower filter. The UI therefore displays everything as active while schedule generation may silently omit prior exclusions. | During `WorkoutCategoryCache.loadData`, hydrate each selection set from `WorkoutScheduleStore.getSelected*()` before defaulting to “all”. Add a reconciliation step to log/repair missing IDs. |
| 4 | Local-only schedule persistence | ⚠️ Open | `WorkoutScheduleStore` directly touches `localStorage` in synchronous getters that run during React render (e.g., provider state initializer). This works in-browser but complicates testing/server rendering and makes it hard to swap persistence strategies later. | Wrap access behind an abstraction (e.g., injected storage adapter) so tests can stub and future environments (React Native, SSR) can hook in. |
| 5 | Observability | ⚠️ Open | Heavy console logging helps debug but there’s no structured telemetry or error surface for users if category/subcategory data fails to load (promises resolve after `setTimeout`). | Add user-facing fallback UI plus centralized logger (or feature flag) so workout onboarding failures don’t silently degrade UX. |

## Quality Gates
- `npm run test` (Vitest) — ✅ Pass (3 files, 7 tests). Existing suites cover caches/utilities; no workout-specific regressions detected.
- Tooling surfaced 10 npm audit warnings; none were introduced in this pass but should be triaged separately.

## Recommendations & Next Steps
1. **Rehydrate Selections** – Load persisted selection state into `WorkoutCategoryCache` during `loadData` so checkboxes reflect reality on refresh.
2. **Functional Tests** – Add a minimal integration test that wires `WorkoutCategoryCache` + `WorkoutScheduleCreator` to guarantee filtered schedules respect persisted selections.
3. **Storage Abstraction** – Introduce a storage service (browser `localStorage` default) to decouple state management from the DOM environment and unblock SSR or unit tests without jsdom.
4. **UX Feedback** – Provide user feedback when schedule generation returns zero workouts (e.g., incompatible difficulty filter) rather than returning an empty schedule silently.
5. **Monitoring** – Consider aggregating loader/caching stats into a dev overlay or telemetry endpoint to spot data drift early.

## Related Changes in This Audit
- Added `WorkoutCategoryCache.selectAll()/unselectAll()` plus a private persistence helper to keep cache and `WorkoutScheduleStore` aligned.
- Updated `WorkoutSelector` to call the new helpers so future behavioral tweaks stay centralized.
- Corrected the filter argument order inside `WorkoutScheduleStore.createNewSchedule()` and its synchronous counterpart to unblock fallback schedule generation.
- Recorded automated test results and dependency installation steps for reproducibility.
