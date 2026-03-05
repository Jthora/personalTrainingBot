import MissionEntityStore from './MissionEntityStore';
import type {
    MissionArtifact,
    MissionCase,
    MissionDebriefOutcome,
    MissionEntityCollection,
    MissionIntelPacket,
    MissionLead,
    MissionOperation,
    MissionSignal,
} from './types';

type MissionCollection = MissionEntityCollection;

function fromCanonical<T>(selector: (collection: MissionCollection) => T, fallback: T): T {
    const collection = MissionEntityStore.getInstance().getCanonicalCollection();
    if (!collection) {
        return fallback;
    }

    return selector(collection);
}

export function selectMissionOperations(): MissionOperation[] {
    return fromCanonical(collection => collection.operations, []);
}

export function selectMissionCases(): MissionCase[] {
    return fromCanonical(collection => collection.cases, []);
}

export function selectMissionLeads(): MissionLead[] {
    return fromCanonical(collection => collection.leads, []);
}

export function selectMissionSignals(): MissionSignal[] {
    return fromCanonical(collection => collection.signals, []);
}

export function selectMissionArtifacts(): MissionArtifact[] {
    return fromCanonical(collection => collection.artifacts, []);
}

export function selectMissionIntelPackets(): MissionIntelPacket[] {
    return fromCanonical(collection => collection.intelPackets, []);
}

export function selectMissionDebriefs(): MissionDebriefOutcome[] {
    return fromCanonical(collection => collection.debriefOutcomes, []);
}

export function selectMissionReadPath(): 'legacy' | 'canonical' {
    return MissionEntityStore.getInstance().getReadPath();
}
