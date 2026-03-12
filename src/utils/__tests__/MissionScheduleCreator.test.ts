import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Drill } from '../../types/DrillCategory';

const mockCacheInstance = {
    isLoading: vi.fn(() => false),
    getAllDrillsSelected: vi.fn(),
    getAllDrills: vi.fn(),
};

vi.mock('../../cache/DrillCategoryCache', () => ({
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
import { createMissionSchedule } from '../MissionScheduleCreator';

const makeDrill = (name: string, difficulty: [number, number]) =>
    new Drill(name, 'desc', '30', 'medium', difficulty);

describe('createMissionSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCacheInstance.isLoading.mockReturnValue(false);
    });

    it('creates a schedule from selected drills', async () => {
        mockCacheInstance.getAllDrillsSelected.mockReturnValue([
            makeDrill('A', [0, 2]),
            makeDrill('B', [0, 2]),
            makeDrill('C', [0, 2]),
        ]);

        const schedule = await createMissionSchedule();

        expect(mockCacheInstance.getAllDrillsSelected).toHaveBeenCalled();
        expect(schedule.scheduleItems.length).toBeGreaterThan(0);
        expect(schedule.scheduleItems.length).toBe(2); // 1 set + 1 block for 3 drills
    });

    it('returns empty schedule when no drills match difficulty', async () => {
        // All drills have range [5, 10] but DifficultySettingsStore returns level 1
        mockCacheInstance.getAllDrillsSelected.mockReturnValue([
            makeDrill('Hard', [5, 10]),
        ]);

        const schedule = await createMissionSchedule();

        expect(schedule.scheduleItems.length).toBe(0);
    });

    it('propagates errors from modern generator', async () => {
        mockCacheInstance.getAllDrillsSelected.mockImplementation(() => {
            throw new Error('modern boom');
        });

        await expect(createMissionSchedule()).rejects.toThrow('modern boom');
    });
});
