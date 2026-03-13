# Internal Naming Audit: Fitness/Workout → Mission/Drill Transmutation

**Generated:** 2026-03-09  
**Scope:** `src/` directory only (excludes docs/, node_modules/, dist/, coverage/)

---

## Naming Convention Map

| Old Term | New Term |
|---|---|
| Workout | Drill |
| WorkoutCategory | DrillCategory |
| WorkoutSubCategory | DrillSubCategory |
| WorkoutGroup | DrillGroup |
| WorkoutSchedule | MissionSchedule |
| WorkoutBlock | MissionBlock |
| WorkoutSet | MissionSet |
| WorkoutFilters | DrillFilters |
| Coach | Handler |
| CoachPalette | HandlerPalette |
| Training (as module concept) | Keep as-is (legitimate domain concept) |
| TrainingCoach | MissionHandler / TrainingHandler |
| fitness (data category) | Keep as-is (legitimate sub-module name) |

---

## 1. DIRECTORIES (13 directories to rename)

### Components
| Current Path | Suggested New Path |
|---|---|
| `src/components/WorkoutCard/` | `src/components/DrillCard/` |
| `src/components/WorkoutDetails/` | `src/components/DrillDetails/` |
| `src/components/WorkoutFilters/` | `src/components/DrillFilters/` |
| `src/components/WorkoutList/` | `src/components/DrillList/` |
| `src/components/WorkoutResultsPanel/` | `src/components/DrillResultsPanel/` |
| `src/components/WorkoutScheduler/` | `src/components/MissionScheduler/` |
| `src/components/WorkoutSelector/` | `src/components/DrillSelector/` |
| `src/components/WorkoutsSidebar/` | `src/components/DrillsSidebar/` |
| `src/components/WorkoutsWindow/` | `src/components/DrillsWindow/` |
| `src/components/WorkoutTimer/` | `src/components/DrillTimer/` |
| `src/components/CreateWorkoutBlockPopup/` | `src/components/CreateMissionBlockPopup/` |
| `src/components/CreateWorkoutSetPopup/` | `src/components/CreateMissionSetPopup/` |
| `src/components/CreateNewWorkoutSchedulePopup/` | `src/components/CreateNewMissionSchedulePopup/` |
| `src/components/DeleteExistingWorkoutSchedulePopup/` | `src/components/DeleteExistingMissionSchedulePopup/` |
| `src/components/ManageWorkoutScheduleCalendarPopup/` | `src/components/ManageMissionScheduleCalendarPopup/` |
| `src/components/CoachDialog/` | `src/components/HandlerDialog/` |
| `src/components/CoachSelector/` | `src/components/HandlerSelector/` |
| `src/components/TrainingSequence/` | *(keep — legitimate concept)* |
| `src/components/TrainingDfficulty/` | *(keep — legitimate concept; note: typo in dir name)* |
| `src/components/TrainingWindow/` | *(keep — legitimate concept)* |

### Pages
| Current Path | Suggested New Path |
|---|---|
| `src/pages/WorkoutsPage/` | `src/pages/DrillsPage/` |
| `src/pages/HomePage/sections/CoachSection.tsx` | `src/pages/HomePage/sections/HandlerSection.tsx` |

### Store
| Current Path | Suggested New Path |
|---|---|
| `src/store/workoutSchedule/` | `src/store/missionSchedule/` |

### Data
| Current Path | Suggested New Path |
|---|---|
| `src/data/training_coach_data/` | `src/data/training_handler_data/` |
| `src/data/training_coach_data/workouts/` | `src/data/training_handler_data/drills/` |
| `src/data/training_coach_data/workouts/subcategories/` | `src/data/training_handler_data/drills/subcategories/` |
| `src/data/training_coach_data/coach_speech.json` | `src/data/training_handler_data/handler_speech.json` |

---

## 2. FILES (65+ files to rename)

### Type Definition Files
| Current File | Suggested New Name |
|---|---|
| `src/types/WorkoutCategory.ts` | `src/types/DrillCategory.ts` |
| `src/types/WorkoutsData.ts` | `src/types/DrillsData.ts` |
| `src/types/WorkoutSchedule.ts` | `src/types/MissionSchedule.ts` |
| `src/types/WorkoutRank.ts` | `src/types/DrillRank.ts` |
| `src/types/WorkoutDifficultyLevel.ts` | `src/types/DrillDifficultyLevel.ts` |
| `src/types/CoachData.ts` | `src/types/HandlerData.ts` |
| `src/types/TrainingDataFiles.ts` | *(keep name — but internal types need renaming, see §3)* |

