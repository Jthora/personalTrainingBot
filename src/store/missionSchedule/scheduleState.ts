import { createMissionSchedule } from '../../utils/MissionScheduleCreator';
import DifficultySettingsStore from '../DifficultySettingsStore';
import DrillCategoryCache from '../../cache/DrillCategoryCache';
import { logAlignmentForSchedule } from '../../utils/alignmentCheck';
import { recordMetric } from '../../utils/metrics';
import { emitCacheMetric } from '../../utils/cacheMetrics';
import { MissionSchedule, MissionSet, MissionScheduleJSON, MissionBlock } from '../../types/MissionSchedule';
import { Drill } from '../../types/DrillCategory';
import {
    MISSION_SCHEDULE_KEY,
    LAST_PRESET_KEY,
    STORAGE_KEYS,
} from './keys';
import {
    getSelectedDrillCategoriesSync,
    getSelectedDrillGroupsSync,
    getSelectedDrillSubCategoriesSync,
    getSelectedDrillsSync,
} from './selectionState';
import { notifySelectionChange } from './selectionListeners';

const isMissionScheduleJSON = (value: unknown): value is MissionScheduleJSON => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<MissionScheduleJSON>;
    return typeof candidate.date === 'string'
        && Array.isArray(candidate.scheduleItems)
        && typeof candidate.difficultySettings === 'object'
        && candidate.difficultySettings !== null;
};

const parseScheduleFromStorage = (raw: string): MissionSchedule | null => {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isMissionScheduleJSON(parsed)) {
            console.warn('MissionScheduleStore: Stored schedule has invalid shape.');
            return null;
        }
        return MissionSchedule.fromJSON(parsed);
    } catch (error) {
        console.error('MissionScheduleStore: Failed to parse or hydrate schedule from JSON', error);
        return null;
    }
};

export const resetAll = (reason: string) => {
    console.warn('MissionScheduleStore: resetting persisted state due to drift', reason);
    try {
        STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        recordMetric('store_reset_drift', { reason });
        emitCacheMetric({ dataset: 'workout_schedule', status: 'clear', source: 'localStorage', reason });
    } catch (error) {
        console.error('MissionScheduleStore: failed to reset persisted state', error);
    }
};

export const getSchedule = async (): Promise<MissionSchedule | null> => {
    try {
        const schedule = localStorage.getItem(MISSION_SCHEDULE_KEY);
        if (schedule) {
            emitCacheMetric({ dataset: 'workout_schedule', status: 'hit', source: 'localStorage' });
            console.log('MissionScheduleStore: getSchedule: Retrieved drill schedule from localStorage.');
            const missionSchedule = parseScheduleFromStorage(schedule);
            if (missionSchedule && missionSchedule.scheduleItems.length > 0) {
                return missionSchedule;
            }

            console.warn('MissionScheduleStore: Stored schedule invalid or empty. Creating a new schedule.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule' });
            resetAll('invalid_schedule');
        } else {
            console.warn('getSchedule: No drill schedule found in localStorage. Creating a new schedule.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'miss', source: 'localStorage' });
        }

        const defaultSchedule = await createNewSchedule();
        saveSchedule(defaultSchedule);
        return defaultSchedule;
    } catch (error) {
        console.error('Failed to get drill schedule:', error);
        const defaultSchedule = await createNewSchedule();
        saveSchedule(defaultSchedule);
        return defaultSchedule;
    }
};

export const getScheduleSync = (): MissionSchedule | null => {
    try {
        const schedule = localStorage.getItem(MISSION_SCHEDULE_KEY);
        if (!schedule) {
            console.warn('getScheduleSync: No drill schedule found in localStorage.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'miss', source: 'localStorage' });
            return null;
        }

        console.log('MissionScheduleStore: getScheduleSync: Retrieved drill schedule from localStorage.');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'hit', source: 'localStorage' });
        const missionSchedule = parseScheduleFromStorage(schedule);
        if (!missionSchedule || missionSchedule.scheduleItems.length === 0) {
            console.warn('MissionScheduleStore: Stored schedule invalid or empty.');
            emitCacheMetric({ dataset: 'workout_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule_sync' });
            resetAll('invalid_schedule_sync');
            const newSchedule = createNewScheduleSync();
            saveSchedule(newSchedule);
            return newSchedule;
        }

        return missionSchedule;
    } catch (error) {
        console.error('Failed to get drill schedule:', error);
        return null;
    }
};

export const saveSchedule = (schedule: MissionSchedule) => {
    try {
        localStorage.setItem(MISSION_SCHEDULE_KEY, JSON.stringify(schedule.toJSON()));
        console.log('Saved drill schedule to localStorage.');
        emitCacheMetric({ dataset: 'workout_schedule', status: 'write', source: 'localStorage' });
    } catch (error) {
        console.error('Failed to save drill schedule:', error);
    }
};

export const addDrillToSchedule = (drill: Drill, options?: { force?: boolean }): { status: 'added' | 'conflict' | 'error'; reason?: string; schedule?: MissionSchedule } => {
    try {
        const existing = getScheduleSync();

        if (existing) {
            const conflict = existing.scheduleItems.some(item => item instanceof MissionSet && item.drills.some(([w]) => w.id === drill.id));
            if (conflict && !options?.force) {
                return { status: 'conflict', reason: 'Already on current schedule', schedule: existing };
            }

            const updated = new MissionSchedule(
                existing.date,
                [...existing.scheduleItems, new MissionSet([[drill, false]])],
                existing.difficultySettings
            );
            saveSchedule(updated);
            logAlignmentForSchedule(updated);
            notifySelectionChange();
            return { status: 'added', schedule: updated };
        }

        const fallback = new MissionSchedule(
            new Date().toISOString().slice(0, 10),
            [new MissionSet([[drill, false]])],
            DifficultySettingsStore.getSettings()
        );
        saveSchedule(fallback);
        logAlignmentForSchedule(fallback);
        notifySelectionChange();
        return { status: 'added', schedule: fallback };
    } catch (error) {
        console.error('MissionScheduleStore: addDrillToSchedule failed', error);
        return { status: 'error', reason: error instanceof Error ? error.message : 'unknown' };
    }
};

