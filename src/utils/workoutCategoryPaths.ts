import type { WorkoutCategoryFile } from "../types/TrainingDataFiles";

const rawWorkoutCategories = import.meta.glob("../data/training_coach_data/workouts/*.json", { eager: true });

const normalize = (value: unknown): WorkoutCategoryFile => {
    const maybeModule = value as { default?: unknown };
    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {
        return maybeModule.default as WorkoutCategoryFile;
    }
    return value as WorkoutCategoryFile;
};

const workoutCategoryData = Object.fromEntries(
    Object.entries(rawWorkoutCategories).map(([fullPath, mod]) => {
        const match = fullPath.match(/workouts\/([^/]+)\.json$/);
        const id = match ? match[1] : undefined;
        if (!id) {
            throw new Error("Failed to derive workout category id from " + fullPath);
        }
        return [id, normalize(mod)];
    })
) as Record<string, WorkoutCategoryFile>;

export const workoutCategoryPaths = Object.fromEntries(
    Object.entries(workoutCategoryData).map(([id, value]) => [id, async () => value])
) satisfies Record<string, () => Promise<WorkoutCategoryFile>>;

export const totalWorkoutCategories = Object.keys(workoutCategoryData).length;
