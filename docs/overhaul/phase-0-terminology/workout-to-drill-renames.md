# Stream A: workout → drill Renames

Every identifier that needs renaming, organised by file. Each entry shows the current identifier → new identifier.

**Rule:** Only rename code identifiers (variable names, function names, method names, parameter names, comments). Do NOT rename localStorage key strings or JSON data file names.

---

## src/cache/DrillCategoryCache.ts (380 lines)

| Line | Current | New |
|------|---------|-----|
| 32 | `loadData(workoutCategories: DrillCategory[])` | `loadData(drillCategories: DrillCategory[])` |
| 38 | `${workoutCategories.length} drill categories` | `${drillCategories.length} drill categories` |
| 40 | `workoutCategories.forEach(category =>` | `drillCategories.forEach(category =>` |
| 58 | `this.computeTaxonomySignature(workoutCategories)` | `this.computeTaxonomySignature(drillCategories)` |
| 70 | `reloadData(workoutCategories: DrillCategory[])` | `reloadData(drillCategories: DrillCategory[])` |
| 79 | `getWorkoutCategories(): DrillCategory[]` | `getDrillCategories(): DrillCategory[]` |
| 80 | `// Return all WorkoutCategories from the cache` | `// Return all DrillCategories from the cache` |
| 84 | `fetchAllWorkoutsInCategory(categoryId)` | `fetchAllDrillsInCategory(categoryId)` |
| 98 | `getAllWorkoutsSelected(): Drill[]` | `getAllDrillsSelected(): Drill[]` |
| 114 | `getAllWorkouts(): Drill[]` | `getAllDrills(): Drill[]` |
| 157 | `toggleWorkoutSelection(id: string)` | `toggleDrillSelection(id: string)` |
| 168 | `workoutIds` (from buildPresetSelections) | `drillIds` |
| 170 | `if (workoutIds.size === 0)` | `if (drillIds.size === 0)` |
| 179 | `this.selectedDrills = workoutIds` | `this.selectedDrills = drillIds` |
| 220 | `isWorkoutSelected(id: string)` | `isDrillSelected(id: string)` |
| 232 | `computeTaxonomySignature(workoutCategories)` | `computeTaxonomySignature(drillCategories)` |
| 233 | `const parts = workoutCategories` | `const parts = drillCategories` |
| 239 | `const workoutParts = group.drills` | `const drillParts = group.drills` |
| 243 | `return \`${group.id}:${workoutParts}\`` | `return \`${group.id}:${drillParts}\`` |
| 259 | `getWorkoutsByDifficultyRange(...)` | `getDrillsByDifficultyRange(...)` |
| 275 | `getWorkoutsBySingleDifficultyLevel(...)` | `getDrillsBySingleDifficultyLevel(...)` |
| 276 | `return this.getWorkoutsByDifficultyRange(...)` | `return this.getDrillsByDifficultyRange(...)` |
| 279 | `getAllWorkoutsFilteredBy(...)` | `getAllDrillsFilteredBy(...)` |
| 285 | `console.log('getAllWorkoutsFilteredBy: filtering')` | `console.log('getAllDrillsFilteredBy: filtering')` |
| 309 | `console.warn('getAllWorkoutsFilteredBy: no drills selected?')` | `console.warn('getAllDrillsFilteredBy: no drills selected?')` |
| 311 | `console.log('getAllWorkoutsFilteredBy: selected...')` | `console.log('getAllDrillsFilteredBy: selected...')` |
| 340 | `const allWorkoutIds = new Set(...)` | `const allDrillIds = new Set(...)` |

**Downstream callers to update after renaming these methods:**
- Every file that calls `getWorkoutCategories()`, `getAllWorkouts()`, `getAllWorkoutsSelected()`, `toggleWorkoutSelection()`, `isWorkoutSelected()`, `getAllWorkoutsFilteredBy()`, `getWorkoutsByDifficultyRange()`, `getWorkoutsBySingleDifficultyLevel()`, `fetchAllWorkoutsInCategory()`

---

## src/types/MissionSchedule.ts