### Store Files
| Current File | Suggested New Name |
|---|---|
| `src/store/WorkoutFilterStore.ts` | `src/store/DrillFilterStore.ts` |
| `src/store/WorkoutScheduleStore.ts` | `src/store/MissionScheduleStore.ts` |
| `src/store/CustomWorkoutSchedulesStore.ts` | `src/store/CustomMissionSchedulesStore.ts` |
| `src/store/workoutSchedule/keys.ts` | `src/store/missionSchedule/keys.ts` |
| `src/store/workoutSchedule/defaults.ts` | `src/store/missionSchedule/defaults.ts` |
| `src/store/workoutSchedule/scheduleState.ts` | `src/store/missionSchedule/scheduleState.ts` |
| `src/store/workoutSchedule/selectionState.ts` | `src/store/missionSchedule/selectionState.ts` |
| `src/store/workoutSchedule/selectionListeners.ts` | `src/store/missionSchedule/selectionListeners.ts` |
| `src/store/TrainingModuleSelectionStore.ts` | *(keep — "Training Module" is legitimate)* |

### Store Tests
| Current File | Suggested New Name |
|---|---|
| `src/store/__tests__/WorkoutScheduleStore.test.ts` | `src/store/__tests__/MissionScheduleStore.test.ts` |
| `src/store/__tests__/WorkoutScheduleStore.selection.test.ts` | `src/store/__tests__/MissionScheduleStore.selection.test.ts` |
| `src/store/__tests__/TrainingModuleSelectionStore.test.ts` | *(keep)* |

### Cache Files
| Current File | Suggested New Name |
|---|---|
| `src/cache/WorkoutCategoryCache.ts` | `src/cache/DrillCategoryCache.ts` |
| `src/cache/__tests__/WorkoutCategoryCache.test.ts` | `src/cache/__tests__/DrillCategoryCache.test.ts` |
| `src/cache/TrainingCoachCache.ts` | `src/cache/TrainingHandlerCache.ts` |
| `src/cache/TrainingModuleCache.ts` | *(keep — legitimate)* |

### Hook Files
| Current File | Suggested New Name |
|---|---|
| `src/hooks/useWorkoutSchedule.ts` | `src/hooks/useMissionSchedule.ts` |
| `src/hooks/useWorkoutResultsData.ts` | `src/hooks/useDrillResultsData.ts` |
| `src/hooks/useCoachTheme.ts` | `src/hooks/useHandlerTheme.ts` |
| `src/hooks/useCoachSelection.ts` | `src/hooks/useHandlerSelection.ts` |

### Context Files
| Current File | Suggested New Name |
|---|---|
| `src/context/WorkoutScheduleContext.tsx` | `src/context/MissionScheduleContext.tsx` |
| `src/context/__tests__/WorkoutScheduleContext.test.tsx` | `src/context/__tests__/MissionScheduleContext.test.tsx` |
| `src/context/CoachSelectionContext.tsx` | `src/context/HandlerSelectionContext.tsx` |
| `src/context/CoachSelectionContextState.ts` | `src/context/HandlerSelectionContextState.ts` |

### Service Files
| Current File | Suggested New Name |
|---|---|
| `src/services/WorkoutSchedulingService.ts` | `src/services/MissionSchedulingService.ts` |

### Utility Files
| Current File | Suggested New Name |
|---|---|
| `src/utils/WorkoutDataLoader.ts` | `src/utils/DrillDataLoader.ts` |
| `src/utils/WorkoutScheduleCreator.ts` | `src/utils/MissionScheduleCreator.ts` |
| `src/utils/__tests__/WorkoutScheduleCreator.test.ts` | `src/utils/__tests__/MissionScheduleCreator.test.ts` |
| `src/utils/workoutFilters.ts` | `src/utils/drillFilters.ts` |
| `src/utils/__tests__/workoutFilters.test.ts` | `src/utils/__tests__/drillFilters.test.ts` |
| `src/utils/workoutPresets.ts` | `src/utils/drillPresets.ts` |
| `src/utils/workoutCategoryPaths.ts` | `src/utils/drillCategoryPaths.ts` |
| `src/utils/workoutSubCategoryPaths.ts` | `src/utils/drillSubCategoryPaths.ts` |
| `src/utils/generateWorkoutCategoryPaths.tsx` | `src/utils/generateDrillCategoryPaths.tsx` |
| `src/utils/generateWorkoutSubCategoryPaths.tsx` | `src/utils/generateDrillSubCategoryPaths.tsx` |
| `src/utils/CoachDataLoader.ts` | `src/utils/HandlerDataLoader.ts` |
| `src/utils/coachModulePreferences.ts` | `src/utils/handlerModulePreferences.ts` |
| `src/utils/cardDeckPaths/fitness.ts` | *(keep — legitimate sub-module name)* |

