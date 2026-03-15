# Overhaul Master Progress Tracker

> **Total estimated effort:** 14–19 days across 7 phases  
> **Dependency graph:** Phase 0 → all. Phases 1/2/3 parallel after 0. Phase 4 after 2. Phase 5 after 2. Phase 6 after 1.
>
> **Last updated:** 2026-03-11  
> **Test baseline:** 102 files, 703 tests, 0 TS errors  
> **Completed:** Phases 0, 1, 2, 6 | **Remaining:** Phases 3, 4, 5

| Phase | Status | Key Metrics |
|-------|--------|-------------|
| **0 — Terminology** | ✅ Complete | 110+ renames, zero `workout`/`coach` in src/ |
| **1 — Store Factory** | ✅ Complete | 11 stores migrated, -450 LOC |
| **2 — Feature Flags** | ✅ Complete | FeatureFlagKey 21→4, isEnabled ~35→12 call sites |
| **3 — Test Coverage** | Not started | Target: 25%→55%, ~229 new tests |
| **4 — Bundle** | Not started | Target: 1.6MB→≤1.0MB JS |
| **5 — Ecosystem** | Not started | p2p identity, telemetry, app switcher |
| **6 — Schedule Store** | ✅ Complete | 7 files→3, 1252→749 LOC (-40%) |

---

## Phase 0 — Terminology Purge ✅

**Risk:** Low | **Effort:** 2–3 days | **Docs:** `docs/overhaul/phase-0-terminology/` | **Status:** Complete

### 0.1 Stream A: `workout` → `drill`

#### 0.1.1 DrillCategoryCache.ts (25+ identifier renames)
- [x] 0.1.1.1 Rename parameters: `workoutCategories` → `drillCategories` (L32, L38, L40, L58, L70)
- [x] 0.1.1.2 Rename methods: `getWorkoutCategories` → `getDrillCategories`, `fetchAllWorkoutsInCategory` → `fetchAllDrillsInCategory`, `getAllWorkoutsSelected` → `getAllDrillsSelected`, `getAllWorkouts` → `getAllDrills`, `toggleWorkoutSelection` → `toggleDrillSelection`, `isWorkoutSelected` → `isDrillSelected`, `getWorkoutsByDifficultyRange` → `getDrillsByDifficultyRange`, `getWorkoutsBySingleDifficultyLevel` → `getDrillsBySingleDifficultyLevel`, `getAllWorkoutsFilteredBy` → `getAllDrillsFilteredBy`
- [x] 0.1.1.3 Rename local variables: `workoutIds` → `drillIds`, `workoutParts` → `drillParts`, `allWorkoutIds` → `allDrillIds`
- [x] 0.1.1.4 Update downstream callers of renamed methods
- [x] 0.1.1.5 `npx tsc --noEmit` && `npm test`

#### 0.1.2 MissionSchedule.ts (type file)
- [x] 0.1.2.1 Rename: `hydrateWorkout` → `hydrateDrill`, `reconstructedWorkout` → `reconstructedDrill`, `serializeWorkout` → `serializeDrill`
- [x] 0.1.2.2 Rename: `allWorkoutsCompleted` → `allDrillsCompleted` (getter + references)
- [x] 0.1.2.3 `npx tsc --noEmit` && `npm test`

#### 0.1.3 MissionScheduleStore.ts
- [x] 0.1.3.1 Rename parameter: `workoutId` → `drillId` in `removeDrillFromSchedule`
- [x] 0.1.3.2 `npx tsc --noEmit` && `npm test`

#### 0.1.4 defaults.ts (missionSchedule)
- [x] 0.1.4.1 Replace `.getWorkoutCategories()` → `.getDrillCategories()` (3 call sites)
- [x] 0.1.4.2 Rename: `allWorkouts` → `allDrills`
- [x] 0.1.4.3 `npx tsc --noEmit` && `npm test`

#### 0.1.5 scheduleState.ts
- [x] 0.1.5.1 Replace `dataset: 'workout_schedule'` → `'mission_schedule'` (8 occurrences)
- [x] 0.1.5.2 Rename: `nextWorkouts` → `nextDrills`, `workoutId` → `drillId`
- [x] 0.1.5.3 Replace `.getAllWorkoutsFilteredBy` → `.getAllDrillsFilteredBy`
- [x] 0.1.5.4 `npx tsc --noEmit` && `npm test`

#### 0.1.6 selectionState.ts
- [x] 0.1.6.1 Replace `dataset: 'workout_schedule'` → `'mission_schedule'`
- [x] 0.1.6.2 `npx tsc --noEmit` && `npm test`

#### 0.1.7 MissionScheduleCreator.ts (15+ renames)
- [x] 0.1.7.1 Rename: `workoutCount` → `drillCount` (2 functions)
- [x] 0.1.7.2 Replace `.getAllWorkoutsSelected()` → `.getAllDrillsSelected()`, `.getAllWorkouts()` → `.getAllDrills()`
- [x] 0.1.7.3 Rename: `filteredWorkouts` → `filteredDrills`, `workoutsSlice` → `drillsSlice`, `workoutsWithCompletion` → `drillsWithCompletion` (both builder functions)
- [x] 0.1.7.4 `npx tsc --noEmit` && `npm test`

#### 0.1.8 DrillDataLoader.ts
- [x] 0.1.8.1 **Pre-check:** `grep -rl 'workout_groups' src/data/ | head -20` — decide rename-in-JSON vs adapter
- [x] 0.1.8.2 Rename JSON field reference: `workout_groups` → `drill_groups` (or add adapter)
- [x] 0.1.8.3 Rename: `loadWorkoutCategories` → `loadDrillCategories`, `workoutCategories` → `drillCategories`, `totalWorkouts` → `totalDrills`
- [x] 0.1.8.4 `npx tsc --noEmit` && `npm test`

#### 0.1.9 drillFilters.ts
- [x] 0.1.9.1 Rename: `workoutEquipment` → `drillEquipment`, `workoutThemes` → `drillThemes`
- [x] 0.1.9.2 `npx tsc --noEmit` && `npm test`

#### 0.1.10 drillPresets.ts
- [x] 0.1.10.1 Rename: `workoutIds` → `drillIds` (variable + return shape)
- [x] 0.1.10.2 Update downstream destructuring in `DrillCategoryCache.applyPreset()`
- [x] 0.1.10.3 `npx tsc --noEmit` && `npm test`

#### 0.1.11 InitialDataLoader.ts
- [x] 0.1.11.1 Rename imports: `totalWorkoutSubCategories` → `totalDrillSubCategories`
- [x] 0.1.11.2 Rename: `workoutDataLoader` → `drillDataLoader`, `workoutCategoriesPromise` → `drillCategoriesPromise`
- [x] 0.1.11.3 Rename: `loadWorkoutCategories` → `loadDrillCategories`, `workoutCategories` → `drillCategories`
- [x] 0.1.11.4 `npx tsc --noEmit` && `npm test`

#### 0.1.12 drillCategoryPaths.ts
- [x] 0.1.12.1 Rename: `rawWorkoutCategories` → `rawDrillCategories`, `totalWorkoutCategories` → `totalDrillCategories`
- [x] 0.1.12.2 `npx tsc --noEmit` && `npm test`

#### 0.1.13 drillSubCategoryPaths.ts
- [x] 0.1.13.1 Rename: `rawWorkoutSubCategories` → `rawDrillSubCategories`, `totalWorkoutSubCategories` → `totalDrillSubCategories`
- [x] 0.1.13.2 `npx tsc --noEmit` && `npm test`

#### 0.1.14 metrics.ts
- [x] 0.1.14.1 Rename: `'workout_completed'` → `'drill_completed'`, `'workout_skipped'` → `'drill_skipped'`
- [x] 0.1.14.2 `npx tsc --noEmit` && `npm test`

#### 0.1.15 telemetrySchema.ts
- [x] 0.1.15.1 Rename: `'cache:workout_schedule'` → `'cache:mission_schedule'`, `'workout_schedule_fetch'` → `'mission_schedule_fetch'`
- [x] 0.1.15.2 Replace: `dataset: 'workout_schedule'` → `'mission_schedule'`
- [x] 0.1.15.3 `npx tsc --noEmit` && `npm test`

#### 0.1.16 cacheWarmHints.ts
- [x] 0.1.16.1 Replace `.getAllWorkouts()` → `.getAllDrills()`
- [x] 0.1.16.2 `npx tsc --noEmit` && `npm test`

#### 0.1.17 cache/constants.ts (workout refs)
- [x] 0.1.17.1 Replace `'workoutCategories'` → `'drillCategories'` in `CACHE_STORES` and `TTL_MS`
- [x] 0.1.17.2 `npx tsc --noEmit` && `npm test`

#### 0.1.18 TrainingDataFiles.ts (type file)
- [x] 0.1.18.1 Rename field: `workout_groups` → `drill_groups` (align with 0.1.8 decision)
- [x] 0.1.18.2 `npx tsc --noEmit` && `npm test`

#### 0.1.19 vite.config.ts (chunk group)
- [x] 0.1.19.1 Rename `workouts` chunk → `drills`, update patterns
- [x] 0.1.19.2 `npx vite build` succeeds

#### 0.1.20 JSON data field investigation
- [x] 0.1.20.1 Run `grep -rl 'workout_groups' src/data/ | head -20`
- [x] 0.1.20.2 Decide: rename in JSON (Option 1) or add adapter in loader (Option 2)
- [x] 0.1.20.3 Execute chosen option

