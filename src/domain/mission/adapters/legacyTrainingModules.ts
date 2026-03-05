import type { TrainingModule } from '../../../types/TrainingModule';
import type {
    DebriefRating,
    MissionArtifact,
    MissionCase,
    MissionDebriefOutcome,
    MissionEntityCollection,
    MissionIntelPacket,
    MissionLead,
    MissionOperation,
    MissionSeverity,
    MissionSignal,
} from '../types';
import { DEFAULT_ENTITY_VERSION } from '../lifecycle';

export interface LegacyFieldMapping {
    source: string;
    target: string;
    note?: string;
}

export const LEGACY_TO_MISSION_FIELD_MAPPINGS: LegacyFieldMapping[] = [
    { source: 'TrainingModule.id', target: 'MissionOperation.id', note: 'Prefixed with op-' },
    { source: 'TrainingModule.name', target: 'MissionOperation.codename' },
    { source: 'TrainingModule.description', target: 'MissionOperation.objective' },
    { source: 'TrainingSubModule.id', target: 'MissionCase.id', note: 'Prefixed with case-' },
    { source: 'TrainingSubModule.name', target: 'MissionCase.title' },
    { source: 'TrainingSubModule.description', target: 'MissionCase.summary' },
    { source: 'CardDeck.cards[]', target: 'MissionSignal[]', note: 'Deck-level signal generated per deck' },
    { source: 'Card.id', target: 'MissionArtifact.id', note: 'Prefixed with artifact-' },
    { source: 'Card.title', target: 'MissionArtifact.title' },
    { source: 'Card.description', target: 'MissionArtifact.description' },
    { source: 'TrainingSubModule.focus[]', target: 'MissionLead[]', note: 'One lead per focus item' },
];

export interface LegacyDriftIssue {
    level: 'warning' | 'error';
    path: string;
    message: string;
}

export interface LegacyDriftReport {
    valid: boolean;
    stats: {
        modules: number;
        submodules: number;
        decks: number;
        cards: number;
    };
    issues: LegacyDriftIssue[];
}

export interface LegacyAdapterOptions {
    baseTimestamp?: string;
}

const DEFAULT_TIMESTAMP = '2026-03-05T00:00:00.000Z';

