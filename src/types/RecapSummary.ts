export type RecapCopyVariant = 'streaking' | 'low_activity' | 'default';

export interface RecapChallengeProgress {
    id: string;
    title: string;
    progress: number;
    target: number;
    timeframe: 'daily' | 'weekly';
    rewardXp?: number;
    endsAt?: string;
    completed?: boolean;
    claimed?: boolean;
}

export interface RecapSummary {
    xp: number;
    minutes: number;
    streakCount: number;
    streakStatus: 'active' | 'frozen' | 'broken';
    xpDelta?: number;
    streakDelta?: number;
    level: number;
    levelProgressPercent: number;
    xpToNextLevel: number;
    dailyGoalPercent: number;
    weeklyGoalPercent: number;
    badges: string[];
    badgeTotal?: number;
    selectionFocus?: string;
    presetUsed?: string;
    focusRationale?: string;
    shareText?: string;
    shareAvailable?: boolean;
    animationsEnabled?: boolean;
    isOffline?: boolean;
    unlockedBadges?: string[];
    challengeProgress?: RecapChallengeProgress[];
    nextSteps?: string[];
    copyVariant?: RecapCopyVariant;
}
