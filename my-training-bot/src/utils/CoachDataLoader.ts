import trainingChallenges from "../data/training_coach_data/training_challenges.json";
import ranksData from "../data/training_coach_data/ranks.json";
import difficultyLevels from "../data/training_coach_data/difficulty_levels.json";
import coachSpeech from "../data/training_coach_data/coach_speech.json";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { WorkoutRank } from "../types/WorkoutRank";
import { CoachData } from "../types/CoachData";

class CoachDataLoader {
    private coachData: { [key: string]: CoachData } = {};

    public async loadAllData(): Promise<void> {
        try {
            console.log("CoachDataLoader: Starting to load all coach data...");
            await this.loadTrainingChallenges();
            await this.loadCoachSpeech();
            await this.loadRanks();
            await this.loadDifficultyLevels();
            console.log("CoachDataLoader: Successfully loaded all coach data.");
        } catch (error) {
            console.error("CoachDataLoader: Failed to load all coach data:", error);
        }
    }

    public async loadTrainingChallenges(): Promise<void> {
        try {
            console.log("CoachDataLoader: Loading training challenges...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`CoachDataLoader: Loaded ${trainingChallenges.length} training challenges.`);
        } catch (error) {
            console.error("CoachDataLoader: Failed to load training challenges:", error);
        }
    }

    public async loadCoachSpeech(): Promise<void> {
        try {
            console.log("CoachDataLoader: Loading coach speech...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.coachData = coachSpeech.coaches;
            console.log(`CoachDataLoader: Loaded coach speech for ${Object.keys(this.coachData).length} coaches.`);
        } catch (error) {
            console.error("CoachDataLoader: Failed to load coach speech:", error);
        }
    }

    public async loadRanks(): Promise<void> {
        try {
            console.log("CoachDataLoader: Loading ranks...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`CoachDataLoader: Loaded ${ranksData.length} ranks.`);
        } catch (error) {
            console.error("CoachDataLoader: Failed to load ranks:", error);
        }
    }

    public async loadDifficultyLevels(): Promise<void> {
        try {
            console.log("CoachDataLoader: Loading difficulty levels...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`Loaded ${difficultyLevels.length} difficulty levels.`);
        } catch (error) {
            console.error("CoachDataLoader: Failed to load difficulty levels:", error);
        }
    }

    public getRanks(): WorkoutRank[] {
        return ranksData.map(rank => ({
            name: rank.rank,
            description: rank.description,
            // ...other properties from rank
        }));
    }

    public getDifficultyLevels(): WorkoutDifficultyLevel[] {
        return difficultyLevels.map(level => ({
            name: level.name,
            description: level.description,
            military_soldier: level.military_soldier,
            athlete_archetype: level.athlete_archetype,
            level: level.level,
            pft: level.pft,
            requirements: level.requirements
        })) as WorkoutDifficultyLevel[];
    }

    public getCoachData(): { [key: string]: CoachData } {
        return this.coachData;
    }
}

export default CoachDataLoader;
