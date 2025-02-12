import { WorkoutCategory } from "../types/WorkoutCategory";

class WorkoutCategoryCache {
    private static instance: WorkoutCategoryCache;
    public cache: Map<string, WorkoutCategory>;
    public selectedCategories: Set<string>;
    public selectedSubCategories: Set<string>;
    public selectedWorkoutGroups: Set<string>;
    public selectedWorkouts: Set<string>;

    private constructor() {
        this.cache = new Map();
        this.selectedCategories = new Set();
        this.selectedSubCategories = new Set();
        this.selectedWorkoutGroups = new Set();
        this.selectedWorkouts = new Set();
    }

    public static getInstance(): WorkoutCategoryCache {
        if (!WorkoutCategoryCache.instance) {
            WorkoutCategoryCache.instance = new WorkoutCategoryCache();
        }
        return WorkoutCategoryCache.instance;
    }

    public async loadData(workoutCategories: WorkoutCategory[]): Promise<void> {
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
                resolve();
            }, 1000); // Simulate a delay
        });
    }

    public isLoaded(): boolean {
        return this.cache.size > 0;
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
}

export default WorkoutCategoryCache;
