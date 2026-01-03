import { RecapSummary, RecapCopyVariant, RecapChallengeProgress } from '../types/RecapSummary';

export type RecapView = {
    variant: RecapCopyVariant;
    headline: string;
    subhead: string;
    badgeCelebration?: {
        items: string[];
        overflow: number;
        text: string;
    };
    challengeCallouts: {
        lines: string[];
        overflow: number;
    };
    nextSteps: string[];
};

const BADGE_CELEBRATION_LIMIT = 3;
const CHALLENGE_CALLOUT_LIMIT = 2;
const NEXT_STEPS_LIMIT = 2;

export const selectRecapVariant = (recap: RecapSummary): RecapCopyVariant => {
    if ((recap.minutes ?? 0) < 10 || (recap.xpDelta ?? recap.xp) <= 0 || recap.streakStatus === 'broken') {
        return 'low_activity';
    }
    if (recap.streakStatus === 'active' && recap.streakCount >= 7) {
        return 'streaking';
    }
    return 'default';
};

const formatBadgeCelebration = (unlockedBadges: string[] = []) => {
    if (!unlockedBadges.length) return undefined;
    const items = unlockedBadges.slice(0, BADGE_CELEBRATION_LIMIT);
    const overflow = Math.max(0, unlockedBadges.length - items.length);
    const text = `Unlocked ${items.join(', ')}${overflow ? ` (+${overflow} more)` : ''}!`;
    return { items, overflow, text };
};

const buildChallengeCallouts = (challenges: RecapChallengeProgress[] = []) => {
    if (!challenges.length) return { lines: [], overflow: 0 };
    const sorted = [...challenges].sort((a, b) => a.timeframe.localeCompare(b.timeframe));
    const lines: string[] = [];
    sorted.forEach(challenge => {
        const prefix = challenge.timeframe === 'daily' ? 'Daily' : 'Weekly';
        const progressText = `${challenge.progress}/${challenge.target}`;
        const status = challenge.completed ? 'Ready to claim' : 'Keep going';
        const rewardText = challenge.rewardXp ? ` · +${challenge.rewardXp} XP` : '';
        lines.push(`${prefix}: ${challenge.title} — ${progressText} ${status}${rewardText}`);
    });
    const trimmed = lines.slice(0, CHALLENGE_CALLOUT_LIMIT);
    return { lines: trimmed, overflow: Math.max(0, lines.length - trimmed.length) };
};

const suggestNextSteps = (recap: RecapSummary, challenges: RecapChallengeProgress[] = []) => {
    const steps: string[] = [...(recap.nextSteps ?? [])];

    if (steps.length < NEXT_STEPS_LIMIT && recap.dailyGoalPercent < 100) {
        steps.push('Close your daily goal with a quick 10-min block.');
    }
    if (steps.length < NEXT_STEPS_LIMIT && recap.weeklyGoalPercent < 100) {
        steps.push('Schedule a mid-week session to stay on track for the weekly goal.');
    }
    const incompleteChallenge = challenges.find(c => !c.completed);
    if (steps.length < NEXT_STEPS_LIMIT && incompleteChallenge) {
        const remaining = Math.max(0, incompleteChallenge.target - incompleteChallenge.progress);
        const rewardText = incompleteChallenge.rewardXp ? ` for +${incompleteChallenge.rewardXp} XP` : '';
        steps.push(`Finish ${remaining} more to clear the ${incompleteChallenge.timeframe} challenge${rewardText}.`);
    }

    return steps.slice(0, NEXT_STEPS_LIMIT);
};

export const deriveRecapView = (recap: RecapSummary): RecapView => {
    const variant = recap.copyVariant ?? selectRecapVariant(recap);
    const badgeCelebration = formatBadgeCelebration(recap.unlockedBadges);
    const challengeCallouts = buildChallengeCallouts(recap.challengeProgress);
    const nextSteps = suggestNextSteps(recap, recap.challengeProgress);

    const headline = variant === 'streaking'
        ? `Streak on fire (${recap.streakCount} days)`
        : variant === 'low_activity'
            ? 'Small win logged'
            : 'Nice work';

    const subhead = variant === 'streaking'
        ? 'Keep your pace—one more session keeps the streak alive.'
        : variant === 'low_activity'
            ? 'Light session today. A short finisher will keep goals and streak safe.'
            : `+${recap.xp} XP · Streak ${recap.streakCount}d · Level ${recap.level}`;

    return {
        variant,
        headline,
        subhead,
        badgeCelebration,
        challengeCallouts,
        nextSteps,
    };
};
