import HandlerDataLoader from '../utils/HandlerDataLoader';
import { DrillRank } from "../types/DrillRank";
import { DrillDifficultyLevel } from "../types/DrillDifficultyLevel";
import { HandlerData } from "../types/HandlerData";
import { isFeatureEnabled } from '../config/featureFlags';
import { withCache, APP_VERSION } from '../utils/cache/indexedDbCache';
import { TTL_MS } from '../utils/cache/constants';
import type { HandlerDataBundle } from '../utils/HandlerDataLoader';

class TrainingHandlerCache {
    private static instance: TrainingHandlerCache;
    private dataLoader: HandlerDataLoader;
    private ranks: DrillRank[] = [];
    private difficultyLevels: DrillDifficultyLevel[] = [];
    private handlerData: { [key: string]: HandlerData } = {};
    private defaultCoach: string = "tiger_fitness_god";

    private constructor() {
        this.dataLoader = new HandlerDataLoader();
    }

    public static getInstance(): TrainingHandlerCache {
        if (!TrainingHandlerCache.instance) {
            TrainingHandlerCache.instance = new TrainingHandlerCache();
        }
        return TrainingHandlerCache.instance;
    }

    public async loadData(): Promise<void> {
        if (isFeatureEnabled('loadingCacheV2')) {
            const appVersion = ((import.meta as any).env?.VITE_APP_VERSION as string | undefined) ?? APP_VERSION;
            const bundleResult = await withCache<HandlerDataBundle>(
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

    public async loadHandlerData(): Promise<void> {
        if (Object.keys(this.handlerData).length === 0) {
            const data = await this.dataLoader.loadCoachSpeech();
            this.handlerData = Object.keys(data).length ? data : this.dataLoader.getHandlerData();
        }
    }

    public getHandlerData(handler: string = this.defaultCoach): HandlerData {
        return this.handlerData[handler] || {} as HandlerData;
    }

    public getRandomMotivationalQuote(handler: string = this.defaultCoach): string {
        return this.getRandomItem(this.getHandlerData(handler).motivational_quotes || []);
    }

    public getRandomBoast(handler: string = this.defaultCoach): string {
        return this.getRandomItem(this.getHandlerData(handler).boasts || []);
    }

    public getRandomGrowl(handler: string = this.defaultCoach): string {
        return this.getRandomItem(this.getHandlerData(handler).growls || []);
    }

    private getRandomItem(array: string[]): string {
        return array[Math.floor(Math.random() * array.length)];
    }

    public getRanks(): DrillRank[] {
        return this.ranks;
    }

    public getDifficultyLevels(): DrillDifficultyLevel[] {
        return this.difficultyLevels;
    }

    private applyBundle(bundle: HandlerDataBundle): void {
        this.handlerData = bundle.handlerData ?? this.handlerData;
        this.ranks = bundle.ranks ?? this.ranks;
        this.difficultyLevels = bundle.difficultyLevels ?? this.difficultyLevels;
    }
}

export default TrainingHandlerCache;
