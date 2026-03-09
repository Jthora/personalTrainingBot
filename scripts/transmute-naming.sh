#!/bin/bash
set -euo pipefail

ROOT="/home/jono/workspace/github/personalTrainingBot"
cd "$ROOT"

echo "=== Phase 1: Create sed patterns file ==="

cat > /tmp/transmute.sed << 'SEDEOF'
# ============================================================
# Internal Naming Transmutation — sed patterns
# Order: most specific / longest patterns first, general last
# ============================================================

# --- CSS custom properties (before general coach→handler) ---
s/--coach-accent-strong/--handler-accent-strong/g
s/--coach-accent-soft/--handler-accent-soft/g
s/--coach-accent/--handler-accent/g
s/--coach-border/--handler-border/g
s/--coach-glow/--handler-glow/g
s/--coach-color/--handler-color/g

# --- CustomWorkoutSchedule family ---
s/CustomWorkoutScheduleJSON/CustomMissionScheduleJSON/g
s/CustomWorkoutSchedulesStore/CustomMissionSchedulesStore/g
s/customWorkoutSchedules/customMissionSchedules/g
s/CustomWorkoutSchedule/CustomMissionSchedule/g
s/customWorkoutSchedule/customMissionSchedule/g

# --- WorkoutSchedule family (before standalone Workout) ---
s/WorkoutScheduleItemJSON/MissionScheduleItemJSON/g
s/WorkoutScheduleJSON/MissionScheduleJSON/g
s/WorkoutScheduleStore/MissionScheduleStore/g
s/WorkoutScheduleCreator/MissionScheduleCreator/g
s/WorkoutScheduleProvider/MissionScheduleProvider/g
s/WorkoutScheduleContext/MissionScheduleContext/g
s/WorkoutSchedulingService/MissionSchedulingService/g
s/WORKOUT_SCHEDULE_KEY/MISSION_SCHEDULE_KEY/g
s/WorkoutSchedule/MissionSchedule/g
s/workoutSchedule/missionSchedule/g
s/useWorkoutSchedule/useMissionSchedule/g

# --- WorkoutBlock family ---
s/CreateWorkoutBlockPopup/CreateMissionBlockPopup/g
s/isWorkoutBlockPopupOpen/isMissionBlockPopupOpen/g
s/setIsWorkoutBlockPopupOpen/setIsMissionBlockPopupOpen/g
s/WorkoutBlockJSON/MissionBlockJSON/g
s/WorkoutBlock/MissionBlock/g
s/workoutBlockCreator/missionBlockCreator/g
s/workoutBlock/missionBlock/g

# --- WorkoutSet family ---
s/CreateWorkoutSetPopup/CreateMissionSetPopup/g
s/isWorkoutSetPopupOpen/isMissionSetPopupOpen/g
s/setIsWorkoutSetPopupOpen/setIsMissionSetPopupOpen/g
s/WorkoutSetJSON/MissionSetJSON/g
s/WorkoutSet/MissionSet/g
s/workoutSet/missionSet/g

# --- Schedule popup components ---
s/CreateNewWorkoutSchedulePopup/CreateNewMissionSchedulePopup/g
s/isCreateNewSchedulePopupOpen/isCreateNewSchedulePopupOpen/g
s/DeleteExistingWorkoutSchedulePopup/DeleteExistingMissionSchedulePopup/g
s/ManageWorkoutScheduleCalendarPopup/ManageMissionScheduleCalendarPopup/g

# --- WorkoutCategory family ---
s/SelectedWorkoutSubCategories/SelectedDrillSubCategories/g
s/selectedWorkoutSubCategories/selectedDrillSubCategories/g
s/SelectedWorkoutCategories/SelectedDrillCategories/g
s/selectedWorkoutCategories/selectedDrillCategories/g
s/SelectedWorkoutGroups/SelectedDrillGroups/g
s/selectedWorkoutGroups/selectedDrillGroups/g
s/SelectedWorkouts/SelectedDrills/g
s/selectedWorkouts/selectedDrills/g
s/WorkoutSubCategoryJSON/DrillSubCategoryJSON/g
s/WorkoutSubCategoryFile/DrillSubCategoryFile/g
s/WorkoutSubCategory/DrillSubCategory/g
s/workoutSubCategory/drillSubCategory/g
s/WorkoutCategoryJSON/DrillCategoryJSON/g
s/WorkoutCategoryFile/DrillCategoryFile/g
s/WorkoutCategoryCache/DrillCategoryCache/g
s/WorkoutCategoryPaths/DrillCategoryPaths/g
s/WorkoutCategory/DrillCategory/g
s/workoutCategoryPaths/drillCategoryPaths/g
s/workoutCategory/drillCategory/g
s/WorkoutGroupJSON/DrillGroupJSON/g
s/WorkoutGroupFile/DrillGroupFile/g
s/WorkoutGroup/DrillGroup/g
s/workoutGroup/drillGroup/g
s/WorkoutEntryFile/DrillEntryFile/g

