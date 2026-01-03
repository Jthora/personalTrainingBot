import { RecapSummary } from '../types/RecapSummary';

type ShareTemplate = 'daily' | 'achievement';

const MAX_SHARE_LENGTH = 200;

const sanitize = (text: string) => text.replace(/\s+/g, ' ').trim();

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export interface RecapShareOptions {
    maxLength?: number;
    template?: ShareTemplate;
}

const joinParts = (parts: Array<string | null | undefined>) => sanitize(parts.filter(Boolean).join(' | '));

const buildAchievementTemplate = (recap: RecapSummary) => {
    const unlocked = recap.unlockedBadges?.slice(-2) ?? [];
    const badgesPart = unlocked.length
        ? `Unlocked: ${unlocked.join(' & ')}`
        : recap.badges.length
            ? `Badges: ${recap.badges.slice(-2).join(' • ')}`
            : null;
    const challengesPart = recap.challengeProgress?.find(c => c.completed && !c.claimed)
        ? 'Challenge cleared—claim your XP!'
        : recap.challengeProgress?.length
            ? `${recap.challengeProgress[0].title}: ${recap.challengeProgress[0].progress}/${recap.challengeProgress[0].target}`
            : null;

    return joinParts([
        `Achievement unlocked: +${recap.xp} XP in ${recap.minutes} min` ,
        badgesPart,
        challengesPart,
        `Streak ${recap.streakCount}d (${recap.streakStatus})`,
    ]);
};

const buildDailyTemplate = (recap: RecapSummary) => {
    const badges = recap.badges.slice(-2).join(' • ');
    const badgePart = badges ? `Badges: ${badges}` : null;
    const focusPart = recap.selectionFocus ? `Focus: ${recap.selectionFocus}` : null;
    const presetPart = recap.presetUsed ? `Preset: ${recap.presetUsed}` : null;

    return joinParts([
        `Wrapped today: +${recap.xp} XP, ${recap.minutes} min`,
        `Streak ${recap.streakCount}d (${recap.streakStatus})`,
        `Goals ${clampPercent(recap.dailyGoalPercent)}% daily / ${clampPercent(recap.weeklyGoalPercent)}% weekly`,
        badgePart,
        focusPart,
        presetPart,
    ]);
};

const shrinkToFit = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return { text, truncated: false };
    const truncated = `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
    return { text: truncated, truncated: true };
};

export const buildRecapShareText = (recap: RecapSummary, options: RecapShareOptions = {}) => {
    const maxLength = options.maxLength ?? MAX_SHARE_LENGTH;
    const template: ShareTemplate = options.template ?? (recap.unlockedBadges?.length ? 'achievement' : 'daily');

    const baseText = template === 'achievement'
        ? buildAchievementTemplate(recap)
        : buildDailyTemplate(recap);

    return shrinkToFit(baseText, maxLength);
};