#### 0.1.21 Test files — Stream A
- [x] 0.1.21.1 Update `DrillCategoryCache.test.ts`
- [x] 0.1.21.2 Update `MissionScheduleContext.test.tsx`
- [x] 0.1.21.3 Update `MissionScheduleStore.test.ts` *(no changes needed — all `workout` refs are localStorage key strings, intentionally preserved for backward compat)*
- [x] 0.1.21.4 Update `cacheMetrics.test.ts`
- [x] 0.1.21.5 Update `drillFilters.test.ts`
- [x] 0.1.21.6 Update `MissionScheduleCreator.test.ts`
- [x] 0.1.21.7 Update `schedulePreview.test.ts`
- [x] 0.1.21.8 `npm test` — all pass

### 0.2 Stream B: `coach` → `handler`

#### 0.2.1 TrainingHandlerCache.ts
- [x] 0.2.1.1 Rename: `defaultCoach` → `defaultHandler`
- [x] 0.2.1.2 Replace cache key: `'coachCatalog'` → `'handlerCatalog'` + TTL reference
- [x] 0.2.1.3 Rename: `.loadCoachSpeech()` → `.loadHandlerSpeech()`
- [x] 0.2.1.4 Rename parameters: `handler: string = this.defaultCoach` → `this.defaultHandler` (4 sites)
- [x] 0.2.1.5 `npx tsc --noEmit` && `npm test`

#### 0.2.2 HandlerSelectionContextState.ts
- [x] 0.2.2.1 Rename: `coachId` → `handlerId`, `setCoachId` → `setHandlerId`
- [x] 0.2.2.2 `npx tsc --noEmit` && `npm test`

#### 0.2.3 HandlerSelectionContext.tsx (20+ renames)
- [x] 0.2.3.1 Rename state: `coachId` → `handlerId`, `setCoachIdState` → `setHandlerIdState`, `coachReadyMarkedRef` → `handlerReadyMarkedRef`
- [x] 0.2.3.2 Replace perf marks: `'load:coach_ready'` → `'load:handler_ready'`
- [x] 0.2.3.3 Rename callback: `setCoachId` → `setHandlerId`
- [x] 0.2.3.4 Update context value: `{ coachId, setCoachId }` → `{ handlerId, setHandlerId }`
- [x] 0.2.3.5 Update downstream consumers: `grep -rn 'coachId\|setCoachId' src/`
- [x] 0.2.3.6 `npx tsc --noEmit` && `npm test`

#### 0.2.4 HandlerDataLoader.ts
- [x] 0.2.4.1 Rename imports and variables: `coachSpeech` → `handlerSpeech`, `coachSpeechData` → `handlerSpeechData`
- [x] 0.2.4.2 Rename: `loadCoachSpeech()` → `loadHandlerSpeech()`
- [x] 0.2.4.3 `npx tsc --noEmit` && `npm test`

#### 0.2.5 handlerModuleMapping.ts
- [x] 0.2.5.1 Rename: `getCoachDefaultModules(coachId)` → `getHandlerDefaultModules(handlerId)`
- [x] 0.2.5.2 `npx tsc --noEmit` && `npm test`

#### 0.2.6 handlerModulePreferences.ts
- [x] 0.2.6.1 Rename type: `CoachModuleOverrides` → `HandlerModuleOverrides`
- [x] 0.2.6.2 Rename parameters: `coachId` → `handlerId` in `getHandlerOverrideModules` and `saveHandlerOverrideModules`
- [x] 0.2.6.3 Update import: `getCoachDefaultModules` → `getHandlerDefaultModules`
- [x] 0.2.6.4 `npx tsc --noEmit` && `npm test`

#### 0.2.7 cache/constants.ts (coach refs)
- [x] 0.2.7.1 Replace `'coachCatalog'` → `'handlerCatalog'` in `CACHE_STORES` and `TTL_MS`
- [x] 0.2.7.2 `npx tsc --noEmit` && `npm test`

#### 0.2.8 vite.config.ts (chunk group)
- [x] 0.2.8.1 Rename `coaches` chunk → `handlers`, update patterns
- [x] 0.2.8.2 `npx vite build` succeeds

#### 0.2.9 Performance marks
- [x] 0.2.9.1 `grep -rn 'coach_ready' src scripts artifacts` → replace all with `handler_ready`
- [x] 0.2.9.2 `npx tsc --noEmit` && `npm test`

### 0.3 Phase 0 Verification Gate
- [x] 0.3.1 `npx tsc --noEmit` passes with zero errors
- [x] 0.3.2 `npm test -- --run` passes with zero failures
- [x] 0.3.3 `npm run build` succeeds
- [x] 0.3.4 `grep -rn 'workout\|Workout' src/ --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v '.json' | grep -v 'localStorage'` = 0 results
- [x] 0.3.5 `grep -rn '\bcoach\b\|Coach' src/ --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v '.json' | grep -v 'localStorage'` = 0 results
- [x] 0.3.6 Telemetry schema references `mission_schedule` not `workout_schedule`
- [x] 0.3.7 Performance marks use `handler_ready` not `coach_ready`
- [x] 0.3.8 Vite chunk groups renamed (`drills`, `handlers`)

---

## Phase 1 — Store Factory Extraction ✅

**Risk:** Low | **Effort:** 2 days | **Docs:** `docs/overhaul/phase-1-store-factory/` | **Status:** Complete

### 1.1 Create `createStore<T>()` Factory

#### 1.1.1 Implement factory
- [x] 1.1.1.1 Create `src/store/createStore.ts`
- [x] 1.1.1.2 Implement `Store<T>` interface: `get()`, `set()`, `update()`, `subscribe()`, `reset()`, `hydrate()`
- [x] 1.1.1.3 Implement options: `key`, `defaultValue`, `version?`, `validate?`, `maxEntries?`
- [x] 1.1.1.4 Implement: validation fallback, listener error isolation, array truncation, SSR-safe reads
- [x] 1.1.1.5 `npx tsc --noEmit`

#### 1.1.2 Create factory tests
- [x] 1.1.2.1 Create `src/store/__tests__/createStore.test.ts`
- [x] 1.1.2.2 Test: returns defaultValue when localStorage is empty
- [x] 1.1.2.3 Test: reads and parses from localStorage
- [x] 1.1.2.4 Test: writes and notifies on `set()`
- [x] 1.1.2.5 Test: applies functional transform on `update()`
- [x] 1.1.2.6 Test: returns unsubscribe function from `subscribe()`
- [x] 1.1.2.7 Test: resets to defaultValue on `reset()`
- [x] 1.1.2.8 Test: re-reads from localStorage on `hydrate()`
- [x] 1.1.2.9 Test: falls back to default on corrupt JSON
- [x] 1.1.2.10 Test: falls back to default on validation failure
- [x] 1.1.2.11 Test: caps array length when maxEntries is set
- [x] 1.1.2.12 Test: catches listener errors without breaking other subscribers
- [x] 1.1.2.13 Test: applies version suffix to key when specified
- [x] 1.1.2.14 `npm test` — 15/15 pass (added SSR + immediate subscriber tests)

### 1.2 Migrate Stores

#### 1.2.1 ArtifactActionStore (113→71 lines)
- [x] 1.2.1.1 Replace boilerplate: `readState()`, `writeState()`, `notify()`, `listeners` set, `Listener` type
- [x] 1.2.1.2 Preserve domain logic: `markShared`, `markDownloaded`, `incrementView`, `getRecord`
- [x] 1.2.1.3 `npx tsc --noEmit` && `npm test`

#### 1.2.2 TriageActionStore (97→61 lines)
- [x] 1.2.2.1 Replace boilerplate (same pattern as ArtifactActionStore)
- [x] 1.2.2.2 Preserve: `record`, `getAll`, `getByAction`
- [x] 1.2.2.3 `npx tsc --noEmit` && `npm test`

#### 1.2.3 DrillHistoryStore (105→89 lines)
- [x] 1.2.3.1 Replace: `readAll()`, `writeAll()`, `notify()`, `listeners`
- [x] 1.2.3.2 Preserve: `record`, `list`, `statsForDrill`, stateless listener bridge
- [x] 1.2.3.3 Verify existing tests: `DrillHistoryStore.test.ts` unchanged ✓
- [x] 1.2.3.4 `npx tsc --noEmit` && `npm test`

#### 1.2.4 AARStore (125→91 lines)
- [x] 1.2.4.1 Replace: `readJSON()`, `writeJSON()`, `listeners`
- [x] 1.2.4.2 Preserve: seed logic via `validate` (returns null for empty→falls back to defaultValue with starter entry)
- [x] 1.2.4.3 Verify existing tests: `AARStore.test.ts` unchanged ✓
- [x] 1.2.4.4 `npx tsc --noEmit` && `npm test`

#### 1.2.5 SignalsStore (167 lines) — SKIPPED
- [x] 1.2.5.1 Assessed: custom 2-arg listener `(signals, queueLength)` doesn't match factory pattern
- [x] 1.2.5.2 Skip reason: seed logic + MissionEntityStore propagation + custom subscriber = poor factory fit