### Data Files
| Current File | Suggested New Name |
|---|---|
| `src/data/coaches.ts` | `src/data/handlers.ts` |
| `src/data/coachThemes.ts` | `src/data/handlerThemes.ts` |
| `src/data/coachModuleMapping.ts` | `src/data/handlerModuleMapping.ts` |
| `src/data/training_coach_data/workouts.json` | `src/data/training_handler_data/drills.json` |
| `src/data/training_coach_data/coach_speech.json` | `src/data/training_handler_data/handler_speech.json` |

### Component Files (inside renamed directories — TSX + CSS)
Each component directory contains a `.tsx` and `.module.css` file (and sometimes `__tests__/`). All listed below need both files renamed:

| Current | Suggested |
|---|---|
| `WorkoutCard.tsx` / `.module.css` | `DrillCard.tsx` / `.module.css` |
| `WorkoutDetails.tsx` / `.module.css` | `DrillDetails.tsx` / `.module.css` |
| `WorkoutFilters.tsx` / `.module.css` | `DrillFilters.tsx` / `.module.css` |
| `WorkoutList.tsx` / `.module.css` | `DrillList.tsx` / `.module.css` |
| `WorkoutResultsPanel.tsx` / `.module.css` + `__tests__/` | `DrillResultsPanel.tsx` / `.module.css` + `__tests__/` |
| `WorkoutScheduler.tsx` / `.module.css` | `MissionScheduler.tsx` / `.module.css` |
| `WorkoutSelector.tsx` / `.module.css` | `DrillSelector.tsx` / `.module.css` |
| `WorkoutsSidebar.tsx` / `.module.css` + `FiltersSheet.module.css` | `DrillsSidebar.tsx` / `.module.css` + `FiltersSheet.module.css` |
| `WorkoutsWindow.tsx` / `.module.css` | `DrillsWindow.tsx` / `.module.css` |
| `WorkoutTimer.tsx` / `.module.css` | `DrillTimer.tsx` / `.module.css` |
| `CreateWorkoutBlockPopup.tsx` / `.module.css` | `CreateMissionBlockPopup.tsx` / `.module.css` |
| `CreateWorkoutSetPopup.tsx` / `.module.css` | `CreateMissionSetPopup.tsx` / `.module.css` |
| `CreateNewWorkoutSchedulePopup.tsx` / `.module.css` | `CreateNewMissionSchedulePopup.tsx` / `.module.css` |
| `DeleteExistingWorkoutSchedulePopup.tsx` / `.module.css` | `DeleteExistingMissionSchedulePopup.tsx` / `.module.css` |
| `ManageWorkoutScheduleCalendarPopup.tsx` / `.module.css` | `ManageMissionScheduleCalendarPopup.tsx` / `.module.css` |
| `CoachDialog.tsx` / `.module.css` | `HandlerDialog.tsx` / `.module.css` |
| `CoachSelector.tsx` / `.module.css` | `HandlerSelector.tsx` / `.module.css` |
| `CoachSection.tsx` / `.module.css` | `HandlerSection.tsx` / `.module.css` |
| `WorkoutsPage.tsx` / `.module.css` | `DrillsPage.tsx` / `.module.css` |

---

## 3. TYPE & INTERFACE NAMES

### In `src/types/WorkoutCategory.ts` (→ `DrillCategory.ts`)
| Current | Suggested |
|---|---|
| `class WorkoutCategory` | `class DrillCategory` |
| `class WorkoutSubCategory` | `class DrillSubCategory` |
| `class WorkoutGroup` | `class DrillGroup` |
| `class Workout` | `class Drill` |
| `type SelectedWorkoutCategories` | `type SelectedDrillCategories` |
| `type SelectedWorkoutSubCategories` | `type SelectedDrillSubCategories` |
| `type SelectedWorkoutGroups` | `type SelectedDrillGroups` |
| `type SelectedWorkouts` | `type SelectedDrills` |

