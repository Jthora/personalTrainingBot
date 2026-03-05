import {
    addWorkoutToSchedule,
    clearSchedule,
    createNewSchedule,
    createNewScheduleSync,
    getLastPreset,
    getSchedule,
    getScheduleSync,
    removeWorkoutFromSchedule,
    resetAll,
    saveLastPreset,
    saveSchedule,
    updateWorkoutInSchedule,
} from './workoutSchedule/scheduleState';
import {
    clearSelectedWorkoutCategories,
    clearSelectedWorkoutGroups,
    clearSelectedWorkoutSubCategories,
    clearSelectedWorkouts,
    getSelectedWorkoutCategories,
    getSelectedWorkoutCategoriesSync,
    getSelectedWorkoutGroups,
    getSelectedWorkoutGroupsSync,
    getSelectedWorkoutSubCategories,
    getSelectedWorkoutSubCategoriesSync,
    getSelectedWorkouts,
    getSelectedWorkoutsSync,
    saveSelectedWorkoutCategories,
    saveSelectedWorkoutGroups,
    saveSelectedWorkoutSubCategories,
    saveSelectedWorkouts,
    getSelectionCounts,
    getTaxonomySignature,
    saveTaxonomySignature,
    syncTaxonomySignature,
} from './workoutSchedule/selectionState';
import { notifySelectionChange, subscribeToSelectionChanges } from './workoutSchedule/selectionListeners';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

const WorkoutScheduleStore = {
    resetAll,
    async getSchedule(): Promise<WorkoutSchedule | null> {
        return getSchedule();
    },
    getScheduleSync(): WorkoutSchedule | null {
        return getScheduleSync();
    },
    saveSchedule(schedule: WorkoutSchedule) {
        saveSchedule(schedule);
    },
    addWorkoutToSchedule(workout: Workout, options?: { force?: boolean }) {
        return addWorkoutToSchedule(workout, options);
    },
    updateWorkoutInSchedule(workout: Workout) {
        return updateWorkoutInSchedule(workout);
    },
    removeWorkoutFromSchedule(workoutId: string) {
        return removeWorkoutFromSchedule(workoutId);
    },
    saveLastPreset(preset: string) {
        saveLastPreset(preset);
    },
    getLastPreset(): string | null {
        return getLastPreset();
    },
    clearSchedule() {
        clearSchedule();
    },
    async createNewSchedule(): Promise<WorkoutSchedule> {
        return createNewSchedule();
    },
    createNewScheduleSync(): WorkoutSchedule {
        return createNewScheduleSync();
    },

    async getSelectedWorkoutCategories() {
        return getSelectedWorkoutCategories();
    },
    saveSelectedWorkoutCategories(categories: Record<string, boolean>) {
        saveSelectedWorkoutCategories(categories, getScheduleSync);
    },
    clearSelectedWorkoutCategories() {
        clearSelectedWorkoutCategories();
    },
    getSelectedWorkoutCategoriesSync() {
        return getSelectedWorkoutCategoriesSync();
    },

    async getSelectedWorkoutGroups() {
        return getSelectedWorkoutGroups();
    },
    saveSelectedWorkoutGroups(groups: Record<string, boolean>) {
        saveSelectedWorkoutGroups(groups, getScheduleSync);
    },
    clearSelectedWorkoutGroups() {
        clearSelectedWorkoutGroups();
    },
    getSelectedWorkoutGroupsSync() {
        return getSelectedWorkoutGroupsSync();
    },

    async getSelectedWorkoutSubCategories() {
        return getSelectedWorkoutSubCategories();
    },
    saveSelectedWorkoutSubCategories(subCategories: Record<string, boolean>) {
        saveSelectedWorkoutSubCategories(subCategories, getScheduleSync);
    },
    clearSelectedWorkoutSubCategories() {
        clearSelectedWorkoutSubCategories();
    },
    getSelectedWorkoutSubCategoriesSync() {
        return getSelectedWorkoutSubCategoriesSync();
    },

    async getSelectedWorkouts() {
        return getSelectedWorkouts();
    },
    saveSelectedWorkouts(workouts: Record<string, boolean>) {
        saveSelectedWorkouts(workouts, getScheduleSync);
    },
    clearSelectedWorkouts() {
        clearSelectedWorkouts();
    },
    getSelectedWorkoutsSync() {
        return getSelectedWorkoutsSync();
    },

    getSelectionCounts() {
        return getSelectionCounts();
    },

    getTaxonomySignature() {
        return getTaxonomySignature();
    },
    saveTaxonomySignature(signature: string) {
        saveTaxonomySignature(signature);
    },
    syncTaxonomySignature(signature: string) {
        return syncTaxonomySignature(signature);
    },

    subscribeToSelectionChanges(listener: () => void) {
        return subscribeToSelectionChanges(listener);
    },
    notifySelectionChange() {
        notifySelectionChange();
    }
};

export default WorkoutScheduleStore;
