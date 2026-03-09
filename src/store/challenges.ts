import dayjs from 'dayjs';
import { ChallengeDefinition, ChallengeTimeframe } from '../data/challengeCatalog';
import { ChallengeInstance } from '../types/Challenge';

export type ChallengeRotationResult = {
    challenges: ChallengeInstance[];
    expiredIds: string[];
};

const windowFor = (timeframe: ChallengeTimeframe, todayIso: string) => {
    const base = dayjs(todayIso);
    return timeframe === 'daily'
        ? { start: base.startOf('day'), end: base.endOf('day') }
        : { start: base.startOf('week'), end: base.endOf('week') };
};

const spawnChallengeInstance = (definition: ChallengeDefinition, todayIso: string): ChallengeInstance => {
    const window = windowFor(definition.timeframe, todayIso);
    return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        rewardXp: definition.rewardXp,
        timeframe: definition.timeframe,
        unit: definition.unit,
        startsAt: window.start.toISOString(),
        endsAt: window.end.toISOString(),
        progress: 0,
        target: definition.target,
        completed: false,
        claimed: false,
    };
};

export const rotateChallengesIfNeeded = (
    existing: ChallengeInstance[],
    todayIso: string,
    catalog: ChallengeDefinition[],
): ChallengeRotationResult => {
    const now = dayjs(todayIso);
    const expiredIds: string[] = [];
    const results: ChallengeInstance[] = [];

    const upsertForTimeframe = (timeframe: ChallengeTimeframe) => {
        const active = existing.find(c => c.timeframe === timeframe && dayjs(c.endsAt).isAfter(now));
        if (active) {
            results.push(active);
            return;
        }
        const expired = existing.filter(c => c.timeframe === timeframe).map(c => c.id);
        expiredIds.push(...expired);

        // Rotate through catalog entries for this timeframe instead of always picking the first
        const candidates = catalog.filter(c => c.timeframe === timeframe);
        if (candidates.length === 0) return;
        const lastExpired = expired[expired.length - 1] ?? '';
        const lastIdx = candidates.findIndex(c => c.id === lastExpired);
        const nextIdx = (lastIdx + 1) % candidates.length;
        results.push(spawnChallengeInstance(candidates[nextIdx], todayIso));
    };

    upsertForTimeframe('daily');
    upsertForTimeframe('weekly');

    return { challenges: results, expiredIds };
};

export const applyChallengeProgress = (
    challenges: ChallengeInstance[],
    { minutesDelta = 0, missionsDelta = 0, asOfDate }: { minutesDelta?: number; missionsDelta?: number; asOfDate: string },
): ChallengeInstance[] => {
    const now = dayjs(asOfDate);
    return challenges.map(challenge => {
        const withinWindow = !now.isBefore(dayjs(challenge.startsAt)) && !now.isAfter(dayjs(challenge.endsAt));
        if (!withinWindow) return challenge;
        const delta = challenge.unit === 'minutes' ? minutesDelta : missionsDelta;
        if (!delta || delta <= 0) return challenge;
        const progress = challenge.progress + delta;
        const completed = progress >= challenge.target;
        return { ...challenge, progress, completed };
    });
};

export const claimChallengeReward = (
    progress: { challenges: ChallengeInstance[] },
    id: string,
): { progress: { challenges: ChallengeInstance[] }; xpAwarded: number; claimed: boolean } => {
    const index = progress.challenges.findIndex(c => c.id === id);
    if (index === -1) return { progress, xpAwarded: 0, claimed: false };
    const challenge = progress.challenges[index];
    if (!challenge.completed || challenge.claimed) return { progress, xpAwarded: 0, claimed: false };
    const updatedChallenges = [...progress.challenges];
    updatedChallenges[index] = { ...challenge, claimed: true };
    return { progress: { ...progress, challenges: updatedChallenges }, xpAwarded: challenge.rewardXp, claimed: true };
};

export const getPendingChallengeReminders = (
    challenges: ChallengeInstance[],
    asOfIso: string,
): ChallengeInstance[] => {
    const now = dayjs(asOfIso);
    return challenges.filter(challenge => {
        if (challenge.completed || challenge.claimed) return false;
        const withinWindow = !now.isBefore(dayjs(challenge.startsAt)) && !now.isAfter(dayjs(challenge.endsAt));
        return withinWindow;
    });
};
