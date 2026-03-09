import type { DrillCategoryFile } from "../types/TrainingDataFiles";

const rawWorkoutCategories = import.meta.glob("../data/training_handler_data/drills/*.json", { eager: true });

const normalize = (value: unknown): DrillCategoryFile => {
    const maybeModule = value as { default?: unknown };
    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {
        return maybeModule.default as DrillCategoryFile;
    }
    return value as DrillCategoryFile;
};

const drillCategoryData = Object.fromEntries(
    Object.entries(rawWorkoutCategories).map(([fullPath, mod]) => {
        const match = fullPath.match(/drills\/([^/]+)\.json$/);
        const id = match ? match[1] : undefined;
        if (!id) {
            throw new Error("Failed to derive drill category id from " + fullPath);
        }
        return [id, normalize(mod)];
    })
) as Record<string, DrillCategoryFile>;

export const drillCategoryPaths = Object.fromEntries(
    Object.entries(drillCategoryData).map(([id, value]) => [id, async () => value])
) satisfies Record<string, () => Promise<DrillCategoryFile>>;

export const totalWorkoutCategories = Object.keys(drillCategoryData).length;
