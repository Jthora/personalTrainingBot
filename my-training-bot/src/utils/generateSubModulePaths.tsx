import fs from 'fs';
import path from 'path';

const trainingModulesPath = path.resolve('src/data/training_modules.json');
const outputPath = path.resolve('src/utils/subModulePaths.ts');

const generateSubModulePaths = async () => {
    try {
        const data = fs.readFileSync(trainingModulesPath, 'utf-8');
        const trainingModules = JSON.parse(data);

        if (!trainingModules.modules) {
            throw new Error("Invalid data format: 'modules' field is missing.");
        }

        const subModuleEntries = trainingModules.modules.flatMap((module: { id: string }) => {
            const subModulesPath = path.resolve(`src/data/training_modules/training_sub_modules/${module.id}`);
            if (fs.existsSync(subModulesPath)) {
                const subModules = fs.readdirSync(subModulesPath).filter(file => file.endsWith('.json'));
                return subModules.map(subModule => {
                    const subModuleId = path.basename(subModule, '.json');
                    return `    ${module.id}_${subModuleId}: createJsonLoader<TrainingSubModuleFile>(() => import("../data/training_modules/training_sub_modules/${module.id}/${subModule}"))`;
                });
            }
            return [];
        }).join(',\n');

        const fileContent = `import type { TrainingSubModuleFile } from "../types/TrainingDataFiles";\nimport { createJsonLoader } from "./jsonLoader";\n\nexport const subModulePaths = {\n${subModuleEntries}\n} satisfies Record<string, () => Promise<TrainingSubModuleFile>>;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated submodule paths.');
    } catch (error) {
        console.error('Failed to generate submodule paths:', error);
    }
};

generateSubModulePaths();