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
        const workoutCategoryPaths = files.map(file => {
            const id = path.basename(file, '.json');
            return `    ${id}: () => import("../data/training_coach_data/workouts/${file}")`;
        }).join(',\n');

        const fileContent = `export const workoutCategoryPaths: { [key: string]: () => Promise<any> } = {\n${workoutCategoryPaths}\n};\n\nexport const totalWorkoutCategories = Object.keys(workoutCategoryPaths).length;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated workout category paths.');
    } catch (error) {
        console.error('Failed to generate workout category paths:', error);
    }
};

generateWorkoutCategoryPaths();
