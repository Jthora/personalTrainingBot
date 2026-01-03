import dayjs from 'dayjs';
import { getBadgeCatalog } from '../data/badgeCatalog';
import { getChallengeCatalog } from '../data/challengeCatalog';
import { applyChallengeProgress, claimChallengeReward, rotateChallengesIfNeeded, getPendingChallengeReminders } from './challenges';
import { recordMetric } from '../utils/metrics';
import { ChallengeInstance } from '../types/Challenge';

export type GoalUnit = 'minutes' | 'items';

export interface GoalProgress {
    target: number;
    unit: GoalUnit;
    progress: number;
    updatedAt: string;
}

export interface BadgeUnlock {
    id: string;
    unlockedAt: string;
    source?: string;
}

export interface UserProgress {
    version: number;
    streakCount: number;
    lastActiveDate: string;
    streakFrozen?: boolean;
    xp: number;
    level: number;
    totalWorkoutsCompleted: number;
    badges: string[];
    badgeUnlocks: BadgeUnlock[];
    dailyGoal: GoalProgress;
    weeklyGoal: GoalProgress & { weekStart: string; weekEnd: string };
    challenges: ChallengeInstance[];
    lastRecap: { date: string; scheduleId?: string; xpEarned: number; badges: string[] } | null;
    quietMode: boolean;
    flags?: {
        recapEnabled?: boolean;
        recapShareEnabled?: boolean;
        recapAnimationsEnabled?: boolean;
        challengesEnabled?: boolean;
        challengeRemindersEnabled?: boolean;
        badgeStripEnabled?: boolean;
        progressEnabled?: boolean;
    };
}

export interface ProgressViewModel {
    levelProgressPercent: number;
    xpToNextLevel: number;
    dailyGoalPercent: number;
    weeklyGoalPercent: number;
    streakStatus: 'active' | 'frozen' | 'broken';
    badgesPreview: string[];
    challengeSummaries: Array<Pick<ChallengeInstance, 'id' | 'title' | 'progress' | 'target' | 'rewardXp' | 'timeframe' | 'endsAt'>>;
}

const STORAGE_KEY = 'userProgress:v1';
const DEFAULT_VERSION = 1;
const XP_PER_LEVEL = 500;

let inMemoryProgress: UserProgress | null = null;

const storageAvailable = () => {
    try {
        const key = '__userProgress:probe__';
        localStorage.setItem(key, '1');
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn('UserProgressStore: localStorage unavailable, falling back to memory', error);
        return false;
    }
};

const today = () => dayjs().format('YYYY-MM-DD');
const startOfWeek = () => dayjs().startOf('week').format('YYYY-MM-DD');
const endOfWeek = () => dayjs().endOf('week').format('YYYY-MM-DD');

const createDefaultProgress = (): UserProgress => ({
    version: DEFAULT_VERSION,
    streakCount: 0,
    lastActiveDate: '',
    streakFrozen: false,
    xp: 0,
    level: 1,
    totalWorkoutsCompleted: 0,
    badges: [],
    badgeUnlocks: [],
    dailyGoal: { target: 20, unit: 'minutes', progress: 0, updatedAt: today() },
    weeklyGoal: { target: 90, unit: 'minutes', progress: 0, updatedAt: today(), weekStart: startOfWeek(), weekEnd: endOfWeek() },
    challenges: [],
    lastRecap: null,
    quietMode: false,
    flags: {
        recapEnabled: true,
    recapShareEnabled: true,
    recapAnimationsEnabled: true,
        challengesEnabled: true,
        challengeRemindersEnabled: true,
        badgeStripEnabled: true,
        progressEnabled: true,
    },
});

const safeParse = (raw: string | null): UserProgress => {
    if (!raw) return createDefaultProgress();
    try {
        const parsed = JSON.parse(raw) as Partial<UserProgress>;
        if (!parsed || typeof parsed !== 'object') return createDefaultProgress();
        const defaults = createDefaultProgress();
        return {
            ...defaults,
            ...parsed,
            flags: { ...defaults.flags, ...parsed.flags },
            streakFrozen: parsed.streakFrozen ?? false,
            totalWorkoutsCompleted: parsed.totalWorkoutsCompleted ?? defaults.totalWorkoutsCompleted,
            dailyGoal: { ...defaults.dailyGoal, ...parsed.dailyGoal },
            weeklyGoal: { ...defaults.weeklyGoal, ...parsed.weeklyGoal },
            challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
            badges: Array.isArray(parsed.badges) ? parsed.badges : [],
            badgeUnlocks: Array.isArray(parsed.badgeUnlocks) ? parsed.badgeUnlocks : [],
        };
    } catch (error) {
        console.warn('UserProgressStore: failed to parse, using defaults', error);
        return createDefaultProgress();
    }
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const computeLevel = (xp: number) => Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);

