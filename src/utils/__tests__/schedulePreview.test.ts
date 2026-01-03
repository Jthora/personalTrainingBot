import { describe, expect, it } from 'vitest';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutBlock, WorkoutSet } from '../../types/WorkoutSchedule';
import { cloneScheduleItems, moveScheduleItem, removeScheduleItem, describeScheduleItem, getAlignmentStatus, adjustSetDifficulty, replaceSetWithSimilar } from '../schedulePreview';

describe('schedulePreview helpers', () => {
    const workoutA = new Workout('A', 'desc', '10', 'med', [1, 3]);
    const workoutB = new Workout('B', 'desc', '10', 'med', [1, 3]);
    const workoutC = new Workout('C', 'desc', '15', 'high', [4, 6]);

    const baseItems = [
        new WorkoutSet([[workoutA, false], [workoutB, false]]),
        new WorkoutBlock('Block', 'intervals', 12, 'details'),
        new WorkoutSet([[workoutC, false]])
    ];

    it('clones without mutating original items', () => {
        const clone = cloneScheduleItems(baseItems);
        expect(clone).not.toBe(baseItems);
        expect(clone[0]).toBeInstanceOf(WorkoutSet);
        expect((clone[0] as WorkoutSet).workouts).not.toBe((baseItems[0] as WorkoutSet).workouts);
        expect((clone[0] as WorkoutSet).workouts[0][0]).not.toBe(workoutA);
    });

    it('moves items between indices', () => {
        const moved = moveScheduleItem(baseItems, 0, 2);
        expect(moved[2]).toBeInstanceOf(WorkoutSet);
        expect((moved[2] as WorkoutSet).workouts[0][0].name).toBe('A');
        expect(moved.length).toBe(3);
    });

    it('removes an item by index', () => {
        const trimmed = removeScheduleItem(baseItems, 1);
        expect(trimmed.length).toBe(2);
        expect(trimmed[0]).toBeInstanceOf(WorkoutSet);
        expect(trimmed[1]).toBeInstanceOf(WorkoutSet);
    });

    it('describes items for UI labels', () => {
        expect(describeScheduleItem(baseItems[0])).toContain('Set');
        expect(describeScheduleItem(baseItems[1])).toContain('Block');
    });

    it('computes alignment status vs difficulty level', () => {
        expect(getAlignmentStatus(baseItems[0], 2)).toBe('aligned');
        expect(getAlignmentStatus(baseItems[0], 5)).toBe('warn');
        expect(getAlignmentStatus(baseItems[1], 5)).toBe('neutral');
    });

    it('adjusts set difficulty with clamping', () => {
        const adjusted = adjustSetDifficulty(baseItems[0] as WorkoutSet, 9);
        const range = (adjusted as WorkoutSet).workouts[0][0].difficulty_range;
        expect(range[0]).toBe(8);
        expect(range[1]).toBe(10);
    });

    it('replaces a set with similar workouts', () => {
        const pool = [workoutA, workoutB, workoutC];
        const replaced = replaceSetWithSimilar(baseItems[0] as WorkoutSet, pool, 3);
        expect(replaced.workouts.length).toBe(2);
        expect(replaced.workouts[0][0].name).not.toBe('A');
    });
});