### In `src/types/WorkoutSchedule.ts` (→ `MissionSchedule.ts`)
| Current | Suggested |
|---|---|
| `interface WorkoutSerialized` | `interface DrillSerialized` |
| `type WorkoutCompletionTupleJSON` | `type DrillCompletionTupleJSON` |
| `interface WorkoutSetJSON` | `interface MissionSetJSON` |
| `interface WorkoutBlockJSON` | `interface MissionBlockJSON` |
| `type WorkoutScheduleItemJSON` | `type MissionScheduleItemJSON` |
| `interface WorkoutScheduleJSON` | `interface MissionScheduleJSON` |
| `interface CustomWorkoutScheduleJSON` | `interface CustomMissionScheduleJSON` |
| `class WorkoutSchedule` | `class MissionSchedule` |
| `class WorkoutSet` | `class MissionSet` |
| `class WorkoutBlock` | `class MissionBlock` |
| `class CustomWorkoutSchedule` | `class CustomMissionSchedule` |

### In `src/types/WorkoutsData.ts` (→ `DrillsData.ts`)
| Current | Suggested |
|---|---|
| `type WorkoutsData` | `type DrillsData` |

### In `src/types/WorkoutRank.ts` (→ `DrillRank.ts`)
| Current | Suggested |
|---|---|
| `type WorkoutRank` | `type DrillRank` |

### In `src/types/WorkoutDifficultyLevel.ts` (→ `DrillDifficultyLevel.ts`)
| Current | Suggested |
|---|---|
| `interface WorkoutDifficultyLevel` | `interface DrillDifficultyLevel` |

### In `src/types/TrainingDataFiles.ts` (keep file name)
| Current | Suggested |
|---|---|
| `interface WorkoutCategoryFile` | `interface DrillCategoryFile` |
| `interface WorkoutEntryFile` | `interface DrillEntryFile` |
| `interface WorkoutGroupFile` | `interface DrillGroupFile` |
| `interface WorkoutSubCategoryFile` | `interface DrillSubCategoryFile` |
| *(TrainingModuleFile, TrainingSubModuleFile — keep as-is)* | |

### In `src/types/CoachData.ts` (→ `HandlerData.ts`)
| Current | Suggested |
|---|---|
| `interface CoachData` | `interface HandlerData` |

### In `src/data/coaches.ts` (→ `handlers.ts`)
| Current | Suggested |
|---|---|
| `type Coach` | `type Handler` |
| `const defaultCoachId` | `const defaultHandlerId` |
| `const coaches` | `const handlers` |

### In `src/data/coachThemes.ts` (→ `handlerThemes.ts`)
| Current | Suggested |
|---|---|
| `type CoachPalette` | `type HandlerPalette` |
| `const coachPalettes` | `const handlerPalettes` |
| `function getCoachPalette` | `function getHandlerPalette` |
| `function applyCoachPaletteToRoot` | `function applyHandlerPaletteToRoot` |

### In `src/data/coachModuleMapping.ts` (→ `handlerModuleMapping.ts`)
| Current | Suggested |
|---|---|
| `type CoachModuleMapping` | `type HandlerModuleMapping` |
| `const coachModuleMapping` | `const handlerModuleMapping` |

### In `src/store/WorkoutFilterStore.ts` (→ `DrillFilterStore.ts`)
| Current | Suggested |
|---|---|
| `type WorkoutFilters` | `type DrillFilters` |
| `default export WorkoutFilterStore` | `default export DrillFilterStore` |

### In `src/store/WorkoutScheduleStore.ts` (→ `MissionScheduleStore.ts`)
| Current | Suggested |
|---|---|
| `default export WorkoutScheduleStore` | `default export MissionScheduleStore` |

### In `src/store/CustomWorkoutSchedulesStore.ts` (→ `CustomMissionSchedulesStore.ts`)
| Current | Suggested |
|---|---|
| `default export CustomWorkoutSchedulesStore` | `default export CustomMissionSchedulesStore` |

