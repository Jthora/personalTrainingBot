import {
    addDrillToSchedule,
    clearSchedule,
    createNewSchedule,
    createNewScheduleSync,
    getLastPreset,
    getSchedule,
    getScheduleSync,
    removeDrillFromSchedule,
    resetAll,
    saveLastPreset,
    saveSchedule,
    updateDrillInSchedule,
} from './missionSchedule/scheduleState';
import {
    clearSelectedDrillCategories,
    clearSelectedDrillGroups,
    clearSelectedDrillSubCategories,
    clearSelectedDrills,
    getSelectedDrillCategories,
    getSelectedDrillCategoriesSync,
    getSelectedDrillGroups,
    getSelectedDrillGroupsSync,
    getSelectedDrillSubCategories,
    getSelectedDrillSubCategoriesSync,
    getSelectedDrills,
    getSelectedDrillsSync,
    saveSelectedDrillCategories,
    saveSelectedDrillGroups,
    saveSelectedDrillSubCategories,
    saveSelectedDrills,
    getSelectionCounts,
    getTaxonomySignature,
    saveTaxonomySignature,
    syncTaxonomySignature,
} from './missionSchedule/selectionState';
import { notifySelectionChange, subscribeToSelectionChanges } from './missionSchedule/selectionListeners';
import { Drill } from '../types/DrillCategory';
import { MissionSchedule } from '../types/MissionSchedule';

const MissionScheduleStore = {
    resetAll,
    async getSchedule(): Promise<MissionSchedule | null> {
        return getSchedule();
    },
    getScheduleSync(): MissionSchedule | null {
        return getScheduleSync();
    },
    saveSchedule(schedule: MissionSchedule) {
        saveSchedule(schedule);
    },
    addDrillToSchedule(drill: Drill, options?: { force?: boolean }) {
        return addDrillToSchedule(drill, options);
    },
    updateDrillInSchedule(drill: Drill) {
        return updateDrillInSchedule(drill);
    },
    removeDrillFromSchedule(workoutId: string) {
        return removeDrillFromSchedule(workoutId);
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
    async createNewSchedule(): Promise<MissionSchedule> {
        return createNewSchedule();
    },
    createNewScheduleSync(): MissionSchedule {
        return createNewScheduleSync();
    },

    async getSelectedDrillCategories() {
        return getSelectedDrillCategories();
    },
    saveSelectedDrillCategories(categories: Record<string, boolean>) {
        saveSelectedDrillCategories(categories, getScheduleSync);
    },
    clearSelectedDrillCategories() {
        clearSelectedDrillCategories();
    },
    getSelectedDrillCategoriesSync() {
        return getSelectedDrillCategoriesSync();
    },

    async getSelectedDrillGroups() {
        return getSelectedDrillGroups();
    },
    saveSelectedDrillGroups(groups: Record<string, boolean>) {
        saveSelectedDrillGroups(groups, getScheduleSync);
    },
    clearSelectedDrillGroups() {
        clearSelectedDrillGroups();
    },
    getSelectedDrillGroupsSync() {
        return getSelectedDrillGroupsSync();
    },

    async getSelectedDrillSubCategories() {
        return getSelectedDrillSubCategories();
    },
    saveSelectedDrillSubCategories(subCategories: Record<string, boolean>) {
        saveSelectedDrillSubCategories(subCategories, getScheduleSync);
    },
    clearSelectedDrillSubCategories() {
        clearSelectedDrillSubCategories();
    },
    getSelectedDrillSubCategoriesSync() {
        return getSelectedDrillSubCategoriesSync();
    },

    async getSelectedDrills() {
        return getSelectedDrills();
    },
    saveSelectedDrills(drills: Record<string, boolean>) {
        saveSelectedDrills(drills, getScheduleSync);
    },
    clearSelectedDrills() {
        clearSelectedDrills();
    },
    getSelectedDrillsSync() {
        return getSelectedDrillsSync();
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

export default MissionScheduleStore;