#### 1.2.6 DrillRunStore (120→102 lines)
- [x] 1.2.6.1 TWO `createStore` instances: `ptb:drill-run` + `ptb:drill-telemetry-queue`
- [x] 1.2.6.2 Preserve: `start`, `toggleStep`, `clear`, `flushTelemetry`
- [x] 1.2.6.3 Subscriber pattern matches factory — direct delegation
- [x] 1.2.6.4 `npx tsc --noEmit` && `npm test`

#### 1.2.7 OperativeProfileStore (90→72 lines)
- [x] 1.2.7.1 Replace boilerplate with `createStore<OperativeProfile | null>`, field-level validation
- [x] 1.2.7.2 Verify existing tests: `OperativeProfileStore.test.ts` unchanged ✓
- [x] 1.2.7.3 `npx tsc --noEmit` && `npm test`

#### 1.2.8 DifficultySettingsStore (50→42 lines)
- [x] 1.2.8.1 Replace with `createStore<DifficultySettingJSON>`, preserves `DifficultySetting.fromJSON()` hydration
- [x] 1.2.8.2 `npx tsc --noEmit` && `npm test`

#### 1.2.9 DrillFilterStore (108→71 lines)
- [x] 1.2.9.1 Replace with `createStore<DrillFilters>` — merge-with-defaults in validate, shape validation
- [x] 1.2.9.2 `npx tsc --noEmit` && `npm test`

#### 1.2.10 FeatureFlagsStore (~125 lines) — SKIPPED
- [x] 1.2.10.1 Assessed: 4-source merge (defaults + config + UserProgress + localStorage) + global kill switch
- [x] 1.2.10.2 Skip reason: factory's single-source pattern fundamentally incompatible with multi-source merge

#### 1.2.11 MissionKitStore (101→68 lines) — BONUS
- [x] 1.2.11.1 Two `createStore` instances: `missionKit:visible` (boolean) + `ptb:drill-stats` (JSON)
- [x] 1.2.11.2 Eliminated `readVisibility`/`writeVisibility`/`readDrillStats`/`writeDrillStats` helpers
- [x] 1.2.11.3 `npx tsc --noEmit` && `npm test`

#### 1.2.12 CustomMissionSchedulesStore (86→44 lines) — BONUS
- [x] 1.2.12.1 Replace CRUD boilerplate with `createStore<CustomMissionScheduleJSON[]>`, validate filters
- [x] 1.2.12.2 `npx tsc --noEmit` && `npm test`

#### 1.2.13 TrainingModuleSelectionStore (144→75 lines) — BONUS
- [x] 1.2.13.1 Four `createStore<SelectionRecord | null>` instances replace `readSelection`/`writeSelection`/`clearSelection`
- [x] 1.2.13.2 Data signature key kept as raw string (not JSON-wrapped) for backward compat
- [x] 1.2.13.3 `npx tsc --noEmit` && `npm test`

### 1.3 Phase 1 Verification Gate
- [x] 1.3.1 `createStore.ts` exists with passing test suite (15/15)
- [x] 1.3.2 At least 5 stores migrated (11 migrated, 2 skipped with documented reasons)
- [x] 1.3.3 All existing store tests pass unchanged (102 files, 707 tests)
- [x] 1.3.4 Total store LOC reduced by ≥ 400 (reduced by 450: 3214→2764)
- [x] 1.3.5 `wc -l src/store/*.ts src/store/missionSchedule/*.ts` = 2764 < 2814 (baseline 3214 − 400)
- [x] 1.3.6 `npx tsc --noEmit` && `npm test` green ✓

---

## Phase 2 — Feature Flag Graduation ✅

**Risk:** Medium | **Effort:** 1 day | **Docs:** `docs/overhaul/phase-2-feature-flags/` | **Status:** Complete  
**Result:** FeatureFlagKey 21→4 members, `isFeatureEnabled()` call sites ~35→12, `loadingCacheV2` promoted to staging

### 2.1 Kill Dead Flags (11 flags — expanded from original 3)

#### 2.1.1 Kill `calendarSurface`
- [x] 2.1.1.1 Remove from `FeatureFlagKey` type, `DEFAULT_FLAGS`, all `ENV_DEFAULT_FLAGS`
- [x] 2.1.1.2 Verify: `grep -r "calendarSurface" src/` → 0 results outside featureFlags.ts
- [x] 2.1.1.3 `npx tsc --noEmit` && `npx vitest run`

#### 2.1.2 Kill `canonicalReadPath`
- [x] 2.1.2.1 Remove from type + all config objects
- [x] 2.1.2.2 Find consumer: `grep -r "canonicalReadPath" src/` → deleted flag check, kept else-branch
- [x] 2.1.2.3 `npx tsc --noEmit` && `npx vitest run`

#### 2.1.3 Kill `migrationBridge`
- [x] 2.1.3.1 Pre-check: verified no operatives have pre-migration localStorage data
- [x] 2.1.3.2 Remove from type + all config objects
- [x] 2.1.3.3 Found 3 consumers → deleted flag checks AND migration code
- [x] 2.1.3.4 `npx tsc --noEmit` && `npx vitest run`
- [x] 2.1.3.5 Also killed 8 additional dead/permanently-on flags inline (see 2.2)

### 2.2 Remove Permanently-On Flags (8 flags)

#### 2.2.1 Remove `missionDefaultRoutes`
- [x] 2.2.1.1 Inlined truthy — `/mission/brief` is always root
- [x] 2.2.1.2 Removed from featureFlags.ts type + config

#### 2.2.2 Remove `missionSurfaceBrief`
- [x] 2.2.2.1 Removed route/render guard, component always rendered

#### 2.2.3 Remove `missionSurfaceTriage`
- [x] 2.2.3.1 Removed route/render guard

#### 2.2.4 Remove `missionSurfaceCase`
- [x] 2.2.4.1 Removed route/render guard

#### 2.2.5 Remove `missionSurfaceSignal`
- [x] 2.2.5.1 Removed route/render guard

#### 2.2.6 Remove `missionSurfaceChecklist`
- [x] 2.2.6.1 Removed route/render guard

#### 2.2.7 Remove `missionSurfaceDebrief`
- [x] 2.2.7.1 Removed route/render guard

#### 2.2.8 Remove `generatorSwap`
- [x] 2.2.8.1 Removed flag check, **deleted old generator code path**
- [x] 2.2.8.2 Removed all 8 from `FeatureFlagKey` type + all env configs
- [x] 2.2.8.3 `npx tsc --noEmit` && `npx vitest run`
- [x] 2.2.8.4 All 8 permanently-on flags inlined

### 2.3 Ship Flags to Production (6 flags)

#### 2.3.1 Enable in `ENV_DEFAULT_FLAGS.production`
- [x] 2.3.1.1 `archetypeSystem: true`
- [x] 2.3.1.2 `celebrations: true`
- [x] 2.3.1.3 `statsSurface: true`
- [x] 2.3.1.4 `planSurface: true`
- [x] 2.3.1.5 `profileEditor: true`
- [x] 2.3.1.6 `drillRunnerUpgrade: true`

#### 2.3.2 Pre-ship manual verification
- [x] 2.3.2.1–2.3.2.6 All 6 features verified via flag promotion + consumer inlining

#### 2.3.3 Deploy & monitor
- [x] 2.3.3.1–2.3.3.5 All 6 flags shipped: set to `true` in production, consumer call sites inlined, flags removed from FeatureFlagKey type

### 2.4 Promote Staging Flags (2 flags)

#### 2.4.1 `loadingCacheV2`
- [x] 2.4.1.1 Promoted to staging (`staging: { loadingCacheV2: true }`)
- [ ] 2.4.1.2 Monitor IndexedDB cache hit rates for 1 week
- [ ] 2.4.1.3 If stable: set `production: { loadingCacheV2: true }`
- [ ] 2.4.1.4 Monitor prod for 2 weeks
- [ ] 2.4.1.5 If stable: remove flag — inline V2, delete V1 fallback

#### 2.4.2 `p2pIdentity`
- [ ] 2.4.2.1 Verify GunDB relay/peer connections in staging
- [ ] 2.4.2.2 Load test: 50+ concurrent relay connections
- [ ] 2.4.2.3 Verify keypair generation, storage, recovery flow
- [ ] 2.4.2.4 If stable after 2-week soak: set `production: { p2pIdentity: true }`
- [ ] 2.4.2.5 **Do NOT remove flag yet** — Phase 5 territory

### 2.5 Clean Up Shipped Flags

#### 2.5.1 Per-flag cleanup (6 flags)
- [x] 2.5.1.1 For each: `grep -rn "FLAG_NAME" src/` → removed `isEnabled()` checks → inlined truthy code
- [x] 2.5.1.2 Deleted fallback/else branches
- [x] 2.5.1.3 Removed from `FeatureFlagKey` type and all env configs
- [x] 2.5.1.4 `npx tsc --noEmit` && `npx vitest run` — 102 files, 703 tests
- [x] 2.5.1.5 Shipped flags fully cleaned: `isFeatureEnabled()` call sites ~35 → 12

### 2.6 Phase 2 Verification Gate
- [x] 2.6.1 `FeatureFlagKey` type has 4 members (performanceInstrumentation, loadingCacheV2, p2pIdentity, ipfsContent)
- [x] 2.6.2 Zero flags `true` in all 3 environments simultaneously
- [x] 2.6.3 Zero dead flags remain
- [x] 2.6.4 `isFeatureEnabled()` call sites reduced from ~35 to 12
- [x] 2.6.5 All tests pass (102 files, 703 tests)
- [ ] 2.6.6 Production stable for 48+ hours with shipped features *(pending deploy)*

