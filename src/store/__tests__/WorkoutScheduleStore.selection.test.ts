import { describe, expect, it, vi, beforeEach } from 'vitest';
import WorkoutScheduleStore from '../WorkoutScheduleStore';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';

// Ensure cache initialized for defaults
beforeEach(() => {
    localStorage.clear();
    WorkoutCategoryCache.getInstance();
});

describe('WorkoutScheduleStore selection listeners', () => {
    it('notifies subscribers when selections change', () => {
        const listener = vi.fn();
        const unsubscribe = WorkoutScheduleStore.subscribeToSelectionChanges(listener);

        WorkoutScheduleStore.saveSelectedWorkouts({ alpha: true });
        WorkoutScheduleStore.saveSelectedWorkoutCategories({ catA: true, catB: false });
        unsubscribe();

        WorkoutScheduleStore.saveSelectedWorkoutGroups({ g: true });
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('returns selection counts', () => {
        localStorage.clear();
        WorkoutScheduleStore.saveSelectedWorkoutCategories({ c1: true, c2: false });
        WorkoutScheduleStore.saveSelectedWorkouts({ w1: true, w2: true, w3: false });

        const counts = WorkoutScheduleStore.getSelectionCounts();
        expect(counts.categories).toBe(1);
        expect(counts.workouts).toBe(2);
    });
});
