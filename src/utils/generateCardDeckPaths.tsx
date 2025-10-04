import fs from 'fs';
import path from 'path';

const trainingModulesPath = path.resolve('src/data/training_modules.json');
const outputPath = path.resolve('src/utils/cardDeckPaths.ts');
const verbose = false; // Set to true to enable detailed logging

interface TrainingModule {
    id: string;
}

interface TrainingModulesData {
    modules: TrainingModule[];
}

const readJSONFile = (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to read or parse JSON file at ${filePath}: ${error.message}`);
        } else {
            throw new Error(`Failed to read or parse JSON file at ${filePath}: Unknown error`);
        }
    }
};

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

const getCardDeckPaths = (module: TrainingModule) => {
    const subModulesPath = path.resolve(`src/data/training_modules/training_sub_modules/${module.id}/card_decks`);
    if (!fs.existsSync(subModulesPath)) {
        if (verbose) console.log(`Sub-modules path does not exist: ${subModulesPath}`);
        return [];
    }

    return getDirectories(subModulesPath).flatMap(subModule => {
        const cardDecksPath = path.resolve(`src/data/training_modules/training_sub_modules/${module.id}/card_decks/${subModule}`);
        if (!fs.existsSync(cardDecksPath)) {
            if (verbose) console.log(`Card decks path does not exist: ${cardDecksPath}`);
            return [];
        }

        return getFiles(cardDecksPath, '.json').map(cardDeck => {
            const cardDeckId = path.basename(cardDeck, '.json');
            return `    ${module.id}_${subModule}_${cardDeckId}: createJsonLoader<CardDeckFile>(() => import("../data/training_modules/training_sub_modules/${module.id}/card_decks/${subModule}/${cardDeck}"))`;
        });
    });
};

const generateCardDeckPaths = async () => {
    try {
        const trainingModules: TrainingModulesData = readJSONFile(trainingModulesPath);

        if (!trainingModules.modules) {
            throw new Error("Invalid data format: 'modules' field is missing.");
        }

    const cardDeckEntries = trainingModules.modules.flatMap(getCardDeckPaths);
    const totalCardDecks = cardDeckEntries.length;
    const joinedEntries = cardDeckEntries.join(',\n');
    const fileContent = `import type { CardDeckFile } from "../types/TrainingDataFiles";\nimport { createJsonLoader } from "./jsonLoader";\n\nexport const cardDeckPaths = {\n${joinedEntries}\n} satisfies Record<string, () => Promise<CardDeckFile>>;\n\nexport const totalCardDecks = ${totalCardDecks};\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated card deck paths.');
    } catch (error) {
        console.error('Failed to generate card deck paths:', error);
    }
};

generateCardDeckPaths();