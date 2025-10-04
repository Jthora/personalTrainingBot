import CoachDataLoader from '../utils/CoachDataLoader';
import { WorkoutRank } from "../types/WorkoutRank";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { CoachData } from "../types/CoachData";

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
        await Promise.all([
            this.loadRanks(),
            this.loadDifficultyLevels(),
            this.loadCoachData()
        ]);
    }

    public async loadRanks(): Promise<void> {
        if (this.ranks.length === 0) {
            await this.dataLoader.loadRanks();
            this.ranks = this.dataLoader.getRanks();
        }
    }

    public async loadDifficultyLevels(): Promise<void> {
        if (this.difficultyLevels.length === 0) {
            await this.dataLoader.loadDifficultyLevels();
            this.difficultyLevels = this.dataLoader.getDifficultyLevels();
        }
    }

    public async loadCoachData(): Promise<void> {
        if (Object.keys(this.coachData).length === 0) {
            await this.dataLoader.loadCoachSpeech();
            this.coachData = this.dataLoader.getCoachData();
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
}

export default TrainingCoachCache;
