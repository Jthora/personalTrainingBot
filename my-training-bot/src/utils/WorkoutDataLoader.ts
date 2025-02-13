import { WorkoutCategory, WorkoutSubCategory, WorkoutGroup, Workout } from "../types/WorkoutCategory";
import { workoutCategoryPaths } from "./workoutCategoryPaths";
import { workoutSubCategoryPaths } from "./workoutSubCategoryPaths";

class WorkoutDataLoader {
    async loadAllData(onProgress: () => void): Promise<WorkoutCategory[]> {
        try {
            console.log("WorkoutDataLoader: Starting to load all workout data...");
            const workoutCategories = await this.loadWorkoutCategories(onProgress);
            console.log(`WorkoutDataLoader: Fetched ${workoutCategories.length} workout categories.`);
            return workoutCategories;
        } catch (error) {
            console.error("WorkoutDataLoader: Failed to load all workout data:", error);
            return [];
        }
    }

    async loadWorkoutCategories(onProgress: () => void): Promise<WorkoutCategory[]> {
        const workoutCategories: WorkoutCategory[] = [];
        let totalSubCategories = 0;
        let totalWorkoutGroups = 0;
        let totalWorkouts = 0;
        console.log(`WorkoutDataLoader: Total categories to load: ${Object.keys(workoutCategoryPaths).length}`);
        for (const categoryId in workoutCategoryPaths) {
            try {
                const categoryData = await workoutCategoryPaths[categoryId]();
                if (typeof categoryData.subcategories !== 'object' || Array.isArray(categoryData.subcategories)) {
                    throw new Error(`WorkoutDataLoader: Invalid subcategories format for category ${categoryId}`);
                }
                //console.log(`WorkoutDataLoader: Loading subcategories for category ${categoryId}`);
                const subCategories: WorkoutSubCategory[] = await Promise.all(
                    Object.keys(categoryData.subcategories).map(async (subCategoryId: string) => {
                        try {
                            //console.log(`WorkoutDataLoader: Loading data for subcategory ${subCategoryId} in category ${categoryId}`);
                            const subCategoryData = await workoutSubCategoryPaths[`${categoryId}_${subCategoryId}`]();
                            //console.log(`WorkoutDataLoader: Loaded subcategory ${subCategoryId} for category ${categoryId}`);
                            totalSubCategories++;
                            const workoutGroups: WorkoutGroup[] = subCategoryData.workout_groups.map((group: any) => {
                                const workouts: Workout[] = group.workouts.map((workout: any) => new Workout(
                                    workout.name,
                                    workout.description,
                                    workout.duration,
                                    workout.intensity,
                                    workout.difficulty_range
                                ));
                                totalWorkouts += workouts.length;
                                return new WorkoutGroup(group.name, group.description, workouts);
                            });
                            totalWorkoutGroups += workoutGroups.length;
                            const workoutSubCategory = new WorkoutSubCategory(subCategoryId, subCategoryData.description, subCategoryData.name, workoutGroups);

                            onProgress(); // Update progress

                            return workoutSubCategory;
                        } catch (error) {
                            console.error(`WorkoutDataLoader: Failed to load subcategory ${subCategoryId}:`, error);
                            return this.createFallbackSubCategory(subCategoryId);
                        }
                    })
                );

                workoutCategories.push(new WorkoutCategory(categoryId, categoryData.name, categoryData.description, subCategories));
                console.log(`WorkoutDataLoader: Loaded category ${categoryData.name} with ${subCategories.length} subcategories.`);
            } catch (error) {
                console.error(`WorkoutDataLoader: Failed to load workout category ${categoryId}:`, error);
                workoutCategories.push(this.createFallbackCategory(categoryId));
            }
        }
        console.log(`WorkoutDataLoader: Successfully loaded ${workoutCategories.length} workout categories.`);
        console.log(`WorkoutDataLoader: Total subcategories: ${totalSubCategories}.`);
        console.log(`WorkoutDataLoader: Total workout groups: ${totalWorkoutGroups}.`);
        console.log(`WorkoutDataLoader: Total workouts: ${totalWorkouts}.`);
        return workoutCategories;
    }

    private createFallbackCategory(categoryId: string): WorkoutCategory {
        console.warn(`WorkoutDataLoader: Creating fallback category for ${categoryId}`);
        return new WorkoutCategory(categoryId, "Unknown Category", "No description available", []);
    }

    private createFallbackSubCategory(subCategoryId: string): WorkoutSubCategory {
        console.warn(`WorkoutDataLoader: Creating fallback category for ${subCategoryId}`);
        return new WorkoutSubCategory(subCategoryId, "Unknown Subcategory", "No description available", []);
    }
}

export default WorkoutDataLoader;