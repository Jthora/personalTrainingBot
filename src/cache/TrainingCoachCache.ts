import CoachDataLoader from '../utils/CoachDataLoader';
import { WorkoutRank } from "../types/WorkoutRank";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { CoachData } from "../types/CoachData";
import { isFeatureEnabled } from '../config/featureFlags';
import { withCache, APP_VERSION } from '../utils/cache/indexedDbCache';
import { TTL_MS } from '../utils/cache/constants';
import type { CoachDataBundle } from '../utils/CoachDataLoader';

class TrainingCoachCache {
    private static instance: TrainingCoachCache;
    private dataLoader: CoachDataLoader;
    private ranks: WorkoutRank[] = [];
    private difficultyLevels: WorkoutDifficultyLevel[] = [];
    private coachData: { [key: string]: CoachData } = {};
    private defaultCoach: string = "tiger_fitness_god";

    private constructor() {
        this.dataLoader = new CoachDataLoader();
    }

    public static getInstance(): TrainingCoachCache {
        if (!TrainingCoachCache.instance) {
            TrainingCoachCache.instance = new TrainingCoachCache();
        }
        return TrainingCoachCache.instance;
    }

    public async loadData(): Promise<void> {
        if (isFeatureEnabled('loadingCacheV2')) {
            const appVersion = ((import.meta as any).env?.VITE_APP_VERSION as string | undefined) ?? APP_VERSION;
            const bundleResult = await withCache<CoachDataBundle>(
                'coachCatalog',
                'all',
                TTL_MS.coachCatalog,
                `coachCatalog-${appVersion}`,
                async () => this.dataLoader.loadAllData(),
                { logger: (msg, meta) => console.info(`coachCache: ${msg}`, meta) }
            );
            this.applyBundle(bundleResult.data);
            return;
        }

        const bundle = await this.dataLoader.loadAllData();
        this.applyBundle(bundle);
    }

    public async loadRanks(): Promise<void> {
        if (this.ranks.length === 0) {
            const ranks = await this.dataLoader.loadRanks();
            this.ranks = ranks.length ? ranks : this.dataLoader.getRanks();
        }
    }

    public async loadDifficultyLevels(): Promise<void> {
        if (this.difficultyLevels.length === 0) {
            const difficultyLevels = await this.dataLoader.loadDifficultyLevels();
            this.difficultyLevels = difficultyLevels.length ? difficultyLevels : this.dataLoader.getDifficultyLevels();
        }
    }

    public async loadCoachData(): Promise<void> {
        if (Object.keys(this.coachData).length === 0) {
            const data = await this.dataLoader.loadCoachSpeech();
            this.coachData = Object.keys(data).length ? data : this.dataLoader.getCoachData();
        }
    }

    public getCoachData(coach: string = this.defaultCoach): CoachData {
        return this.coachData[coach] || {} as CoachData;
    }

    public getRandomMotivationalQuote(coach: string = this.defaultCoach): string {
        return this.getRandomItem(this.getCoachData(coach).motivational_quotes || []);
    }

    public getRandomBoast(coach: string = this.defaultCoach): string {
        return this.getRandomItem(this.getCoachData(coach).boasts || []);
    }

    public getRandomGrowl(coach: string = this.defaultCoach): string {
        return this.getRandomItem(this.getCoachData(coach).growls || []);
    }

    private getRandomItem(array: string[]): string {
        return array[Math.floor(Math.random() * array.length)];
    }

    public getRanks(): WorkoutRank[] {
        return this.ranks;
    }

    public getDifficultyLevels(): WorkoutDifficultyLevel[] {
        return this.difficultyLevels;
    }

    private applyBundle(bundle: CoachDataBundle): void {
        this.coachData = bundle.coachData ?? this.coachData;
        this.ranks = bundle.ranks ?? this.ranks;
        this.difficultyLevels = bundle.difficultyLevels ?? this.difficultyLevels;
    }
}

export default TrainingCoachCache;
