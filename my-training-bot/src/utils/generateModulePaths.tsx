import fs from 'fs';
import path from 'path';

const trainingModulesPath = path.resolve('src/data/training_modules.json');
const outputPath = path.resolve('src/utils/modulePaths.ts');

const generateModulePaths = async () => {
    try {
        const data = fs.readFileSync(trainingModulesPath, 'utf-8');
        const trainingModules = JSON.parse(data);

        if (!trainingModules.modules) {
            throw new Error("Invalid data format: 'modules' field is missing.");
        }

        const modulePaths = trainingModules.modules.map((module: { id: string }) => {
            return `    ${module.id}: () => import("../data/training_modules/${module.id}.json")`;
        }).join(',\n');

        const fileContent = `export const modulePaths: { [key: string]: () => Promise<any> } = {\n${modulePaths}\n};\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated module paths.');
    } catch (error) {
        console.error('Failed to generate module paths:', error);
    }
};

generateModulePaths();