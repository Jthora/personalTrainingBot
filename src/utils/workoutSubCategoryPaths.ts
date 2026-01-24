import type { WorkoutSubCategoryFile } from "../types/TrainingDataFiles";

const rawWorkoutSubCategories = import.meta.glob("../data/training_coach_data/workouts/subcategories/**/*.json", { eager: true });

const normalize = (value: unknown): WorkoutSubCategoryFile => {
    const maybeModule = value as { default?: unknown };
    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {
        return maybeModule.default as WorkoutSubCategoryFile;
    }
    return value as WorkoutSubCategoryFile;
};

const workoutSubCategoryData = Object.fromEntries(
    Object.entries(rawWorkoutSubCategories).map(([fullPath, mod]) => {
        const match = fullPath.match(/subcategories\/([^/]+)\/([^/]+)\.json$/);
        const id = match ? match[1] + "_" + match[2] : undefined;
        if (!id) {
            throw new Error("Failed to derive workout subcategory id from " + fullPath);
        }
        return [id, normalize(mod)];
    })
) as Record<string, WorkoutSubCategoryFile>;

export const workoutSubCategoryPaths = Object.fromEntries(
    Object.entries(workoutSubCategoryData).map(([id, value]) => [id, async () => value])
) satisfies Record<string, () => Promise<WorkoutSubCategoryFile>>;

export const totalWorkoutSubCategories = Object.keys(workoutSubCategoryData).length;
