import fs from "fs";
import path from "path";
import { createHash } from "crypto";

type ManifestEntry = {
    id: string;
    shard: string;
    hash: string;
    size: number;
    version: string;
    subModuleCount: number;
    cardDeckCount: number;
};

type TrainingModulesIndex = {
    modules: { id: string }[];
};

type CombinedTrainingData = {
    modules: Record<string, unknown>;
    subModules: Record<string, unknown>;
    cardDecks: Record<string, unknown>;
};

const modulesIndexPath = path.resolve("src/data/training_modules.json");
const modulesDir = path.resolve("src/data/training_modules");
const subModulesDir = path.resolve("src/data/training_modules/training_sub_modules");
const outputPath = path.resolve("src/data/training_modules_combined.json");
const manifestPath = path.resolve("public/training_modules_manifest.json");
const shardDir = path.resolve("public/training_modules_shards");

const appVersion = process.env.APP_VERSION || JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")).version || "dev";

function readJson(filePath: string): unknown {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function collectModules(index: TrainingModulesIndex, combined: CombinedTrainingData) {
    index.modules.forEach(({ id }) => {
        const modulePath = path.join(modulesDir, `${id}.json`);
        combined.modules[id] = readJson(modulePath);
    });
}

function collectSubModules(index: TrainingModulesIndex, combined: CombinedTrainingData) {
    index.modules.forEach(({ id }) => {
        const moduleSubDir = path.join(subModulesDir, id);
        if (!fs.existsSync(moduleSubDir)) return;
        const subModuleFiles = fs.readdirSync(moduleSubDir).filter(file => file.endsWith(".json"));
        subModuleFiles.forEach(file => {
            const subId = path.basename(file, ".json");
            combined.subModules[`${id}_${subId}`] = readJson(path.join(moduleSubDir, file));
        });
    });
}

function collectCardDecks(index: TrainingModulesIndex, combined: CombinedTrainingData) {
    index.modules.forEach(({ id }) => {
        const cardDeckBase = path.join(subModulesDir, id, "card_decks");
        if (!fs.existsSync(cardDeckBase)) return;
        const subModuleDirs = fs.readdirSync(cardDeckBase).filter(entry => fs.statSync(path.join(cardDeckBase, entry)).isDirectory());
        subModuleDirs.forEach(subModule => {
            const deckDir = path.join(cardDeckBase, subModule);
            const deckFiles = fs.readdirSync(deckDir).filter(file => file.endsWith(".json"));
            deckFiles.forEach(file => {
                const deckId = path.basename(file, ".json");
                const key = `${id}_${subModule}_${deckId}`;
                combined.cardDecks[key] = readJson(path.join(deckDir, file));
            });
        });
    });
}

function ensureCleanDir(dir: string) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function writeShards(index: TrainingModulesIndex, combined: CombinedTrainingData) {
    ensureCleanDir(shardDir);
    const manifest: ManifestEntry[] = [];

    index.modules.forEach(({ id }) => {
        const subModules = Object.fromEntries(
            Object.entries(combined.subModules).filter(([key]) => key.startsWith(`${id}_`))
        );
        const cardDecks = Object.fromEntries(
            Object.entries(combined.cardDecks).filter(([key]) => key.startsWith(`${id}_`))
        );
        const shard = {
            module: combined.modules[id],
            subModules,
            cardDecks,
        };
        const shardJson = JSON.stringify(shard);
        const shardHash = createHash("sha256").update(shardJson).digest("hex");
        const shardSize = Buffer.byteLength(shardJson, "utf-8");
        const shardPath = path.join(shardDir, `${id}.json`);
        fs.writeFileSync(shardPath, shardJson, "utf-8");
        manifest.push({
            id,
            shard: `/training_modules_shards/${id}.json`,
            hash: shardHash,
            size: shardSize,
            version: appVersion,
            subModuleCount: Object.keys(subModules).length,
            cardDeckCount: Object.keys(cardDecks).length,
        });
    });

    const manifestPayload = {
        generatedAt: new Date().toISOString(),
        version: appVersion,
        modules: manifest,
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifestPayload, null, 2), "utf-8");
    console.log(`Wrote manifest to ${manifestPath}`);
}

function main() {
    const index = readJson(modulesIndexPath) as TrainingModulesIndex;
    if (!index.modules) {
        throw new Error("Invalid modules index: missing modules array");
    }

    const combined: CombinedTrainingData = { modules: {}, subModules: {}, cardDecks: {} };

    collectModules(index, combined);
    collectSubModules(index, combined);
    collectCardDecks(index, combined);

    fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2), "utf-8");
    console.log(`Wrote combined training data to ${outputPath}`);

    writeShards(index, combined);
}

main();
