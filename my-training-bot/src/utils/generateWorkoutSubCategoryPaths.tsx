import fs from 'fs';
import path from 'path';

const workoutSubCategoriesPath = path.resolve('src/data/training_coach_data/workouts/subcategories');
const outputPath = path.resolve('src/utils/workoutSubCategoryPaths.ts');

const getDirectories = (source: string) => {
    return fs.readdirSync(source).filter(name => {
        const fullPath = path.join(source, name);
        return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    });
};

const getFiles = (source: string, extension: string) => {
    return fs.readdirSync(source).filter(name => {
        const fullPath = path.join(source, name);
        return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() && name.endsWith(extension);
    });
};

const generateWorkoutSubCategoryPaths = async () => {
    try {
        const directories = getDirectories(workoutSubCategoriesPath);
        const paths = directories.flatMap(directory => {
            const subDirPath = path.join(workoutSubCategoriesPath, directory);
            const files = getFiles(subDirPath, '.json');
            return files.map(file => {
                const id = `${directory}_${path.basename(file, '.json')}`;
                const filePath = `../data/training_coach_data/workouts/subcategories/${directory}/${file}`;
                const fileContent = fs.readFileSync(path.join(subDirPath, file), 'utf-8');
                if (fileContent.trim() === '') {
                    console.warn(`Warning: Empty JSON file detected at ${filePath}`);
                }
                return `    ${id}: () => import("${filePath}")`;
            });
        }).join(',\n');

        const fileContent = `export const workoutSubCategoryPaths: { [key: string]: () => Promise<any> } = {\n${paths}\n};\n\nexport const totalWorkoutSubCategories = Object.keys(workoutSubCategoryPaths).length;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated workout subcategory paths.');
    } catch (error) {
        console.error('Failed to generate workout subcategory paths:', error);
    }
};

generateWorkoutSubCategoryPaths();
