import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('src/utils/workoutSubCategoryPaths.ts');

const generateWorkoutSubCategoryPaths = async () => {
    try {
        const fileContent = `import type { WorkoutSubCategoryFile } from "../types/TrainingDataFiles";\n\nconst rawWorkoutSubCategories = import.meta.glob("../data/training_coach_data/workouts/subcategories/**/*.json", { eager: true });\n\nconst normalize = (value: unknown): WorkoutSubCategoryFile => {\n    const maybeModule = value as { default?: unknown };\n    if (maybeModule && typeof maybeModule === "object" && "default" in maybeModule) {\n        return maybeModule.default as WorkoutSubCategoryFile;\n    }\n    return value as WorkoutSubCategoryFile;\n};\n\nconst workoutSubCategoryData = Object.fromEntries(\n    Object.entries(rawWorkoutSubCategories).map(([fullPath, mod]) => {\n        const match = fullPath.match(/subcategories\\/([^/]+)\\/([^/]+)\\.json$/);\n        const id = match ? match[1] + "_" + match[2] : undefined;\n        if (!id) {\n            throw new Error("Failed to derive workout subcategory id from " + fullPath);\n        }\n        return [id, normalize(mod)];\n    })\n) as Record<string, WorkoutSubCategoryFile>;\n\nexport const workoutSubCategoryPaths = Object.fromEntries(\n    Object.entries(workoutSubCategoryData).map(([id, value]) => [id, async () => value])\n) satisfies Record<string, () => Promise<WorkoutSubCategoryFile>>;\n\nexport const totalWorkoutSubCategories = Object.keys(workoutSubCategoryData).length;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated workout subcategory paths.');
    } catch (error) {
        console.error('Failed to generate workout subcategory paths:', error);
    }
};

generateWorkoutSubCategoryPaths();
