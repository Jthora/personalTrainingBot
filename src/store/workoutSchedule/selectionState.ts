import { logAlignmentForSchedule } from '../../utils/alignmentCheck';
import { emitCacheMetric } from '../../utils/cacheMetrics';
import {
    SELECTED_CATEGORIES_KEY,
    SELECTED_GROUPS_KEY,
    SELECTED_SUBCATEGORIES_KEY,
    SELECTED_WORKOUTS_KEY,
    TAXONOMY_SIGNATURE_KEY,
} from './keys';
import {
    getDefaultSelectedWorkoutCategories,
    getDefaultSelectedWorkoutGroups,
    getDefaultSelectedWorkoutSubCategories,
    getDefaultSelectedWorkouts,
} from './defaults';
import { notifySelectionChange } from './selectionListeners';
import { SelectedWorkoutCategories, SelectedWorkoutGroups, SelectedWorkoutSubCategories, SelectedWorkouts } from '../../types/WorkoutCategory';
import { WorkoutSchedule } from '../../types/WorkoutSchedule';

const isBooleanRecord = (value: unknown): value is Record<string, boolean> => {
    if (!value || typeof value !== 'object') return false;
    return Object.values(value as Record<string, unknown>).every(entry => typeof entry === 'boolean');
};

type ScheduleGetter = () => WorkoutSchedule | null;

const alignIfSchedule = (getScheduleSync?: ScheduleGetter) => {
    if (!getScheduleSync) return;
    const schedule = getScheduleSync();
    if (schedule) logAlignmentForSchedule(schedule);
};

export const getSelectedWorkoutCategoriesSync = (): SelectedWorkoutCategories => {
    try {
        const categories = localStorage.getItem(SELECTED_CATEGORIES_KEY);
        if (categories) {
            console.log('Retrieved selected workout categories from localStorage.');
            const parsed = JSON.parse(categories) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedWorkoutCategories;
            console.warn('Invalid selected workout categories found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected workout categories found in localStorage. Using all categories.');
        }
    } catch (error) {
        console.error('Failed to get selected workout categories:', error);
    }

    const selectedCategories = getDefaultSelectedWorkoutCategories();
    saveSelectedWorkoutCategories(selectedCategories);
    return selectedCategories;
};

export const getSelectedWorkoutCategories = async (): Promise<SelectedWorkoutCategories> => {
    return getSelectedWorkoutCategoriesSync();
};

export const saveSelectedWorkoutCategories = (categories: SelectedWorkoutCategories, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(categories));
        console.log('Saved selected workout categories to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected workout categories:', error);
    }
};

export const clearSelectedWorkoutCategories = () => {
    try {
        localStorage.removeItem(SELECTED_CATEGORIES_KEY);
        console.log('Cleared selected workout categories from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected workout categories:', error);
    }
};

export const getSelectedWorkoutGroupsSync = (): SelectedWorkoutGroups => {
    try {
        const groups = localStorage.getItem(SELECTED_GROUPS_KEY);
        if (groups) {
            console.log('Retrieved selected workout groups from localStorage.');
            const parsed = JSON.parse(groups) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedWorkoutGroups;
            console.warn('Invalid selected workout groups found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected workout groups found in localStorage. Using all groups.');
        }
    } catch (error) {
        console.error('Failed to get selected workout groups:', error);
    }

    const selectedGroups = getDefaultSelectedWorkoutGroups();
    saveSelectedWorkoutGroups(selectedGroups);
    return selectedGroups;
};

export const getSelectedWorkoutGroups = async (): Promise<SelectedWorkoutGroups> => {
    return getSelectedWorkoutGroupsSync();
};

export const saveSelectedWorkoutGroups = (groups: SelectedWorkoutGroups, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_GROUPS_KEY, JSON.stringify(groups));
        console.log('Saved selected workout groups to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected workout groups:', error);
    }
};

export const clearSelectedWorkoutGroups = () => {
    try {
        localStorage.removeItem(SELECTED_GROUPS_KEY);
        console.log('Cleared selected workout groups from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected workout groups:', error);
    }
};

