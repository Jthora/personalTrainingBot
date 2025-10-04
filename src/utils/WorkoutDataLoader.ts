import { WorkoutCategory, WorkoutSubCategory, WorkoutGroup, Workout } from "../types/WorkoutCategory";
import { workoutCategoryPaths } from "./workoutCategoryPaths";
import { workoutSubCategoryPaths } from "./workoutSubCategoryPaths";

type DifficultyRangeJSON = [number, number];

interface WorkoutJSON {
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: DifficultyRangeJSON;
}

interface WorkoutGroupJSON {
    name: string;
    description: string;
    workouts: WorkoutJSON[];
}

interface WorkoutSubCategoryJSON {
    name: string;
    description: string;
    workout_groups: WorkoutGroupJSON[];
}

interface WorkoutCategoryJSON {
    name: string;
    description: string;
    subcategories: Record<string, string>;
}

const resolveJsonModule = (module: unknown): unknown => {
    if (module && typeof module === "object" && "default" in module) {
        return (module as { default: unknown }).default;
    }

    return module;
};

const isDifficultyRangeJSON = (value: unknown): value is DifficultyRangeJSON =>
    Array.isArray(value)
    && value.length === 2
    && value.every(entry => typeof entry === "number");

const isWorkoutJSON = (value: unknown): value is WorkoutJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<WorkoutJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && typeof candidate.duration === "string"
        && typeof candidate.intensity === "string"
        && isDifficultyRangeJSON(candidate.difficulty_range);
};

const isWorkoutGroupJSON = (value: unknown): value is WorkoutGroupJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<WorkoutGroupJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && Array.isArray(candidate.workouts)
        && candidate.workouts.every(isWorkoutJSON);
};

const isWorkoutSubCategoryJSON = (value: unknown): value is WorkoutSubCategoryJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<WorkoutSubCategoryJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && Array.isArray(candidate.workout_groups)
        && candidate.workout_groups.every(isWorkoutGroupJSON);
};

const isRecordOfStrings = (value: unknown): value is Record<string, string> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value as Record<string, unknown>).every(entry => typeof entry === "string");
};

const isWorkoutCategoryJSON = (value: unknown): value is WorkoutCategoryJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<WorkoutCategoryJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && isRecordOfStrings(candidate.subcategories);
};

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
        const categoryEntries = Object.entries(workoutCategoryPaths) as Array<[
            keyof typeof workoutCategoryPaths,
            (typeof workoutCategoryPaths)[keyof typeof workoutCategoryPaths]
        ]>;

        for (const [categoryId, categoryLoader] of categoryEntries) {
            try {
                const categoryModule = await categoryLoader();
                const categoryCandidate = resolveJsonModule(categoryModule);

                if (!isWorkoutCategoryJSON(categoryCandidate)) {
                    throw new Error(`WorkoutDataLoader: Invalid category data format for ${categoryId}`);
                }

                const categoryData = categoryCandidate;

                const subCategoryIds = Object.keys(categoryData.subcategories);

                const subCategories: WorkoutSubCategory[] = await Promise.all(
                    subCategoryIds.map(async subCategoryId => {
                        const subCategoryKey = `${categoryId}_${subCategoryId}` as keyof typeof workoutSubCategoryPaths;
                        const subCategoryLoader = workoutSubCategoryPaths[subCategoryKey];
                        if (!subCategoryLoader) {
                            throw new Error(`WorkoutDataLoader: Missing loader for subcategory ${subCategoryKey}`);
                        }

                        try {
                            const subCategoryModule = await subCategoryLoader();
                            const subCategoryCandidate = resolveJsonModule(subCategoryModule);

                            if (!isWorkoutSubCategoryJSON(subCategoryCandidate)) {
                                throw new Error(`WorkoutDataLoader: Invalid subcategory data format for ${subCategoryKey}`);
                            }

                            const subCategoryData = subCategoryCandidate;
                            totalSubCategories++;
                            const workoutGroups: WorkoutGroup[] = subCategoryData.workout_groups.map(group => {
                                const workouts = group.workouts.map(workoutJSON => new Workout(
                                    workoutJSON.name,
                                    workoutJSON.description,
                                    workoutJSON.duration,
                                    workoutJSON.intensity,
                                    workoutJSON.difficulty_range
                                ));
                                totalWorkouts += workouts.length;
                                return new WorkoutGroup(group.name, group.description, workouts);
                            });
                            totalWorkoutGroups += workoutGroups.length;
                            const workoutSubCategory = new WorkoutSubCategory(subCategoryId, subCategoryData.name, subCategoryData.description, workoutGroups);

                            onProgress();

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