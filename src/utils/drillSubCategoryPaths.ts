import type { DrillSubCategoryFile } from "../types/TrainingDataFiles";

const rawDrillSubCategories = import.meta.glob("../data/training_handler_data/drills/subcategories/**/*.json", { eager: true });

const normalize = (value: unknown): DrillSubCategoryFile => {
    const maybeModule = value as { default?: unknown };
    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {
        return maybeModule.default as DrillSubCategoryFile;
    }
    return value as DrillSubCategoryFile;
};

const drillSubCategoryData = Object.fromEntries(
    Object.entries(rawDrillSubCategories).map(([fullPath, mod]) => {
        const match = fullPath.match(/subcategories\/([^/]+)\/([^/]+)\.json$/);
        const id = match ? match[1] + "_" + match[2] : undefined;
        if (!id) {
            throw new Error("Failed to derive drill subcategory id from " + fullPath);
        }
        return [id, normalize(mod)];
    })
) as Record<string, DrillSubCategoryFile>;

export const drillSubCategoryPaths = Object.fromEntries(
    Object.entries(drillSubCategoryData).map(([id, value]) => [id, async () => value])
) satisfies Record<string, () => Promise<DrillSubCategoryFile>>;

export const totalDrillSubCategories = Object.keys(drillSubCategoryData).length;