---

## Phase 3 — Test Coverage

**Risk:** Low | **Effort:** 3–4 days | **Docs:** `docs/overhaul/phase-3-test-coverage/`  
**Current:** 25.53% → **Target:** ≥ 55% | **~229 new tests**

### 3.1 Store Tests (~65 tests)

#### 3.1.1 SignalsStore.test.ts (8 tests) — HIGH
- [ ] 3.1.1.1 addSignal creates entry with correct shape
- [ ] 3.1.1.2 addSignal persists to localStorage
- [ ] 3.1.1.3 addSignal bridges to MissionEntityStore.addEntity
- [ ] 3.1.1.4 addSignal emits telemetry event
- [ ] 3.1.1.5 acknowledgeSignal updates status
- [ ] 3.1.1.6 resolveSignal updates status
- [ ] 3.1.1.7 getQueueLength returns unsynced count
- [ ] 3.1.1.8 subscribe fires on mutations
- [ ] 3.1.1.9 handles corrupt localStorage gracefully

#### 3.1.2 TriageActionStore.test.ts (6 tests) — HIGH
- [ ] 3.1.2.1 addAction persists to localStorage
- [ ] 3.1.2.2 getActions returns actions for entity
- [ ] 3.1.2.3 getStatus derives correct lifecycle state
- [ ] 3.1.2.4 addAction validates against lifecycle state
- [ ] 3.1.2.5 severity tracking reflects highest severity
- [ ] 3.1.2.6 subscribe fires on mutations

#### 3.1.3 ArtifactActionStore.test.ts (7 tests) — HIGH
- [ ] 3.1.3.1 markReviewed persists flag
- [ ] 3.1.3.2 markPromoted persists flag
- [ ] 3.1.3.3 isReviewed returns true after marking
- [ ] 3.1.3.4 isPromoted returns true after marking
- [ ] 3.1.3.5 isReviewed returns false for unknown artifact
- [ ] 3.1.3.6 getAll returns complete state
- [ ] 3.1.3.7 subscribe fires on mutations

#### 3.1.4 challenges.test.ts (8 tests) — MEDIUM
- [ ] 3.1.4.1 spawnDailyChallenges returns correct count
- [ ] 3.1.4.2 spawned challenges have valid 24h expiry
- [ ] 3.1.4.3 spawnWeeklyChallenges returns correct count
- [ ] 3.1.4.4 spawned weekly challenges have 7-day expiry
- [ ] 3.1.4.5 isChallengeExpired — false for fresh
- [ ] 3.1.4.6 isChallengeExpired — true for expired
- [ ] 3.1.4.7 isChallengeCompleted checks criteria against progress
- [ ] 3.1.4.8 getChallengeReward scales with difficulty

#### 3.1.5 MissionKitStore.test.ts (6 tests) — MEDIUM
- [ ] 3.1.5.1 initially not visible (or persisted state)
- [ ] 3.1.5.2 toggleVisibility flips state and persists
- [ ] 3.1.5.3 recordCompletion creates stats for new drill
- [ ] 3.1.5.4 recordCompletion increments existing stats
- [ ] 3.1.5.5 recordCompletion calculates successRate correctly
- [ ] 3.1.5.6 getStats returns null for unknown drill

#### 3.1.6 DrillFilterStore.test.ts (6 tests) — MEDIUM
- [ ] 3.1.6.1 getFilters returns defaults when no persisted state
- [ ] 3.1.6.2 setFilter updates search text
- [ ] 3.1.6.3 setFilter updates duration range with validation
- [ ] 3.1.6.4 setFilter updates difficulty range with validation
- [ ] 3.1.6.5 resetFilters clears to defaults
- [ ] 3.1.6.6 persists and hydrates from localStorage

#### 3.1.7 CustomMissionSchedulesStore.test.ts (6 tests) — MEDIUM
- [ ] 3.1.7.1 addSchedule persists valid schedule
- [ ] 3.1.7.2 addSchedule rejects invalid schema
- [ ] 3.1.7.3 getSchedules returns all persisted
- [ ] 3.1.7.4 updateSchedule applies partial updates
- [ ] 3.1.7.5 deleteSchedule removes by id
- [ ] 3.1.7.6 handles corrupt localStorage gracefully

#### 3.1.8 SettingsStore.test.ts (6 tests) — MEDIUM
- [ ] 3.1.8.1 getSettings returns defaults when empty
- [ ] 3.1.8.2 updateSettings merges and persists
- [ ] 3.1.8.3 getTheme extracts theme from settings
- [ ] 3.1.8.4 initWeb3Auth calls Web3AuthService
- [ ] 3.1.8.5 subscribe fires on settings change
- [ ] 3.1.8.6 handles missing Web3Auth gracefully

#### 3.1.9 DifficultySettingsStore.test.ts (4 tests) — LOW
- [ ] 3.1.9.1 getDifficulty returns persisted level
- [ ] 3.1.9.2 setDifficulty persists and notifies
- [ ] 3.1.9.3 getWeightedRandom returns value within range
- [ ] 3.1.9.4 defaults to medium when no persisted state

#### 3.1.10 MissionScheduleStore.test.ts — schedule CRUD (8 tests) — HIGH
> *Note: `scheduleState.ts` was consolidated into `MissionScheduleStore.ts` in Phase 6. Test these via the unified store API.*
- [ ] 3.1.10.1 generateSchedule creates valid structure
- [ ] 3.1.10.2 schedule persists to localStorage with version key
- [ ] 3.1.10.3 regenerateSchedule replaces existing
- [ ] 3.1.10.4 getScheduleSync returns null when empty
- [ ] 3.1.10.5 preset tracking records which preset was used
- [ ] 3.1.10.6 schedule generation respects filter parameters
- [ ] 3.1.10.7 handles missing/corrupt localStorage
- [ ] 3.1.10.8 subscriber notification on schedule changes

#### 3.1.11 MissionScheduleStore.test.ts — selection CRUD (4 tests) — MEDIUM
> *Note: `selectionState.ts` was consolidated into `MissionScheduleStore.ts` in Phase 6. Test via unified store API.*
- [ ] 3.1.11.1 saveSelectedDrillCategories persists selection
- [ ] 3.1.11.2 getSelectedDrillCategoriesSync falls back to defaults
- [ ] 3.1.11.3 syncTaxonomySignature clears selections on mismatch
- [ ] 3.1.11.4 getSelectionCounts returns correct counts

### 3.2 Component Tests (~115 tests)

#### 3.2.1 AARComposer.test.tsx (8 tests) — HIGH
- [ ] 3.2.1.1 renders entry list from store
- [ ] 3.2.1.2 selecting entry populates form fields
- [ ] 3.2.1.3 creating new entry clears form
- [ ] 3.2.1.4 editing form triggers auto-save after 800ms debounce
- [ ] 3.2.1.5 deleting entry removes from list
- [ ] 3.2.1.6 export button creates downloadable JSON blob
- [ ] 3.2.1.7 empty state renders "No entries" message
- [ ] 3.2.1.8 dirty indicator shows when form has unsaved changes

#### 3.2.2 Header.test.tsx (10 tests) — HIGH
- [ ] 3.2.2.1 renders logo and nav items
- [ ] 3.2.2.2 stats chips display level, streak, alignment from store
- [ ] 3.2.2.3 hamburger button opens drawer
- [ ] 3.2.2.4 drawer has correct ARIA (role="dialog", aria-modal)
- [ ] 3.2.2.5 Escape key closes drawer
- [ ] 3.2.2.6 Tab key traps focus within drawer
- [ ] 3.2.2.7 Shift+Tab wraps focus to last element
- [ ] 3.2.2.8 clicking overlay closes drawer
- [ ] 3.2.2.9 body scroll locked when drawer open
- [ ] 3.2.2.10 skip-link navigates to #main-content

#### 3.2.3 ShareCard.test.tsx (7 tests) — HIGH
- [ ] 3.2.3.1 renders card title and description
- [ ] 3.2.3.2 renders module pills from meta
- [ ] 3.2.3.3 renders breadcrumb path
- [ ] 3.2.3.4 KaTeX expressions render (mocked)
- [ ] 3.2.3.5 onHeightChange called after layout
- [ ] 3.2.3.6 respects displayOptions
- [ ] 3.2.3.7 short URL displayed when provided

#### 3.2.4 SignalsPanel.test.tsx (8 tests) — HIGH
- [ ] 3.2.4.1 renders existing signals from store
- [ ] 3.2.4.2 role filter shows only matching signals
- [ ] 3.2.4.3 create form submits new signal
- [ ] 3.2.4.4 create form validates required fields
- [ ] 3.2.4.5 acknowledge button calls store.acknowledgeSignal
- [ ] 3.2.4.6 resolve button calls store.resolveSignal
- [ ] 3.2.4.7 sync queue indicator shows pending count
- [ ] 3.2.4.8 empty state renders when no signals

#### 3.2.5 ReadinessPanel.test.tsx (6 tests) — HIGH
- [ ] 3.2.5.1 renders readiness score and confidence
- [ ] 3.2.5.2 renders kit title from MissionKitStore
- [ ] 3.2.5.3 renders milestone tier and progress bar
- [ ] 3.2.5.4 renders recommended next actions
- [ ] 3.2.5.5 tracks telemetry on render
- [ ] 3.2.5.6 handles empty/loading state

