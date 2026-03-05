import {
    canTransition,
    caseStatusTransitions,
    intelPacketStatusTransitions,
    isIsoDateString,
    isValidEntityVersion,
    leadStatusTransitions,
    operationStatusTransitions,
    signalStatusTransitions,
} from './lifecycle';
import type {
    MissionArtifact,
    MissionCase,
    MissionDebriefOutcome,
    MissionEntity,
    MissionIntelPacket,
    MissionLead,
    MissionOperation,
    MissionSignal,
} from './types';

export interface MissionValidationIssue {
    path: string;
    message: string;
}

export interface MissionValidationResult {
    valid: boolean;
    issues: MissionValidationIssue[];
}

function baseEntityIssues(entity: MissionEntity): MissionValidationIssue[] {
    const issues: MissionValidationIssue[] = [];

    if (!entity.id.trim()) {
        issues.push({ path: 'id', message: 'Entity id is required.' });
    }

    if (!isValidEntityVersion(entity.version)) {
        issues.push({ path: 'version', message: 'Entity version must match v<number>.' });
    }

    if (!isIsoDateString(entity.createdAt)) {
        issues.push({ path: 'createdAt', message: 'createdAt must be an ISO timestamp.' });
    }

    if (!isIsoDateString(entity.updatedAt)) {
        issues.push({ path: 'updatedAt', message: 'updatedAt must be an ISO timestamp.' });
    }

    return issues;
}

function validateOperation(operation: MissionOperation): MissionValidationIssue[] {
    const issues = baseEntityIssues(operation);

    if (!operation.codename.trim()) {
        issues.push({ path: 'codename', message: 'Operation codename is required.' });
    }

    if (operation.readinessScore < 0 || operation.readinessScore > 100) {
        issues.push({ path: 'readinessScore', message: 'Operation readinessScore must be between 0 and 100.' });
    }

    return issues;
}

function validateCase(missionCase: MissionCase): MissionValidationIssue[] {
    const issues = baseEntityIssues(missionCase);

    if (!missionCase.operationId.trim()) {
        issues.push({ path: 'operationId', message: 'Case operationId is required.' });
    }

    if (!missionCase.title.trim()) {
        issues.push({ path: 'title', message: 'Case title is required.' });
    }

    return issues;
}

function validateLead(lead: MissionLead): MissionValidationIssue[] {
    const issues = baseEntityIssues(lead);

    if (!lead.caseId.trim()) {
        issues.push({ path: 'caseId', message: 'Lead caseId is required.' });
    }

    if (lead.confidence < 0 || lead.confidence > 1) {
        issues.push({ path: 'confidence', message: 'Lead confidence must be in the range [0,1].' });
    }

    return issues;
}

function validateSignal(signal: MissionSignal): MissionValidationIssue[] {
    const issues = baseEntityIssues(signal);

    if (!signal.operationId.trim()) {
        issues.push({ path: 'operationId', message: 'Signal operationId is required.' });
    }

    if (!isIsoDateString(signal.observedAt)) {
        issues.push({ path: 'observedAt', message: 'Signal observedAt must be an ISO timestamp.' });
    }

    return issues;
}

function validateArtifact(artifact: MissionArtifact): MissionValidationIssue[] {
    const issues = baseEntityIssues(artifact);

    if (!artifact.caseId.trim()) {
        issues.push({ path: 'caseId', message: 'Artifact caseId is required.' });
    }

    if (!isIsoDateString(artifact.collectedAt)) {
        issues.push({ path: 'collectedAt', message: 'Artifact collectedAt must be an ISO timestamp.' });
    }

    return issues;
}

function validateIntelPacket(packet: MissionIntelPacket): MissionValidationIssue[] {
    const issues = baseEntityIssues(packet);

    if (!packet.operationId.trim()) {
        issues.push({ path: 'operationId', message: 'Intel packet operationId is required.' });
    }

    if (!packet.title.trim()) {
        issues.push({ path: 'title', message: 'Intel packet title is required.' });
    }

    return issues;
}

function validateDebrief(debrief: MissionDebriefOutcome): MissionValidationIssue[] {
    const issues = baseEntityIssues(debrief);

    if (!debrief.operationId.trim()) {
        issues.push({ path: 'operationId', message: 'Debrief operationId is required.' });
    }

    if (!debrief.summary.trim()) {
        issues.push({ path: 'summary', message: 'Debrief summary is required.' });
    }

    return issues;
}

export function validateMissionEntity(entity: MissionEntity): MissionValidationResult {
    const issues = (() => {
        switch (entity.kind) {
            case 'operation':
                return validateOperation(entity);
            case 'case':
                return validateCase(entity);
            case 'lead':
                return validateLead(entity);
            case 'signal':
                return validateSignal(entity);
            case 'artifact':
                return validateArtifact(entity);
            case 'intel_packet':
                return validateIntelPacket(entity);
            case 'debrief_outcome':
                return validateDebrief(entity);
            default:
                return [{ path: 'kind', message: 'Unknown mission entity kind.' }];
        }
    })();

    return {
        valid: issues.length === 0,
        issues,
    };
}

export function validateStatusTransition(params: {
    entityKind: MissionEntity['kind'];
    currentStatus: string;
    nextStatus: string;
}): MissionValidationResult {
    const { entityKind, currentStatus, nextStatus } = params;

    const isValid = (() => {
        switch (entityKind) {
            case 'operation':
                return canTransition(currentStatus as MissionOperation['status'], nextStatus as MissionOperation['status'], operationStatusTransitions);
            case 'case':
                return canTransition(currentStatus as MissionCase['status'], nextStatus as MissionCase['status'], caseStatusTransitions);
            case 'lead':
                return canTransition(currentStatus as MissionLead['status'], nextStatus as MissionLead['status'], leadStatusTransitions);
            case 'signal':
                return canTransition(currentStatus as MissionSignal['status'], nextStatus as MissionSignal['status'], signalStatusTransitions);
            case 'intel_packet':
                return canTransition(currentStatus as MissionIntelPacket['status'], nextStatus as MissionIntelPacket['status'], intelPacketStatusTransitions);
            case 'artifact':
            case 'debrief_outcome':
                return currentStatus === nextStatus;
            default:
                return false;
        }
    })();

    if (isValid) {
        return { valid: true, issues: [] };
    }

    return {
        valid: false,
        issues: [
            {
                path: 'status',
                message: `Invalid transition for ${entityKind}: ${currentStatus} -> ${nextStatus}.`,
            },
        ],
    };
}
