import {
    fetchAllDifficultyLevels,
    fetchAllRanks,
    fetchSpeech,
    fetchWorkout,
    fetchAllWorkoutsInCategory
} from "../utils/CoachDataLoader";
import { DifficultyLevel, Rank, Workout, WorkoutsData, Category } from "../types/CoachTypes";

class CoachTrainingCache {
    private difficultyLevels!: DifficultyLevel[];
    private ranks!: Rank[];
    private tigerSpeech!: string[];
    private trainingChallenges!: { task: string }[];
    private workouts!: WorkoutsData;

    constructor() {
        this.refreshCache();
    }

    private async loadAllWorkouts(): Promise<WorkoutsData> {
        const categories = ["cardio", "strength", "agility", "combat", "mental"];
        const workoutsData: WorkoutsData = {};

        for (const category of categories) {
            try {
                const categoryWorkouts = await fetchAllWorkoutsInCategory(category);
                if (categoryWorkouts) {
                    workoutsData[category] = categoryWorkouts.reduce((acc, workout) => {
                        const subCategory = workout.description.split(",")[0].trim();
                        if (!acc[subCategory]) {
                            acc[subCategory] = [];
                        }
                        acc[subCategory].push(workout);
                        return acc;
                    }, {} as Category);
                }
            } catch (error) {
                console.error(`Failed to load workouts for category ${category}:`, error);
            }
        }

        return workoutsData;
    }

    async refreshCache(): Promise<void> {
        try {
            this.difficultyLevels = await fetchAllDifficultyLevels() || [];
            this.ranks = await fetchAllRanks() || [];
            this.tigerSpeech = fetchSpeech() ? [fetchSpeech()] : [];
            this.trainingChallenges = fetchWorkout() ? [{ task: fetchWorkout() }] : [];
            this.workouts = await this.loadAllWorkouts();
        } catch (error) {
            console.error("Failed to refresh cache:", error);
        }
    }

    async updateDifficultyLevels(): Promise<void> {
        try {
            this.difficultyLevels = await fetchAllDifficultyLevels() || [];
        } catch (error) {
            console.error("Failed to update difficulty levels:", error);
        }
    }

    async updateRanks(): Promise<void> {
        try {
            this.ranks = await fetchAllRanks() || [];
        } catch (error) {
            console.error("Failed to update ranks:", error);
        }
    }

    updateTigerSpeech(): void {
        try {
            this.tigerSpeech = fetchSpeech() ? [fetchSpeech()] : [];
        } catch (error) {
            console.error("Failed to update tiger speech:", error);
        }
    }

    updateTrainingChallenges(): void {
        try {
            this.trainingChallenges = fetchWorkout() ? [{ task: fetchWorkout() }] : [];
        } catch (error) {
            console.error("Failed to update training challenges:", error);
        }
    }

    async updateWorkouts(): Promise<void> {
        try {
            this.workouts = await this.loadAllWorkouts();
        } catch (error) {
            console.error("Failed to update workouts:", error);
        }
    }

    getDifficultyLevels(): DifficultyLevel[] {
        return this.difficultyLevels;
    }

    getRanks(): Rank[] {
        return this.ranks;
    }

    getTigerSpeech(): string[] {
        return this.tigerSpeech;
    }

    getTrainingChallenges(): { task: string }[] {
        return this.trainingChallenges;
    }

    getWorkouts(): WorkoutsData {
        return this.workouts;
    }

    getWorkoutByCategory(category: string, subCategory: string): Workout[] | null {
        const categoryData = this.workouts[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        return categoryData[subCategory] || null;
    }

    getSubWorkout(category: string, subCategory: string, workoutName: string): Workout | null {
        const categoryData = this.workouts[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = categoryData[subCategory];
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const workout = subCategoryData.find(workout => workout.name === workoutName);
        if (!workout) {
            console.warn(`Workout ${workoutName} not found in sub-category ${subCategory} of category ${category}.`);
            return null;
        }
        return workout;
    }
}

const coachTrainingCache = new CoachTrainingCache();
export default coachTrainingCache;
