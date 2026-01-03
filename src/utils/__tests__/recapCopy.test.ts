import { describe, expect, it } from 'vitest';
import { deriveRecapView, selectRecapVariant } from '../recapCopy';
import { RecapSummary } from '../../types/RecapSummary';

const baseRecap: RecapSummary = {
    xp: 120,
    minutes: 22,
    streakCount: 5,
    streakStatus: 'active',
    level: 3,
    levelProgressPercent: 45,
    xpToNextLevel: 275,
    dailyGoalPercent: 80,
    weeklyGoalPercent: 40,
    badges: ['Consistency'],
};

describe('recap copy helpers', () => {
    it('selects streaking variant when streak is strong', () => {
        const recap: RecapSummary = { ...baseRecap, streakCount: 8 };
        expect(selectRecapVariant(recap)).toBe('streaking');
    });

    it('selects low-activity variant when XP is zero', () => {
        const recap: RecapSummary = { ...baseRecap, xp: 0, xpDelta: 0 };
        expect(selectRecapVariant(recap)).toBe('low_activity');
    });

    it('celebrates unlocked badges and truncates overflow', () => {
        const recap: RecapSummary = { ...baseRecap, unlockedBadges: ['a', 'b', 'c', 'd'] };
        const view = deriveRecapView(recap);
        expect(view.badgeCelebration?.items.length).toBe(3);
        expect(view.badgeCelebration?.overflow).toBe(1);
    });

    it('summarizes challenge progress and truncates to limit', () => {
        const recap: RecapSummary = {
            ...baseRecap,
            challengeProgress: [
                { id: 'd1', title: 'Daily steps', progress: 2, target: 3, timeframe: 'daily', rewardXp: 30 },
                { id: 'w1', title: 'Weekly lifts', progress: 1, target: 4, timeframe: 'weekly', rewardXp: 80 },
                { id: 'w2', title: 'Bonus', progress: 0, target: 2, timeframe: 'weekly' },
            ],
        };
        const view = deriveRecapView(recap);
        expect(view.challengeCallouts.lines.length).toBe(2);
        expect(view.challengeCallouts.overflow).toBe(1);
    });

    it('suggests next steps from goals and challenges', () => {
        const recap: RecapSummary = {
            ...baseRecap,
            dailyGoalPercent: 50,
            weeklyGoalPercent: 60,
            challengeProgress: [
                { id: 'd1', title: 'Daily steps', progress: 1, target: 3, timeframe: 'daily', rewardXp: 30 },
            ],
        };
        const view = deriveRecapView(recap);
        expect(view.nextSteps.length).toBeGreaterThan(0);
        expect(view.nextSteps.some(step => step.includes('10-min'))).toBe(true);
    });
});
