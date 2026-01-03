export type ChallengeTimeframe = 'daily' | 'weekly';

export interface ChallengeDefinition {
    id: string;
    title: string;
    description: string;
    timeframe: ChallengeTimeframe;
    target: number;
    unit: 'minutes' | 'workouts';
    rewardXp: number;
}

const CHALLENGE_CATALOG: ChallengeDefinition[] = [
    {
        id: 'daily_minutes_20',
        title: 'Daily 20',
        description: 'Log at least 20 minutes today',
        timeframe: 'daily',
        target: 20,
        unit: 'minutes',
        rewardXp: 50,
    },
    {
        id: 'daily_two_workouts',
        title: 'Double Up',
        description: 'Complete 2 workouts today',
        timeframe: 'daily',
        target: 2,
        unit: 'workouts',
        rewardXp: 60,
    },
    {
        id: 'weekly_minutes_90',
        title: 'Weekly 90',
        description: 'Accumulate 90 minutes this week',
        timeframe: 'weekly',
        target: 90,
        unit: 'minutes',
        rewardXp: 120,
    },
    {
        id: 'weekly_five_workouts',
        title: 'Five Flights',
        description: 'Complete 5 workouts this week',
        timeframe: 'weekly',
        target: 5,
        unit: 'workouts',
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
