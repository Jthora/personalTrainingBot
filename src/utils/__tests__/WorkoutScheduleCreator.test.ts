import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Workout } from '../../types/WorkoutCategory';

const flagValues: Record<'generatorSwap' | 'calendarSurface' | 'migrationBridge', boolean> = {
    generatorSwap: true,
    calendarSurface: false,
    migrationBridge: false,
};

const mockCacheInstance = {
    isLoading: vi.fn(() => false),
    getAllWorkoutsSelected: vi.fn(),
    getAllWorkouts: vi.fn(),
};

vi.mock('../../config/featureFlags', () => ({
    __esModule: true,
    isFeatureEnabled: (flag: 'generatorSwap' | 'calendarSurface' | 'migrationBridge') => flagValues[flag],
}));

vi.mock('../../cache/WorkoutCategoryCache', () => ({
    __esModule: true,
    default: {
        getInstance: () => mockCacheInstance,
    },
}));

vi.mock('../../store/DifficultySettingsStore', () => ({
    __esModule: true,
    default: {
        getSettings: () => ({ level: 1, range: [1, 2] }),
        getWeightedRandomDifficulty: () => 1,
    },
}));

// Import after mocks
import { createWorkoutSchedule } from '../WorkoutScheduleCreator';

const makeWorkout = (name: string, difficulty: [number, number]) =>
    new Workout(name, 'desc', '30', 'medium', difficulty);

describe('createWorkoutSchedule (feature-flagged generator)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        flagValues.generatorSwap = true;
        flagValues.calendarSurface = false;
        flagValues.migrationBridge = false;
        mockCacheInstance.isLoading.mockReturnValue(false);
    });

    it('uses modern generator when generatorSwap is on', async () => {
        mockCacheInstance.getAllWorkoutsSelected.mockReturnValue([
            makeWorkout('A', [0, 2]),
            makeWorkout('B', [0, 2]),
            makeWorkout('C', [0, 2]),
        ]);

        const schedule = await createWorkoutSchedule();

        expect(mockCacheInstance.getAllWorkoutsSelected).toHaveBeenCalled();
        expect(mockCacheInstance.getAllWorkouts).not.toHaveBeenCalled();
        expect(schedule.scheduleItems.length).toBeGreaterThan(0);
        expect(schedule.scheduleItems.length).toBe(2); // 1 set + 1 block for 3 workouts
    });

    it('falls back to legacy when modern yields empty and migrationBridge is enabled', async () => {
        flagValues.migrationBridge = true;
        mockCacheInstance.getAllWorkoutsSelected.mockReturnValue([]); // modern will be empty
        mockCacheInstance.getAllWorkouts.mockReturnValue([
            makeWorkout('LegacyA', [0, 5]),
            makeWorkout('LegacyB', [0, 5]),
        ]);

        const schedule = await createWorkoutSchedule();

        expect(mockCacheInstance.getAllWorkoutsSelected).toHaveBeenCalled();
        expect(mockCacheInstance.getAllWorkouts).toHaveBeenCalled();
        expect(schedule.scheduleItems.length).toBeGreaterThan(0);
    });

    it('uses legacy generator when generatorSwap is off', async () => {
        flagValues.generatorSwap = false;
        mockCacheInstance.getAllWorkouts.mockReturnValue([
            makeWorkout('LegacyA', [0, 5]),
            makeWorkout('LegacyB', [0, 5]),
        ]);

        const schedule = await createWorkoutSchedule();

        expect(mockCacheInstance.getAllWorkoutsSelected).not.toHaveBeenCalled();
        expect(mockCacheInstance.getAllWorkouts).toHaveBeenCalled();
        expect(schedule.scheduleItems.length).toBe(2); // 1 set + 1 block for 2 workouts
    });

    it('falls back to legacy when modern generator throws and migrationBridge is enabled', async () => {
        flagValues.generatorSwap = true;
        flagValues.migrationBridge = true;
        mockCacheInstance.getAllWorkoutsSelected.mockImplementation(() => {
            throw new Error('modern boom');
        });
        mockCacheInstance.getAllWorkouts.mockReturnValue([
            makeWorkout('LegacyA', [0, 5]),
            makeWorkout('LegacyB', [0, 5]),
        ]);

        const schedule = await createWorkoutSchedule();

        expect(mockCacheInstance.getAllWorkouts).toHaveBeenCalled();
        expect(schedule.scheduleItems.length).toBeGreaterThan(0);
    });
});
