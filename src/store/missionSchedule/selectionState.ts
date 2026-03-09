import { logAlignmentForSchedule } from '../../utils/alignmentCheck';
import { emitCacheMetric } from '../../utils/cacheMetrics';
import {
    SELECTED_CATEGORIES_KEY,
    SELECTED_GROUPS_KEY,
    SELECTED_SUBCATEGORIES_KEY,
    SELECTED_DRILLS_KEY,
    TAXONOMY_SIGNATURE_KEY,
} from './keys';
import {
    getDefaultSelectedDrillCategories,
    getDefaultSelectedDrillGroups,
    getDefaultSelectedDrillSubCategories,
    getDefaultSelectedDrills,
} from './defaults';
import { notifySelectionChange } from './selectionListeners';
import { SelectedDrillCategories, SelectedDrillGroups, SelectedDrillSubCategories, SelectedDrills } from '../../types/DrillCategory';
import { MissionSchedule } from '../../types/MissionSchedule';

const isBooleanRecord = (value: unknown): value is Record<string, boolean> => {
    if (!value || typeof value !== 'object') return false;
    return Object.values(value as Record<string, unknown>).every(entry => typeof entry === 'boolean');
};

type ScheduleGetter = () => MissionSchedule | null;

const alignIfSchedule = (getScheduleSync?: ScheduleGetter) => {
    if (!getScheduleSync) return;
    const schedule = getScheduleSync();
    if (schedule) logAlignmentForSchedule(schedule);
};

export const getSelectedDrillCategoriesSync = (): SelectedDrillCategories => {
    try {
        const categories = localStorage.getItem(SELECTED_CATEGORIES_KEY);
        if (categories) {
            console.log('Retrieved selected drill categories from localStorage.');
            const parsed = JSON.parse(categories) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedDrillCategories;
            console.warn('Invalid selected drill categories found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected drill categories found in localStorage. Using all categories.');
        }
    } catch (error) {
        console.error('Failed to get selected drill categories:', error);
    }

    const selectedCategories = getDefaultSelectedDrillCategories();
    saveSelectedDrillCategories(selectedCategories);
    return selectedCategories;
};

export const getSelectedDrillCategories = async (): Promise<SelectedDrillCategories> => {
    return getSelectedDrillCategoriesSync();
};

export const saveSelectedDrillCategories = (categories: SelectedDrillCategories, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(categories));
        console.log('Saved selected drill categories to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected drill categories:', error);
    }
};

export const clearSelectedDrillCategories = () => {
    try {
        localStorage.removeItem(SELECTED_CATEGORIES_KEY);
        console.log('Cleared selected drill categories from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected drill categories:', error);
    }
};

export const getSelectedDrillGroupsSync = (): SelectedDrillGroups => {
    try {
        const groups = localStorage.getItem(SELECTED_GROUPS_KEY);
        if (groups) {
            console.log('Retrieved selected drill groups from localStorage.');
            const parsed = JSON.parse(groups) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedDrillGroups;
            console.warn('Invalid selected drill groups found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected drill groups found in localStorage. Using all groups.');
        }
    } catch (error) {
        console.error('Failed to get selected drill groups:', error);
    }

    const selectedGroups = getDefaultSelectedDrillGroups();
    saveSelectedDrillGroups(selectedGroups);
    return selectedGroups;
};

export const getSelectedDrillGroups = async (): Promise<SelectedDrillGroups> => {
    return getSelectedDrillGroupsSync();
};

export const saveSelectedDrillGroups = (groups: SelectedDrillGroups, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_GROUPS_KEY, JSON.stringify(groups));
        console.log('Saved selected drill groups to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected drill groups:', error);
    }
};

export const clearSelectedDrillGroups = () => {
    try {
        localStorage.removeItem(SELECTED_GROUPS_KEY);
        console.log('Cleared selected drill groups from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected drill groups:', error);
    }
};

