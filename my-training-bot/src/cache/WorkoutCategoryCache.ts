import { Workout, WorkoutCategory } from "../types/WorkoutCategory";
import WorkoutDataLoader from '../utils/WorkoutDataLoader';

class WorkoutCategoryCache {
    private static instance: WorkoutCategoryCache;
    public cache: Map<string, WorkoutCategory>;
    public selectedCategories: Set<string>;
    public selectedSubCategories: Set<string>;
    public selectedWorkoutGroups: Set<string>;
    public selectedWorkouts: Set<string>;
    private loading: boolean;
    private categories: WorkoutCategory[] = [];

    private constructor() {
        this.cache = new Map();
        this.selectedCategories = new Set();
        this.selectedSubCategories = new Set();
        this.selectedWorkoutGroups = new Set();
        this.selectedWorkouts = new Set();
        this.loading = true;
        this.loadCategories();
    }

    public static getInstance(): WorkoutCategoryCache {
        if (!WorkoutCategoryCache.instance) {
            WorkoutCategoryCache.instance = new WorkoutCategoryCache();
        }
        return WorkoutCategoryCache.instance;
    }

    private async loadCategories() {
        const dataLoader = new WorkoutDataLoader();
        this.categories = await dataLoader.loadAllData(() => {});
        this.categories.forEach(category => {
            this.cache.set(category.id, category);
        });
        this.loading = false;
        console.log(`Loaded ${this.cache.size} workout categories.`);
    }

    public async loadData(workoutCategories: WorkoutCategory[]): Promise<void> {
        this.loading = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                workoutCategories.forEach(category => {
                    this.cache.set(category.id, category);
                    this.selectedCategories.add(category.id);
                    category.subCategories.forEach(subCategory => {
                        this.selectedSubCategories.add(subCategory.id);
                        subCategory.workoutGroups.forEach(group => {
                            this.selectedWorkoutGroups.add(group.id);
                            group.workouts.forEach(workout => {
                                this.selectedWorkouts.add(workout.id);
                            });
                        });
                    });
                });
                console.log(`Loaded ${this.cache.size} workout categories.`);
                console.log(`Loaded ${this.selectedSubCategories.size} workout subcategories.`);
                console.log(`Loaded ${this.selectedWorkoutGroups.size} workout groups.`);
                console.log(`Loaded ${this.selectedWorkouts.size} workouts.`);
                this.loading = false;
                resolve();
            }, 1000); // Simulate a delay
        });
    }

    public async reloadData(workoutCategories: WorkoutCategory[]): Promise<void> {
        this.clearCache();
        await this.loadData(workoutCategories);
    }

    public isLoading(): boolean {
        return this.loading;
    }

    public getWorkoutCategories(): WorkoutCategory[] {
        return this.categories;
    }

    public async fetchAllWorkoutsInCategory(categoryId: string): Promise<Workout[]> {
        const category = this.cache.get(categoryId);
        if (!category) {
            return [];
        }
        const workouts: Workout[] = [];
        category.subCategories.forEach(subCategory => {
            subCategory.workoutGroups.forEach(group => {
                workouts.push(...group.workouts);
            });
        });
        return workouts;
    }

    public getWorkoutCategory(id: string): WorkoutCategory | undefined {
        return this.cache.get(id);
    }

    public toggleCategorySelection(id: string): void {
        if (this.selectedCategories.has(id)) {
            this.selectedCategories.delete(id);
        } else {
            this.selectedCategories.add(id);
        }
    }

    public toggleSubCategorySelection(id: string): void {
        if (this.selectedSubCategories.has(id)) {
            this.selectedSubCategories.delete(id);
        } else {
            this.selectedSubCategories.add(id);
        }
    }

    public toggleWorkoutGroupSelection(id: string): void {
        if (this.selectedWorkoutGroups.has(id)) {
            this.selectedWorkoutGroups.delete(id);
        } else {
            this.selectedWorkoutGroups.add(id);
        }
    }

    public toggleWorkoutSelection(id: string): void {
        if (this.selectedWorkouts.has(id)) {
            this.selectedWorkouts.delete(id);
        } else {
            this.selectedWorkouts.add(id);
        }
    }

    public isCategorySelected(id: string): boolean {
        return this.selectedCategories.has(id);
    }

    public isSubCategorySelected(id: string): boolean {
        return this.selectedSubCategories.has(id);
    }

    public isWorkoutGroupSelected(id: string): boolean {
        return this.selectedWorkoutGroups.has(id);
    }

    public isWorkoutSelected(id: string): boolean {
        return this.selectedWorkouts.has(id);
    }

    public clearCache(): void {
        this.cache.clear();
        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedWorkoutGroups.clear();
        this.selectedWorkouts.clear();
    }

    public getWorkoutsByDifficultyRange(minLevel: number, maxLevel: number, count: number): Workout[] {
        const workouts: Workout[] = [];
        this.cache.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.workoutGroups.forEach(group => {
                    group.workouts.forEach(workout => {
                        if (workout.difficulty_range[0] <= maxLevel && workout.difficulty_range[1] >= minLevel) {
                            workouts.push(workout);
                        }
                    });
                });
            });
        });
        return this.getRandomItems(workouts, count);
    }

    public getWorkoutsBySingleDifficultyLevel(level: number, count: number): Workout[] {
        return this.getWorkoutsByDifficultyRange(level, level, count);
    }

    private getRandomItems<T>(array: T[], count: number): T[] {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

export default WorkoutCategoryCache;
