import fs from 'fs';
import path from 'path';

const trainingModulesPath = path.resolve('src/data/training_modules.json');
const outputPath = path.resolve('src/utils/cardDeckPaths.ts');
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

const generateCardDeckPaths = async () => {
    try {
        const trainingModules: TrainingModulesData = readJSONFile(trainingModulesPath);

        if (!trainingModules.modules) {
            throw new Error("Invalid data format: 'modules' field is missing.");
        }
        const cardDeckEntries: string[] = [];

        trainingModules.modules.forEach(({ id }) => {
            const cardDeckBase = path.resolve(`src/data/training_modules/training_sub_modules/${id}/card_decks`);
            if (!fs.existsSync(cardDeckBase)) return;

            const subModuleDirs = fs.readdirSync(cardDeckBase).filter(entry => fs.statSync(path.join(cardDeckBase, entry)).isDirectory());
            subModuleDirs.forEach(subModule => {
                const deckDir = path.join(cardDeckBase, subModule);
                const deckFiles = fs.readdirSync(deckDir).filter(file => file.endsWith('.json'));
                deckFiles.forEach(file => {
                    const deckId = path.basename(file, '.json');
                    cardDeckEntries.push(`    ${id}_${subModule}_${deckId}: async () => (await loadShard("${id}")).cardDecks["${id}_${subModule}_${deckId}"]`);
                });
            });
        });

    const fileContent = `import type { CardDeckFile, TrainingModuleFile, TrainingSubModuleFile } from "../types/TrainingDataFiles";\n\nconst manifestUrl = "/training_modules_manifest.json";\n\ntype ManifestEntry = { id: string; shard: string; hash?: string; size?: number; version?: string };\ntype Manifest = { generatedAt?: string; version?: string; modules: ManifestEntry[] };\ntype Shard = { module: TrainingModuleFile; subModules: Record<string, TrainingSubModuleFile>; cardDecks: Record<string, CardDeckFile> };\n\nlet manifestPromise: Promise<Manifest> | null = null;\nconst loadManifest = async (): Promise<Manifest> => {\n    if (!manifestPromise) {\n        manifestPromise = fetch(manifestUrl).then(async (res) => {\n            if (!res.ok) throw new Error(\`Failed to load manifest: \${res.status}\`);\n            return res.json();\n        });\n    }\n    return manifestPromise;\n};\n\nconst versionedCacheKey = (entry: ManifestEntry) => \`\${entry.id}@\${entry.hash ?? entry.version ?? entry.size ?? "v0"}\`;\nconst shardCache = new Map<string, Promise<Shard>>();\nconst loadShard = async (id: string): Promise<Shard> => {\n    const manifest = await loadManifest();\n    const entry = manifest.modules.find((m) => m.id === id);\n    if (!entry) throw new Error('Shard not found for module ' + id);\n    const cacheKey = versionedCacheKey(entry);\n    if (!shardCache.has(cacheKey)) {\n        shardCache.set(cacheKey, fetch(entry.shard).then(async (res) => {\n            if (!res.ok) throw new Error('Failed to load shard ' + id + ': ' + res.status);\n            return res.json();\n        }));\n    }\n    return shardCache.get(cacheKey)!;\n};\n\nexport const cardDeckPaths = {\n${cardDeckEntries.join(',\n')}\n} satisfies Record<string, () => Promise<CardDeckFile>>;\n\nexport const totalCardDecks = ${cardDeckEntries.length};\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated card deck paths.');
    } catch (error) {
        console.error('Failed to generate card deck paths:', error);
    }
};

generateCardDeckPaths();