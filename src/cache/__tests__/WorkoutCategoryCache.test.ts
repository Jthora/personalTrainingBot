import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutCategoryCache from '../WorkoutCategoryCache';
import type { WorkoutCategory } from '../../types/WorkoutCategory';

const sampleCategories: WorkoutCategory[] = [
    {
        id: 'cat-strength',
        name: 'Strength',
        description: 'Build strength',
        subCategories: [
            {
                id: 'sub-upper',
                name: 'Upper',
                description: 'Upper body work',
                workoutGroups: [
                    {
                        id: 'group-push',
                        name: 'Push',
                        description: 'Push movements',
                        workouts: [
                            {
                                id: 'workout-pushup',
                                name: 'Push Ups',
                                description: 'Do push ups',
                                duration: '10 min',
                                intensity: 'Medium',
                                difficulty_range: [1, 3],
                            },
                            {
                                id: 'workout-dips',
                                name: 'Dips',
                                description: 'Do dips',
                                duration: '8 min',
                                intensity: 'Medium',
                                difficulty_range: [2, 4],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const categoriesWithNewWorkout: WorkoutCategory[] = [
    {
        ...sampleCategories[0],
        subCategories: [
            {
                ...sampleCategories[0].subCategories[0],
                workoutGroups: [
                    {
                        ...sampleCategories[0].subCategories[0].workoutGroups[0],
                        workouts: [
                            ...sampleCategories[0].subCategories[0].workoutGroups[0].workouts,
                            {
                                id: 'workout-flyes',
                                name: 'Chest Flyes',
                                description: 'Flyes for chest',
                                duration: '12 min',
                                intensity: 'Light',
                                difficulty_range: [1, 2],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const cache = WorkoutCategoryCache.getInstance();

const loadCategories = async (categories: WorkoutCategory[]) => {
    vi.useFakeTimers();
    const promise = cache.loadData(categories);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await promise;
};

describe('WorkoutCategoryCache', () => {
    beforeEach(() => {
        cache.clearCache();
        localStorage.clear();
        vi.useRealTimers();
    });

    it('hydrates persisted selections when the taxonomy signature matches', async () => {
        await loadCategories(sampleCategories);

        cache.toggleWorkoutSelection('workout-pushup');
        expect(cache.isWorkoutSelected('workout-pushup')).toBe(false);

        await loadCategories(sampleCategories);

        expect(cache.isWorkoutSelected('workout-pushup')).toBe(false);
    });

    it('clears stored selections when the taxonomy signature changes', async () => {
        await loadCategories(sampleCategories);

        cache.toggleCategorySelection('cat-strength');
        expect(cache.isCategorySelected('cat-strength')).toBe(false);

        await loadCategories(categoriesWithNewWorkout);

        expect(cache.isCategorySelected('cat-strength')).toBe(true);
        expect(cache.isWorkoutSelected('workout-flyes')).toBe(true);
    });
});