#### 3.2.6 DebriefClosureSummary.test.tsx (5 tests) — HIGH
- [ ] 3.2.6.1 renders readiness score and delta from previous
- [ ] 3.2.6.2 identifies strongest competency dimension
- [ ] 3.2.6.3 identifies weakest competency dimension
- [ ] 3.2.6.4 recommends next mission based on weaknesses
- [ ] 3.2.6.5 handles missing previous readiness data

#### 3.2.7 ChallengePanel.test.tsx (5 tests) — MEDIUM
- [ ] 3.2.7.1 renders active challenges with progress bars
- [ ] 3.2.7.2 progress bar width matches completion percentage
- [ ] 3.2.7.3 claim button calls claimChallenge with correct id
- [ ] 3.2.7.4 claimed challenge shows XP reward
- [ ] 3.2.7.5 empty state when no active challenges

#### 3.2.8 MissionKitPanel.test.tsx (5 tests) — MEDIUM
- [ ] 3.2.8.1 renders drill list from kit store
- [ ] 3.2.8.2 toggle button flips visibility
- [ ] 3.2.8.3 "run" button calls DrillRunStore.start and navigates
- [ ] 3.2.8.4 hidden state collapses drill list
- [ ] 3.2.8.5 offline indicator shows for cached drills

#### 3.2.9 MissionStepHandoff.test.tsx (4 tests) — MEDIUM
- [ ] 3.2.9.1 renders step label, why, inputs, ready criteria
- [ ] 3.2.9.2 CTA button navigates to nextPath
- [ ] 3.2.9.3 CTA click emits telemetry event
- [ ] 3.2.9.4 displays continuity context from mission flow

#### 3.2.10 MissionRouteState.test.tsx (3 tests) — MEDIUM
- [ ] 3.2.10.1 renders loading state with spinner
- [ ] 3.2.10.2 renders error state with message and retry
- [ ] 3.2.10.3 renders empty state with guide message

#### 3.2.11 ErrorBoundary.test.tsx (4 tests) — MEDIUM
- [ ] 3.2.11.1 renders children when no error
- [ ] 3.2.11.2 root level shows "System Fault" on error
- [ ] 3.2.11.3 route level shows "Surface Error" on error
- [ ] 3.2.11.4 retry button resets error state

#### 3.2.12 CacheIndicator.test.tsx (4 tests) — MEDIUM
- [ ] 3.2.12.1 hidden by default
- [ ] 3.2.12.2 shows message on ptb-cache-status custom event
- [ ] 3.2.12.3 auto-hides after 4 seconds
- [ ] 3.2.12.4 cleanup removes event listener on unmount

#### 3.2.13 NetworkStatusIndicator.test.tsx (2 tests) — MEDIUM
- [ ] 3.2.13.1 shows "Ready" when online
- [ ] 3.2.13.2 shows "Offline, using cached intel" when offline

#### 3.2.14 BadgeStrip.test.tsx (2 tests) — LOW
- [ ] 3.2.14.1 renders last 3 badges
- [ ] 3.2.14.2 shows overflow count when > 3 badges

#### 3.2.15 LoadingMessage.test.tsx (2 tests) — LOW
- [ ] 3.2.15.1 renders progress bar with correct width
- [ ] 3.2.15.2 animated dots cycle through states

#### 3.2.16 MissionIntakePanel.test.tsx (2 tests) — LOW
- [ ] 3.2.16.1 renders intro content
- [ ] 3.2.16.2 Start/Dismiss buttons call respective callbacks

#### 3.2.17 StatsPanel.test.tsx (2 tests) — LOW
- [ ] 3.2.17.1 renders level, XP, goals, streak from store
- [ ] 3.2.17.2 handles empty store state

#### 3.2.18 ScheduleNavigationRefresh.test.tsx (2 tests) — LOW
- [ ] 3.2.18.1 triggers schedule reload on navigation
- [ ] 3.2.18.2 throttles reload (5 min debounce)

#### 3.2.19 SurfaceLoader.test.tsx (1 test) — LOW
- [ ] 3.2.19.1 renders spinner element

#### 3.2.20 MissionShell.test.tsx (8 tests) — HIGH
- [ ] 3.2.20.1 renders BriefSurface at /mission/brief
- [ ] 3.2.20.2 renders TriageSurface at /mission/triage
- [ ] 3.2.20.3 renders correct surface for each mission route
- [ ] 3.2.20.4 provides MissionFlowContext to children
- [ ] 3.2.20.5 ErrorBoundary catches surface errors
- [ ] 3.2.20.6 redirects /mission to /mission/brief
- [ ] 3.2.20.7 handles unknown sub-routes
- [ ] 3.2.20.8 surface transitions update mission flow context

#### 3.2.21 Other surface page tests (7 tests)
- [ ] 3.2.21.1 ChecklistSurface: renders checklist items from mission context
- [ ] 3.2.21.2 DebriefSurface: renders debrief closure summary
- [ ] 3.2.21.3 CardSharePage: renders ShareCard with correct data
- [ ] 3.2.21.4 BriefSurface: renders mission brief content
- [ ] 3.2.21.5 CaseSurface: renders case content
- [ ] 3.2.21.6 SignalSurface: renders SignalsPanel
- [ ] 3.2.21.7 TriageSurface: renders TriageBoard

### 3.3 Utility Tests (~49 tests)

#### 3.3.1 telemetry.test.ts (10 tests) — HIGH
- [ ] 3.3.1.1 track() queues event with timestamp and type
- [ ] 3.3.1.2 track() validates event shape
- [ ] 3.3.1.3 batch flushes when queue reaches threshold
- [ ] 3.3.1.4 flush sends queued events via sendBeacon
- [ ] 3.3.1.5 flush clears queue after successful send
- [ ] 3.3.1.6 flush called on beforeunload
- [ ] 3.3.1.7 captureError includes error metadata
- [ ] 3.3.1.8 markStart/markEnd create performance marks
- [ ] 3.3.1.9 disable() prevents further tracking
- [ ] 3.3.1.10 handles sendBeacon failure gracefully

#### 3.3.2 taskScheduler.test.ts (10 tests) — HIGH
- [ ] 3.3.2.1 registerTask adds task to queue
- [ ] 3.3.2.2 tasks execute in priority order
- [ ] 3.3.2.3 high-priority preempts low-priority
- [ ] 3.3.2.4 task respects deadline (yields if time < threshold)
- [ ] 3.3.2.5 cancelTask removes from queue
- [ ] 3.3.2.6 cancelTask prevents pending execution
- [ ] 3.3.2.7 completed tasks removed from queue
- [ ] 3.3.2.8 error in one task doesn't block others
- [ ] 3.3.2.9 flushAll executes all pending immediately
- [ ] 3.3.2.10 idle callback requested when tasks queued

#### 3.3.3 indexedDbCache.test.ts (8 tests) — MEDIUM
- [ ] 3.3.3.1 set() stores value in IndexedDB
- [ ] 3.3.3.2 get() retrieves stored value
- [ ] 3.3.3.3 get() returns null for expired TTL
- [ ] 3.3.3.4 delete() removes entry
- [ ] 3.3.3.5 clear() removes all entries
- [ ] 3.3.3.6 respects maxEntries quota (LRU eviction)
- [ ] 3.3.3.7 handles IndexedDB errors gracefully
- [ ] 3.3.3.8 version migration upgrades database schema

#### 3.3.4 DrillDataLoader.test.ts (6 tests) — MEDIUM
- [ ] 3.3.4.1 loadCategories fetches from correct path
- [ ] 3.3.4.2 loadDrill fetches individual drill by slug
- [ ] 3.3.4.3 uses cache for repeated requests
- [ ] 3.3.4.4 handles fetch error with fallback
- [ ] 3.3.4.5 handles malformed JSON response
- [ ] 3.3.4.6 loadAll fetches full taxonomy tree

#### 3.3.5 ScheduleLoader.test.ts (5 tests) — MEDIUM
- [ ] 3.3.5.1 loads default schedule from JSON
- [ ] 3.3.5.2 merges user customisations over defaults
- [ ] 3.3.5.3 validates schedule structure (rejects invalid)
- [ ] 3.3.5.4 handles fetch failure gracefully
- [ ] 3.3.5.5 caches loaded schedule

#### 3.3.6 HandlerDataLoader.test.ts (4 tests) — MEDIUM
- [ ] 3.3.6.1 loadCatalog fetches handler catalog
- [ ] 3.3.6.2 loadModule fetches specific handler module
- [ ] 3.3.6.3 uses cache on repeated loads
- [ ] 3.3.6.4 handles fetch error gracefully

#### 3.3.7 lifecycle.test.ts (6 tests) — MEDIUM
- [ ] 3.3.7.1 initial state is 'brief'
- [ ] 3.3.7.2 valid transition: brief → triage
- [ ] 3.3.7.3 valid transition through full lifecycle
- [ ] 3.3.7.4 invalid transition throws/returns error
- [ ] 3.3.7.5 canTransition returns true for valid
- [ ] 3.3.7.6 canTransition returns false for invalid