| Line | Current | New |
|------|---------|-----|
| 42 | `const hydrateWorkout = (...)` | `const hydrateDrill = (...)` |
| 43 | `const reconstructedWorkout = new Drill(...)` | `const reconstructedDrill = new Drill(...)` |
| 50 | `return [reconstructedWorkout, completed]` | `return [reconstructedDrill, completed]` |
| 53 | `const serializeWorkout = (drill)` | `const serializeDrill = (drill)` |
| 88 | `if (currentItem.allWorkoutsCompleted)` | `if (currentItem.allDrillsCompleted)` |
| 120 | `if (currentItem.allWorkoutsCompleted)` | `if (currentItem.allDrillsCompleted)` |
| 140 | `item.drills.map(hydrateWorkout)` | `item.drills.map(hydrateDrill)` |
| 152 | `[serializeWorkout(drill), completed]` | `[serializeDrill(drill), completed]` |
| 179 | `get allWorkoutsCompleted(): boolean` | `get allDrillsCompleted(): boolean` |

---

## src/store/MissionScheduleStore.ts

| Line | Current | New |
|------|---------|-----|
| 58 | `removeDrillFromSchedule(workoutId: string)` | `removeDrillFromSchedule(drillId: string)` |
| 59 | `return removeDrillFromSchedule(workoutId)` | `return removeDrillFromSchedule(drillId)` |

---

## src/store/missionSchedule/defaults.ts

| Line | Current | New |
|------|---------|-----|
| 5 | `.getWorkoutCategories()` | `.getDrillCategories()` |
| 14 | `.getWorkoutCategories()` | `.getDrillCategories()` |
| 25 | `.getWorkoutCategories()` | `.getDrillCategories()` |
| 35 | `const allWorkouts = ...getAllWorkouts()` | `const allDrills = ...getAllDrills()` |
| 36 | `return allWorkouts.reduce(...)` | `return allDrills.reduce(...)` |

---

## src/store/missionSchedule/keys.ts

**Note:** The localStorage key STRINGS must be preserved for backward compatibility. Only rename the COMMENTS.

| Line | Current | New |
|------|---------|-----|
| 2 | `// Keep legacy 'workout:' prefix for backward compatibility` | Keep as-is (this comment explains the legacy prefix) |

No identifier renames needed — only storage key strings exist here, which are preserved.

---

## src/store/missionSchedule/scheduleState.ts

| Line | Current | New |
|------|---------|-----|
| 50, 60, 68, 72, 91, 96, 100, 118 | `dataset: 'workout_schedule'` in `emitCacheMetric` | `dataset: 'mission_schedule'` |
| 168 | `const nextWorkouts = item.drills.map(...)` | `const nextDrills = item.drills.map(...)` |
| 175 | `return new MissionSet(nextWorkouts)` | `return new MissionSet(nextDrills)` |
| 193 | `removeDrillFromSchedule = (workoutId: string)` | `removeDrillFromSchedule = (drillId: string)` |
| 201 | `([w]) => w.id !== workoutId` | `([w]) => w.id !== drillId` |
| 297 | `.getAllWorkoutsFilteredBy(...)` | `.getAllDrillsFilteredBy(...)` |

---

## src/store/missionSchedule/selectionState.ts

| Line | Current | New |
|------|---------|-----|
| 257 | `dataset: 'workout_schedule'` | `dataset: 'mission_schedule'` |

---

## src/utils/MissionScheduleCreator.ts

| Line | Current | New |
|------|---------|-----|
| 82 | `const workoutCount = 10` | `const drillCount = 10` |
| 91 | `const drills = cache.getAllWorkoutsSelected()` | `const drills = cache.getAllDrillsSelected()` |
| 100 | `const filteredWorkouts = drills.filter(...)` | `const filteredDrills = drills.filter(...)` |
| 105 | `console.log('Filtered drills...', filteredWorkouts.length)` | `console.log('Filtered drills...', filteredDrills.length)` |
| 107 | `if (filteredWorkouts.length === 0)` | `if (filteredDrills.length === 0)` |
| 112 | `Math.min(workoutCount, filteredWorkouts.length)` | `Math.min(drillCount, filteredDrills.length)` |
| 117 | `const workoutsSlice = selectedDrills.slice(...)` | `const drillsSlice = selectedDrills.slice(...)` |
| 118 | `const workoutsWithCompletion = workoutsSlice.map(...)` | `const drillsWithCompletion = drillsSlice.map(...)` |
| 119 | `const missionSet = new MissionSet(workoutsWithCompletion)` | `const missionSet = new MissionSet(drillsWithCompletion)` |
| 137 | `const workoutCount = 8` | `const drillCount = 8` |
| 145 | `const drills = cache.getAllWorkouts()` | `const drills = cache.getAllDrills()` |
| 148 | `Math.min(workoutCount, drills.length)` | `Math.min(drillCount, drills.length)` |
| 157 | `const workoutsSlice = selectedDrills.slice(...)` | `const drillsSlice = selectedDrills.slice(...)` |
| 158 | `const workoutsWithCompletion = workoutsSlice.map(...)` | `const drillsWithCompletion = drillsSlice.map(...)` |
| 159 | `const missionSet = new MissionSet(workoutsWithCompletion)` | `const missionSet = new MissionSet(drillsWithCompletion)` |

