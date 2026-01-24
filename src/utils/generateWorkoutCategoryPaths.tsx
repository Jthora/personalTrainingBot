import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('src/utils/workoutCategoryPaths.ts');

const generateWorkoutCategoryPaths = async () => {
    try {
        const fileContent = `import type { WorkoutCategoryFile } from "../types/TrainingDataFiles";\n\nconst rawWorkoutCategories = import.meta.glob("../data/training_coach_data/workouts/*.json", { eager: true });\n\nconst normalize = (value: unknown): WorkoutCategoryFile => {\n    const maybeModule = value as { default?: unknown };\n    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {\n        return maybeModule.default as WorkoutCategoryFile;\n    }\n    return value as WorkoutCategoryFile;\n};\n\nconst workoutCategoryData = Object.fromEntries(\n    Object.entries(rawWorkoutCategories).map(([fullPath, mod]) => {\n        const match = fullPath.match(/workouts\\/([^/]+)\\.json$/);\n        const id = match ? match[1] : undefined;\n        if (!id) {\n            throw new Error("Failed to derive workout category id from " + fullPath);\n        }\n        return [id, normalize(mod)];\n    })\n) as Record<string, WorkoutCategoryFile>;\n\nexport const workoutCategoryPaths = Object.fromEntries(\n    Object.entries(workoutCategoryData).map(([id, value]) => [id, async () => value])\n) satisfies Record<string, () => Promise<WorkoutCategoryFile>>;\n\nexport const totalWorkoutCategories = Object.keys(workoutCategoryData).length;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated workout category paths.');
    } catch (error) {
        console.error('Failed to generate workout category paths:', error);
    }
};

generateWorkoutCategoryPaths();
