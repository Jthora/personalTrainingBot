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

    const fileContent = `import type { TrainingModuleFile, TrainingSubModuleFile, CardDeckFile } from "../types/TrainingDataFiles";\n\nconst manifestUrl = "/training_modules_manifest.json";\n\ntype ManifestEntry = { id: string; shard: string; hash?: string; size?: number; version?: string };\ntype Manifest = { generatedAt?: string; version?: string; modules: ManifestEntry[] };\ntype Shard = { module: TrainingModuleFile; subModules: Record<string, TrainingSubModuleFile>; cardDecks: Record<string, CardDeckFile> };\n\nlet manifestPromise: Promise<Manifest> | null = null;\nconst loadManifest = async (): Promise<Manifest> => {\n    if (!manifestPromise) {\n        manifestPromise = fetch(manifestUrl).then(async (res) => {\n            if (!res.ok) throw new Error(\`Failed to load manifest: \${res.status}\`);\n            return res.json();\n        });\n    }\n    return manifestPromise;\n};\n\nconst versionedCacheKey = (entry: ManifestEntry) => \`\${entry.id}@\${entry.hash ?? entry.version ?? entry.size ?? "v0"}\`;\nconst shardCache = new Map<string, Promise<Shard>>();\nconst loadShard = async (id: string): Promise<Shard> => {\n    const manifest = await loadManifest();\n    const entry = manifest.modules.find((m) => m.id === id);\n    if (!entry) throw new Error('Shard not found for module ' + id);\n    const cacheKey = versionedCacheKey(entry);\n    if (!shardCache.has(cacheKey)) {\n        shardCache.set(cacheKey, fetch(entry.shard).then(async (res) => {\n            if (!res.ok) throw new Error('Failed to load shard ' + id + ': ' + res.status);\n            return res.json();\n        }));\n    }\n    return shardCache.get(cacheKey)!;\n};\n\nexport const modulePaths = {\n${trainingModules.modules.map((module: { id: string }) => `    ${module.id}: async () => (await loadShard("${module.id}")).module`).join(',\n')}\n} satisfies Record<string, () => Promise<TrainingModuleFile>>;\n`;

        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log('Successfully generated module paths.');
    } catch (error) {
        console.error('Failed to generate module paths:', error);
    }
};

generateModulePaths();