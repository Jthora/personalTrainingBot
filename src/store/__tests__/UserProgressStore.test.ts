import { describe, it, expect, beforeEach } from 'vitest';
import UserProgressStore from '../UserProgressStore';

const clearProgress = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.clear();
    }
    UserProgressStore.reset();
};

describe('UserProgressStore', () => {
    beforeEach(() => {
        clearProgress();
    });

    it('records activity and updates streak/xp/goal progress', () => {
        const before = UserProgressStore.get();
        expect(before.xp).toBe(0);

        UserProgressStore.recordActivity({ xp: 50, goalDeltaMinutes: 20 });

        const after = UserProgressStore.get();
        expect(after.xp).toBe(50);
        expect(after.level).toBeGreaterThanOrEqual(1);
        expect(after.streakCount).toBeGreaterThan(0);
        expect(after.dailyGoal.progress).toBeGreaterThanOrEqual(20);
        expect(after.weeklyGoal.progress).toBeGreaterThanOrEqual(20);
    });

    it('freezes streak on skip/timeout events', () => {
        UserProgressStore.recordSkipOrTimeout({ reason: 'skip' });
        const view = UserProgressStore.getViewModel();
        expect(view.streakStatus).toBe('frozen');
    });

    it('clears freeze when activity is recorded', () => {
        UserProgressStore.recordSkipOrTimeout({ reason: 'timeout' });
        UserProgressStore.recordActivity({ xp: 10, goalDeltaMinutes: 5 });
        const view = UserProgressStore.getViewModel();
        expect(view.streakStatus).toBe('active');
    });
});
