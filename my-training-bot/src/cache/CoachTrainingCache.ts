import {
    fetchAllDifficultyLevels,
    fetchAllRanks,
    fetchSpeech,
    fetchWorkout,
    fetchAllWorkoutsInCategory,
    fetchAllSubWorkoutsInCategory
} from "../utils/CoachDataLoader";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { WorkoutRank } from "../types/WorkoutRank";
import { Workout } from "../types/Workout";
import { WorkoutsData } from "../types/WorkoutsData";
import { SubWorkout } from "../types/SubWorkout";
import { WorkoutCategory } from "../types/WorkoutCategory";

class CoachTrainingCache {
    private difficultyLevels!: WorkoutDifficultyLevel[];
    private ranks!: WorkoutRank[];
    private tigerSpeech!: string[];
    private trainingChallenges!: { task: string }[];
    private workouts!: WorkoutsData;
    private subWorkouts!: { [key: string]: SubWorkout[] };
    private loading: boolean = true;

    constructor() {
        console.log("Initializing CoachTrainingCache...");
        this.refreshCache();
    }

    private async loadAllWorkouts(): Promise<WorkoutsData> {
        console.log("Loading all workouts...");
        const categories = ["cardio", "strength", "agility", "combat", "mental"];
        const workoutsData: WorkoutsData = {};

        for (const category of categories) {
            console.log(`Loading workouts for category: ${category}`);
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
                    }, {} as WorkoutCategory);
                    console.log(`Loaded ${categoryWorkouts.length} workouts for category: ${category}`);
                }
            } catch (error) {
                console.error(`Failed to load workouts for category ${category}:`, error);
            }
        }

        return workoutsData;
    }

    private async loadAllSubWorkouts(): Promise<{ [key: string]: SubWorkout[] }> {
        console.log("Loading all sub-workouts...");
        const categories = ["cardio", "strength", "agility", "combat", "mental"];
        const subWorkoutsData: { [key: string]: SubWorkout[] } = {};

        for (const category of categories) {
            console.log(`Loading sub-workouts for category: ${category}`);
            try {
                const categorySubWorkouts = await fetchAllSubWorkoutsInCategory(category);
                if (categorySubWorkouts) {
                    subWorkoutsData[category] = categorySubWorkouts;
                    console.log(`Loaded ${categorySubWorkouts.length} sub-workouts for category: ${category}`);
                }
            } catch (error) {
                console.error(`Failed to load sub-workouts for category ${category}:`, error);
            }
        }

        return subWorkoutsData;
    }

    async refreshCache(): Promise<void> {
        console.log("Refreshing cache...");
        this.loading = true;
        try {
            this.difficultyLevels = await fetchAllDifficultyLevels() || [];
            console.log(`Loaded ${this.difficultyLevels.length} difficulty levels.`);
            this.ranks = await fetchAllRanks() || [];
            console.log(`Loaded ${this.ranks.length} ranks.`);
            this.tigerSpeech = fetchSpeech() ? [fetchSpeech()] : [];
            console.log(`Loaded tiger speech: ${this.tigerSpeech}`);
            this.trainingChallenges = fetchWorkout() ? [{ task: fetchWorkout() }] : [];
            console.log(`Loaded training challenges: ${this.trainingChallenges}`);
            this.workouts = await this.loadAllWorkouts();
            this.subWorkouts = await this.loadAllSubWorkouts();
            console.log("Cache refreshed successfully.");
        } catch (error) {
            console.error("Failed to refresh cache:", error);
        } finally {
            this.loading = false;
        }
    }

    isLoading(): boolean {
        return this.loading;
    }

    async updateDifficultyLevels(): Promise<void> {
        console.log("Updating difficulty levels...");
        try {
            this.difficultyLevels = await fetchAllDifficultyLevels() || [];
            console.log(`Updated difficulty levels: ${this.difficultyLevels}`);
        } catch (error) {
            console.error("Failed to update difficulty levels:", error);
        }
    }

    async updateRanks(): Promise<void> {
        console.log("Updating ranks...");
        try {
            this.ranks = await fetchAllRanks() || [];
            console.log(`Updated ranks: ${this.ranks}`);
        } catch (error) {
            console.error("Failed to update ranks:", error);
        }
    }

    updateTigerSpeech(): void {
        console.log("Updating tiger speech...");
        try {
            this.tigerSpeech = fetchSpeech() ? [fetchSpeech()] : [];
            console.log(`Updated tiger speech: ${this.tigerSpeech}`);
        } catch (error) {
            console.error("Failed to update tiger speech:", error);
        }
    }

    updateTrainingChallenges(): void {
        console.log("Updating training challenges...");
        try {
            this.trainingChallenges = fetchWorkout() ? [{ task: fetchWorkout() }] : [];
            console.log(`Updated training challenges: ${this.trainingChallenges}`);
        } catch (error) {
            console.error("Failed to update training challenges:", error);
        }
    }

    async updateWorkouts(): Promise<void> {
        console.log("Updating workouts...");
        try {
            this.workouts = await this.loadAllWorkouts();
            console.log("Workouts updated successfully.");
        } catch (error) {
            console.error("Failed to update workouts:", error);
        }
    }

    getDifficultyLevels(): WorkoutDifficultyLevel[] {
        console.log("Fetching difficulty levels...");
        return this.difficultyLevels;
    }

    getRanks(): WorkoutRank[] {
        console.log("Fetching ranks...");
        return this.ranks;
    }

    getTigerSpeech(): string[] {
        console.log("Fetching tiger speech...");
        return this.tigerSpeech;
    }

    getTrainingChallenges(): { task: string }[] {
        console.log("Fetching training challenges...");
        return this.trainingChallenges;
    }

    getWorkouts(): WorkoutsData {
        console.log("Fetching workouts...");
        return this.workouts;
    }

    getWorkoutByCategory(category: string, subCategory: string): Workout[] | null {
        console.log(`Fetching workouts for category: ${category}, sub-category: ${subCategory}`);
        const categoryData = this.workouts[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        return categoryData[subCategory] || null;
    }

    getSubWorkout(category: string, subCategory: string, workoutName: string): SubWorkout | null {
        console.log(`Fetching sub-workout for category: ${category}, sub-category: ${subCategory}, workout name: ${workoutName}`);
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
        return getRandomItem(workout.sub_workouts);
    }

    getSubWorkoutsByCategory(category: string): SubWorkout[] | null {
        console.log(`Fetching sub-workouts for category: ${category}`);
        return this.subWorkouts[category] || null;
    }
}

const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const coachTrainingCache = new CoachTrainingCache();
export default coachTrainingCache;
