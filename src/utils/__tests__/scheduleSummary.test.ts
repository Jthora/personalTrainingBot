import { describe, expect, it } from 'vitest';
import { summarizeSchedule } from '../scheduleSummary';
import { WorkoutBlock, WorkoutSchedule, WorkoutSet } from '../../types/WorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';
import { DifficultySetting } from '../../types/DifficultySetting';

const workout = (name: string, duration: string) => new Workout(name, `${name} desc`, duration, 'Medium', [1, 5]);

const buildSchedule = () => new WorkoutSchedule(
    'Today',
    [
        new WorkoutSet([
            [workout('A', '8 min'), false],
            [workout('B', '12 min'), true],
        ]),
        new WorkoutBlock('Finisher', 'Block desc', 15, 'intervals'),
    ],
    new DifficultySetting(5, [3, 7])
);

describe('summarizeSchedule', () => {
    it('returns null when schedule is empty', () => {
        const empty = new WorkoutSchedule('Empty', [], new DifficultySetting(0, [0, 0]));
        expect(summarizeSchedule(empty)).toBeNull();
    });

    it('summarizes next workout, remaining minutes, and focus', () => {
        const summary = summarizeSchedule(buildSchedule());
        expect(summary).not.toBeNull();
        expect(summary?.nextTitle).toBe('A');
        expect(summary?.remainingMinutes).toBe(23); // 8 (pending A) + 15 block
        expect(summary?.remainingCount).toBe(2);
        expect(summary?.focus).toContain('Moderate effort');
        expect(summary?.rationale).toContain('2 item(s) queued');
    });
});