# --- Selection state functions ---
s/getSelectedWorkoutCategoriesSync/getSelectedDrillCategoriesSync/g
s/getSelectedWorkoutCategories/getSelectedDrillCategories/g
s/saveSelectedWorkoutCategories/saveSelectedDrillCategories/g
s/clearSelectedWorkoutCategories/clearSelectedDrillCategories/g
s/getSelectedWorkoutGroupsSync/getSelectedDrillGroupsSync/g
s/getSelectedWorkoutGroups/getSelectedDrillGroups/g
s/saveSelectedWorkoutGroups/saveSelectedDrillGroups/g
s/clearSelectedWorkoutGroups/clearSelectedDrillGroups/g
s/getSelectedWorkoutSubCategoriesSync/getSelectedDrillSubCategoriesSync/g
s/getSelectedWorkoutSubCategories/getSelectedDrillSubCategories/g
s/saveSelectedWorkoutSubCategories/saveSelectedDrillSubCategories/g
s/clearSelectedWorkoutSubCategories/clearSelectedDrillSubCategories/g
s/getSelectedWorkoutsSync/getSelectedDrillsSync/g
s/getSelectedWorkouts/getSelectedDrills/g
s/saveSelectedWorkouts/saveSelectedDrills/g
s/clearSelectedWorkouts/clearSelectedDrills/g

# --- Schedule state functions ---
s/addWorkoutToSchedule/addDrillToSchedule/g
s/updateWorkoutInSchedule/updateDrillInSchedule/g
s/removeWorkoutFromSchedule/removeDrillFromSchedule/g
s/createWorkoutSchedule/createMissionSchedule/g
s/createMissionSchedule/createMissionSchedule/g

# --- Default functions ---
s/getDefaultSelectedWorkoutCategories/getDefaultSelectedDrillCategories/g
s/getDefaultSelectedWorkoutGroups/getDefaultSelectedDrillGroups/g
s/getDefaultSelectedWorkoutSubCategories/getDefaultSelectedDrillSubCategories/g
s/getDefaultSelectedWorkouts/getDefaultSelectedDrills/g

# --- Filter functions ---
s/applyWorkoutFilters/applyDrillFilters/g
s/WorkoutFilterStore/DrillFilterStore/g
s/WorkoutFilters/DrillFilters/g
s/workoutFilters/drillFilters/g

# --- Data loader / misc types ---
s/WorkoutDataLoader/DrillDataLoader/g
s/WorkoutDataState/DrillDataState/g
s/WorkoutDataControls/DrillDataControls/g
s/useWorkoutResultsData/useDrillResultsData/g
s/WorkoutsData/DrillsData/g
s/WorkoutSerialized/DrillSerialized/g
s/WorkoutCompletionTupleJSON/DrillCompletionTupleJSON/g
s/WorkoutDifficultyLevel/DrillDifficultyLevel/g
s/WorkoutRank/DrillRank/g
s/WorkoutJSON/DrillJSON/g
s/WorkoutPreset/DrillPreset/g
s/WorkoutMatch/DrillMatch/g
s/workoutPresets/drillPresets/g

# --- Component names ---
s/WorkoutResultsPanel/DrillResultsPanel/g
s/WorkoutCard/DrillCard/g
s/WorkoutDetails/DrillDetails/g
s/WorkoutList/DrillList/g
s/WorkoutScheduler/MissionScheduler/g
s/WorkoutSelector/DrillSelector/g
s/WorkoutsSidebar/DrillsSidebar/g
s/WorkoutsWindow/DrillsWindow/g
s/WorkoutTimer/DrillTimer/g
s/WorkoutsPage/DrillsPage/g

