import trainingChallenges from "../data/training_handler_data/training_challenges.json";
import ranksData from "../data/training_handler_data/ranks.json";
import difficultyLevels from "../data/training_handler_data/difficulty_levels.json";
import handlerSpeech from "../data/training_handler_data/handler_speech.json";
import { DrillDifficultyLevel } from "../types/DrillDifficultyLevel";
import { DrillRank } from "../types/DrillRank";
import { HandlerData } from "../types/HandlerData";

export interface HandlerDataBundle {
    handlerData: { [key: string]: HandlerData };
    ranks: DrillRank[];
    difficultyLevels: DrillDifficultyLevel[];
    trainingChallenges: typeof trainingChallenges;
}

class HandlerDataLoader {
    private handlerData: { [key: string]: HandlerData } = {};
    private ranks: DrillRank[] = [];
    private difficultyLevels: DrillDifficultyLevel[] = [];

    public async loadAllData(): Promise<HandlerDataBundle> {
        try {
            console.log("HandlerDataLoader: Starting to load all handler data...");
            const [trainingChallengesData, handlerSpeechData, ranks, difficultyLevelsData] = await Promise.all([
                this.loadTrainingChallenges(),
                this.loadHandlerSpeech(),
                this.loadRanks(),
                this.loadDifficultyLevels(),
            ]);

            this.handlerData = handlerSpeechData;
            this.ranks = ranks;
            this.difficultyLevels = difficultyLevelsData;

            console.log("HandlerDataLoader: Successfully loaded all handler data.");
            return {
                handlerData: this.handlerData,
                ranks: this.ranks,
                difficultyLevels: this.difficultyLevels,
                trainingChallenges: trainingChallengesData,
            };
        } catch (error) {
            console.error("HandlerDataLoader: Failed to load all handler data:", error);
            return {
                handlerData: this.handlerData,
                ranks: this.ranks,
                difficultyLevels: this.difficultyLevels,
                trainingChallenges,
            };
        }
    }

    public async loadTrainingChallenges(): Promise<typeof trainingChallenges> {
        try {
            console.log("HandlerDataLoader: Loading training challenges...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`HandlerDataLoader: Loaded ${trainingChallenges.length} training challenges.`);
            return trainingChallenges;
        } catch (error) {
            console.error("HandlerDataLoader: Failed to load training challenges:", error);
            return trainingChallenges;
        }
    }

    public async loadHandlerSpeech(): Promise<{ [key: string]: HandlerData }> {
        try {
            console.log("HandlerDataLoader: Loading handler speech...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.handlerData = (handlerSpeech as any).handlers ?? handlerSpeech;
            console.log(`HandlerDataLoader: Loaded handler speech for ${Object.keys(this.handlerData).length} handlers.`);
            return this.handlerData;
        } catch (error) {
            console.error("HandlerDataLoader: Failed to load handler speech:", error);
            return this.handlerData;
        }
    }

    public async loadRanks(): Promise<DrillRank[]> {
        try {
            console.log("HandlerDataLoader: Loading ranks...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.ranks = this.getRanks();
            console.log(`HandlerDataLoader: Loaded ${this.ranks.length} ranks.`);
            return this.ranks;
        } catch (error) {
            console.error("HandlerDataLoader: Failed to load ranks:", error);
            return this.ranks;
        }
    }

    public async loadDifficultyLevels(): Promise<DrillDifficultyLevel[]> {
        try {
            console.log("HandlerDataLoader: Loading difficulty levels...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.difficultyLevels = this.getDifficultyLevels();
            console.log(`HandlerDataLoader: Loaded ${this.difficultyLevels.length} difficulty levels.`);
            return this.difficultyLevels;
        } catch (error) {
            console.error("HandlerDataLoader: Failed to load difficulty levels:", error);
            return this.difficultyLevels;
        }
    }

    public getRanks(): DrillRank[] {
        return ranksData.map(rank => ({
            name: rank.rank,
            description: rank.description,
            // ...other properties from rank
        }));
    }

    public getDifficultyLevels(): DrillDifficultyLevel[] {
        return difficultyLevels.map(level => ({
            name: level.name,
            description: level.description,
            military_soldier: level.military_soldier,
            athlete_archetype: level.athlete_archetype,
            level: level.level,
            pft: level.pft,
            requirements: level.requirements
        })) as DrillDifficultyLevel[];
    }

    public getHandlerData(): { [key: string]: HandlerData } {
        return this.handlerData;
    }
}

export default HandlerDataLoader;
