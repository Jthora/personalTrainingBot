import trainingChallenges from "../data/training_coach_data/training_challenges.json";
import ranksData from "../data/training_coach_data/ranks.json";
import difficultyLevels from "../data/training_coach_data/difficulty_levels.json";
import coachSpeech from "../data/training_coach_data/coach_speech.json";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { WorkoutRank } from "../types/WorkoutRank";
import { CoachData } from "../types/CoachData";

export interface CoachDataBundle {
    coachData: { [key: string]: CoachData };
    ranks: WorkoutRank[];
    difficultyLevels: WorkoutDifficultyLevel[];
    trainingChallenges: typeof trainingChallenges;
}

class CoachDataLoader {
    private coachData: { [key: string]: CoachData } = {};
    private ranks: WorkoutRank[] = [];
    private difficultyLevels: WorkoutDifficultyLevel[] = [];

    public async loadAllData(): Promise<CoachDataBundle> {
        try {
            console.log("CoachDataLoader: Starting to load all coach data...");
            const [trainingChallengesData, coachSpeechData, ranks, difficultyLevelsData] = await Promise.all([
                this.loadTrainingChallenges(),
                this.loadCoachSpeech(),
                this.loadRanks(),
                this.loadDifficultyLevels(),
            ]);

            this.coachData = coachSpeechData;
            this.ranks = ranks;
            this.difficultyLevels = difficultyLevelsData;

            console.log("CoachDataLoader: Successfully loaded all coach data.");
            return {
                coachData: this.coachData,
                ranks: this.ranks,
                difficultyLevels: this.difficultyLevels,
                trainingChallenges: trainingChallengesData,
            };
        } catch (error) {
            console.error("CoachDataLoader: Failed to load all coach data:", error);
            return {
                coachData: this.coachData,
                ranks: this.ranks,
                difficultyLevels: this.difficultyLevels,
                trainingChallenges,
            };
        }
    }

    public async loadTrainingChallenges(): Promise<typeof trainingChallenges> {
        try {
            console.log("CoachDataLoader: Loading training challenges...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`CoachDataLoader: Loaded ${trainingChallenges.length} training challenges.`);
            return trainingChallenges;
        } catch (error) {
            console.error("CoachDataLoader: Failed to load training challenges:", error);
            return trainingChallenges;
        }
    }

    public async loadCoachSpeech(): Promise<{ [key: string]: CoachData }> {
        try {
            console.log("CoachDataLoader: Loading coach speech...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.coachData = coachSpeech.coaches;
            console.log(`CoachDataLoader: Loaded coach speech for ${Object.keys(this.coachData).length} coaches.`);
            return this.coachData;
        } catch (error) {
            console.error("CoachDataLoader: Failed to load coach speech:", error);
            return this.coachData;
        }
    }

    public async loadRanks(): Promise<WorkoutRank[]> {
        try {
            console.log("CoachDataLoader: Loading ranks...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.ranks = this.getRanks();
            console.log(`CoachDataLoader: Loaded ${this.ranks.length} ranks.`);
            return this.ranks;
        } catch (error) {
            console.error("CoachDataLoader: Failed to load ranks:", error);
            return this.ranks;
        }
    }

    public async loadDifficultyLevels(): Promise<WorkoutDifficultyLevel[]> {
        try {
            console.log("CoachDataLoader: Loading difficulty levels...");
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.difficultyLevels = this.getDifficultyLevels();
            console.log(`CoachDataLoader: Loaded ${this.difficultyLevels.length} difficulty levels.`);
            return this.difficultyLevels;
        } catch (error) {
            console.error("CoachDataLoader: Failed to load difficulty levels:", error);
            return this.difficultyLevels;
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
