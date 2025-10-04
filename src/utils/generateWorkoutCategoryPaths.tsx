import fs from 'fs';
import path from 'path';

const workoutCategoriesPath = path.resolve('src/data/training_coach_data/workouts');
const outputPath = path.resolve('src/utils/workoutCategoryPaths.ts');

const getFiles = (source: string, extension: string) => {
    return fs.readdirSync(source).filter(name => {
        const fullPath = path.join(source, name);
        return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() && name.endsWith(extension);
    });
};

const generateWorkoutCategoryPaths = async () => {
    try {
        const files = getFiles(workoutCategoriesPath, '.json');
        const workoutCategoryEntries = files.map(file => {
            const id = path.basename(file, '.json');
            return `    ${id}: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/${file}"))`;
        });

        const totalWorkoutCategories = workoutCategoryEntries.length;
        const fileContent = `import type { WorkoutCategoryFile } from "../types/TrainingDataFiles";\nimport { createJsonLoader } from "./jsonLoader";\n\nexport const workoutCategoryPaths = {\n${workoutCategoryEntries.join(',\n')}\n} satisfies Record<string, () => Promise<WorkoutCategoryFile>>;\n\nexport const totalWorkoutCategories = ${totalWorkoutCategories};\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated workout category paths.');
    } catch (error) {
        console.error('Failed to generate workout category paths:', error);
    }
};

generateWorkoutCategoryPaths();
