import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutScheduleStore from '../WorkoutScheduleStore';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
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

const cache = WorkoutCategoryCache.getInstance();

const loadCategories = async () => {
    vi.useFakeTimers();
    const promise = cache.loadData(sampleCategories);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await promise;
};

describe('WorkoutScheduleStore persistence', () => {
    beforeEach(() => {
        cache.clearCache();
        localStorage.clear();
        vi.useRealTimers();
    });

    it('persists and returns default selections when storage is empty', async () => {
        await loadCategories();

        const categories = await WorkoutScheduleStore.getSelectedWorkoutCategories();
        const groups = await WorkoutScheduleStore.getSelectedWorkoutGroups();
        const subCategories = await WorkoutScheduleStore.getSelectedWorkoutSubCategories();
        const workouts = await WorkoutScheduleStore.getSelectedWorkouts();

        expect(categories['cat-strength']).toBe(true);
        expect(groups['group-push']).toBe(true);
        expect(subCategories['sub-upper']).toBe(true);
        expect(workouts['workout-pushup']).toBe(true);
        expect(workouts['workout-dips']).toBe(true);

        expect(localStorage.getItem('workout:v2:selectedWorkoutCategories')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkoutGroups')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkoutSubCategories')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkouts')).toBeTruthy();
    });

    it('resets invalid stored selections back to defaults', async () => {
        await loadCategories();

        localStorage.setItem('workout:v2:selectedWorkoutCategories', JSON.stringify({ 'cat-strength': 'yes' }));
        localStorage.setItem('workout:v2:selectedWorkoutGroups', JSON.stringify({ 'group-push': null }));
        localStorage.setItem('workout:v2:selectedWorkoutSubCategories', JSON.stringify({ 'sub-upper': 123 }));
        localStorage.setItem('workout:v2:selectedWorkouts', JSON.stringify({ 'workout-pushup': 'nope' }));

        const categories = await WorkoutScheduleStore.getSelectedWorkoutCategories();
        const groups = await WorkoutScheduleStore.getSelectedWorkoutGroups();
        const subCategories = await WorkoutScheduleStore.getSelectedWorkoutSubCategories();
        const workouts = await WorkoutScheduleStore.getSelectedWorkouts();

        expect(categories['cat-strength']).toBe(true);
        expect(groups['group-push']).toBe(true);
        expect(subCategories['sub-upper']).toBe(true);
        expect(workouts['workout-pushup']).toBe(true);

        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutCategories') || '{}')['cat-strength']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutGroups') || '{}')['group-push']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutSubCategories') || '{}')['sub-upper']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkouts') || '{}')['workout-pushup']).toBe(true);
    });
});
