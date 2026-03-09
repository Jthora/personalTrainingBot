import { describe, expect, it } from 'vitest';
import { Drill } from '../../types/DrillCategory';
import { MissionBlock, MissionSet } from '../../types/MissionSchedule';
import { cloneScheduleItems, moveScheduleItem, removeScheduleItem, describeScheduleItem, getAlignmentStatus, adjustSetDifficulty, replaceSetWithSimilar } from '../schedulePreview';

describe('schedulePreview helpers', () => {
    const workoutA = new Drill('A', 'desc', '10', 'med', [1, 3]);
    const workoutB = new Drill('B', 'desc', '10', 'med', [1, 3]);
    const workoutC = new Drill('C', 'desc', '15', 'high', [4, 6]);

    const baseItems = [
        new MissionSet([[workoutA, false], [workoutB, false]]),
        new MissionBlock('Block', 'intervals', 12, 'details'),
        new MissionSet([[workoutC, false]])
    ];

    it('clones without mutating original items', () => {
        const clone = cloneScheduleItems(baseItems);
        expect(clone).not.toBe(baseItems);
        expect(clone[0]).toBeInstanceOf(MissionSet);
        expect((clone[0] as MissionSet).drills).not.toBe((baseItems[0] as MissionSet).drills);
        expect((clone[0] as MissionSet).drills[0][0]).not.toBe(workoutA);
    });

    it('moves items between indices', () => {
        const moved = moveScheduleItem(baseItems, 0, 2);
        expect(moved[2]).toBeInstanceOf(MissionSet);
        expect((moved[2] as MissionSet).drills[0][0].name).toBe('A');
        expect(moved.length).toBe(3);
    });

    it('removes an item by index', () => {
        const trimmed = removeScheduleItem(baseItems, 1);
        expect(trimmed.length).toBe(2);
        expect(trimmed[0]).toBeInstanceOf(MissionSet);
        expect(trimmed[1]).toBeInstanceOf(MissionSet);
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
        const adjusted = adjustSetDifficulty(baseItems[0] as MissionSet, 9);
        const range = (adjusted as MissionSet).drills[0][0].difficulty_range;
        expect(range[0]).toBe(8);
        expect(range[1]).toBe(10);
    });

    it('replaces a set with similar drills', () => {
        const pool = [workoutA, workoutB, workoutC];
        const replaced = replaceSetWithSimilar(baseItems[0] as MissionSet, pool, 3);
        expect(replaced.drills.length).toBe(2);
        expect(replaced.drills[0][0].name).not.toBe('A');
    });
});