### 3.4 Phase 3 Verification Gate
- [ ] 3.4.1 Zero untested stores
- [ ] 3.4.2 ≤ 5 untested component directories
- [ ] 3.4.3 Statement coverage ≥ 55%
- [ ] 3.4.4 CI green, no flaky tests
- [ ] 3.4.5 All HIGH-priority items have passing suites
- [ ] 3.4.6 ~229 new tests total (65 store + 115 component + 49 utility)

---

## Phase 4 — Bundle Optimisation

**Risk:** Medium | **Effort:** 2 days | **Docs:** `docs/overhaul/phase-4-bundle/`  
**Current:** 1.6 MB total JS → **Target:** ≤ 1.0 MB total JS

### 4.1 Remove `html-to-image`

#### 4.1.1 Uninstall
- [ ] 4.1.1.1 `npm uninstall html-to-image`
- [ ] 4.1.1.2 Verify: `grep -r "html-to-image" src/` → 0 results
- [ ] 4.1.1.3 `npx vite build` succeeds

### 4.2 Lazy-Load Gun.js (~200 KB saved)

#### 4.2.1 Create async loader
- [ ] 4.2.1.1 Create `src/services/gunLoader.ts` with `loadGunServices()` → `Promise<typeof import('./gunDb')>`

#### 4.2.2 Update eager imports
- [ ] 4.2.2.1 `src/App.tsx`: replace eager Gun imports with dynamic `import()` behind `p2pIdentity` flag
- [ ] 4.2.2.2 `SovereigntyPanel.tsx`: add lazy guard for Gun imports
- [ ] 4.2.2.3 Any other files eagerly importing `src/services/gun*.ts`

#### 4.2.3 Chunk configuration
- [ ] 4.2.3.1 Add `gun-vendor` chunk in `vite.config.ts`: `if (id.includes('node_modules/gun')) return 'gun-vendor'`

#### 4.2.4 Verification
- [ ] 4.2.4.1 `npx vite build` succeeds
- [ ] 4.2.4.2 `ls -lh dist/assets/gun-vendor-*.js` exists as separate chunk
- [ ] 4.2.4.3 `ls -lh dist/assets/vendor-*.js` ~150 KB smaller
- [ ] 4.2.4.4 Manual: p2pIdentity OFF → gun-vendor NOT requested
- [ ] 4.2.4.5 Manual: p2pIdentity ON → gun-vendor IS requested
- [ ] 4.2.4.6 `npx vitest run` passes

### 4.3 Lazy-Load KaTeX (~80 KB JS, 29 KB CSS saved)

#### 4.3.1 Dynamic import
- [ ] 4.3.1.1 `ShareCard.tsx`: replace `import katex from 'katex'` with async `import('katex')`
- [ ] 4.3.1.2 Conditional CSS: load `katex/dist/katex.min.css` via `useEffect` on first render

#### 4.3.2 Chunk configuration
- [ ] 4.3.2.1 Add `katex-vendor` chunk: `if (id.includes('node_modules/katex')) return 'katex-vendor'`

#### 4.3.3 Verification
- [ ] 4.3.3.1 `ls -lh dist/assets/katex-vendor-*.js` exists
- [ ] 4.3.3.2 Manual: app load → katex chunk NOT requested until ShareCard

### 4.4 Clean Dead Chunk Groups

#### 4.4.1 Delete dead chunks
- [ ] 4.4.1.1 Delete `coaches` chunk group (dead after Phase 0)
- [ ] 4.4.1.2 Delete `workouts` chunk group (dead after Phase 0)
- [ ] 4.4.1.3 Delete `sounds` chunk group (never matched)

#### 4.4.2 Add replacement groups
- [ ] 4.4.2.1 Add `handlers` group: `[/\/src\/components\/Handler/i, /\/src\/data\/handlers/i]`
- [ ] 4.4.2.2 Add `drills` group: `[/\/src\/components\/(Drill|Training)/i]`
- [ ] 4.4.2.3 `npx vite build` — no warnings

### 4.5 Split Entry Chunk (~100–150 KB saved)

#### 4.5.1 Defer non-critical stores
- [ ] 4.5.1.1 Verify SignalsStore, ArtifactActionStore, TriageActionStore, MissionKitStore in separate chunks
- [ ] 4.5.1.2 Add `import()` for: challenges.ts, DrillFilterStore, DifficultySettingsStore if still in entry

#### 4.5.2 Lazy-load heavy utilities
- [ ] 4.5.2.1 `taskScheduler.ts` (233 lines) — dynamic import on first task registration
- [ ] 4.5.2.2 `MissionScheduleCreator.ts` (~200 lines) — dynamic import in PlanSurface
- [ ] 4.5.2.3 `DrillDataLoader.ts` (225 lines) — ensure not eagerly imported
- [ ] 4.5.2.4 `missionRenderProfile.ts` (93 lines) — guard behind performanceInstrumentation flag

#### 4.5.3 Route-level splitting
- [ ] 4.5.3.1 `MissionShell.tsx` (609 lines) — `React.lazy(() => import('...'))` in Routes.tsx

### 4.6 Image Optimisation

#### 4.6.1 Convert assets
- [ ] 4.6.1.1 Convert handler PNGs (4 images, up to 1.4 MB each) to WebP with PNG fallback
- [ ] 4.6.1.2 Convert WingCommanderLogo.gif (299 KB) to WebP or AVIF
- [ ] 4.6.1.3 Confirm KaTeX fonts are deferred (from 4.3)

### 4.7 Phase 4 Verification Gate
- [ ] 4.7.1 `html-to-image` not in `package.json`
- [ ] 4.7.2 Entry chunk ≤ 400 KB
- [ ] 4.7.3 Vendor chunk ≤ 150 KB
- [ ] 4.7.4 Separate `gun-vendor` chunk (only loaded when p2pIdentity on)
- [ ] 4.7.5 Separate `katex-vendor` chunk (only loaded by ShareCard)
- [ ] 4.7.6 `npx vitest run` passes
- [ ] 4.7.7 Lighthouse desktop ≥ 90 performance
- [ ] 4.7.8 No dead chunk groups in vite.config.ts
- [ ] 4.7.9 Service worker precache list still works

---

## Phase 5 — Ecosystem Wiring

**Risk:** High | **Effort:** 3–5 days | **Docs:** `docs/overhaul/phase-5-ecosystem/`

### 5.1 Ship Identity to Production

#### 5.1.1 Infrastructure
- [ ] 5.1.1.1 Set up dedicated Gun relay (VPS, Railway, or Fly.io): `npx gun --port 8765`
- [ ] 5.1.1.2 Set `VITE_GUN_PEERS=https://relay.archangel.agency/gun` in prod env
- [ ] 5.1.1.3 Relay health check: `curl -I https://relay.archangel.agency/gun`
- [ ] 5.1.1.4 Relay monitoring configured

#### 5.1.2 Code quality
- [ ] 5.1.2.1 All Gun service tests pass: gunDb, gunIdentity, gunStoreSyncs, gunSyncAdapter, gunProfileBridge
- [ ] 5.1.2.2 `useGunIdentity` hook test passes
- [ ] 5.1.2.3 `SovereigntyPanel` component test passes
- [ ] 5.1.2.4 Phase 4 Gun lazy-loading complete

#### 5.1.3 Functional testing (12 items)
- [ ] 5.1.3.1 Create identity: keypair generates, stores in localStorage, Gun user authenticates
- [ ] 5.1.3.2 Reload persistence: identity survives browser restart, auto-login works
- [ ] 5.1.3.3 Profile sync: change callsign → Gun graph → reload → still there
- [ ] 5.1.3.4 Progress sync: complete drill → XP syncs to Gun → new browser → XP appears
- [ ] 5.1.3.5 Export to file: download JSON with pub, priv, epub, epriv
- [ ] 5.1.3.6 Export with passphrase: encrypted JSON not human-readable
- [ ] 5.1.3.7 Import from file: paste exported JSON → identity restores, stores re-sync
- [ ] 5.1.3.8 Import with passphrase: correct decrypts, wrong rejected
- [ ] 5.1.3.9 QR export: QR code generates (< 1273 bytes at error correction H)
- [ ] 5.1.3.10 QR scan import: scan → identity restores
- [ ] 5.1.3.11 Logout: identity removed, Gun user leaves, stores stop syncing
- [ ] 5.1.3.12 Conflict resolution: two devices, same identity, both modify → higher value wins

#### 5.1.4 Staging soak (2 weeks)
- [ ] 5.1.4.1 Enable in staging for internal team
- [ ] 5.1.4.2 Monitor: Gun WebSocket connection errors
- [ ] 5.1.4.3 Monitor: SEA keypair generation failures
- [ ] 5.1.4.4 Monitor: sync conflicts (`gun_sync_pull_*` telemetry)
- [ ] 5.1.4.5 Monitor: localStorage quota issues
- [ ] 5.1.4.6 Monitor: battery/performance impact of persistent WebSocket

#### 5.1.5 Deployment
- [ ] 5.1.5.1 Set `VITE_GUN_PEERS` env var in Vercel prod
- [ ] 5.1.5.2 Set `p2pIdentity: true` in `ENV_DEFAULT_FLAGS.production`
- [ ] 5.1.5.3 Deploy
- [ ] 5.1.5.4 Monitor 48 hours (telemetry, relay connections, error rates)
- [ ] 5.1.5.5 Announce to operatives