const computeViewModel = (progress: UserProgress): ProgressViewModel => {
    const xpToNextLevel = Math.max(0, XP_PER_LEVEL - (progress.xp % XP_PER_LEVEL));
    const levelProgressPercent = clampPercent(((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100);
    const dailyGoalPercent = clampPercent(progress.dailyGoal.progress / Math.max(1, progress.dailyGoal.target) * 100);
    const weeklyGoalPercent = clampPercent(progress.weeklyGoal.progress / Math.max(1, progress.weeklyGoal.target) * 100);

    const todayDate = today();
    const streakStatus: 'active' | 'frozen' | 'broken' = progress.streakFrozen
        ? 'frozen'
        : progress.lastActiveDate === todayDate
            ? 'active'
            : progress.lastActiveDate
                ? dayjs(todayDate).diff(dayjs(progress.lastActiveDate), 'day') === 1
                    ? 'frozen'
                    : 'broken'
                : 'broken';

    const badgesPreview = progress.badges.slice(-3);
    const challengeSummaries = (progress.challenges || []).map(c => ({
        id: c.id,
        title: c.title,
        progress: c.progress,
        target: c.target,
        rewardXp: c.rewardXp,
        timeframe: c.timeframe,
        endsAt: c.endsAt,
    }));

    return {
        levelProgressPercent,
        xpToNextLevel,
        dailyGoalPercent,
        weeklyGoalPercent,
        streakStatus,
        badgesPreview,
        challengeSummaries,
    };
};

type BadgeRuleContext = {
    difficultyLevel?: number;
};

const ensureUnlocked = (progress: UserProgress, badgeId: string): UserProgress => {
    if (progress.badges.includes(badgeId)) return progress;
    return {
        ...progress,
        badges: [...progress.badges, badgeId],
        badgeUnlocks: [...progress.badgeUnlocks, { id: badgeId, unlockedAt: today() }],
    };
};

const applyBadgeUnlocks = (progress: UserProgress, context: BadgeRuleContext = {}): UserProgress => {
    let updated = progress;
    const rules: Array<{ id: string; predicate: (p: UserProgress, ctx: BadgeRuleContext) => boolean; }> = [
        { id: 'streak_3', predicate: p => p.streakCount >= 3 },
        { id: 'streak_7', predicate: p => p.streakCount >= 7 },
        { id: 'streak_30', predicate: p => p.streakCount >= 30 },
        { id: 'minutes_60', predicate: p => p.dailyGoal.unit === 'minutes' && p.dailyGoal.progress >= 60 },
        { id: 'minutes_300', predicate: p => p.weeklyGoal.unit === 'minutes' && p.weeklyGoal.progress >= 300 },
        { id: 'completion_10', predicate: p => p.totalWorkoutsCompleted >= 10 },
        { id: 'completion_50', predicate: p => p.totalWorkoutsCompleted >= 50 },
        { id: 'completion_100', predicate: p => p.totalWorkoutsCompleted >= 100 },
        { id: 'difficulty_advance', predicate: (_p, ctx) => (ctx.difficultyLevel ?? 0) >= 3 },
        { id: 'share_card', predicate: () => false }, // unlocked via explicit call to unlockBadge
    ];

    rules.forEach(rule => {
        if (rule.predicate(updated, context)) {
            updated = ensureUnlocked(updated, rule.id);
        }
    });

    return updated;
};

const UserProgressStore = {
    get(): UserProgress {
        if (!storageAvailable()) {
            inMemoryProgress = inMemoryProgress ?? createDefaultProgress();
            return inMemoryProgress;
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        return safeParse(raw);
    },

    getViewModel(): ProgressViewModel {
        const progress = this.get();
        if (this.isDisabled(progress)) {
            return computeViewModel(createDefaultProgress());
        }
        return computeViewModel(progress);
    },

    save(progress: UserProgress) {
        try {
            const payload = { ...progress, version: DEFAULT_VERSION };
            if (storageAvailable()) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } else {
                inMemoryProgress = payload;
            }
        } catch (error) {
            console.warn('UserProgressStore: failed to save; continuing without persistence', error);
            inMemoryProgress = progress;
        }
    },

    reset() {
        this.save(createDefaultProgress());
    },

    addXp(amount: number) {
        const current = this.get();
        const newXp = Math.max(0, current.xp + amount);
        const level = computeLevel(newXp);
        this.save({ ...current, xp: newXp, level });
    },

    recordActivity({ xp = 0, badges = [] as string[], goalDeltaMinutes = 0, completedWorkouts = 0, difficultyLevel }: { xp?: number; badges?: string[]; goalDeltaMinutes?: number; completedWorkouts?: number; difficultyLevel?: number; }) {
        const current = this.get();
        const todayDate = today();
        let streak = current.streakCount;
        if (current.lastActiveDate === todayDate) {
            // same day, keep streak
        } else if (current.lastActiveDate && dayjs(todayDate).diff(dayjs(current.lastActiveDate), 'day') === 1) {
            streak = streak + 1;
        } else {
            streak = 1;
        }

        const newXp = Math.max(0, current.xp + xp);
        const level = computeLevel(newXp);

        const dailyGoal = { ...current.dailyGoal };
        const weeklyGoal = { ...current.weeklyGoal };
        if (dailyGoal.updatedAt !== todayDate) {
            dailyGoal.progress = 0;
            dailyGoal.updatedAt = todayDate;
        }
        if (weeklyGoal.weekEnd && dayjs(todayDate).isAfter(dayjs(weeklyGoal.weekEnd))) {
            weeklyGoal.progress = 0;
            weeklyGoal.weekStart = startOfWeek();
            weeklyGoal.weekEnd = endOfWeek();
            weeklyGoal.updatedAt = todayDate;
        }
        if (goalDeltaMinutes > 0) {
            if (dailyGoal.unit === 'minutes') dailyGoal.progress += goalDeltaMinutes;
            if (weeklyGoal.unit === 'minutes') weeklyGoal.progress += goalDeltaMinutes;
        }

        const mergedBadges = [...current.badges, ...badges];
        const totalWorkoutsCompleted = Math.max(0, current.totalWorkoutsCompleted + Math.max(0, completedWorkouts));

        // Challenge rotation + progress
        const { challenges: rotatedChallenges, expiredIds } = rotateChallengesIfNeeded(current.challenges, todayDate, getChallengeCatalog());
        const challengesProgressed = applyChallengeProgress(rotatedChallenges, {
            minutesDelta: goalDeltaMinutes,
            workoutsDelta: completedWorkouts,
            asOfDate: todayDate,
        });

        const newlyCompleted: ChallengeInstance[] = challengesProgressed
            .filter((c: ChallengeInstance) => c.completed && !c.claimed)
            .filter((c: ChallengeInstance) => !current.challenges.find(prev => prev.id === c.id && prev.completed));

        newlyCompleted.forEach((c: ChallengeInstance) => recordMetric('challenge_completed', { id: c.id, timeframe: c.timeframe }));
        expiredIds.forEach((id: string) => recordMetric('challenge_expired', { id }));

        const updated = applyBadgeUnlocks({
            ...current,
            streakCount: streak,
            lastActiveDate: todayDate,
            streakFrozen: false,
            xp: newXp,
            level,
            dailyGoal,
            weeklyGoal,
            badges: mergedBadges,
            totalWorkoutsCompleted,
            badgeUnlocks: current.badgeUnlocks,
            challenges: challengesProgressed,
        }, { difficultyLevel });

        this.save(updated);
    },

    recordSkipOrTimeout({ reason }: { reason: 'skip' | 'timeout'; }) {
        const current = this.get();
        const todayDate = today();
        // Freeze streak for today without advancing; keep existing count.
        this.save({
            ...current,
            lastActiveDate: todayDate,
            streakFrozen: true,
        });
        console.log(`UserProgressStore: recorded ${reason}; streak frozen for ${todayDate}`);
    },

    isDisabled(progress?: UserProgress) {
        const state = progress ?? this.get();
        return state.flags?.progressEnabled === false;
    },

    getBadgeCatalog() {
        return getBadgeCatalog();
    },

    unlockBadge(id: string) {
        const current = this.get();
        const updated = ensureUnlocked(current, id);
        this.save(updated);
    },

    claimChallenge(id: string) {
        const current = this.get();
        const { progress: challengesOnly, xpAwarded, claimed } = claimChallengeReward({ challenges: current.challenges }, id);
        if (!claimed) return { claimed: false, xpAwarded: 0 };

        const newXp = Math.max(0, current.xp + xpAwarded);
        const level = computeLevel(newXp);
        const updatedProgress: UserProgress = {
            ...current,
            challenges: challengesOnly.challenges,
            xp: newXp,
            level,
        };

        this.save(updatedProgress);
        recordMetric('challenge_claimed', { id, xp: xpAwarded });
        return { claimed: true, xpAwarded };
    },

    getChallengeCatalog() {
        return getChallengeCatalog();
    },

    getChallengeReminders() {
        const progress = this.get();
        if (this.isDisabled(progress)) return [];
        if (progress.quietMode) return [];
        if (progress.flags?.challengeRemindersEnabled === false) return [];
        return getPendingChallengeReminders(progress.challenges, today());
    },

    isStorageAvailable() {
        return storageAvailable();
    },
};

export default UserProgressStore;
