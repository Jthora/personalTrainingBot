import { ChallengeTimeframe } from '../data/challengeCatalog';

export interface ChallengeInstance {
    id: string;
    title: string;
    description: string;
    rewardXp: number;
    timeframe: ChallengeTimeframe;
    startsAt: string;
    endsAt: string;
    progress: number;
    target: number;
    unit: 'minutes' | 'missions';
    completed: boolean;
    claimed: boolean;
    hidden?: boolean;
}