# --- CSS class names (camelCase) ---
s/workoutCard/drillCard/g
s/workoutDetails/drillDetails/g
s/workoutList/drillList/g
s/workoutControls/drillControls/g
s/workoutSelector/drillSelector/g
s/workoutsSidebar/drillsSidebar/g
s/workoutsWindow/drillsWindow/g
s/workoutScheduler/missionScheduler/g
s/workoutTimer/drillTimer/g
s/workoutItem/drillItem/g
s/workoutDetail/drillDetail/g
s/noWorkout/noDrill/g
s/addWorkoutsButton/addDrillsButton/g
s/workoutSelectorLeftSide/drillSelectorLeftSide/g
s/workoutSelectorRightSide/drillSelectorRightSide/g
s/workoutDetailsButtonGroup/drillDetailsButtonGroup/g
s/workoutDetailsButton/drillDetailsButton/g

# --- Coach → Handler (compound patterns first) ---
s/TrainingCoachCache/TrainingHandlerCache/g
s/CoachDataBundle/HandlerDataBundle/g
s/CoachDataLoader/HandlerDataLoader/g
s/CoachModuleMapping/HandlerModuleMapping/g
s/CoachSelectionProvider/HandlerSelectionProvider/g
s/CoachSelectionContextState/HandlerSelectionContextState/g
s/CoachSelectionContext/HandlerSelectionContext/g
s/CoachSelector/HandlerSelector/g
s/CoachDialog/HandlerDialog/g
s/CoachSection/HandlerSection/g
s/CoachPalette/HandlerPalette/g
s/CoachData/HandlerData/g
s/coachModuleMapping/handlerModuleMapping/g
s/coachModulePreferences/handlerModulePreferences/g
s/coachPalettes/handlerPalettes/g
s/getCoachPalette/getHandlerPalette/g
s/applyCoachPaletteToRoot/applyHandlerPaletteToRoot/g
s/getCoachOverrideModules/getHandlerOverrideModules/g
s/saveCoachOverrideModules/saveHandlerOverrideModules/g
s/clearCoachOverrideModules/clearHandlerOverrideModules/g
s/getModulesForCoach/getModulesForHandler/g
s/hasCoachOverride/hasHandlerOverride/g
s/syncCoachModuleSelection/syncHandlerModuleSelection/g
s/coachDialog/handlerDialog/g
s/coachSelector/handlerSelector/g
s/coachTitle/handlerTitle/g
s/coachList/handlerList/g
s/coachButton/handlerButton/g
s/coachPresetSummary/handlerPresetSummary/g
s/defaultCoachId/defaultHandlerId/g
s/useCoachTheme/useHandlerTheme/g
s/useCoachSelection/useHandlerSelection/g
s/selectedCoach/selectedHandler/g
s/setSelectedCoach/setSelectedHandler/g
s/coachIcon/handlerIcon/g
s/coachData/handlerData/g
s/coachName/handlerName/g
s/coachColor/handlerColor/g
s/coachThemes/handlerThemes/g

# --- Data paths ---
s/training_coach_data\/workouts\//training_handler_data\/drills\//g
s/training_coach_data\/workouts\.json/training_handler_data\/drills.json/g
s/training_coach_data\/coach_speech/training_handler_data\/handler_speech/g
s/training_coach_data/training_handler_data/g
s/workouts\.json/drills.json/g
s/coach_speech\.json/handler_speech.json/g

# --- UPPERCASE constants ---
s/SELECTED_WORKOUTS_KEY/SELECTED_DRILLS_KEY/g
s/WORKOUT_SCHEDULE/MISSION_SCHEDULE/g

# --- General fallbacks with word boundaries ---
s/\bCoaches\b/Handlers/g
s/\bCoach\b/Handler/g
s/\bcoaches\b/handlers/g
s/\bcoach\b/handler/g
s/\bWorkouts\b/Drills/g
s/\bWorkout\b/Drill/g
s/\bworkouts\b/drills/g
s/\bworkout\b/drill/g

SEDEOF

echo "=== Phase 2: Apply sed to all source files ==="
find src/ -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) \
    -not -path '*/node_modules/*' \
    -exec sed -i -f /tmp/transmute.sed {} +

echo "Sed complete."

echo "=== Phase 3: Rename component files inside directories ==="

