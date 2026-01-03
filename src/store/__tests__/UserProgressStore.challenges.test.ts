import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import UserProgressStore from '../UserProgressStore';
import * as metrics from '../../utils/metrics';

vi.mock('../../utils/metrics', async () => {
    const actual = await vi.importActual<typeof import('../../utils/metrics')>('../../utils/metrics');
    return {
        ...actual,
        recordMetric: vi.fn(),
    };
});

const recordMetric = metrics.recordMetric as unknown as ReturnType<typeof vi.fn>;

describe('UserProgressStore challenges', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        UserProgressStore.reset();
        recordMetric.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
        UserProgressStore.reset();
    });

    it('rotates in daily and weekly challenges and tracks progress/completion', () => {
        vi.setSystemTime(new Date('2024-03-01T08:00:00Z'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 100, completedWorkouts: 5 });

        const progress = UserProgressStore.get();
        expect(progress.challenges.length).toBe(2);
        const daily = progress.challenges.find(c => c.timeframe === 'daily');
        const weekly = progress.challenges.find(c => c.timeframe === 'weekly');
        expect(daily?.completed).toBe(true);
        expect(weekly?.progress).toBeGreaterThan(0);
        expect(recordMetric).toHaveBeenCalledWith('challenge_completed', expect.objectContaining({ id: daily?.id, timeframe: 'daily' }));
    });

    it('claims a completed challenge once and grants XP', () => {
        vi.setSystemTime(new Date('2024-03-02T08:00:00Z'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 25 });
        const beforeXp = UserProgressStore.get().xp;
        const daily = UserProgressStore.get().challenges.find(c => c.timeframe === 'daily');
        expect(daily?.completed).toBe(true);

        const claimResult = UserProgressStore.claimChallenge(daily!.id);
        expect(claimResult.claimed).toBe(true);
        const after = UserProgressStore.get();
        expect(after.xp).toBeGreaterThan(beforeXp);
        expect(after.challenges.find(c => c.id === daily!.id)?.claimed).toBe(true);

        const second = UserProgressStore.claimChallenge(daily!.id);
        expect(second.claimed).toBe(false);
    });

    it('expires daily challenge on next day and rotates a new one', () => {
        vi.setSystemTime(new Date('2024-03-03T08:00:00Z'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 10 });
        const firstDaily = UserProgressStore.get().challenges.find(c => c.timeframe === 'daily');
        expect(firstDaily).toBeDefined();

        vi.setSystemTime(new Date('2024-03-04T08:00:00Z'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 5 });
        const nextDaily = UserProgressStore.get().challenges.find(c => c.timeframe === 'daily');
        expect(nextDaily).toBeDefined();
        expect(nextDaily?.startsAt).not.toBe(firstDaily?.startsAt);
        expect(recordMetric).toHaveBeenCalledWith('challenge_expired', expect.objectContaining({ id: firstDaily?.id }));
    });

    it('gates reminders by quiet mode and challengeRemindersEnabled flag', () => {
        vi.setSystemTime(new Date('2024-03-05T08:00:00Z'));
        UserProgressStore.recordActivity({ goalDeltaMinutes: 5 });

        const reminders = UserProgressStore.getChallengeReminders();
        expect(reminders.length).toBeGreaterThanOrEqual(1);

        const progress = UserProgressStore.get();
        UserProgressStore.save({ ...progress, quietMode: true });
        expect(UserProgressStore.getChallengeReminders()).toEqual([]);

        UserProgressStore.save({ ...progress, quietMode: false, flags: { ...progress.flags, challengeRemindersEnabled: false } });
        expect(UserProgressStore.getChallengeReminders()).toEqual([]);
    });
});
