import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TrainingModule } from '../src/types/TrainingModule';
import {
    LEGACY_TO_MISSION_FIELD_MAPPINGS,
    mapTrainingModulesToMissionEntities,
    reportLegacyTrainingModuleDrift,
} from '../src/domain/mission/adapters/legacyTrainingModules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sourcePath = process.argv[2] ?? path.resolve(projectRoot, 'src/data/training_modules_combined.json');
const outputPath = process.argv[3] ?? path.resolve(projectRoot, 'artifacts/mission-migration-drift.json');

function readTrainingModules(filePath: string): TrainingModule[] {
    const payload = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(payload) as unknown;

    if (!Array.isArray(parsed)) {
        if (parsed && typeof parsed === 'object') {
            const combined = parsed as {
                modules?: Record<string, any>;
                subModules?: Record<string, any>;
                cardDecks?: Record<string, any>;
            };

            const modules = combined.modules ?? {};
            const subModules = combined.subModules ?? {};
            const cardDecks = combined.cardDecks ?? {};

            return Object.values(modules).map(moduleRecord => {
                const moduleId = String(moduleRecord.id ?? '');
                const moduleSubmoduleIds: string[] = Array.isArray(moduleRecord.submodules)
                    ? moduleRecord.submodules.map((id: unknown) => String(id))
                    : [];

                const hydratedSubmodules = moduleSubmoduleIds
                    .map(subModuleId => subModules[`${moduleId}_${subModuleId}`])
                    .filter(Boolean)
                    .map(subModuleRecord => {
                        const deckIds: string[] = Array.isArray(subModuleRecord.cardDecks)
                            ? subModuleRecord.cardDecks.map((id: unknown) => String(id))
                            : [];

                        const hydratedDecks = deckIds
                            .map(deckId => cardDecks[`${moduleId}_${subModuleRecord.id}_${deckId}`])
                            .filter(Boolean);

                        return {
                            ...subModuleRecord,
                            cardDecks: hydratedDecks,
                        };
                    });

                return {
                    ...moduleRecord,
                    submodules: hydratedSubmodules,
                } as TrainingModule;
            });
        }

        throw new Error(`Expected array or combined payload at ${filePath}`);
    }

    return parsed as TrainingModule[];
}

function main() {
    const trainingModules = readTrainingModules(sourcePath);
    const drift = reportLegacyTrainingModuleDrift(trainingModules);
    const canonical = mapTrainingModulesToMissionEntities(trainingModules);

    const report = {
        generatedAt: new Date().toISOString(),
        sourcePath,
        outputPath,
        valid: drift.valid,
        legacyStats: drift.stats,
        canonicalStats: {
            operations: canonical.operations.length,
            cases: canonical.cases.length,
            leads: canonical.leads.length,
            signals: canonical.signals.length,
            artifacts: canonical.artifacts.length,
            intelPackets: canonical.intelPackets.length,
            debriefOutcomes: canonical.debriefOutcomes.length,
        },
        mappingCount: LEGACY_TO_MISSION_FIELD_MAPPINGS.length,
        issues: drift.issues,
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

    console.log(`Mission migration drift report written to ${outputPath}`);
    console.log(`Legacy valid: ${drift.valid}; issue count: ${drift.issues.length}`);
}

main();