# Helper: rename a component's files
rename_component() {
    local dir="$1"
    local old="$2"
    local new="$3"
    [ -f "$dir/$old.tsx" ] && mv "$dir/$old.tsx" "$dir/$new.tsx"
    [ -f "$dir/$old.module.css" ] && mv "$dir/$old.module.css" "$dir/$new.module.css"
    [ -f "$dir/__tests__/$old.test.tsx" ] && mv "$dir/__tests__/$old.test.tsx" "$dir/__tests__/$new.test.tsx"
    [ -f "$dir/__tests__/$old.test.ts" ] && mv "$dir/__tests__/$old.test.ts" "$dir/__tests__/$new.test.ts"
}

# Components
rename_component src/components/CoachDialog CoachDialog HandlerDialog
rename_component src/components/CoachSelector CoachSelector HandlerSelector
rename_component src/components/WorkoutCard WorkoutCard DrillCard
rename_component src/components/WorkoutDetails WorkoutDetails DrillDetails
rename_component src/components/WorkoutFilters WorkoutFilters DrillFilters
rename_component src/components/WorkoutList WorkoutList DrillList
rename_component src/components/WorkoutResultsPanel WorkoutResultsPanel DrillResultsPanel
rename_component src/components/WorkoutScheduler WorkoutScheduler MissionScheduler
rename_component src/components/WorkoutSelector WorkoutSelector DrillSelector
rename_component src/components/WorkoutsSidebar WorkoutsSidebar DrillsSidebar
rename_component src/components/WorkoutsWindow WorkoutsWindow DrillsWindow
rename_component src/components/WorkoutTimer WorkoutTimer DrillTimer
rename_component src/components/CreateWorkoutBlockPopup CreateWorkoutBlockPopup CreateMissionBlockPopup
rename_component src/components/CreateWorkoutSetPopup CreateWorkoutSetPopup CreateMissionSetPopup
rename_component src/components/CreateNewWorkoutSchedulePopup CreateNewWorkoutSchedulePopup CreateNewMissionSchedulePopup
rename_component src/components/DeleteExistingWorkoutSchedulePopup DeleteExistingWorkoutSchedulePopup DeleteExistingMissionSchedulePopup
rename_component src/components/ManageWorkoutScheduleCalendarPopup ManageWorkoutScheduleCalendarPopup ManageMissionScheduleCalendarPopup

# Page files
rename_component src/pages/WorkoutsPage WorkoutsPage DrillsPage

# HomePage sections
[ -f src/pages/HomePage/sections/CoachSection.tsx ] && mv src/pages/HomePage/sections/CoachSection.tsx src/pages/HomePage/sections/HandlerSection.tsx
[ -f src/pages/HomePage/sections/CoachSection.module.css ] && mv src/pages/HomePage/sections/CoachSection.module.css src/pages/HomePage/sections/HandlerSection.module.css

echo "Component files renamed."

echo "=== Phase 4: Rename component directories ==="
rename_dir() {
    [ -d "$1" ] && mv "$1" "$2"
}

rename_dir src/components/CoachDialog src/components/HandlerDialog
rename_dir src/components/CoachSelector src/components/HandlerSelector
rename_dir src/components/WorkoutCard src/components/DrillCard
rename_dir src/components/WorkoutDetails src/components/DrillDetails
rename_dir src/components/WorkoutFilters src/components/DrillFilters
rename_dir src/components/WorkoutList src/components/DrillList
rename_dir src/components/WorkoutResultsPanel src/components/DrillResultsPanel
rename_dir src/components/WorkoutScheduler src/components/MissionScheduler
rename_dir src/components/WorkoutSelector src/components/DrillSelector
rename_dir src/components/WorkoutsSidebar src/components/DrillsSidebar
rename_dir src/components/WorkoutsWindow src/components/DrillsWindow
rename_dir src/components/WorkoutTimer src/components/DrillTimer
rename_dir src/components/CreateWorkoutBlockPopup src/components/CreateMissionBlockPopup
rename_dir src/components/CreateWorkoutSetPopup src/components/CreateMissionSetPopup
rename_dir src/components/CreateNewWorkoutSchedulePopup src/components/CreateNewMissionSchedulePopup
rename_dir src/components/DeleteExistingWorkoutSchedulePopup src/components/DeleteExistingMissionSchedulePopup
rename_dir src/components/ManageWorkoutScheduleCalendarPopup src/components/ManageMissionScheduleCalendarPopup
rename_dir src/pages/WorkoutsPage src/pages/DrillsPage

