import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressEventRecorder } from '../UserProgressEvents';
import UserProgressStore from '../UserProgressStore';
import { MissionBlock, MissionSchedule, MissionSet } from '../../types/MissionSchedule';
import { Drill } from '../../types/DrillCategory';
import { DifficultySetting } from '../../types/DifficultySetting';

const freshSchedule = (items: (MissionSet | MissionBlock)[]) =>
    new MissionSchedule(new Date().toISOString(), items, DifficultySetting.fromLevel(1));

const resetProgress = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.clear();
    }
    UserProgressStore.reset();
};

describe('ProgressEventRecorder', () => {
    beforeEach(() => {
        resetProgress();
    });

    it('awards XP and goal minutes on drill completion', () => {
        const drill = new Drill('Test', 'desc', '15', 'medium', [1, 3]);
        const set = new MissionSet([[drill, false]]);
        const scheduleAfter = freshSchedule([]);

        ProgressEventRecorder.recordCompletion({ item: set, scheduleAfter });

        const progress = UserProgressStore.get();
        expect(progress.xp).toBeGreaterThanOrEqual(80); // 35 + 50 bonus
        expect(progress.dailyGoal.progress).toBeGreaterThanOrEqual(1);
    });

    it('freezes streak on skip', () => {
        ProgressEventRecorder.recordSkip('skip');
        const view = UserProgressStore.getViewModel();
        expect(view.streakStatus).toBe('frozen');
    });

    it('freezes streak on timeout', () => {
        ProgressEventRecorder.recordSkip('timeout');
        const view = UserProgressStore.getViewModel();
        expect(view.streakStatus).toBe('frozen');
    });
});
