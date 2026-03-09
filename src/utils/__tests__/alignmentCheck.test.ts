import { describe, it, expect } from 'vitest';
import { Drill } from '../../types/DrillCategory';
import { DifficultySetting } from '../../types/DifficultySetting';
import { MissionSchedule, MissionSet, MissionBlock } from '../../types/MissionSchedule';
import { checkScheduleAlignment } from '../alignmentCheck';

const w = (name: string, range: [number, number]) => new Drill(name, 'desc', '10', 'medium', range);

const schedule = (items: (MissionSet | MissionBlock)[], level: number) =>
    new MissionSchedule(new Date().toISOString(), items, DifficultySetting.fromLevel(level));

describe('checkScheduleAlignment', () => {
    it('passes when majority of drills are within range', () => {
        const set = new MissionSet([[w('in1', [1, 3]), false], [w('in2', [1, 3]), false], [w('out', [5, 6]), false]]);
        const s = schedule([set], 2);
        const result = checkScheduleAlignment(s);
        expect(result.status).toBe('pass');
        expect(result.outOfRangeCount).toBe(1);
    });

    it('warns when too many drills are out of range', () => {
        const set = new MissionSet([[w('out1', [5, 6]), false], [w('out2', [5, 6]), false], [w('in', [1, 3]), false]]);
        const s = schedule([set], 2);
        const result = checkScheduleAlignment(s);
        expect(result.status).toBe('warn');
        expect(result.outOfRangeCount).toBe(2);
    });
});