export const updateDrillInSchedule = (drill: Drill): { status: 'updated' | 'not_found' | 'error'; reason?: string; schedule?: MissionSchedule } => {
    try {
        const existing = getScheduleSync();
        if (!existing) return { status: 'not_found', reason: 'No schedule available' };

        let updated = false;
        const nextItems = existing.scheduleItems.map(item => {
            if (item instanceof MissionSet) {
                const nextWorkouts = item.drills.map(([w, completed]) => {
                    if (w.id === drill.id) {
                        updated = true;
                        return [drill, completed] as [Drill, boolean];
                    }
                    return [w, completed] as [Drill, boolean];
                });
                return new MissionSet(nextWorkouts);
            }
            return item;
        });

        if (!updated) return { status: 'not_found', reason: 'Drill not in schedule' };

        const nextSchedule = new MissionSchedule(existing.date, nextItems, existing.difficultySettings);
        saveSchedule(nextSchedule);
        logAlignmentForSchedule(nextSchedule);
        notifySelectionChange();
        return { status: 'updated', schedule: nextSchedule };
    } catch (error) {
        console.error('MissionScheduleStore: updateDrillInSchedule failed', error);
        return { status: 'error', reason: error instanceof Error ? error.message : 'unknown' };
    }
};

export const removeDrillFromSchedule = (workoutId: string): { status: 'removed' | 'not_found' | 'error'; reason?: string; schedule?: MissionSchedule } => {
    try {
        const existing = getScheduleSync();
        if (!existing) return { status: 'not_found', reason: 'No schedule available' };

        let removed = false;
        const nextItems = existing.scheduleItems.reduce<(MissionSet | MissionBlock)[]>((acc, item) => {
            if (item instanceof MissionSet) {
                const filtered = item.drills.filter(([w]) => w.id !== workoutId);
                if (filtered.length !== item.drills.length) removed = true;

                if (filtered.length > 0) acc.push(new MissionSet(filtered));
                return acc;
            }

            acc.push(item);
            return acc;
        }, []);

        if (!removed) return { status: 'not_found', reason: 'Drill not in schedule' };

        const nextSchedule = new MissionSchedule(existing.date, nextItems, existing.difficultySettings);
        saveSchedule(nextSchedule);
        logAlignmentForSchedule(nextSchedule);
        notifySelectionChange();
        return { status: 'removed', schedule: nextSchedule };
    } catch (error) {
        console.error('MissionScheduleStore: removeDrillFromSchedule failed', error);
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
        localStorage.removeItem(MISSION_SCHEDULE_KEY);
        console.log('Cleared drill schedule from localStorage.');
    } catch (error) {
        console.error('Failed to clear drill schedule:', error);
    }
};

export const createNewSchedule = async (): Promise<MissionSchedule> => {
    return createMissionSchedule();
};

export const createNewScheduleSync = (): MissionSchedule => {
    const selectedCategories = getSelectedDrillCategoriesSync();
    const selectedGroups = getSelectedDrillGroupsSync();
    const selectedSubCategories = getSelectedDrillSubCategoriesSync();
    const selectedDrills = getSelectedDrillsSync();

    const drills = createMissionScheduleFiltered(selectedCategories, selectedSubCategories, selectedGroups, selectedDrills);
    const difficultySettings = DifficultySettingsStore.getSettings();

    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);
    const filtered = drills.filter(drill => drill.difficulty_range[0] <= difficultyLevel && drill.difficulty_range[1] >= difficultyLevel);
    const picked = filtered.length > 0 ? filtered : drills;

    const shuffled = [...picked].sort(() => 0.5 - Math.random());
    const selectedDrillsForSchedule = shuffled.slice(0, Math.min(10, shuffled.length));

    const missionSets: MissionSet[] = [];
    const missionBlocks: MissionBlock[] = [];
    for (let i = 0; i < selectedDrillsForSchedule.length; i += 3) {
        const slice = selectedDrillsForSchedule.slice(i, i + 3);
        missionSets.push(new MissionSet(slice.map(w => [w, false])));
        const duration = Math.floor(Math.random() * (45 - 30 + 1)) + 30;
        missionBlocks.push(new MissionBlock(`Standby ${(i / 3) + 1}`, 'Review intel and prepare for the next phase.', duration, 'Consolidate findings, update case notes, and verify continuity before proceeding.'));
    }

    const scheduleItems: (MissionSet | MissionBlock)[] = [];
    missionSets.forEach((set, idx) => {
        scheduleItems.push(set);
        if (missionBlocks[idx]) scheduleItems.push(missionBlocks[idx]);
    });

    return new MissionSchedule(new Date().toISOString(), scheduleItems, difficultySettings);
};

const createMissionScheduleFiltered = (
    selectedCategories: ReturnType<typeof getSelectedDrillCategoriesSync>,
    selectedSubCategories: ReturnType<typeof getSelectedDrillSubCategoriesSync>,
    selectedGroups: ReturnType<typeof getSelectedDrillGroupsSync>,
    selectedDrills: ReturnType<typeof getSelectedDrillsSync>
) => {
    return DrillCategoryCache
        .getInstance()
        .getAllWorkoutsFilteredBy(selectedCategories, selectedSubCategories, selectedGroups, selectedDrills);
};