---

## src/utils/DrillDataLoader.ts

| Line | Current | New |
|------|---------|-----|
| 27 | `workout_groups: DrillGroupJSON[]` | `drill_groups: DrillGroupJSON[]` |
| 82 | `Array.isArray(candidate.workout_groups)` | `Array.isArray(candidate.drill_groups)` |
| 83 | `candidate.workout_groups.every(isDrillGroupJSON)` | `candidate.drill_groups.every(isDrillGroupJSON)` |
| 109 | `const workoutCategories = await this.loadWorkoutCategories(...)` | `const drillCategories = await this.loadDrillCategories(...)` |
| 110 | `Fetched ${workoutCategories.length} drill categories` | `Fetched ${drillCategories.length} drill categories` |
| 111 | `return workoutCategories` | `return drillCategories` |
| 118 | `async loadWorkoutCategories(...)` | `async loadDrillCategories(...)` |
| 120 | `const workoutCategories: DrillCategory[] = []` | `const drillCategories: DrillCategory[] = []` |
| 123 | `let totalWorkouts = 0` | `let totalDrills = 0` |
| 159 | `subCategoryData.workout_groups.map(...)` | `subCategoryData.drill_groups.map(...)` |

**WARNING:** Line 27 (`workout_groups`) is a JSON schema field. Check if the corresponding JSON data files use this field name. If they do, changing it requires updating ALL JSON drill data files too, or adding an adapter. **Investigate before renaming.**

---

## src/utils/drillFilters.ts

| Line | Current | New |
|------|---------|-----|
| 39 | `const workoutEquipment = drill.equipment ?? []` | `const drillEquipment = drill.equipment ?? []` |
| 40 | `return hasOverlap(workoutEquipment, equipment)` | `return hasOverlap(drillEquipment, equipment)` |
| 45 | `const workoutThemes = drill.themes ?? []` | `const drillThemes = drill.themes ?? []` |
| 46 | `return hasOverlap(workoutThemes, themes)` | `return hasOverlap(drillThemes, themes)` |

---

## src/utils/drillPresets.ts

| Line | Current | New |
|------|---------|-----|
| 44 | `const workoutIds = new Set<string>()` | `const drillIds = new Set<string>()` |
| 55 | `workoutIds.add(drill.id)` | `drillIds.add(drill.id)` |
| 62 | `return { categoryIds, subCategoryIds, groupIds, workoutIds }` | `return { categoryIds, subCategoryIds, groupIds, drillIds }` |

**Downstream:** `DrillCategoryCache.applyPreset()` destructures `workoutIds` from this return value — update the destructuring there too.

---

## src/utils/InitialDataLoader.ts

| Line | Current | New |
|------|---------|-----|
| 4 | `import { totalWorkoutSubCategories }` | `import { totalDrillSubCategories }` (requires export rename in drillSubCategoryPaths.ts) |
| 28 | `const workoutDataLoader = new DrillDataLoader()` | `const drillDataLoader = new DrillDataLoader()` |
| 36 | `totalCardDecks + Object.keys(totalWorkoutSubCategories).length` | `totalCardDecks + Object.keys(totalDrillSubCategories).length` |
| 37 | `console.log('...Total CardDecks and WorkoutSubCategories...')` | `console.log('...Total CardDecks and DrillSubCategories...')` |
| 41 | `const workoutCategoriesPromise = this.loadWorkoutCategories(workoutDataLoader, ...)` | `const drillCategoriesPromise = this.loadDrillCategories(drillDataLoader, ...)` |
| 42 | `const schedulePromise = workoutCategoriesPromise.then(...)` | `const schedulePromise = drillCategoriesPromise.then(...)` |
| 47 | `["workoutCategories", workoutCategoriesPromise]` | `["drillCategories", drillCategoriesPromise]` |
| 92 | `private static async loadWorkoutCategories(...)` | `private static async loadDrillCategories(...)` |
| 99 | `const workoutCategories = await dataLoader.loadAllData(...)` | `const drillCategories = await dataLoader.loadAllData(...)` |
| 100 | `Loaded ${workoutCategories.length} drill categories` | `Loaded ${drillCategories.length} drill categories` |

---

