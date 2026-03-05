import { describe, expect, it } from 'vitest';
import type { TrainingModule } from '../../../../types/TrainingModule';
import {
    LEGACY_TO_MISSION_FIELD_MAPPINGS,
    mapTrainingModulesToMissionEntities,
    reportLegacyTrainingModuleDrift,
} from '../legacyTrainingModules';

const sampleModules: TrainingModule[] = [
    {
        id: 'module-alpha',
        name: 'Alpha Ops',
        description: 'Mission alpha training module.',
        color: '#4455aa',
        submodules: [
            {
                id: 'sub-alpha-1',
                name: 'Signal Triage',
                description: 'Triage suspicious events quickly.',
                difficulty: 'Intermediate',
                estimated_time: '4 weeks',
                focus: ['Event Qualification', 'Threat Prioritization'],
                cardDecks: [
                    {
                        id: 'deck-alpha-1',
                        name: 'Rapid Signals',
                        description: 'Signal-heavy scenario deck.',
                        focus: ['Signals'],
                        cards: [
                            {
                                id: 'card-alpha-1',
                                title: 'Detect outlier stream',
                                description: 'Review stream and flag abnormal sequences.',
                                bulletpoints: ['Collect baseline', 'Detect variance'],
                                duration: 20,
                                difficulty: 'Intermediate',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

describe('legacyTrainingModules adapter', () => {
    it('provides legacy-to-mission field mappings', () => {
        expect(LEGACY_TO_MISSION_FIELD_MAPPINGS.length).toBeGreaterThan(5);
    });

    it('produces deterministic canonical output for the same input', () => {
        const first = mapTrainingModulesToMissionEntities(sampleModules);
        const second = mapTrainingModulesToMissionEntities(sampleModules);

        expect(first).toEqual(second);
        expect(first.operations[0].id).toBe('op-module-alpha');
        expect(first.cases[0].operationId).toBe(first.operations[0].id);
    });

    it('flags structural drift and duplicate ids in legacy data', () => {
        const driftSource: TrainingModule[] = [
            {
                ...sampleModules[0],
                submodules: [
                    ...sampleModules[0].submodules,
                    {
                        ...sampleModules[0].submodules[0],
                        id: 'sub-alpha-1',
                        cardDecks: [
                            {
                                ...sampleModules[0].submodules[0].cardDecks[0],
                                id: 'deck-alpha-1',
                                cards: [
                                    {
                                        ...sampleModules[0].submodules[0].cardDecks[0].cards[0],
                                        id: 'card-alpha-1',
                                        title: '',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        const report = reportLegacyTrainingModuleDrift(driftSource);

        expect(report.valid).toBe(false);
        expect(report.issues.some(issue => issue.path.includes('Duplicate submodule id'))).toBe(false);
        expect(report.issues.some(issue => issue.message.includes('Duplicate submodule id'))).toBe(true);
        expect(report.issues.some(issue => issue.message.includes('Card title is empty'))).toBe(true);
    });
});