### In `src/utils/WorkoutDataLoader.ts` (→ `DrillDataLoader.ts`)
| Current | Suggested |
|---|---|
| `interface WorkoutJSON` | `interface DrillJSON` |
| `interface WorkoutGroupJSON` | `interface DrillGroupJSON` |
| `interface WorkoutSubCategoryJSON` | `interface DrillSubCategoryJSON` |
| `interface WorkoutCategoryJSON` | `interface DrillCategoryJSON` |
| `default export WorkoutDataLoader` | `default export DrillDataLoader` |

### In `src/utils/CoachDataLoader.ts` (→ `HandlerDataLoader.ts`)
| Current | Suggested |
|---|---|
| `interface CoachDataBundle` | `interface HandlerDataBundle` |
| `default export CoachDataLoader` | `default export HandlerDataLoader` |

### In `src/utils/workoutPresets.ts` (→ `drillPresets.ts`)
| Current | Suggested |
|---|---|
| `type WorkoutPreset` | `type DrillPreset` |
| `type WorkoutMatch` | `type DrillMatch` |
| `function buildPresetSelections` | *(keep — name is generic enough)* |

### In `src/utils/workoutFilters.ts` (→ `drillFilters.ts`)
| Current | Suggested |
|---|---|
| `function applyWorkoutFilters` | `function applyDrillFilters` |
| `const DEFAULT_FILTERS` | *(keep — generic)* |

### In `src/hooks/useWorkoutResultsData.ts` (→ `useDrillResultsData.ts`)
| Current | Suggested |
|---|---|
| `type WorkoutDataState` | `type DrillDataState` |
| `type WorkoutDataControls` | `type DrillDataControls` |
| `function useWorkoutResultsData` | `function useDrillResultsData` |

### In `src/services/WorkoutSchedulingService.ts` (→ `MissionSchedulingService.ts`)
| Current | Suggested |
|---|---|
| `const WorkoutSchedulingService` | `const MissionSchedulingService` |

### In `src/utils/WorkoutScheduleCreator.ts` (→ `MissionScheduleCreator.ts`)
| Current | Suggested |
|---|---|
| `function createWorkoutSchedule` | `function createMissionSchedule` |

---

## 4. CLASSES (domain model)

All classes are in `src/types/`. These are the **highest-risk renames** since they're imported everywhere:

| Current Class | Suggested | File Count (estimated importers) |
|---|---|---|
| `Workout` | `Drill` | ~30 files |
| `WorkoutCategory` | `DrillCategory` | ~15 files |
| `WorkoutSubCategory` | `DrillSubCategory` | ~10 files |
| `WorkoutGroup` | `DrillGroup` | ~10 files |
| `WorkoutSchedule` | `MissionSchedule` | ~20 files |
| `WorkoutSet` | `MissionSet` | ~8 files |
| `WorkoutBlock` | `MissionBlock` | ~8 files |
| `CustomWorkoutSchedule` | `CustomMissionSchedule` | ~5 files |
| `TrainingModuleCache` | *(keep — legitimate)* | — |
| `WorkoutCategoryCache` | `DrillCategoryCache` | ~5 files |

---

## 5. COMPONENT NAMES (exported React components)

