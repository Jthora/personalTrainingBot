import fs from "fs";
import path from "path";

const trainingModulesPath = path.resolve("src/data/training_modules.json");
const outputDir = path.resolve("src/utils/cardDeckPaths");
const legacyOutputPath = path.resolve("src/utils/cardDeckPaths.ts");

interface TrainingModule {
    id: string;
}

interface TrainingModulesData {
    modules: TrainingModule[];
}

const readJSONFile = (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to read or parse JSON file at ${filePath}: ${error.message}`);
        }
        throw new Error(`Failed to read or parse JSON file at ${filePath}: Unknown error`);
    }
};

const toCamel = (value: string) => value.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const writeShardFile = (shardId: string, deckIds: string[]) => {
    const shardName = toCamel(shardId);
    const filePath = path.join(outputDir, `${shardName}.ts`);
    const fileContent = `import type { CardDeckPathMap } from "./common";\nimport { createShardLoaders } from "./common";\n\nconst ${shardName}Decks = createShardLoaders(\n    "${shardId}",\n    [\n${deckIds.map((id) => `        "${id}"`).join(",\n")}\n    ] as const\n);\n\nexport default ${shardName}Decks as CardDeckPathMap;\n`;
    fs.writeFileSync(filePath, fileContent, "utf-8");
    return { shardName, filePath };
};

const writeIndexFile = (imports: { shardName: string; shardId: string }[], total: number) => {
    const indexPath = path.join(outputDir, "index.ts");
    const importLines = imports
        .map(({ shardName }) => `import ${shardName}Decks from "./${shardName}";`)
        .join("\n");
    const spreadLines = imports.map(({ shardName }) => `    ...${shardName}Decks`).join(",\n");

    const indexContent = `import type { CardDeckPathMap } from "./common";\n${importLines}\n\nexport const cardDeckPaths: CardDeckPathMap = {\n${spreadLines}\n};\n\nexport const totalCardDecks = ${total};\n`;
    fs.writeFileSync(indexPath, indexContent, "utf-8");
};

const generateCardDeckPaths = () => {
    const trainingModules: TrainingModulesData = readJSONFile(trainingModulesPath);
    if (!trainingModules.modules) {
        throw new Error("Invalid data format: 'modules' field is missing.");
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const shardDecks: Record<string, string[]> = {};

    trainingModules.modules.forEach(({ id }) => {
        const cardDeckBase = path.resolve(`src/data/training_modules/training_sub_modules/${id}/card_decks`);
        if (!fs.existsSync(cardDeckBase)) return;

        const subModuleDirs = fs
            .readdirSync(cardDeckBase)
            .filter((entry) => fs.statSync(path.join(cardDeckBase, entry)).isDirectory());

        subModuleDirs.forEach((subModule) => {
            const deckDir = path.join(cardDeckBase, subModule);
            const deckFiles = fs.readdirSync(deckDir).filter((file) => file.endsWith(".json"));
            deckFiles.forEach((file) => {
                const deckId = path.basename(file, ".json");
                const fullId = `${id}_${subModule}_${deckId}`;
                shardDecks[id] = shardDecks[id] ?? [];
                shardDecks[id].push(fullId);
            });
        });
    });

    const imports: { shardName: string; shardId: string }[] = [];
    let total = 0;

    Object.entries(shardDecks).forEach(([shardId, deckIds]) => {
        const sortedDeckIds = deckIds.sort();
        const shardName = toCamel(shardId);
        writeShardFile(shardId, sortedDeckIds);
        imports.push({ shardName, shardId });
        total += sortedDeckIds.length;
    });

    writeIndexFile(imports, total);

    if (fs.existsSync(legacyOutputPath)) {
        fs.rmSync(legacyOutputPath);
    }

    console.log("Successfully generated card deck paths.");
};

try {
    generateCardDeckPaths();
} catch (error) {
    console.error("Failed to generate card deck paths:", error);
}