echo "Component directories renamed."

echo "=== Phase 5: Rename type files ==="
[ -f src/types/CoachData.ts ] && mv src/types/CoachData.ts src/types/HandlerData.ts
[ -f src/types/WorkoutCategory.ts ] && mv src/types/WorkoutCategory.ts src/types/DrillCategory.ts
[ -f src/types/WorkoutDifficultyLevel.ts ] && mv src/types/WorkoutDifficultyLevel.ts src/types/DrillDifficultyLevel.ts
[ -f src/types/WorkoutRank.ts ] && mv src/types/WorkoutRank.ts src/types/DrillRank.ts
[ -f src/types/WorkoutSchedule.ts ] && mv src/types/WorkoutSchedule.ts src/types/MissionSchedule.ts
[ -f src/types/WorkoutsData.ts ] && mv src/types/WorkoutsData.ts src/types/DrillsData.ts

echo "=== Phase 6: Rename store files ==="
[ -f src/store/CustomWorkoutSchedulesStore.ts ] && mv src/store/CustomWorkoutSchedulesStore.ts src/store/CustomMissionSchedulesStore.ts
[ -f src/store/WorkoutFilterStore.ts ] && mv src/store/WorkoutFilterStore.ts src/store/DrillFilterStore.ts
[ -f src/store/WorkoutScheduleStore.ts ] && mv src/store/WorkoutScheduleStore.ts src/store/MissionScheduleStore.ts
[ -f src/store/__tests__/WorkoutScheduleStore.test.ts ] && mv src/store/__tests__/WorkoutScheduleStore.test.ts src/store/__tests__/MissionScheduleStore.test.ts
[ -f src/store/__tests__/WorkoutScheduleStore.selection.test.ts ] && mv src/store/__tests__/WorkoutScheduleStore.selection.test.ts src/store/__tests__/MissionScheduleStore.selection.test.ts
rename_dir src/store/workoutSchedule src/store/missionSchedule

echo "=== Phase 7: Rename hooks ==="
[ -f src/hooks/useCoachSelection.ts ] && mv src/hooks/useCoachSelection.ts src/hooks/useHandlerSelection.ts
[ -f src/hooks/useCoachTheme.ts ] && mv src/hooks/useCoachTheme.ts src/hooks/useHandlerTheme.ts
[ -f src/hooks/useWorkoutResultsData.ts ] && mv src/hooks/useWorkoutResultsData.ts src/hooks/useDrillResultsData.ts
[ -f src/hooks/useWorkoutSchedule.ts ] && mv src/hooks/useWorkoutSchedule.ts src/hooks/useMissionSchedule.ts

echo "=== Phase 8: Rename context ==="
[ -f src/context/CoachSelectionContext.tsx ] && mv src/context/CoachSelectionContext.tsx src/context/HandlerSelectionContext.tsx
[ -f src/context/CoachSelectionContextState.ts ] && mv src/context/CoachSelectionContextState.ts src/context/HandlerSelectionContextState.ts
[ -f src/context/WorkoutScheduleContext.tsx ] && mv src/context/WorkoutScheduleContext.tsx src/context/MissionScheduleContext.tsx
[ -f src/context/__tests__/WorkoutScheduleContext.test.tsx ] && mv src/context/__tests__/WorkoutScheduleContext.test.tsx src/context/__tests__/MissionScheduleContext.test.tsx

echo "=== Phase 9: Rename services & cache ==="
[ -f src/services/WorkoutSchedulingService.ts ] && mv src/services/WorkoutSchedulingService.ts src/services/MissionSchedulingService.ts
[ -f src/cache/TrainingCoachCache.ts ] && mv src/cache/TrainingCoachCache.ts src/cache/TrainingHandlerCache.ts
[ -f src/cache/WorkoutCategoryCache.ts ] && mv src/cache/WorkoutCategoryCache.ts src/cache/DrillCategoryCache.ts
[ -f src/cache/__tests__/WorkoutCategoryCache.test.ts ] && mv src/cache/__tests__/WorkoutCategoryCache.test.ts src/cache/__tests__/DrillCategoryCache.test.ts

