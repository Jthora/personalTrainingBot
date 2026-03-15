export type ChallengeTimeframe = 'daily' | 'weekly';

export interface ChallengeDefinition {
    id: string;
    title: string;
    description: string;
    timeframe: ChallengeTimeframe;
    target: number;
    unit: 'minutes' | 'missions';
    rewardXp: number;
}

const CHALLENGE_CATALOG: ChallengeDefinition[] = [
    {
        id: 'daily_minutes_20',
        title: 'Daily Recon',
        description: 'Log at least 20 minutes of training today',
        timeframe: 'daily',
        target: 20,
        unit: 'minutes',
        rewardXp: 50,
    },
    {
        id: 'daily_two_missions',
        title: 'Double Deployment',
        description: 'Complete 2 training exercises today',
        timeframe: 'daily',
        target: 2,
        unit: 'missions',
        rewardXp: 60,
    },
    {
        id: 'weekly_minutes_90',
        title: 'Weekly Surveillance',
        description: 'Accumulate 90 minutes of training this week',
        timeframe: 'weekly',
        target: 90,
        unit: 'minutes',
        rewardXp: 120,
    },
    {
        id: 'weekly_five_missions',
        title: 'Five-Op Sprint',
        description: 'Complete 5 training exercises this week',
        timeframe: 'weekly',
        target: 5,
        unit: 'missions',
        rewardXp: 140,
    },
];

export const getChallengeCatalog = (): ChallengeDefinition[] => {
    try {
        return CHALLENGE_CATALOG;
    } catch (error) {
        console.warn('challengeCatalog: returning empty catalog due to error', error);
        return [];
    }
};

export const findChallenge = (id: string): ChallengeDefinition | undefined => getChallengeCatalog().find(c => c.id === id);
