import CoachDataLoader, { fetchWorkoutByCategory, fetchWorkoutFromGroup, fetchAllWorkoutsInCategory, fetchAllWorkoutsInGroup } from '../utils/CoachDataLoader';
import { WorkoutCategory, WorkoutSubCategory, WorkoutGroup, Workout } from "../types/WorkoutCategory";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import DifficultySettingsStore from '../store/DifficultySettingsStore';

class CoachTrainingCache {
    private dataLoader: CoachDataLoader;
    private workoutCategories: WorkoutCategory[] = [];
    private difficultyLevels: WorkoutDifficultyLevel[] = [];
    private loading: boolean = true;
    private workoutsByDifficulty: { [key: number]: Workout[] } = {};

    constructor() {
        console.log("Initializing CoachTrainingCache...");
        this.dataLoader = new CoachDataLoader();
        this.loadData();
    }

    private async loadData() {
        this.loading = true;
        try {
            this.workoutCategories = await this.dataLoader.loadWorkoutCategories();
            this.difficultyLevels = await this.dataLoader.fetchAllDifficultyLevels();
            this.organizeWorkoutsByDifficulty();
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

    getWorkoutCategories(): WorkoutCategory[] {
        return this.workoutCategories;
    }

    getWorkoutCategoryById(id: string): WorkoutCategory | undefined {
        return this.workoutCategories.find(category => category.id === id);
    }

    getSubCategoryById(categoryId: string, subCategoryId: string): WorkoutSubCategory | undefined {
        const category = this.getWorkoutCategoryById(categoryId);
        return category?.subCategories.find(subCategory => subCategory.id === subCategoryId);
    }

    getWorkoutGroupById(categoryId: string, subCategoryId: string, groupId: string): WorkoutGroup | undefined {
        const subCategory = this.getSubCategoryById(categoryId, subCategoryId);
        return subCategory?.workoutGroups.find(group => group.id === groupId);
    }

    async fetchWorkoutByCategory(category: string, subCategory: string): Promise<Workout | null> {
        return await fetchWorkoutByCategory(category, subCategory);
    }

    async fetchWorkoutFromGroup(category: string, subCategory: string, groupName: string): Promise<Workout | null> {
        return await fetchWorkoutFromGroup(category, subCategory, groupName);
    }

    async fetchAllWorkoutsInCategory(category: string): Promise<Workout[] | null> {
        return await fetchAllWorkoutsInCategory(category);
    }

    async fetchAllWorkoutsInGroup(category: string, subCategory: string, groupName: string): Promise<Workout[] | null> {
        return await fetchAllWorkoutsInGroup(category, subCategory, groupName);
    }

    getWorkoutsByDifficulty(difficulty: number): Workout[] {
        return this.workoutsByDifficulty[difficulty] || [];
    }

    getDifficultyLevels(): WorkoutDifficultyLevel[] {
        return this.difficultyLevels;
    }

    private organizeWorkoutsByDifficulty(): void {
        this.workoutsByDifficulty = {};
        this.workoutCategories.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.workoutGroups.forEach(group => {
                    group.workouts.forEach(workout => {
                        const minDifficulty = workout.difficultyRange[0];
                        const maxDifficulty = workout.difficultyRange[1];
                        for (let i = minDifficulty; i <= maxDifficulty; i++) {
                            if (!this.workoutsByDifficulty[i]) {
                                this.workoutsByDifficulty[i] = [];
                            }
                            this.workoutsByDifficulty[i].push(workout);
                        }
                    });
                });
            });
        });
    }

    getWeightedRandomWorkout(): Workout | null {
        const settings = DifficultySettingsStore.getSettings();
        const selectedDifficulty = this.difficultyLevels.find(level => level.name === settings.selectedDifficulty)?.level || 0;
        const minRange = settings.minRange;
        const maxRange = settings.maxRange;

        const difficulties = [];
        for (let i = minRange; i <= maxRange; i++) {
            const weight = Math.exp(-Math.pow(i - selectedDifficulty, 2) / (2 * Math.pow((maxRange - minRange) / 6, 2)));
            for (let j = 0; j < weight; j++) {
                difficulties.push(i);
            }
        }
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const workouts = this.getWorkoutsByDifficulty(randomDifficulty);
        return workouts.length > 0 ? workouts[Math.floor(Math.random() * workouts.length)] : null;
    }
}

const coachTrainingCache = new CoachTrainingCache();
export default coachTrainingCache;
