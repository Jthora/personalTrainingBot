import { createWorkoutSchedule } from '../../utils/WorkoutScheduleCreator';
import DifficultySettingsStore from '../DifficultySettingsStore';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { logAlignmentForSchedule } from '../../utils/alignmentCheck';
import { recordMetric } from '../../utils/metrics';
import { emitCacheMetric } from '../../utils/cacheMetrics';
import { WorkoutSchedule, WorkoutSet, WorkoutScheduleJSON, WorkoutBlock } from '../../types/WorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';
import {
    WORKOUT_SCHEDULE_KEY,
    LAST_PRESET_KEY,
    STORAGE_KEYS,
} from './keys';
import {
    getSelectedWorkoutCategoriesSync,
    getSelectedWorkoutGroupsSync,
    getSelectedWorkoutSubCategoriesSync,
    getSelectedWorkoutsSync,
} from './selectionState';
import { notifySelectionChange } from './selectionListeners';

const isWorkoutScheduleJSON = (value: unknown): value is WorkoutScheduleJSON => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<WorkoutScheduleJSON>;
    return typeof candidate.date === 'string'
        && Array.isArray(candidate.scheduleItems)
        && typeof candidate.difficultySettings === 'object'
        && candidate.difficultySettings !== null;
};

const parseScheduleFromStorage = (raw: string): WorkoutSchedule | null => {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isWorkoutScheduleJSON(parsed)) {
            console.warn('WorkoutScheduleStore: Stored schedule has invalid shape.');
            return null;
        }
        return WorkoutSchedule.fromJSON(parsed);
    } catch (error) {
        console.error('WorkoutScheduleStore: Failed to parse or hydrate schedule from JSON', error);
        return null;
    }
};

export const resetAll = (reason: string) => {
    console.warn('WorkoutScheduleStore: resetting persisted state due to drift', reason);
    try {
        STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        recordMetric('store_reset_drift', { reason });
        emitCacheMetric({ dataset: 'workout_schedule', status: 'clear', source: 'localStorage', reason });
    } catch (error) {
        console.error('WorkoutScheduleStore: failed to reset persisted state', error);
    }
};

export const getSchedule = async (): Promise<WorkoutSchedule | null> => {
    try {
        const schedule = localStorage.getItem(WORKOUT_SCHEDULE_KEY);
        if (schedule) {
            emitCacheMetric({ dataset: 'workout_schedule', status: 'hit', source: 'localStorage' });
            console.log('WorkoutScheduleStore: getSchedule: Retrieved workout schedule from localStorage.');
            const workoutSchedule = parseScheduleFromStorage(schedule);
            if (workoutSchedule && workoutSchedule.scheduleItems.length > 0) {
                return workoutSchedule;
            }

            console.warn('WorkoutScheduleStore: Stored schedule invalid or empty. Creating a new schedule.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule' });
            resetAll('invalid_schedule');
        } else {
            console.warn('getSchedule: No workout schedule found in localStorage. Creating a new schedule.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'miss', source: 'localStorage' });
        }

        const defaultSchedule = await createNewSchedule();
        saveSchedule(defaultSchedule);
        return defaultSchedule;
    } catch (error) {
        console.error('Failed to get workout schedule:', error);
        const defaultSchedule = await createNewSchedule();
        saveSchedule(defaultSchedule);
        return defaultSchedule;
    }
};

export const getScheduleSync = (): WorkoutSchedule | null => {
    try {
        const schedule = localStorage.getItem(WORKOUT_SCHEDULE_KEY);
        if (!schedule) {
            console.warn('getScheduleSync: No workout schedule found in localStorage.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'miss', source: 'localStorage' });
            return null;
        }

        console.log('WorkoutScheduleStore: getScheduleSync: Retrieved workout schedule from localStorage.');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'hit', source: 'localStorage' });
        const workoutSchedule = parseScheduleFromStorage(schedule);
        if (!workoutSchedule || workoutSchedule.scheduleItems.length === 0) {
            console.warn('WorkoutScheduleStore: Stored schedule invalid or empty.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule_sync' });
            resetAll('invalid_schedule_sync');
            const newSchedule = createNewScheduleSync();
            saveSchedule(newSchedule);
            return newSchedule;
        }

        return workoutSchedule;
    } catch (error) {
        console.error('Failed to get workout schedule:', error);
        return null;
    }
};

