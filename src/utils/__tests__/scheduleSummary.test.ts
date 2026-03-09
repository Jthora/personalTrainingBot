import { describe, expect, it } from 'vitest';
import { summarizeSchedule } from '../scheduleSummary';
import { MissionBlock, MissionSchedule, MissionSet } from '../../types/MissionSchedule';
import { Drill } from '../../types/DrillCategory';
import { DifficultySetting } from '../../types/DifficultySetting';

const drill = (name: string, duration: string) => new Drill(name, `${name} desc`, duration, 'Medium', [1, 5]);

const buildSchedule = () => new MissionSchedule(
    'Today',
    [
        new MissionSet([
            [drill('A', '8 min'), false],
            [drill('B', '12 min'), true],
        ]),
        new MissionBlock('Finisher', 'Block desc', 15, 'intervals'),
    ],
    new DifficultySetting(5, [3, 7])
);

describe('summarizeSchedule', () => {
    it('returns null when schedule is empty', () => {
        const empty = new MissionSchedule('Empty', [], new DifficultySetting(0, [0, 0]));
        expect(summarizeSchedule(empty)).toBeNull();
    });

    it('summarizes next drill, remaining minutes, and focus', () => {
        const summary = summarizeSchedule(buildSchedule());
        expect(summary).not.toBeNull();
        expect(summary?.nextTitle).toBe('A');
        expect(summary?.remainingMinutes).toBe(23); // 8 (pending A) + 15 block
        expect(summary?.remainingCount).toBe(2);
        expect(summary?.focus).toContain('Moderate effort');
        expect(summary?.rationale).toContain('2 item(s) queued');
    });
});
