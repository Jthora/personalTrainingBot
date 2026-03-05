const STORAGE_VERSION = 'v2';
const STORAGE_PREFIX = `workout:${STORAGE_VERSION}:`;

export const withVersionedKey = (base: string) => `${STORAGE_PREFIX}${base}`;

export const WORKOUT_SCHEDULE_KEY = withVersionedKey('schedule');
export const SELECTED_CATEGORIES_KEY = withVersionedKey('selectedWorkoutCategories');
export const SELECTED_SUBCATEGORIES_KEY = withVersionedKey('selectedWorkoutSubCategories');
export const SELECTED_GROUPS_KEY = withVersionedKey('selectedWorkoutGroups');
export const SELECTED_WORKOUTS_KEY = withVersionedKey('selectedWorkouts');
export const TAXONOMY_SIGNATURE_KEY = withVersionedKey('taxonomySignature');
export const LAST_PRESET_KEY = withVersionedKey('lastPreset');

export const STORAGE_KEYS = [
    WORKOUT_SCHEDULE_KEY,
    SELECTED_CATEGORIES_KEY,
    SELECTED_SUBCATEGORIES_KEY,
    SELECTED_GROUPS_KEY,
    SELECTED_WORKOUTS_KEY,
    TAXONOMY_SIGNATURE_KEY,
    LAST_PRESET_KEY,
];
