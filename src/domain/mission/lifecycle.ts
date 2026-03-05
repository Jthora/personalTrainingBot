import type {
    CaseStatus,
    EntityVersion,
    IntelPacketStatus,
    LeadStatus,
    OperationStatus,
    SignalStatus,
} from './types';

type LifecycleTransitionMap<T extends string> = Record<T, readonly T[]>;

export const operationStatusTransitions: LifecycleTransitionMap<OperationStatus> = {
    planned: ['briefing', 'archived'],
    briefing: ['triage', 'archived'],
    triage: ['active', 'archived'],
    active: ['debrief_pending', 'archived'],
    debrief_pending: ['completed', 'archived'],
    completed: ['archived'],
    archived: [],
};

export const caseStatusTransitions: LifecycleTransitionMap<CaseStatus> = {
    new: ['assessing', 'closed'],
    assessing: ['engaged', 'closed'],
    engaged: ['contained', 'closed'],
    contained: ['closed'],
    closed: [],
};

export const leadStatusTransitions: LifecycleTransitionMap<LeadStatus> = {
    new: ['qualified', 'disqualified'],
    qualified: ['resolved', 'disqualified'],
    disqualified: [],
    resolved: [],
};

export const signalStatusTransitions: LifecycleTransitionMap<SignalStatus> = {
    new: ['acknowledged', 'dismissed'],
    acknowledged: ['investigating', 'dismissed'],
    investigating: ['resolved', 'dismissed'],
    resolved: [],
    dismissed: [],
};

export const intelPacketStatusTransitions: LifecycleTransitionMap<IntelPacketStatus> = {
    draft: ['validated', 'superseded'],
    validated: ['distributed', 'superseded'],
    distributed: ['superseded'],
    superseded: [],
};

export const DEFAULT_ENTITY_VERSION: EntityVersion = 'v1';

export const ENTITY_VERSION_PATTERN = /^v\d+$/;

export function isValidEntityVersion(version: string): version is EntityVersion {
    return ENTITY_VERSION_PATTERN.test(version);
}

export function canTransition<T extends string>(
    current: T,
    next: T,
    transitions: Record<T, readonly T[]>,
): boolean {
    const allowed = transitions[current] ?? [];
    return allowed.includes(next);
}

export function isIsoDateString(value: string): boolean {
    if (!value) {
        return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}
