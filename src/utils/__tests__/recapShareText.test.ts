import { describe, expect, it } from 'vitest';
import { buildRecapShareText } from '../recapShareText';
import { RecapSummary } from '../../types/RecapSummary';

const recapBase: RecapSummary = {
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

describe('buildRecapShareText', () => {
    it('uses daily template when no new badges', () => {
        const recap: RecapSummary = {
            ...recapBase,
            selectionFocus: 'Moderate effort • Level 3 (2-4)',
            presetUsed: 'Quick 20',
        };
        const { text, truncated } = buildRecapShareText(recap, { maxLength: 200 });
        expect(text).toContain('+120 XP');
        expect(text).toContain('Streak 5d');
        expect(text).toContain('Preset: Quick 20');
        expect(truncated).toBe(false);
    });

    it('uses achievement template when unlocked badges present', () => {
        const recap: RecapSummary = {
            ...recapBase,
            unlockedBadges: ['Endurance 60'],
        };
        const { text, truncated } = buildRecapShareText(recap, { maxLength: 200 });
        expect(text).toContain('Achievement unlocked');
        expect(text).toContain('Endurance 60');
        expect(truncated).toBe(false);
    });

    it('enforces 200 char limit by default with ellipsis', () => {
        const recap: RecapSummary = {
            ...recapBase,
            badges: Array(8).fill('VeryLongBadgeName'),
            selectionFocus: 'Strength endurance with supersets and tempo focus to emphasize time under tension.',
            presetUsed: 'Marathon Prep',
        };
        const { text, truncated } = buildRecapShareText(recap);
        expect(text.length).toBeLessThanOrEqual(200);
        expect(truncated).toBe(true);
        expect(text.endsWith('…')).toBe(true);
    });
});
