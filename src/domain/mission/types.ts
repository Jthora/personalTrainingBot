export type EntityVersion = `v${number}`;

export type MissionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type MissionEntityKind =
    | 'operation'
    | 'case'
    | 'lead'
    | 'signal'
    | 'artifact'
    | 'intel_packet'
    | 'debrief_outcome';

export interface EntityMetadata {
    id: string;
    version: EntityVersion;
    createdAt: string;
    updatedAt: string;
}

export type OperationStatus =
    | 'planned'
    | 'briefing'
    | 'triage'
    | 'active'
    | 'debrief_pending'
    | 'completed'
    | 'archived';

export interface MissionOperation extends EntityMetadata {
    kind: 'operation';
    codename: string;
    objective: string;
    status: OperationStatus;
    readinessScore: number;
    caseIds: string[];
    signalIds: string[];
    checklistIds: string[];
    debriefOutcomeId?: string;
}

export type CaseStatus = 'new' | 'assessing' | 'engaged' | 'contained' | 'closed';

export interface MissionCase extends EntityMetadata {
    kind: 'case';
    operationId: string;
    title: string;
    summary: string;
    status: CaseStatus;
    severity: MissionSeverity;
    leadIds: string[];
    signalIds: string[];
    artifactIds: string[];
}

export type LeadStatus = 'new' | 'qualified' | 'disqualified' | 'resolved';

export interface MissionLead extends EntityMetadata {
    kind: 'lead';
    caseId: string;
    title: string;
    detail: string;
    status: LeadStatus;
    confidence: number;
    source: 'human' | 'sensor' | 'system' | 'external';
}

export type SignalStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';

export interface MissionSignal extends EntityMetadata {
    kind: 'signal';
    operationId: string;
    caseId?: string;
    title: string;
    detail: string;
    status: SignalStatus;
    severity: MissionSeverity;
    source: 'system' | 'operator' | 'intel' | 'sensor';
    observedAt: string;
}

export type ArtifactType = 'log' | 'capture' | 'report' | 'indicator' | 'note';

export interface MissionArtifact extends EntityMetadata {
    kind: 'artifact';
    caseId: string;
    title: string;
    description: string;
    artifactType: ArtifactType;
    source: string;
    hash?: string;
    collectedAt: string;
}

export type IntelPacketStatus = 'draft' | 'validated' | 'distributed' | 'superseded';

export interface MissionIntelPacket extends EntityMetadata {
    kind: 'intel_packet';
    operationId: string;
    title: string;
    summary: string;
    status: IntelPacketStatus;
    artifactIds: string[];
    classification: 'internal' | 'restricted' | 'confidential';
}

export type DebriefRating = 'insufficient' | 'adequate' | 'strong' | 'exceptional';

export interface MissionDebriefOutcome extends EntityMetadata {
    kind: 'debrief_outcome';
    operationId: string;
    summary: string;
    lessonsLearned: string[];
    followUpActions: string[];
    rating: DebriefRating;
    readinessDelta: number;
}

export type MissionEntity =
    | MissionOperation
    | MissionCase
    | MissionLead
    | MissionSignal
    | MissionArtifact
    | MissionIntelPacket
    | MissionDebriefOutcome;

export interface MissionEntityCollection {
    operations: MissionOperation[];
    cases: MissionCase[];
    leads: MissionLead[];
    signals: MissionSignal[];
    artifacts: MissionArtifact[];
    intelPackets: MissionIntelPacket[];
    debriefOutcomes: MissionDebriefOutcome[];
}