## src/utils/drillCategoryPaths.ts

| Line | Current | New |
|------|---------|-----|
| 3 | `const rawWorkoutCategories = import.meta.glob(...)` | `const rawDrillCategories = import.meta.glob(...)` |
| 14 | `Object.entries(rawWorkoutCategories).map(...)` | `Object.entries(rawDrillCategories).map(...)` |
| 28 | `export const totalWorkoutCategories = Object.keys(drillCategoryData).length` | `export const totalDrillCategories = Object.keys(drillCategoryData).length` |

---

## src/utils/drillSubCategoryPaths.ts

| Line | Current | New |
|------|---------|-----|
| 3 | `const rawWorkoutSubCategories = import.meta.glob(...)` | `const rawDrillSubCategories = import.meta.glob(...)` |
| 14 | `Object.entries(rawWorkoutSubCategories).map(...)` | `Object.entries(rawDrillSubCategories).map(...)` |
| 28 | `export const totalWorkoutSubCategories = Object.keys(drillSubCategoryData).length` | `export const totalDrillSubCategories = Object.keys(drillSubCategoryData).length` |

---

## src/utils/metrics.ts

| Line | Current | New |
|------|---------|-----|
| 11 | `'workout_completed'` | `'drill_completed'` |
| 12 | `'workout_skipped'` | `'drill_skipped'` |

---

## src/utils/telemetrySchema.ts

| Line | Current | New |
|------|---------|-----|
| 109 | `name: 'cache:workout_schedule'` | `name: 'cache:mission_schedule'` |
| 122 | `data: { dataset: 'workout_schedule', ... }` | `data: { dataset: 'mission_schedule', ... }` |
| 127 | `name: 'workout_schedule_fetch'` | `name: 'mission_schedule_fetch'` |

---

## src/utils/cacheWarmHints.ts

| Line | Current | New |
|------|---------|-----|
| 18 | `categoryCache.getAllWorkouts()` | `categoryCache.getAllDrills()` |

---

## src/utils/cache/constants.ts

| Line | Current | New |
|------|---------|-----|
| 3 | `'coachCatalog', 'moduleCatalog', 'workoutCategories', ...` | `'handlerCatalog', 'moduleCatalog', 'drillCategories', ...` |
| 9 | `workoutCategories: 12 * 60 * 60 * 1000` | `drillCategories: 12 * 60 * 60 * 1000` |

**WARNING:** These are IndexedDB cache store names. Changing them means existing caches won't be found. Add a migration that reads the old key and writes to the new key, or accept a one-time re-fetch for all operatives on next load.

---

## src/types/TrainingDataFiles.ts

| Line | Current | New |
|------|---------|-----|
| 54 | `workout_groups: DrillGroupFile[]` | `drill_groups: DrillGroupFile[]` |

**Same JSON schema warning as DrillDataLoader.ts.** Must coordinate with JSON data files.

---

## vite.config.ts

| Line | Current | New |
|------|---------|-----|
| ~5 | `{ name: 'coaches', patterns: [/src\/components\/Coach/i, ...] }` | `{ name: 'handlers', patterns: [/src\/components\/Handler/i, ...] }` |
| ~6 | `{ name: 'workouts', patterns: [/src\/components\/(Workout\|Training)/i] }` | `{ name: 'drills', patterns: [/src\/components\/(Drill\|Training)/i] }` |

---

## Test Files to Update

These test files contain `workout`/`Workout` identifiers that will break when the source renames are applied:

1. `src/cache/__tests__/DrillCategoryCache.test.ts`
2. `src/context/__tests__/MissionScheduleContext.test.tsx`
3. `src/store/__tests__/MissionScheduleStore.test.ts`
4. `src/utils/__tests__/cacheMetrics.test.ts`
5. `src/utils/__tests__/drillFilters.test.ts`
6. `src/utils/__tests__/MissionScheduleCreator.test.ts`
7. `src/utils/__tests__/schedulePreview.test.ts`

**Approach:** After renaming each source file, immediately update the corresponding test file(s) and run `npm test` to verify.

---

## JSON Data Field Investigation Required

Before renaming `workout_groups` in TypeScript types and loaders, verify:

```bash
grep -rl 'workout_groups' src/data/ | head -20
```

If JSON files use `workout_groups` as a field name, you have two choices:
1. **Rename in JSON too** — bulk sed across all drill data JSON files
2. **Add an adapter** — map `workout_groups` → `drill_groups` in the loader

Option 1 is cleaner. Option 2 avoids touching 100+ JSON files.