export const saveSchedule = (schedule: WorkoutSchedule) => {
    try {
        localStorage.setItem(WORKOUT_SCHEDULE_KEY, JSON.stringify(schedule.toJSON()));
        console.log('Saved workout schedule to localStorage.');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'write', source: 'localStorage' });
    } catch (error) {
        console.error('Failed to save workout schedule:', error);
    }
};

export const addWorkoutToSchedule = (workout: Workout, options?: { force?: boolean }): { status: 'added' | 'conflict' | 'error'; reason?: string; schedule?: WorkoutSchedule } => {
    try {
        const existing = getScheduleSync();

        if (existing) {
            const conflict = existing.scheduleItems.some(item => item instanceof WorkoutSet && item.workouts.some(([w]) => w.id === workout.id));
            if (conflict && !options?.force) {
                return { status: 'conflict', reason: 'Already on current schedule', schedule: existing };
            }

            const updated = new WorkoutSchedule(
                existing.date,
                [...existing.scheduleItems, new WorkoutSet([[workout, false]])],
                existing.difficultySettings
            );
            saveSchedule(updated);
            logAlignmentForSchedule(updated);
            notifySelectionChange();
            return { status: 'added', schedule: updated };
        }

        const fallback = new WorkoutSchedule(
            new Date().toISOString().slice(0, 10),
            [new WorkoutSet([[workout, false]])],
            DifficultySettingsStore.getSettings()
        );
        saveSchedule(fallback);
        logAlignmentForSchedule(fallback);
        notifySelectionChange();
        return { status: 'added', schedule: fallback };
    } catch (error) {
        console.error('WorkoutScheduleStore: addWorkoutToSchedule failed', error);
        return { status: 'error', reason: error instanceof Error ? error.message : 'unknown' };
    }
};

export const updateWorkoutInSchedule = (workout: Workout): { status: 'updated' | 'not_found' | 'error'; reason?: string; schedule?: WorkoutSchedule } => {
    try {
        const existing = getScheduleSync();
        if (!existing) return { status: 'not_found', reason: 'No schedule available' };

        let updated = false;
        const nextItems = existing.scheduleItems.map(item => {
            if (item instanceof WorkoutSet) {
                const nextWorkouts = item.workouts.map(([w, completed]) => {
                    if (w.id === workout.id) {
                        updated = true;
                        return [workout, completed] as [Workout, boolean];
                    }
                    return [w, completed] as [Workout, boolean];
                });
                return new WorkoutSet(nextWorkouts);
            }
            return item;
        });

        if (!updated) return { status: 'not_found', reason: 'Workout not in schedule' };

        const nextSchedule = new WorkoutSchedule(existing.date, nextItems, existing.difficultySettings);
        saveSchedule(nextSchedule);
        logAlignmentForSchedule(nextSchedule);
        notifySelectionChange();
        return { status: 'updated', schedule: nextSchedule };
    } catch (error) {
        console.error('WorkoutScheduleStore: updateWorkoutInSchedule failed', error);
        return { status: 'error', reason: error instanceof Error ? error.message : 'unknown' };
    }
};