export const getSelectedWorkoutSubCategoriesSync = (): SelectedWorkoutSubCategories => {
    try {
        const subCategories = localStorage.getItem(SELECTED_SUBCATEGORIES_KEY);
        if (subCategories) {
            console.log('Retrieved selected workout subcategories from localStorage.');
            const parsed = JSON.parse(subCategories) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedWorkoutSubCategories;
            console.warn('Invalid selected workout subcategories found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected workout subcategories found in localStorage. Using all subcategories.');
        }
    } catch (error) {
        console.error('Failed to get selected workout subcategories:', error);
    }

    const selectedSubCategories = getDefaultSelectedWorkoutSubCategories();
    saveSelectedWorkoutSubCategories(selectedSubCategories);
    return selectedSubCategories;
};

export const getSelectedWorkoutSubCategories = async (): Promise<SelectedWorkoutSubCategories> => {
    return getSelectedWorkoutSubCategoriesSync();
};

export const saveSelectedWorkoutSubCategories = (subCategories: SelectedWorkoutSubCategories, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_SUBCATEGORIES_KEY, JSON.stringify(subCategories));
        console.log('Saved selected workout subcategories to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected workout subcategories:', error);
    }
};

export const clearSelectedWorkoutSubCategories = () => {
    try {
        localStorage.removeItem(SELECTED_SUBCATEGORIES_KEY);
        console.log('Cleared selected workout subcategories from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected workout subcategories:', error);
    }
};

export const getSelectedWorkoutsSync = (): SelectedWorkouts => {
    try {
        const workouts = localStorage.getItem(SELECTED_WORKOUTS_KEY);
        if (workouts) {
            console.log('Retrieved selected workouts from localStorage.');
            const parsed = JSON.parse(workouts) as unknown;
            if (isBooleanRecord(parsed)) return parsed as SelectedWorkouts;
            console.warn('Invalid selected workouts found in storage. Resetting to defaults.');
        } else {
            console.warn('No selected workouts found in localStorage. Using all workouts.');
        }
    } catch (error) {
        console.error('Failed to get selected workouts:', error);
    }

    const selectedWorkouts = getDefaultSelectedWorkouts();
    saveSelectedWorkouts(selectedWorkouts);
    return selectedWorkouts;
};

export const getSelectedWorkouts = async (): Promise<SelectedWorkouts> => {
    return getSelectedWorkoutsSync();
};

export const saveSelectedWorkouts = (workouts: SelectedWorkouts, getScheduleSync?: ScheduleGetter) => {
    try {
        localStorage.setItem(SELECTED_WORKOUTS_KEY, JSON.stringify(workouts));
        console.log('Saved selected workouts to localStorage.');
        alignIfSchedule(getScheduleSync);
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to save selected workouts:', error);
    }
};

export const clearSelectedWorkouts = () => {
    try {
        localStorage.removeItem(SELECTED_WORKOUTS_KEY);
        console.log('Cleared selected workouts from localStorage.');
        notifySelectionChange();
    } catch (error) {
        console.error('Failed to clear selected workouts:', error);
    }
};

export const getSelectionCounts = () => {
    const categories = getSelectedWorkoutCategoriesSync();
    const workouts = getSelectedWorkoutsSync();
    return {
        categories: Object.values(categories).filter(Boolean).length,
        workouts: Object.values(workouts).filter(Boolean).length,
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

    console.warn('WorkoutScheduleStore: Taxonomy signature mismatch. Clearing stored selections.');
    clearSelectedWorkoutCategories();
    clearSelectedWorkoutGroups();
    clearSelectedWorkoutSubCategories();
    clearSelectedWorkouts();
    saveTaxonomySignature(signature);
    emitCacheMetric({ dataset: 'workout_schedule', status: 'clear', source: 'localStorage', reason: 'taxonomy_mismatch' });
    return false;
};

export const clearAllSelections = () => {
    clearSelectedWorkoutCategories();
    clearSelectedWorkoutGroups();
    clearSelectedWorkoutSubCategories();
    clearSelectedWorkouts();
};
