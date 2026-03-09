import type { TrainingModule } from '../../types/TrainingModule';
import { isFeatureEnabled } from '../../config/featureFlags';
import { mapTrainingModulesToMissionEntities } from './adapters/legacyTrainingModules';
import type {
    CaseStatus,
    MissionArtifact,
    MissionEntityCollection,
    MissionSeverity,
    MissionSignal,
    SignalStatus,
} from './types';
import { operationAlphaCollection } from './exemplars/operationAlpha';
import { operationBravoCollection } from './exemplars/operationBravo';
import { operationCharlieCollection } from './exemplars/operationCharlie';
import { canTransition, caseStatusTransitions, signalStatusTransitions } from './lifecycle';

export type MissionReadPath = 'legacy' | 'canonical';

type StoreListener = () => void;

class MissionEntityStore {
    private static instance: MissionEntityStore;
    private canonical: MissionEntityCollection | null = null;
    private listeners = new Set<StoreListener>();
    private version = 0;

    private constructor() {}

    static getInstance(): MissionEntityStore {
        if (!MissionEntityStore.instance) {
            MissionEntityStore.instance = new MissionEntityStore();
        }
        return MissionEntityStore.instance;
    }

    /* ── Read ────────────────────────────────────────────────── */

    public hydrateFromTrainingModules(trainingModules: TrainingModule[]): void {
        this.canonical = mergeMissionCollections(
            mergeMissionCollections(
                mergeMissionCollections(operationAlphaCollection, operationBravoCollection),
                operationCharlieCollection,
            ),
            mapTrainingModulesToMissionEntities(trainingModules),
        );
        this.notify();
    }

    public clear(): void {
        this.canonical = null;
        this.notify();
    }

    public getReadPath(): MissionReadPath {
        return isFeatureEnabled('canonicalReadPath') ? 'canonical' : 'legacy';
    }

    public getCanonicalCollection(): MissionEntityCollection | null {
        return this.canonical;
    }

    /** Monotonically increasing version counter — bumps on every mutation. */
    public getVersion(): number {
        return this.version;
    }

    /* ── Subscribe ───────────────────────────────────────────── */

    /**
     * Register a listener that fires whenever the collection is mutated.
     * Returns an unsubscribe function.
     */
    public subscribe(listener: StoreListener): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    private notify(): void {
        this.version += 1;
        this.listeners.forEach((fn) => {
            try { fn(); } catch { /* swallow — consumer errors must not break the store */ }
        });
    }

    /* ── Mutations ───────────────────────────────────────────── */

    /**
     * Update a Case entity's status (lifecycle-validated) and optionally severity.
     * Returns `true` if the mutation was applied.
     */
    public updateCaseStatus(
        caseId: string,
        nextStatus: CaseStatus,
        severity?: MissionSeverity,
    ): boolean {
        if (!this.canonical) return false;
        const target = this.canonical.cases.find((c) => c.id === caseId);
        if (!target) return false;
        if (!canTransition(target.status, nextStatus, caseStatusTransitions)) return false;

        target.status = nextStatus;
        if (severity !== undefined) target.severity = severity;
        target.updatedAt = new Date().toISOString();
        this.notify();
        return true;
    }

    /**
     * Update a Signal entity's status (lifecycle-validated) and optionally severity.
     * Returns `true` if the mutation was applied.
     */
    public updateSignalStatus(
        signalId: string,
        nextStatus: SignalStatus,
        severity?: MissionSeverity,
    ): boolean {
        if (!this.canonical) return false;
        const target = this.canonical.signals.find((s) => s.id === signalId);
        if (!target) return false;
        if (!canTransition(target.status, nextStatus, signalStatusTransitions)) return false;

        target.status = nextStatus;
        if (severity !== undefined) target.severity = severity;
        target.updatedAt = new Date().toISOString();
        this.notify();
        return true;
    }

    /**
     * Ingest a user-created signal into the canonical collection.
     * The signal must have a unique id — duplicates are silently ignored.
     * Returns `true` if the signal was added.
     */
    public ingestSignal(signal: MissionSignal): boolean {
        if (!this.canonical) return false;
        if (this.canonical.signals.some((s) => s.id === signal.id)) return false;

        this.canonical.signals.push(signal);
        this.notify();
        return true;
    }

    /**
     * Mark an artifact as promoted by adding it to the first operation's intel
     * packet artifacts list (if one exists) and tagging its description.
     * Returns `true` if the mutation was applied.
     */
    public promoteArtifact(artifactId: string): boolean {
        if (!this.canonical) return false;
        const target = this.canonical.artifacts.find((a) => a.id === artifactId);
        if (!target) return false;

        // Tag the artifact's description if not already tagged
        if (!target.description.startsWith('[PROMOTED]')) {
            target.description = `[PROMOTED] ${target.description}`;
            target.updatedAt = new Date().toISOString();
        }

        // Link to the first available intel packet
        const packet = this.canonical.intelPackets[0];
        if (packet && !packet.artifactIds.includes(artifactId)) {
            packet.artifactIds.push(artifactId);
            packet.updatedAt = new Date().toISOString();
        }

        this.notify();
        return true;
    }
}

const mergeById = <T extends { id: string }>(primary: T[], secondary: T[]): T[] => {
    const merged = primary.map((item) => ({ ...item }));
    const seen = new Set(primary.map((item) => item.id));

    secondary.forEach((item) => {
        if (seen.has(item.id)) return;
        seen.add(item.id);
        merged.push({ ...item });
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