echo "=== Phase 10: Rename utils ==="
[ -f src/utils/CoachDataLoader.ts ] && mv src/utils/CoachDataLoader.ts src/utils/HandlerDataLoader.ts
[ -f src/utils/coachModulePreferences.ts ] && mv src/utils/coachModulePreferences.ts src/utils/handlerModulePreferences.ts
[ -f src/utils/generateWorkoutCategoryPaths.tsx ] && mv src/utils/generateWorkoutCategoryPaths.tsx src/utils/generateDrillCategoryPaths.tsx
[ -f src/utils/generateWorkoutSubCategoryPaths.tsx ] && mv src/utils/generateWorkoutSubCategoryPaths.tsx src/utils/generateDrillSubCategoryPaths.tsx
[ -f src/utils/workoutCategoryPaths.ts ] && mv src/utils/workoutCategoryPaths.ts src/utils/drillCategoryPaths.ts
[ -f src/utils/WorkoutDataLoader.ts ] && mv src/utils/WorkoutDataLoader.ts src/utils/DrillDataLoader.ts
[ -f src/utils/workoutFilters.ts ] && mv src/utils/workoutFilters.ts src/utils/drillFilters.ts
[ -f src/utils/workoutPresets.ts ] && mv src/utils/workoutPresets.ts src/utils/drillPresets.ts
[ -f src/utils/WorkoutScheduleCreator.ts ] && mv src/utils/WorkoutScheduleCreator.ts src/utils/MissionScheduleCreator.ts
[ -f src/utils/workoutSubCategoryPaths.ts ] && mv src/utils/workoutSubCategoryPaths.ts src/utils/drillSubCategoryPaths.ts
[ -f src/utils/__tests__/workoutFilters.test.ts ] && mv src/utils/__tests__/workoutFilters.test.ts src/utils/__tests__/drillFilters.test.ts
[ -f src/utils/__tests__/WorkoutScheduleCreator.test.ts ] && mv src/utils/__tests__/WorkoutScheduleCreator.test.ts src/utils/__tests__/MissionScheduleCreator.test.ts

echo "=== Phase 11: Rename data files ==="
[ -f src/data/coaches.ts ] && mv src/data/coaches.ts src/data/handlers.ts
[ -f src/data/coachThemes.ts ] && mv src/data/coachThemes.ts src/data/handlerThemes.ts
[ -f src/data/coachModuleMapping.ts ] && mv src/data/coachModuleMapping.ts src/data/handlerModuleMapping.ts

# JSON data directory renames (order matters: files first, then directories)
if [ -d src/data/training_coach_data ]; then
    [ -f src/data/training_coach_data/coach_speech.json ] && mv src/data/training_coach_data/coach_speech.json src/data/training_coach_data/handler_speech.json
    [ -f src/data/training_coach_data/workouts.json ] && mv src/data/training_coach_data/workouts.json src/data/training_coach_data/drills.json
    [ -d src/data/training_coach_data/workouts ] && mv src/data/training_coach_data/workouts src/data/training_coach_data/drills
    mv src/data/training_coach_data src/data/training_handler_data
fi

echo "=== Phase 12: Restore localStorage key string values ==="
# The sed changed the string arguments to withVersionedKey() but those are localStorage keys
# that must be preserved for backward compatibility with existing user data
KEYS_FILE="src/store/missionSchedule/keys.ts"
if [ -f "$KEYS_FILE" ]; then
    # Restore the storage prefix (it uses 'workout:v2:' as localStorage prefix)
    sed -i "s/const STORAGE_PREFIX = \`drill:\${STORAGE_VERSION}:\`/const STORAGE_PREFIX = \`workout:\${STORAGE_VERSION}:\`/" "$KEYS_FILE"
    # Restore withVersionedKey string arguments
    sed -i "s/withVersionedKey('selectedDrillCategories')/withVersionedKey('selectedWorkoutCategories')/" "$KEYS_FILE"
    sed -i "s/withVersionedKey('selectedDrillSubCategories')/withVersionedKey('selectedWorkoutSubCategories')/" "$KEYS_FILE"
    sed -i "s/withVersionedKey('selectedDrillGroups')/withVersionedKey('selectedWorkoutGroups')/" "$KEYS_FILE"
    sed -i "s/withVersionedKey('selectedDrills')/withVersionedKey('selectedWorkouts')/" "$KEYS_FILE"
fi

echo "=== All phases complete ==="
echo "Run 'npx tsc --noEmit' to validate."