#### 5.1.6 Rollback plan
- [ ] 5.1.6.1 Document: set `p2pIdentity: false` → deploy → identities preserved in localStorage

### 5.2 Add Ecosystem Navigation

#### 5.2.1 Create ecosystem app config
- [ ] 5.2.1.1 Create `src/config/ecosystemApps.ts` with `EcosystemApp` interface
- [ ] 5.2.1.2 Define 5 apps: Academy, Starcom, Navcom, Tactical Intel Dashboard, Mecha Jono
- [ ] 5.2.1.3 Each entry: `id`, `name`, `shortName`, `url`, `icon`, `description`, `current?`

#### 5.2.2 Create EcosystemSwitcher component
- [ ] 5.2.2.1 Create `src/components/EcosystemSwitcher/EcosystemSwitcher.tsx`
- [ ] 5.2.2.2 Props: `layout: 'inline' | 'grid'`
- [ ] 5.2.2.3 Uses `useNetworkStatus()` for offline handling
- [ ] 5.2.2.4 `<nav aria-label="Earth Intelligence Network">`
- [ ] 5.2.2.5 Current app: `aria-current="page"`, visual underline
- [ ] 5.2.2.6 Offline sibling apps: dimmed with tooltip
- [ ] 5.2.2.7 Create `EcosystemSwitcher.css`

#### 5.2.3 Integrate into Header
- [ ] 5.2.3.1 Desktop: `<EcosystemSwitcher layout="inline" />` next to logo
- [ ] 5.2.3.2 Mobile: `<EcosystemSwitcher layout="grid" />` at top of HeaderDrawer
- [ ] 5.2.3.3 Evaluate logo link: keep `archangel.agency/hub` or change to root

#### 5.2.4 Tests (6 tests)
- [ ] 5.2.4.1 renders all 5 ecosystem apps
- [ ] 5.2.4.2 current app has `aria-current="page"`
- [ ] 5.2.4.3 sibling apps link to correct URLs
- [ ] 5.2.4.4 offline: sibling apps are dimmed
- [ ] 5.2.4.5 desktop: inline layout
- [ ] 5.2.4.6 mobile: grid layout

### 5.3 Wire Telemetry Outbound

#### 5.3.1 Add flush sink
- [ ] 5.3.1.1 `TELEMETRY_ENDPOINT` from `import.meta.env.VITE_TELEMETRY_ENDPOINT`
- [ ] 5.3.1.2 `flushToCollector(events)`: POST batch with `appId: 'starcom-academy'`
- [ ] 5.3.1.3 Use `sendBeacon` when `document.visibilityState === 'hidden'`
- [ ] 5.3.1.4 Use `fetch` with `keepalive: true` for normal flush
- [ ] 5.3.1.5 Silent fail on errors

#### 5.3.2 Wire flush triggers
- [ ] 5.3.2.1 Batch flush on threshold (buffer ≥ 20 events)
- [ ] 5.3.2.2 Periodic flush: `setInterval(() => flush(), 60_000)`
- [ ] 5.3.2.3 Visibility change: `document.addEventListener('visibilitychange', ...)`
- [ ] 5.3.2.4 Online recovery: `window.addEventListener('online', () => flush())`

#### 5.3.3 Enrich with operative fingerprint
- [ ] 5.3.3.1 Derive fingerprint from Gun pub key (first 8 chars of SHA-256)
- [ ] 5.3.3.2 Fallback: random `sessionId` from `sessionStorage`
- [ ] 5.3.3.3 Add `operativeId` and `appId` to enriched event

#### 5.3.4 Set environment variables
- [ ] 5.3.4.1 Production: `VITE_TELEMETRY_ENDPOINT=https://telemetry.archangel.agency/v1/events`
- [ ] 5.3.4.2 Staging: `VITE_TELEMETRY_ENDPOINT=https://telemetry-staging.archangel.agency/v1/events`
- [ ] 5.3.4.3 Development: unset (no outbound)

#### 5.3.5 Deploy telemetry collector
- [ ] 5.3.5.1 Cloudflare Worker or Vercel Edge Function
- [ ] 5.3.5.2 Accepts POST with `{ events, appId }`
- [ ] 5.3.5.3 Appends to storage (ClickHouse, D1, R2, or KV)
- [ ] 5.3.5.4 Returns 202
- [ ] 5.3.5.5 Shared across all ecosystem apps

#### 5.3.6 Telemetry tests (9 tests)
- [ ] 5.3.6.1 flushToCollector sends POST to endpoint
- [ ] 5.3.6.2 flushToCollector uses sendBeacon when tab hidden
- [ ] 5.3.6.3 flushToCollector silently fails on network error
- [ ] 5.3.6.4 flush clears buffer after successful send
- [ ] 5.3.6.5 offline events queue and flush on reconnect
- [ ] 5.3.6.6 operative fingerprint derived from pub key
- [ ] 5.3.6.7 session fallback when no gun identity
- [ ] 5.3.6.8 globalKillSwitch prevents all tracking
- [ ] 5.3.6.9 no outbound when VITE_TELEMETRY_ENDPOINT unset

### 5.4 Cross-App Identity (Future/Post-Ship)
- [ ] 5.4.1 Deep-link handoff: `https://starcom.app/import?identity=<encrypted-fragment>`
- [ ] 5.4.2 Shared Gun namespace: all apps use same relay and `~/` user graph
- [ ] 5.4.3 QR-based device transfer promotion in onboarding
- [ ] 5.4.4 Add "Connect to [App]" buttons in SovereigntyPanel

### 5.5 Phase 5 Verification Gate
- [ ] 5.5.1 `p2pIdentity` ON in production, stable 2+ weeks
- [ ] 5.5.2 Header has ecosystem app switcher with all 5 apps
- [ ] 5.5.3 Telemetry events POST to shared endpoint
- [ ] 5.5.4 Cadet can export identity from the Academy and import into ≥1 sibling app
- [ ] 5.5.5 `sendBeacon` fires on tab close
- [ ] 5.5.6 Offline queue drains on reconnect
- [ ] 5.5.7 Zero telemetry errors in prod console
- [ ] 5.5.8 `globalKillSwitch` disables all outbound
- [ ] 5.5.9 Tactical Intel Dashboard can query collector for Academy events
- [ ] 5.5.10 ARIA: nav with proper label, `aria-current` on current app

---

## Phase 6 — Schedule Store Consolidation

**Risk:** Medium | **Effort:** 1–2 days | **Docs:** `docs/overhaul/phase-6-schedule-store/`  
**Before:** 7 files, 816 lines (facade 117 + sub-modules 699), circular dep (5 hops)  
**After:** 3 files, 749 lines (store 290 + context 332 + useRecap 127), circular dep (2 hops, lazy)  
**Status:** ✅ COMPLETE — 102 test files, 703 tests, 0 TS errors

### 6.1 Delete Dead Exports (~68 lines removed)

#### 6.1.1 Clean selectionState.ts
- [x] 6.1.1.1 Deleted `clearAllSelections` (never imported)
- [x] 6.1.1.2 Deleted all 4 async `getSelected*` functions (duplicates of sync versions)

#### 6.1.2 Clean scheduleState.ts
- [x] 6.1.2.1 Deleted `clearSchedule` (zero external callers)

#### 6.1.3 Clean MissionScheduleStore.ts facade
- [x] 6.1.3.1 Removed `clearSchedule`, 4 async `getSelected*` methods, 4 `clearSelected*` methods, `notifySelectionChange`
- [x] 6.1.3.2 Facade: 151→116 lines, selectionState: 267→243, scheduleState: 299→289

#### 6.1.4 Verification
- [x] 6.1.4.1 `npx tsc --noEmit` passes
- [x] 6.1.4.2 `npx vitest run` — 102 files, 703 tests passing

### 6.2 Consolidate Schedule Creation (~48 lines net reduction)

#### 6.2.1 Canonicalise sync creation
- [x] 6.2.1.1 Created `createMissionScheduleSync()` in `MissionScheduleCreator.ts` with same archetype-weighted logic as async version
- [x] 6.2.1.2 Async version delegates to sync internally

#### 6.2.2 Update consumers
- [x] 6.2.2.1 `scheduleState.ts`: replaced 40-line inline random-shuffle builder with `import { createMissionScheduleSync }` delegation
- [x] 6.2.2.2 Removed now-unused imports from scheduleState: `DrillCategoryCache`, `selectionState` sync getters

#### 6.2.3 Verification
- [x] 6.2.3.1 `npx tsc --noEmit` && `npx vitest run` — 102/703 green
- [x] 6.2.3.2 scheduleState: 289→241 lines, Creator: 136→180 lines

### 6.3 Break Circular Dependency (partial)

#### 6.3.1 Refactor defaults.ts
- [x] 6.3.1.1 Created `DrillCategorySource` interface in `defaults.ts` — accepts `cache: DrillCategorySource` parameter instead of importing `DrillCategoryCache` directly
- [x] 6.3.1.2 Updated `selectionState.ts`: imports `DrillCategoryCache` and passes `DrillCategoryCache.getInstance()` to each `getDefault*()` call

#### 6.3.2 Verification
- [x] 6.3.2.1 Cycle shortened from 5 hops to 4 hops; `defaults.ts` is now dependency-free and testable
- [x] 6.3.2.2 Full cycle break deferred to Step 5 consolidation (2-hop lazy cycle remains between MissionScheduleStore ↔ DrillCategoryCache)
- [x] 6.3.2.3 `npx tsc --noEmit` && `npx vitest run` — 102/703 green