function toMissionId(prefix: string, id: string): string {
    return `${prefix}-${id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function toTimestamp(baseTimestamp: string, offsetMinutes: number): string {
    const base = new Date(baseTimestamp).getTime();
    return new Date(base + offsetMinutes * 60_000).toISOString();
}

function severityFromDifficulty(value: string | undefined): MissionSeverity {
    const normalized = (value ?? '').toLowerCase();
    if (normalized.includes('challenge') || normalized.includes('heavy') || normalized.includes('advanced')) {
        return 'critical';
    }
    if (normalized.includes('intermediate') || normalized.includes('standard')) {
        return 'high';
    }
    if (normalized.includes('light') || normalized.includes('beginner')) {
        return 'medium';
    }
    return 'low';
}

function sortById<T extends { id: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function computeReadinessScore(module: TrainingModule): number {
    const totalCards = module.submodules.reduce(
        (acc, subModule) => acc + subModule.cardDecks.reduce((deckAcc, deck) => deckAcc + deck.cards.length, 0),
        0,
    );
    return Math.max(10, Math.min(100, 20 + totalCards * 2));
}

export function reportLegacyTrainingModuleDrift(trainingModules: TrainingModule[]): LegacyDriftReport {
    const issues: LegacyDriftIssue[] = [];
    const moduleIds = new Set<string>();
    const submoduleIds = new Set<string>();
    const deckIds = new Set<string>();
    const cardIds = new Set<string>();

    let submodules = 0;
    let decks = 0;
    let cards = 0;

    sortById(trainingModules).forEach(module => {
        if (!module.id.trim()) {
            issues.push({ level: 'error', path: 'module.id', message: 'Module id is missing.' });
        }
        if (!module.name.trim()) {
            issues.push({ level: 'error', path: `module:${module.id}.name`, message: 'Module name is required.' });
        }
        if (moduleIds.has(module.id)) {
            issues.push({ level: 'error', path: `module:${module.id}`, message: 'Duplicate module id found.' });
        }
        moduleIds.add(module.id);

        sortById(module.submodules).forEach(subModule => {
            submodules += 1;
            if (!subModule.id.trim()) {
                issues.push({ level: 'error', path: `module:${module.id}.submodule.id`, message: 'Submodule id is missing.' });
            }
            if (submoduleIds.has(subModule.id)) {
                issues.push({ level: 'error', path: `submodule:${subModule.id}`, message: 'Duplicate submodule id found.' });
            }
            submoduleIds.add(subModule.id);

            sortById(subModule.cardDecks).forEach(deck => {
                decks += 1;
                if (!deck.id.trim()) {
                    issues.push({ level: 'error', path: `submodule:${subModule.id}.deck.id`, message: 'Deck id is missing.' });
                }
                if (!deck.name.trim()) {
                    issues.push({ level: 'warning', path: `deck:${deck.id}.name`, message: 'Deck name is empty.' });
                }
                if (deckIds.has(deck.id)) {
                    issues.push({ level: 'error', path: `deck:${deck.id}`, message: 'Duplicate deck id found.' });
                }
                deckIds.add(deck.id);

                sortById(deck.cards).forEach(card => {
                    cards += 1;
                    if (!card.id.trim()) {
                        issues.push({ level: 'error', path: `deck:${deck.id}.card.id`, message: 'Card id is missing.' });
                    }
                    if (!card.title.trim()) {
                        issues.push({ level: 'warning', path: `card:${card.id}.title`, message: 'Card title is empty.' });
                    }
                    if (cardIds.has(card.id)) {
                        issues.push({ level: 'error', path: `card:${card.id}`, message: 'Duplicate card id found.' });
                    }
                    cardIds.add(card.id);
                });
            });
        });
    });

    return {
        valid: !issues.some(issue => issue.level === 'error'),
        stats: {
            modules: trainingModules.length,
            submodules,
            decks,
            cards,
        },
        issues,
    };
}

export function mapTrainingModulesToMissionEntities(
    trainingModules: TrainingModule[],
    options?: LegacyAdapterOptions,
): MissionEntityCollection {
    const baseTimestamp = options?.baseTimestamp ?? DEFAULT_TIMESTAMP;
    const operations: MissionOperation[] = [];
    const cases: MissionCase[] = [];
    const leads: MissionLead[] = [];
    const signals: MissionSignal[] = [];
    const artifacts: MissionArtifact[] = [];
    const intelPackets: MissionIntelPacket[] = [];
    const debriefOutcomes: MissionDebriefOutcome[] = [];

    let offset = 0;

    sortById(trainingModules).forEach(module => {
        const moduleTimestamp = toTimestamp(baseTimestamp, offset++);
        const operationId = toMissionId('op', module.id);

        const moduleCaseIds: string[] = [];
        const moduleSignalIds: string[] = [];

        sortById(module.submodules).forEach(subModule => {
            const caseId = toMissionId('case', subModule.id);
            moduleCaseIds.push(caseId);

            const submoduleSignalIds: string[] = [];
            const submoduleArtifactIds: string[] = [];
            const submoduleLeadIds: string[] = [];

            sortById(subModule.focus.map((focusValue, index) => ({ id: `${subModule.id}-focus-${index}`, focusValue }))).forEach((entry, index) => {
                const leadId = toMissionId('lead', `${subModule.id}-${index}`);
                submoduleLeadIds.push(leadId);

                leads.push({
                    kind: 'lead',
                    id: leadId,
                    version: DEFAULT_ENTITY_VERSION,
                    createdAt: moduleTimestamp,
                    updatedAt: moduleTimestamp,
                    caseId,
                    title: entry.focusValue,
                    detail: `${entry.focusValue} is identified as a strategic investigative lead from legacy focus metadata.`,
                    status: 'new',
                    confidence: 0.65,
                    source: 'system',
                });
            });

            sortById(subModule.cardDecks).forEach(deck => {
                const deckSignalId = toMissionId('signal', deck.id);
                moduleSignalIds.push(deckSignalId);
                submoduleSignalIds.push(deckSignalId);

                signals.push({
                    kind: 'signal',
                    id: deckSignalId,
                    version: DEFAULT_ENTITY_VERSION,
                    createdAt: moduleTimestamp,
                    updatedAt: moduleTimestamp,
                    operationId,
                    caseId,
                    title: `${deck.name} anomaly stream`,
                    detail: deck.description,
                    status: 'new',
                    severity: severityFromDifficulty(subModule.difficulty),
                    source: 'system',
                    observedAt: moduleTimestamp,
                });

                sortById(deck.cards).forEach(card => {
                    const artifactId = toMissionId('artifact', card.id);
                    submoduleArtifactIds.push(artifactId);

                    artifacts.push({
                        kind: 'artifact',
                        id: artifactId,
                        version: DEFAULT_ENTITY_VERSION,
                        createdAt: moduleTimestamp,
                        updatedAt: moduleTimestamp,
                        caseId,
                        title: card.title,
                        description: card.description,
                        artifactType: 'report',
                        source: `legacy-card:${card.id}`,
                        collectedAt: moduleTimestamp,
                    });
                });
            });

            cases.push({
                kind: 'case',
                id: caseId,
                version: DEFAULT_ENTITY_VERSION,
                createdAt: moduleTimestamp,
                updatedAt: moduleTimestamp,
                operationId,
                title: subModule.name,
                summary: subModule.description,
                status: 'new',
                severity: severityFromDifficulty(subModule.difficulty),
                leadIds: submoduleLeadIds,
                signalIds: submoduleSignalIds,
                artifactIds: submoduleArtifactIds,
            });

            intelPackets.push({
                kind: 'intel_packet',
                id: toMissionId('intel', subModule.id),
                version: DEFAULT_ENTITY_VERSION,
                createdAt: moduleTimestamp,
                updatedAt: moduleTimestamp,
                operationId,
                title: `${subModule.name} intelligence packet`,
                summary: `Derived intelligence packet from legacy submodule ${subModule.id}.`,
                status: 'draft',
                artifactIds: submoduleArtifactIds,
                classification: 'internal',
            });
        });

        operations.push({
            kind: 'operation',
            id: operationId,
            version: DEFAULT_ENTITY_VERSION,
            createdAt: moduleTimestamp,
            updatedAt: moduleTimestamp,
            codename: module.name,
            objective: module.description,
            status: 'planned',
            readinessScore: computeReadinessScore(module),
            caseIds: moduleCaseIds,
            signalIds: moduleSignalIds,
            checklistIds: [toMissionId('checklist', module.id)],
            debriefOutcomeId: toMissionId('debrief', module.id),
        });

        const rating: DebriefRating = moduleCaseIds.length > 2 ? 'strong' : 'adequate';
        debriefOutcomes.push({
            kind: 'debrief_outcome',
            id: toMissionId('debrief', module.id),
            version: DEFAULT_ENTITY_VERSION,
            createdAt: moduleTimestamp,
            updatedAt: moduleTimestamp,
            operationId,
            summary: `Legacy content migration baseline debrief for ${module.name}.`,
            lessonsLearned: ['Validate migrated leads and signals against live mission telemetry.'],
            followUpActions: ['Promote validated draft intel packets to validated status.'],
            rating,
            readinessDelta: moduleCaseIds.length,
        });
    });

    return {
        operations,
        cases,
        leads,
        signals,
        artifacts,
        intelPackets,
        debriefOutcomes,
    };
}