| Current Component | File | Suggested |
|---|---|---|
| `WorkoutCard` | `WorkoutCard/WorkoutCard.tsx` | `DrillCard` |
| `WorkoutDetails` | `WorkoutDetails/WorkoutDetails.tsx` | `DrillDetails` |
| `WorkoutFilters` | `WorkoutFilters/WorkoutFilters.tsx` | `DrillFilters` |
| `WorkoutList` | `WorkoutList/WorkoutList.tsx` | `DrillList` |
| `WorkoutResultsPanel` | `WorkoutResultsPanel/WorkoutResultsPanel.tsx` | `DrillResultsPanel` |
| `WorkoutScheduler` | `WorkoutScheduler/WorkoutScheduler.tsx` | `MissionScheduler` |
| `WorkoutSelector` | `WorkoutSelector/WorkoutSelector.tsx` | `DrillSelector` |
| `WorkoutsSidebar` | `WorkoutsSidebar/WorkoutsSidebar.tsx` | `DrillsSidebar` |
| `WorkoutsWindow` | `WorkoutsWindow/WorkoutsWindow.tsx` | `DrillsWindow` |
| `WorkoutTimer` | `WorkoutTimer/WorkoutTimer.tsx` | `DrillTimer` |
| `CreateWorkoutBlockPopup` | `CreateWorkoutBlockPopup/…` | `CreateMissionBlockPopup` |
| `CreateWorkoutSetPopup` | `CreateWorkoutSetPopup/…` | `CreateMissionSetPopup` |
| `CreateNewWorkoutSchedulePopup` | `CreateNewWorkoutSchedulePopup/…` | `CreateNewMissionSchedulePopup` |
| `DeleteExistingWorkoutSchedulePopup` | `DeleteExistingWorkoutSchedulePopup/…` | `DeleteExistingMissionSchedulePopup` |
| `ManageWorkoutScheduleCalendarPopup` | `ManageWorkoutScheduleCalendarPopup/…` | `ManageMissionScheduleCalendarPopup` |
| `CoachDialog` | `CoachDialog/CoachDialog.tsx` | `HandlerDialog` |
| `CoachSelector` | `CoachSelector/CoachSelector.tsx` | `HandlerSelector` |
| `CoachSection` | `pages/HomePage/sections/CoachSection.tsx` | `HandlerSection` |
| `WorkoutsPage` | `pages/WorkoutsPage/WorkoutsPage.tsx` | `DrillsPage` |
| `WorkoutScheduleProvider` | `context/WorkoutScheduleContext.tsx` | `MissionScheduleProvider` |
| `CoachSelectionProvider` | `context/CoachSelectionContext.tsx` | `HandlerSelectionProvider` |
| `CoachSelectionContext` | `context/CoachSelectionContextState.ts` | `HandlerSelectionContext` |
| `TrainingPage` | `pages/TrainingPage/TrainingPage.tsx` | *(keep — legitimate)* |
| `TrainingWindow` | `components/TrainingWindow/…` | *(keep — legitimate)* |
| `TrainingSequence` | `components/TrainingSequence/…` | *(keep — legitimate)* |
| `TrainingDifficulty` | `components/TrainingDfficulty/…` | *(keep — legitimate)* |

---

## 6. CSS MODULE CLASS NAMES

### Classes with `workout` prefix (need renaming inside CSS modules)

| File | Current Classes | Suggested |
|---|---|---|
| `WorkoutCard.module.css` | `.workoutCard` | `.drillCard` |
| `WorkoutDetails.module.css` | `.workoutDetails`, `.noWorkout`, `.workoutDetailsButtonGroup`, `.workoutDetailsButton` | `.drillDetails`, `.noDrill`, `.drillDetailsButtonGroup`, `.drillDetailsButton` |
| `WorkoutList.module.css` | `.workoutList` | `.drillList` |
| `WorkoutScheduler.module.css` | `.workoutScheduler` | `.missionScheduler` |
| `WorkoutsWindow.module.css` | `.workoutsWindow` | `.drillsWindow` |
| `WorkoutsSidebar.module.css` | `.workoutsSidebar` | `.drillsSidebar` |
| `WorkoutSelector.module.css` | `.workoutSelector`, `.workout`, `.workouts`, `.workoutControls`, `.workoutSelectorLeftSide`, `.workoutSelectorRightSide` | `.drillSelector`, `.drill`, `.drills`, `.drillControls`, `.drillSelectorLeftSide`, `.drillSelectorRightSide` |
| `CreateWorkoutSetPopup.module.css` | `.workoutList`, `.selectedWorkouts` | `.drillList`, `.selectedDrills` |
| `CoachDialog.module.css` | `.workoutDetails`, `.noWorkout` | `.drillDetails`, `.noDrill` |
| `SchedulesSidebar.module.css` | `.workoutSet`, `.workoutBlock`, `.workoutSetTitle`, `.workoutBlockTitle`, `.workoutList`, `.workoutDetails`, `.workoutItem`, `.workoutDetail` | `.missionSet`, `.missionBlock`, `.missionSetTitle`, `.missionBlockTitle`, `.drillList`, `.drillDetails`, `.drillItem`, `.drillDetail` |
| `SchedulesWindow.module.css` | `.addWorkoutsButton` | `.addDrillsButton` |
| `CustomScheduleCreatorView.module.css` | `.workoutList`, `.workoutBlockCreator` | `.drillList`, `.missionBlockCreator` |

### Classes with `coach` prefix (need renaming inside CSS modules)