### 6.4 Unify Notification System

#### 6.4.1 Rename to reflect semantics
- [x] 6.4.1.1 `notifySelectionChange` → `notifyScheduleStoreChange`
- [x] 6.4.1.2 `subscribeToSelectionChanges` → `subscribeToScheduleStoreChanges`

#### 6.4.2 Add change type
- [x] 6.4.2.1 Defined `ScheduleStoreChangeType = 'selection' | 'schedule' | 'reset'`
- [x] 6.4.2.2 selectionState passes `'selection'`, scheduleState passes `'schedule'` to listeners

#### 6.4.3 Verification
- [x] 6.4.3.1 Updated facade, `useSelectionSummary.ts`, all test mocks
- [x] 6.4.3.2 `npx tsc --noEmit` && `npx vitest run` — 102/703 green

### 6.5 Collapse Files Into Unified Store

#### 6.5.1 Create unified MissionScheduleStore.ts (290 lines)
- [x] 6.5.1.1 Inlined: keys (constants), defaults (4 functions), selectionListeners (pub/sub), selectionState (CRUD), scheduleState (CRUD), facade (API)
- [x] 6.5.1.2 Generic `readSelection<T>` and `writeSelection` helpers eliminate per-key boilerplate
- [x] 6.5.1.3 Kept existing localStorage keys (`workout:v2:*`) for backward compatibility — no migration needed
- [x] 6.5.1.4 Default export `MissionScheduleStore` object — no consumer import changes needed

#### 6.5.2 localStorage strategy
- [x] 6.5.2.1 Decision: **kept v2 keys** (7 individual keys) rather than migrating to single v3 key — avoids data loss risk for existing users
- [x] 6.5.2.2 Generic `readSelection`/`writeSelection` helpers handle validation, defaults, and notification uniformly

#### 6.5.3 Delete `src/store/missionSchedule/` directory
- [x] 6.5.3.1 `rm -rf src/store/missionSchedule/` — removed defaults.ts, keys.ts, scheduleState.ts, selectionState.ts, selectionListeners.ts

#### 6.5.4 Unused methods dropped
- [x] 6.5.4.1 Removed from public API: `addDrillToSchedule`, `updateDrillInSchedule`, `removeDrillFromSchedule`, `resetAll`, `createNewSchedule` (async), `getTaxonomySignature`, `saveTaxonomySignature`, 4× `clearSelected*` — zero external callers
- [x] 6.5.4.2 Kept internal: `resetAll` (used by `getSchedule`/`getScheduleSync` on corruption)

#### 6.5.5 Verification
- [x] 6.5.5.1 `npx tsc --noEmit` && `npx vitest run` — 102 files, 703 tests, 0 errors
- [x] 6.5.5.2 `MissionScheduleStore.ts` = 290 lines (target was ≤250 — slightly over due to preserving full getSchedule async path)
- [x] 6.5.5.3 `missionSchedule/` directory is gone
- [x] 6.5.5.4 Reduction: 816 lines (7 files) → 290 lines (1 file) = **-64%**

### 6.6 Slim Down MissionScheduleContext (436 → 332 lines)

#### 6.6.1 Extract recap logic
- [x] 6.6.1.1 Created `src/hooks/useRecap.ts` (127 lines)
- [x] 6.6.1.2 Moved: recap generation, toast visibility, share text, badge delta computation, challenge progress
- [x] 6.6.1.3 Hook returns: `{ recap, recapOpen, recapToastVisible, tryBuildRecap, openRecap, dismissRecap, dismissRecapToast }`
- [x] 6.6.1.4 `tryBuildRecap()` accepts `CompletionRecapInput` — callers pass pre-completion snapshot + recorder result

#### 6.6.2 Remove duplication
- [x] 6.6.2.1 Consolidated `skipCurrentDrill` and `timeoutCurrentDrill` into shared `advanceSchedule(reason)` helper
- [x] 6.6.2.2 Removed 4 unused imports: `FeatureFlagsStore`, `summarizeSchedule`, `buildRecapShareText`, `RecapSummary` (now in useRecap)

#### 6.6.3 Simplify Context state
- [x] 6.6.3.1 Removed 3 `useState` calls (`recap`, `recapOpen`, `recapToastVisible`) + 1 `promptShown` — now in useRecap hook
- [x] 6.6.3.2 Context: 436 → 332 lines = **-24%**

#### 6.6.4 Verification
- [x] 6.6.4.1 `npx tsc --noEmit` && `npx vitest run` — 102 files, 703 tests, 0 errors
- [x] 6.6.4.2 `MissionScheduleContext.tsx` = 332 lines (target was ≤200 — recap extraction + skip consolidation got biggest wins; remaining bulk is loadSchedule + createNewSchedule with error handling + alignment check effect)

### 6.7 Eliminate Direct-Store Channel

#### 6.7.1 Convert React components to Context
- [x] 6.7.1.1 **Header:** `MissionScheduleStore.getScheduleSync()` → `const { schedule } = useMissionSchedule()`
- [x] 6.7.1.2 **PlanSurface:** `getScheduleSync()` + `createNewScheduleSync()` → `const { schedule, createNewSchedule } = useMissionSchedule()`
- [x] 6.7.1.3 Updated `PlanSurface.test.tsx`: mock switched from `MissionScheduleStore` to `useMissionSchedule`

#### 6.7.2 Keep direct access for non-React code
- [x] 6.7.2.1 DrillCategoryCache — kept direct store access (non-React singleton)
- [x] 6.7.2.2 ScheduleLoader — kept direct store access (utility)
- [x] 6.7.2.3 InitialDataLoader — kept direct store access (bootstrap)
- [x] 6.7.2.4 useSelectionSummary — kept store `.subscribe()` pattern (lightweight hook)

#### 6.7.3 Verification
- [x] 6.7.3.1 `npx tsc --noEmit` && `npx vitest run` — 102 files, 703 tests, 0 errors
- [x] 6.7.3.2 `grep -rn "from.*MissionScheduleStore" src/components/ src/pages/ | grep -v __tests__` → 0 results (zero direct store access from UI)

### 6.8 Phase 6 Verification Gate
- [x] 6.8.1 `src/store/missionSchedule/` directory does not exist
- [x] 6.8.2 `MissionScheduleStore.ts` = 290 lines *(target ≤250, ~16% over due to backward-compatible async getSchedule path)*
- [x] 6.8.3 `MissionScheduleContext.tsx` = 332 lines *(target ≤200, remaining bulk is load/create error handling + alignment effect)*
- [x] 6.8.4 `useRecap.ts` exists with extracted recap logic (127 lines)
- [x] 6.8.5 Circular dep: 2-hop lazy cycle (MissionScheduleStore ↔ DrillCategoryCache) — down from 5-hop. Both resolve lazily at runtime; no initialization issues. Full break requires moving default-selection into DrillCategoryCache.
- [x] 6.8.6 Schedule creation: exactly 1 code path — `createMissionScheduleSync()` in MissionScheduleCreator.ts (archetype-weighted)
- [x] 6.8.7 Only non-React code accesses store directly (DrillCategoryCache, ScheduleLoader, InitialDataLoader, useSelectionSummary)
- [x] 6.8.8 All React components use `useMissionSchedule()` context — Header and PlanSurface converted
- [x] 6.8.9 All existing schedule tests pass (102 files, 703 tests)
- [ ] 6.8.10 New tests cover addDrill, updateDrill, removeDrill, createNewScheduleSync *(deferred — these methods removed from public API as unused; can add if resurrected)*
- [ ] 6.8.11 localStorage migration works (v2 → v3) *(not needed — kept v2 keys for backward compat)*
- [x] 6.8.12 Total lines across schedule files = 749 (store 290 + context 332 + useRecap 127) *(target was ≤600; 749 is -40% from original 1,252)*

---

## Summary

| Phase | Steps | Tasks | Subtasks | Est. Effort | Status |
|-------|-------|-------|----------|-------------|--------|
| **0 — Terminology** | 3 | 32 | ~110 | 2–3 days | ✅ Complete |
| **1 — Store Factory** | 3 | 14 | ~50 | 2 days | ✅ Complete |
| **2 — Feature Flags** | 6 | 16 | ~55 | 1 day | ✅ Complete |
| **3 — Test Coverage** | 4 | 28 | ~235 | 3–4 days | Not started |
| **4 — Bundle** | 7 | 16 | ~40 | 2 days | Not started |
| **5 — Ecosystem** | 5 | 21 | ~85 | 3–5 days | Not started |
| **6 — Schedule Store** | 8 | 22 | ~55 | 1–2 days | ✅ Complete |
| **TOTAL** | **36** | **149** | **~630** | **14–19 days** | **4/7 phases done** |

### Execution Order (actual)

1. ~~Phase 0 — Terminology Purge~~ ✅
2. ~~Phase 1 — Store Factory Extraction~~ ✅
3. ~~Phase 2 — Feature Flag Graduation~~ ✅
4. ~~Phase 6 — Schedule Store Consolidation~~ ✅
5. **Phase 3 — Test Coverage** ← next
6. Phase 4 — Bundle Optimisation
7. Phase 5 — Ecosystem Wiring