export const getSelectedDrillSubCategoriesSync = (): SelectedDrillSubCategories => {
    try {
        const subCategories = localStorage.getItem(SELECTED_SUBCATEGORIES_KEY);
        if (subCategories) {
            console.log('Retrieved selected drill subcategories from localStorage.');
            const parsed = JSON.parse(subCategories) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedDrillSubCategories;
            console.warn('Invalid selected drill subcategories found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected drill subcategories found in localStorage. Using all subcategories.');
        }
    } catch (error) {
        console.error('Failed to get selected drill subcategories:', error);
    }

    const selectedSubCategories = getDefaultSelectedDrillSubCategories();
    saveSelectedDrillSubCategories(selectedSubCategories);
    return selectedSubCategories;
};

export const getSelectedDrillSubCategories = async (): Promise<SelectedDrillSubCategories> => {
    return getSelectedDrillSubCategoriesSync();
};

export const saveSelectedDrillSubCategories = (subCategories: SelectedDrillSubCategories, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_SUBCATEGORIES_KEY, JSON.stringify(subCategories));
        console.log('Saved selected drill subcategories to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected drill subcategories:', error);
    }
};

export const clearSelectedDrillSubCategories = () => {
    try {
        localStorage.removeItem(SELECTED_SUBCATEGORIES_KEY);
        console.log('Cleared selected drill subcategories from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected drill subcategories:', error);
    }
};

export const getSelectedDrillsSync = (): SelectedDrills => {
    try {
        const drills = localStorage.getItem(SELECTED_DRILLS_KEY);
        if (drills) {
            console.log('Retrieved selected drills from localStorage.');
            const parsed = JSON.parse(drills) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedDrills;
            console.warn('Invalid selected drills found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected drills found in localStorage. Using all drills.');
        }
    } catch (error) {
        console.error('Failed to get selected drills:', error);
    }

    const selectedDrills = getDefaultSelectedDrills();
    saveSelectedDrills(selectedDrills);
    return selectedDrills;
};

export const getSelectedDrills = async (): Promise<SelectedDrills> => {
    return getSelectedDrillsSync();
};

export const saveSelectedDrills = (drills: SelectedDrills, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_DRILLS_KEY, JSON.stringify(drills));
        console.log('Saved selected drills to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected drills:', error);
    }
};

export const clearSelectedDrills = () => {
    try {
        localStorage.removeItem(SELECTED_DRILLS_KEY);
        console.log('Cleared selected drills from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected drills:', error);
    }
};

export const getSelectionCounts = () => {
    const categories = getSelectedDrillCategoriesSync();
    const drills = getSelectedDrillsSync();
    return {
        categories: Object.values(categories).filter(Boolean).length,
        drills: Object.values(drills).filter(Boolean).length,
    };
};

export const getTaxonomySignature = (): string | null => {
    try {
        return localStorage.getItem(TAXONOMY_SIGNATURE_KEY);
    } catch (error) {
        console.error('Failed to get taxonomy signature:', error);
        return null;
    }
};

export const saveTaxonomySignature = (signature: string) => {
    try {
        localStorage.setItem(TAXONOMY_SIGNATURE_KEY, signature);
    } catch (error) {
        console.error('Failed to save taxonomy signature:', error);
    }
};

export const syncTaxonomySignature = (signature: string) => {
    const existing = getTaxonomySignature();

    if (!existing) {
        saveTaxonomySignature(signature);
        return true;
    }

    if (existing === signature) {
        return true;
    }

    console.warn('MissionScheduleStore: Taxonomy signature mismatch. Clearing stored selections.');
    clearSelectedDrillCategories();
    clearSelectedDrillGroups();
    clearSelectedDrillSubCategories();
    clearSelectedDrills();
    saveTaxonomySignature(signature);
    emitCacheMetric({ dataset: 'workout_schedule', status: 'clear', source: 'localStorage', reason: 'taxonomy_mismatch' });
    return false;
};

export const clearAllSelections = () => {
    clearSelectedDrillCategories();
    clearSelectedDrillGroups();
    clearSelectedDrillSubCategories();
    clearSelectedDrills();
};