| File | Current Classes | Suggested |
|---|---|---|
| `CoachDialog.module.css` | `.coachDialog`, `.coach` | `.handlerDialog`, `.handler` |
| `CoachSelector.module.css` | `.coachSelector`, `.coachTitle`, `.coachList`, `.coachButton` | `.handlerSelector`, `.handlerTitle`, `.handlerList`, `.handlerButton` |
| `CardSelector.module.css` | `.coachPresetSummary` | `.handlerPresetSummary` |

### Classes with `training` prefix (keep — legitimate)

| File | Class | Decision |
|---|---|---|
| `TrainingWindow.module.css` | `.trainingWindow` | **Keep** |
| `TrainingPage.module.css` | `.trainingWindowContainer` | **Keep** |

---

## 7. CSS CUSTOM PROPERTIES (`--coach-*`)

These are set in `src/data/coachThemes.ts` via `applyCoachPaletteToRoot()` and consumed across **~30+ CSS module files**:

| Current Property | Suggested | Used In |
|---|---|---|
| `--coach-accent` | `--handler-accent` | DrillRunner, MissionIntakePanel, MissionStepHandoff, ErrorBoundary, CardTable, TriageBoard, CardSlot, CardSelector, SchedulesSidebar, SchedulesWindow, WorkoutCard, WorkoutScheduler, WorkoutsWindow, CoachDialog, CoachSelector, MissionActionPalette, Settings/Web3Panel, CreateNewWorkoutSchedulePopup, ManageWorkoutScheduleCalendarPopup, DeleteExistingWorkoutSchedulePopup, CustomScheduleCreatorView, WorkoutsSidebar, TodaysPlanBanner, ArtifactList, Header |
| `--coach-accent-strong` | `--handler-accent-strong` | CardSlot, CardSelector, WorkoutsWindow, SchedulesSidebar |
| `--coach-accent-soft` | `--handler-accent-soft` | ErrorBoundary, CardSelector, TriageBoard, MissionActionPalette |
| `--coach-border` | `--handler-border` | ErrorBoundary, TrainingWindow, CardSelector, SchedulesSidebar, SchedulesWindow, WorkoutsSidebar, FiltersSheet |
| `--coach-glow` | `--handler-glow` | *(set in coachThemes.ts, referenced in fewer files)* |
| `--coach-color` | `--handler-color` | HeaderDrawer.tsx inline style |

> **Impact Note:** Renaming CSS custom properties is a cross-cutting change across ~30 CSS files. Consider doing this as a separate atomic step.

---

## 8. EXPORTED FUNCTIONS IN `src/store/workoutSchedule/` (→ `missionSchedule/`)

### `selectionState.ts`
| Current | Suggested |
|---|---|
| `getSelectedWorkoutCategoriesSync` | `getSelectedDrillCategoriesSync` |
| `getSelectedWorkoutCategories` | `getSelectedDrillCategories` |
| `saveSelectedWorkoutCategories` | `saveSelectedDrillCategories` |
| `clearSelectedWorkoutCategories` | `clearSelectedDrillCategories` |
| `getSelectedWorkoutGroupsSync` | `getSelectedDrillGroupsSync` |
| `getSelectedWorkoutGroups` | `getSelectedDrillGroups` |
| `saveSelectedWorkoutGroups` | `saveSelectedDrillGroups` |
| `clearSelectedWorkoutGroups` | `clearSelectedDrillGroups` |
| `getSelectedWorkoutSubCategoriesSync` | `getSelectedDrillSubCategoriesSync` |
| `getSelectedWorkoutSubCategories` | `getSelectedDrillSubCategories` |
| `saveSelectedWorkoutSubCategories` | `saveSelectedDrillSubCategories` |
| `clearSelectedWorkoutSubCategories` | `clearSelectedDrillSubCategories` |
| `getSelectedWorkoutsSync` | `getSelectedDrillsSync` |
| `getSelectedWorkouts` | `getSelectedDrills` |
| `saveSelectedWorkouts` | `saveSelectedDrills` |
| `clearSelectedWorkouts` | `clearSelectedDrills` |

### `scheduleState.ts`
| Current | Suggested |
|---|---|
| `addWorkoutToSchedule` | `addDrillToSchedule` |
| `updateWorkoutInSchedule` | `updateDrillInSchedule` |
| `removeWorkoutFromSchedule` | `removeDrillFromSchedule` |
| `createWorkoutSchedule` (in WorkoutScheduleCreator.ts) | `createMissionSchedule` |