export const removeWorkoutFromSchedule = (workoutId: string): { status: 'removed' | 'not_found' | 'error'; reason?: string; schedule?: WorkoutSchedule } => {
    try {
        const existing = getScheduleSync();
        if (!existing) return { status: 'not_found', reason: 'No schedule available' };

        let removed = false;
        const nextItems = existing.scheduleItems.reduce<(WorkoutSet | WorkoutBlock)[]>((acc, item) => {
            if (item instanceof WorkoutSet) {
                const filtered = item.workouts.filter(([w]) => w.id !== workoutId);
                if (filtered.length !== item.workouts.length) removed = true;

                if (filtered.length > 0) acc.push(new WorkoutSet(filtered));
                return acc;
            }

            acc.push(item);
            return acc;
        }, []);

        if (!removed) return { status: 'not_found', reason: 'Workout not in schedule' };

        const nextSchedule = new WorkoutSchedule(existing.date, nextItems, existing.difficultySettings);
        saveSchedule(nextSchedule);
        logAlignmentForSchedule(nextSchedule);
        notifySelectionChange();
        return { status: 'removed', schedule: nextSchedule };
    } catch (error) {
        console.error('WorkoutScheduleStore: removeWorkoutFromSchedule failed', error);
        return { status: 'error', reason: error instanceof Error ? error.message : 'unknown' };
    }
};

export const saveLastPreset = (preset: string) => {
    try {
        localStorage.setItem(LAST_PRESET_KEY, preset);
    } catch (error) {
        console.error('Failed to save last preset:', error);
    }
};

export const getLastPreset = (): string | null => {
    try {
        return localStorage.getItem(LAST_PRESET_KEY);
    } catch (error) {
        console.error('Failed to get last preset:', error);
        return null;
    }
};

export const clearSchedule = () => {
    try {
        localStorage.removeItem(WORKOUT_SCHEDULE_KEY);
        console.log('Cleared workout schedule from localStorage.');
    } catch (error) {
        console.error('Failed to clear workout schedule:', error);
    }
};

export const createNewSchedule = async (): Promise<WorkoutSchedule> => {
    return createWorkoutSchedule();
};

export const createNewScheduleSync = (): WorkoutSchedule => {
    const selectedCategories = getSelectedWorkoutCategoriesSync();
    const selectedGroups = getSelectedWorkoutGroupsSync();
    const selectedSubCategories = getSelectedWorkoutSubCategoriesSync();
    const selectedWorkouts = getSelectedWorkoutsSync();

    const workouts = createWorkoutScheduleFiltered(selectedCategories, selectedSubCategories, selectedGroups, selectedWorkouts);
    const difficultySettings = DifficultySettingsStore.getSettings();

    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);
    const filtered = workouts.filter(workout => workout.difficulty_range[0] <= difficultyLevel && workout.difficulty_range[1] >= difficultyLevel);
    const picked = filtered.length > 0 ? filtered : workouts;

    const shuffled = [...picked].sort(() => 0.5 - Math.random());
    const selectedWorkoutsForSchedule = shuffled.slice(0, Math.min(10, shuffled.length));

    const workoutSets: WorkoutSet[] = [];
    const workoutBlocks: WorkoutBlock[] = [];
    for (let i = 0; i < selectedWorkoutsForSchedule.length; i += 3) {
        const slice = selectedWorkoutsForSchedule.slice(i, i + 3);
        workoutSets.push(new WorkoutSet(slice.map(w => [w, false])));
        const duration = Math.floor(Math.random() * (45 - 30 + 1)) + 30;
        workoutBlocks.push(new WorkoutBlock(`Block ${(i / 3) + 1}`, 'Do something productive!', duration, 'Take a break and do something productive between workout sets.'));
    }

    const scheduleItems: (WorkoutSet | WorkoutBlock)[] = [];
    workoutSets.forEach((set, idx) => {
        scheduleItems.push(set);
        if (workoutBlocks[idx]) scheduleItems.push(workoutBlocks[idx]);
    });

    return new WorkoutSchedule(new Date().toISOString(), scheduleItems, difficultySettings);
};

const createWorkoutScheduleFiltered = (
    selectedCategories: ReturnType<typeof getSelectedWorkoutCategoriesSync>,
    selectedSubCategories: ReturnType<typeof getSelectedWorkoutSubCategoriesSync>,
    selectedGroups: ReturnType<typeof getSelectedWorkoutGroupsSync>,
    selectedWorkouts: ReturnType<typeof getSelectedWorkoutsSync>
) => {
    return WorkoutCategoryCache
        .getInstance()
        .getAllWorkoutsFilteredBy(selectedCategories, selectedSubCategories, selectedGroups, selectedWorkouts);
};
