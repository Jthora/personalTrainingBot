import { DrillCategory, DrillSubCategory, DrillGroup, Drill } from "../types/DrillCategory";
import { drillCategoryPaths } from "./drillCategoryPaths";
import { drillSubCategoryPaths } from "./drillSubCategoryPaths";
import { isFeatureEnabled } from "../config/featureFlags";
import { withCache } from "./cache/indexedDbCache";
import { TTL_MS, APP_VERSION } from "./cache/constants";

type DifficultyRangeJSON = [number, number];

interface DrillJSON {
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: DifficultyRangeJSON;
}

interface DrillGroupJSON {
    name: string;
    description: string;
    drills: DrillJSON[];
}

interface DrillSubCategoryJSON {
    name: string;
    description: string;
    workout_groups: DrillGroupJSON[];
}

interface DrillCategoryJSON {
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

const isDrillJSON = (value: unknown): value is DrillJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<DrillJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && typeof candidate.duration === "string"
        && typeof candidate.intensity === "string"
        && isDifficultyRangeJSON(candidate.difficulty_range);
};

const isDrillGroupJSON = (value: unknown): value is DrillGroupJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<DrillGroupJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && Array.isArray(candidate.drills)
        && candidate.drills.every(isDrillJSON);
};

const isDrillSubCategoryJSON = (value: unknown): value is DrillSubCategoryJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<DrillSubCategoryJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && Array.isArray(candidate.workout_groups)
        && candidate.workout_groups.every(isDrillGroupJSON);
};

const isRecordOfStrings = (value: unknown): value is Record<string, string> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value as Record<string, unknown>).every(entry => typeof entry === "string");
};

const isDrillCategoryJSON = (value: unknown): value is DrillCategoryJSON => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<DrillCategoryJSON>;
    return typeof candidate.name === "string"
        && typeof candidate.description === "string"
        && isRecordOfStrings(candidate.subcategories);
};

class DrillDataLoader {
    async loadAllData(onProgress: () => void, onPartialFailure?: (message: string) => void): Promise<DrillCategory[]> {
        try {
            console.log("DrillDataLoader: Starting to load all drill data...");
            const workoutCategories = await this.loadWorkoutCategories(onProgress, onPartialFailure);
            console.log(`DrillDataLoader: Fetched ${workoutCategories.length} drill categories.`);
            return workoutCategories;
        } catch (error) {
            console.error("DrillDataLoader: Failed to load all drill data:", error);
            return [];
        }
    }

    async loadWorkoutCategories(onProgress: () => void, onPartialFailure?: (message: string) => void): Promise<DrillCategory[]> {
        const loadCategories = async () => {
        const workoutCategories: DrillCategory[] = [];
        let totalSubCategories = 0;
        let totalDrillGroups = 0;
        let totalWorkouts = 0;
        console.log(`DrillDataLoader: Total categories to load: ${Object.keys(drillCategoryPaths).length}`);
        const categoryEntries = Object.entries(drillCategoryPaths);

        for (const [categoryKey, categoryLoader] of categoryEntries) {
            const categoryId = String(categoryKey);
            try {
                const categoryModule = await categoryLoader();
                const categoryCandidate = resolveJsonModule(categoryModule);

                if (!isDrillCategoryJSON(categoryCandidate)) {
                    throw new Error(`DrillDataLoader: Invalid category data format for ${categoryId}`);
                }

                const categoryData = categoryCandidate;

                const subCategoryIds = Object.keys(categoryData.subcategories);

                const subCategories: DrillSubCategory[] = await Promise.all(
                    subCategoryIds.map(async subCategoryId => {
                        const subCategoryKey = `${categoryId}_${subCategoryId}` as keyof typeof drillSubCategoryPaths;
                        const subCategoryLoader = drillSubCategoryPaths[subCategoryKey];
                        if (!subCategoryLoader) {
                            throw new Error(`DrillDataLoader: Missing loader for subcategory ${subCategoryKey}`);
                        }

                        try {
                            const subCategoryModule = await subCategoryLoader();
                            const subCategoryCandidate = resolveJsonModule(subCategoryModule);

                            if (!isDrillSubCategoryJSON(subCategoryCandidate)) {
                                throw new Error(`DrillDataLoader: Invalid subcategory data format for ${subCategoryKey}`);
                            }

                            const subCategoryData = subCategoryCandidate;
                            totalSubCategories++;
                            const drillGroups: DrillGroup[] = subCategoryData.workout_groups.map(group => {
                                const drills = group.drills.map(workoutJSON => new Drill(
                                    workoutJSON.name,
                                    workoutJSON.description,
                                    workoutJSON.duration,
                                    workoutJSON.intensity,
                                    workoutJSON.difficulty_range
                                ));
                                totalWorkouts += drills.length;
                                return new DrillGroup(group.name, group.description, drills);
                            });
                            totalDrillGroups += drillGroups.length;
                            const drillSubCategory = new DrillSubCategory(subCategoryId, subCategoryData.name, subCategoryData.description, drillGroups);

                            onProgress();

                            return drillSubCategory;
                        } catch (error) {
                            console.error(`DrillDataLoader: Failed to load subcategory ${subCategoryId}:`, error);
                            onPartialFailure?.(`Drill subcategory ${subCategoryId} failed to load; showing fallback.`);
                            return this.createFallbackSubCategory(subCategoryId);
                        }
                    })
                );

                workoutCategories.push(new DrillCategory(categoryId, categoryData.name, categoryData.description, subCategories));
                console.log(`DrillDataLoader: Loaded category ${categoryData.name} with ${subCategories.length} subcategories.`);
            } catch (error) {
                console.error(`DrillDataLoader: Failed to load drill category ${categoryId}:`, error);
                onPartialFailure?.(`Drill category ${categoryId} failed to load; showing fallback.`);
                workoutCategories.push(this.createFallbackCategory(categoryId));
            }
        }
        console.log(`DrillDataLoader: Successfully loaded ${workoutCategories.length} drill categories.`);
        console.log(`DrillDataLoader: Total subcategories: ${totalSubCategories}.`);
        console.log(`DrillDataLoader: Total drill groups: ${totalDrillGroups}.`);
        console.log(`DrillDataLoader: Total drills: ${totalWorkouts}.`);
        return workoutCategories;
        };

        if (isFeatureEnabled('loadingCacheV2')) {
            const appVersion = ((import.meta as any).env?.VITE_APP_VERSION as string | undefined) ?? APP_VERSION;
            const cached = await withCache<DrillCategory[]>(
                'workoutCategories',
                'all',
                TTL_MS.workoutCategories,
                `workoutCategories-${appVersion}`,
                loadCategories,
                { logger: (msg, meta) => console.info(`workoutCategoriesCache: ${msg}`, meta) }
            );
            return cached.data;
        }

        return loadCategories();
    }

    private createFallbackCategory(categoryId: string): DrillCategory {
        console.warn(`DrillDataLoader: Creating fallback category for ${categoryId}`);
        return new DrillCategory(categoryId, "Unknown Category", "No description available", []);
    }

    private createFallbackSubCategory(subCategoryId: string): DrillSubCategory {
        console.warn(`DrillDataLoader: Creating fallback category for ${subCategoryId}`);
        return new DrillSubCategory(subCategoryId, "Unknown Subcategory", "No description available", []);
    }
}

export default DrillDataLoader;