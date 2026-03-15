import { DEFAULT_ENTITY_VERSION } from './lifecycle';
import type {
    MissionArtifact,
    MissionCase,
    MissionDebriefOutcome,
    MissionIntelPacket,
    MissionLead,
    MissionOperation,
    MissionSignal,
} from './types';

const ISO_NOW = '2026-03-05T00:00:00.000Z';

export const validOperationFixture: MissionOperation = {
    kind: 'operation',
    id: 'op-sentinel-prime',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    codename: 'Sentinel Prime',
    objective: 'Stabilize the compromised relay sector without evidence loss.',
    status: 'briefing',
    readinessScore: 72,
    caseIds: ['case-relay-anomaly'],
    signalIds: ['sig-anomaly-01'],
    checklistIds: ['checklist-briefing'],
};

export const validCaseFixture: MissionCase = {
    kind: 'case',
    id: 'case-relay-anomaly',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    operationId: 'op-sentinel-prime',
    title: 'Relay Anomaly Cluster',
    summary: 'Unexpected relay handshake patterns detected across two sectors.',
    status: 'assessing',
    severity: 'high',
    leadIds: ['lead-1'],
    signalIds: ['sig-anomaly-01'],
    artifactIds: ['artifact-1'],
};

export const validLeadFixture: MissionLead = {
    kind: 'lead',
    id: 'lead-1',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    caseId: 'case-relay-anomaly',
    title: 'Rogue key rotation',
    detail: 'Automated key rotations were initiated from an untrusted endpoint.',
    status: 'qualified',
    confidence: 0.86,
    source: 'system',
};

export const validSignalFixture: MissionSignal = {
    kind: 'signal',
    id: 'sig-anomaly-01',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    operationId: 'op-sentinel-prime',
    caseId: 'case-relay-anomaly',
    title: 'Relay handshake drift',
    detail: 'Handshake latency exceeded the expected envelope in two clusters.',
    status: 'acknowledged',
    severity: 'high',
    source: 'sensor',
    observedAt: ISO_NOW,
};

export const validArtifactFixture: MissionArtifact = {
    kind: 'artifact',
    id: 'artifact-1',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    caseId: 'case-relay-anomaly',
    title: 'Packet capture segment',
    description: 'Capture around relay handshake anomaly window.',
    artifactType: 'capture',
    source: 'sensor-hub-7',
    collectedAt: ISO_NOW,
};

export const validIntelPacketFixture: MissionIntelPacket = {
    kind: 'intel_packet',
    id: 'intel-1',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    operationId: 'op-sentinel-prime',
    title: 'Relay anomaly briefing packet',
    summary: 'Compiled indicators and recommended triage sequence.',
    status: 'validated',
    artifactIds: ['artifact-1'],
    classification: 'restricted',
};

export const validDebriefFixture: MissionDebriefOutcome = {
    kind: 'debrief_outcome',
    id: 'debrief-1',
    version: DEFAULT_ENTITY_VERSION,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
    operationId: 'op-sentinel-prime',
    summary: 'Mission stabilized with evidence integrity preserved.',
    lessonsLearned: ['Escalate key rotation anomalies earlier.'],
    followUpActions: ['Add relay key anomaly watchlist.'],
    rating: 'strong',
    readinessDelta: 6,
};

export const invalidOperationFixture: MissionOperation = {
    ...validOperationFixture,
    id: '',
    version: 'invalid-version' as MissionOperation['version'],
    readinessScore: 130,
};

export const invalidLeadFixture: MissionLead = {
    ...validLeadFixture,
    confidence: 1.25,
};
