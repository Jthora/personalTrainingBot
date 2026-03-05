import type { TrainingModule } from '../../types/TrainingModule';
import { isFeatureEnabled } from '../../config/featureFlags';
import { mapTrainingModulesToMissionEntities } from './adapters/legacyTrainingModules';
import type { MissionEntityCollection } from './types';
import { operationAlphaCollection } from './exemplars/operationAlpha';
import { operationBravoCollection } from './exemplars/operationBravo';
import { operationCharlieCollection } from './exemplars/operationCharlie';

export type MissionReadPath = 'legacy' | 'canonical';

class MissionEntityStore {
    private static instance: MissionEntityStore;
    private canonical: MissionEntityCollection | null = null;

    private constructor() {}

    static getInstance(): MissionEntityStore {
        if (!MissionEntityStore.instance) {
            MissionEntityStore.instance = new MissionEntityStore();
        }
        return MissionEntityStore.instance;
    }

    public hydrateFromTrainingModules(trainingModules: TrainingModule[]): void {
        this.canonical = mergeMissionCollections(
            mergeMissionCollections(
                mergeMissionCollections(operationAlphaCollection, operationBravoCollection),
                operationCharlieCollection,
            ),
            mapTrainingModulesToMissionEntities(trainingModules),
        );
    }

    public clear(): void {
        this.canonical = null;
    }

    public getReadPath(): MissionReadPath {
        return isFeatureEnabled('canonicalReadPath') ? 'canonical' : 'legacy';
    }

    public getCanonicalCollection(): MissionEntityCollection | null {
        return this.canonical;
    }
}

const mergeById = <T extends { id: string }>(primary: T[], secondary: T[]): T[] => {
    const merged = [...primary];
    const seen = new Set(primary.map((item) => item.id));

    secondary.forEach((item) => {
        if (seen.has(item.id)) return;
        seen.add(item.id);
        merged.push(item);
    });

    return merged;
};

const mergeMissionCollections = (
    primary: MissionEntityCollection,
    secondary: MissionEntityCollection,
): MissionEntityCollection => ({
    operations: mergeById(primary.operations, secondary.operations),
    cases: mergeById(primary.cases, secondary.cases),
    leads: mergeById(primary.leads, secondary.leads),
    signals: mergeById(primary.signals, secondary.signals),
    artifacts: mergeById(primary.artifacts, secondary.artifacts),
    intelPackets: mergeById(primary.intelPackets, secondary.intelPackets),
    debriefOutcomes: mergeById(primary.debriefOutcomes, secondary.debriefOutcomes),
});

export default MissionEntityStore;
