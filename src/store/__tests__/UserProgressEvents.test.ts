import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressEventRecorder } from '../UserProgressEvents';
import UserProgressStore from '../UserProgressStore';
import { WorkoutBlock, WorkoutSchedule, WorkoutSet } from '../../types/WorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';
import { DifficultySetting } from '../../types/DifficultySetting';

const freshSchedule = (items: (WorkoutSet | WorkoutBlock)[]) =>
    new WorkoutSchedule(new Date().toISOString(), items, DifficultySetting.fromLevel(1));

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

    it('awards XP and goal minutes on workout completion', () => {
        const workout = new Workout('Test', 'desc', '15', 'medium', [1, 3]);
        const set = new WorkoutSet([[workout, false]]);
        const scheduleAfter = freshSchedule([]);

        ProgressEventRecorder.recordCompletion({ item: set, scheduleAfter });

        const progress = UserProgressStore.get();
        expect(progress.xp).toBeGreaterThanOrEqual(80); // 35 + 50 bonus
        expect(progress.dailyGoal.progress).toBeGreaterThanOrEqual(10);
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
