import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import UserProgressStore from '../UserProgressStore';

const getBadges = () => UserProgressStore.get().badges;

describe('UserProgressStore badge unlocking', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        UserProgressStore.reset();
    });

    afterEach(() => {
        vi.useRealTimers();
        UserProgressStore.reset();
    });

    it('unlocks streak badges at thresholds', () => {
        vi.setSystemTime(new Date('2024-01-01'));
        UserProgressStore.recordActivity({}); // day 1

        vi.setSystemTime(new Date('2024-01-02'));
        UserProgressStore.recordActivity({}); // day 2

        vi.setSystemTime(new Date('2024-01-03'));
        UserProgressStore.recordActivity({}); // day 3

        expect(getBadges()).toContain('streak_3');

        vi.setSystemTime(new Date('2024-01-04'));
        UserProgressStore.recordActivity({}); // day 4
        vi.setSystemTime(new Date('2024-01-05'));
        UserProgressStore.recordActivity({}); // day 5
        vi.setSystemTime(new Date('2024-01-06'));
        UserProgressStore.recordActivity({}); // day 6
        vi.setSystemTime(new Date('2024-01-07'));
        UserProgressStore.recordActivity({}); // day 7

        expect(getBadges()).toContain('streak_7');
    });

    it('unlocks completion badges as totals accumulate', () => {
        UserProgressStore.recordActivity({ completedWorkouts: 10 });
        expect(getBadges()).toContain('completion_10');

        UserProgressStore.recordActivity({ completedWorkouts: 40 });
        expect(getBadges()).toContain('completion_50');

        UserProgressStore.recordActivity({ completedWorkouts: 50 });
        expect(getBadges()).toContain('completion_100');
    });

    it('unlocks minute-based badges from daily/weekly progress', () => {
        vi.setSystemTime(new Date('2024-02-01'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 60 });
        expect(getBadges()).toContain('minutes_60');

        UserProgressStore.recordActivity({ goalDeltaMinutes: 250 });
        expect(getBadges()).toContain('minutes_300');
    });

    it('unlocks advanced difficulty badge based on schedule difficulty', () => {
        UserProgressStore.recordActivity({ difficultyLevel: 3 });
        expect(getBadges()).toContain('difficulty_advance');
    });

    it('does not duplicate badge unlocks and records unlock history', () => {
        UserProgressStore.recordActivity({ completedWorkouts: 10 });
        UserProgressStore.recordActivity({ completedWorkouts: 5 });
        const progress = UserProgressStore.get();
        const uniqueBadges = new Set(progress.badges);
        expect(uniqueBadges.size).toBe(progress.badges.length);
        expect(progress.badgeUnlocks.filter(b => b.id === 'completion_10').length).toBe(1);
    });
});