### `keys.ts`
| Current | Suggested |
|---|---|
| `WORKOUT_SCHEDULE_KEY` | `MISSION_SCHEDULE_KEY` |
| `SELECTED_CATEGORIES_KEY` (value: `'selectedWorkoutCategories'`) | *(rename value string)* |
| `SELECTED_SUBCATEGORIES_KEY` (value: `'selectedWorkoutSubCategories'`) | *(rename value string)* |
| `SELECTED_GROUPS_KEY` (value: `'selectedWorkoutGroups'`) | *(rename value string)* |
| `SELECTED_WORKOUTS_KEY` (value: `'selectedWorkouts'`) | *(rename value string)* |

> **Migration hazard:** Renaming localStorage key *values* will invalidate existing user data. Consider adding a migration step or keeping legacy key values with a compatibility alias.

### `defaults.ts`
| Current | Suggested |
|---|---|
| `getDefaultSelectedWorkoutCategories` | `getDefaultSelectedDrillCategories` |
| `getDefaultSelectedWorkoutGroups` | `getDefaultSelectedDrillGroups` |
| `getDefaultSelectedWorkoutSubCategories` | `getDefaultSelectedDrillSubCategories` |
| `getDefaultSelectedWorkouts` | `getDefaultSelectedDrills` |

---

## 9. EXPORTED FUNCTIONS IN `src/utils/coachModulePreferences.ts` (→ `handlerModulePreferences.ts`)

| Current | Suggested |
|---|---|
| `getCoachOverrideModules` | `getHandlerOverrideModules` |
| `saveCoachOverrideModules` | `saveHandlerOverrideModules` |
| `clearCoachOverrideModules` | `clearHandlerOverrideModules` |
| `getModulesForCoach` | `getModulesForHandler` |
| `hasCoachOverride` | `hasHandlerOverride` |
| `syncCoachModuleSelection` | `syncHandlerModuleSelection` |

---

## 10. DATA FILES (JSON) — Lower priority but should be tracked

### `src/data/training_coach_data/workouts/` directory
Contains multiple JSON data files with workout category names. These are the workout taxonomy data:

| Current | Suggested |
|---|---|
| `workouts.json` | `drills.json` |
| `workouts/strength.json` | `drills/strength.json` |
| `workouts/cardio.json` | `drills/cardio.json` |
| `workouts/balance.json` | `drills/balance.json` |
| `workouts/mobility.json` | `drills/mobility.json` |
| `workouts/agility.json` | `drills/agility.json` |
| `workouts/combat.json` | `drills/combat.json` |
| `workouts/coordination.json` | `drills/coordination.json` |
| `workouts/endurance.json` | `drills/endurance.json` |
| `workouts/mental.json` | `drills/mental.json` |
| `workouts/superhero.json` | `drills/superhero.json` |
| `workouts/jono_thora.json` | `drills/jono_thora.json` |
| `workouts/aegis_fang_combat_system.json` | `drills/aegis_fang_combat_system.json` |
| `workouts/subcategories/**` | `drills/subcategories/**` |

---

## 11. SUMMARY: EFFORT ESTIMATE

| Category | Count |
|---|---|
| Directories to rename | ~22 |
| Files to rename | ~65 |
| Types/Interfaces to rename | ~40 |
| Classes to rename | ~11 |
| Component exports to rename | ~22 |
| Exported functions to rename | ~30 |
| CSS module class names to rename | ~40 |
| CSS custom properties to rename | 5 properties across ~30 files |
| JSON data files to rename | ~15 |

### Suggested Execution Order (to minimize breakage)

1. **Phase A — Domain types** (`src/types/WorkoutCategory.ts`, `WorkoutSchedule.ts`, etc.) — rename classes/types, then update all importers
2. **Phase B — Store layer** (`workoutSchedule/`, stores) — rename files + exports
3. **Phase C — Utils** (DataLoader, ScheduleCreator, filters, presets, paths) — rename files + exports
4. **Phase D — Hooks & Context** — rename files + exports
5. **Phase E — Services & Cache** — rename files + exports
6. **Phase F — Components** — rename directories + files + component names
7. **Phase G — CSS** — rename class names + custom properties
8. **Phase H — Data files** (JSON) — rename directories + files (with import path updates)
9. **Phase I — Coach → Handler** — separate pass for all coach-related naming

> **Total estimated touch-points:** ~250+ symbol renames across ~65 files, with ~30 additional files consuming CSS custom properties.
