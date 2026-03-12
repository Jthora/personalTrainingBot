import { describe, expect, it, vi } from 'vitest';
import MissionEntityStore from '../MissionEntityStore';
import type { TrainingModule } from '../../../types/TrainingModule';
import type { MissionSignal } from '../types';
import { operationAlphaCollection } from '../exemplars/operationAlpha';
import { operationBravoCollection } from '../exemplars/operationBravo';
import { operationCharlieCollection } from '../exemplars/operationCharlie';

const sampleModules: TrainingModule[] = [
    {
        id: 'mod-1',
        name: 'Module One',
        description: 'First module.',
        color: '#123456',
        submodules: [
            {
                id: 'sub-1',
                name: 'Sub One',
                description: 'First submodule.',
                difficulty: 'Standard',
                estimated_time: '4 weeks',
                focus: ['Signal Triage'],
                cardDecks: [
                    {
                        id: 'deck-1',
                        name: 'Deck One',
                        description: 'Deck description.',
                        focus: ['Signals'],
                        cards: [
                            {
                                id: 'card-1',
                                title: 'Card One',
                                description: 'Card description.',
                                bulletpoints: ['a'],
                                duration: 10,
                                difficulty: 'Standard',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

describe('MissionEntityStore', () => {
    it('hydrates canonical entities from training modules', () => {
        const store = MissionEntityStore.getInstance();
        store.clear();
        store.hydrateFromTrainingModules(sampleModules);

        const collection = store.getCanonicalCollection();
        expect(collection).toBeTruthy();
        expect(collection?.operations[0].id).toBe(operationAlphaCollection.operations[0].id);
        expect(collection?.operations.some((operation) => operation.id === operationBravoCollection.operations[0].id)).toBe(true);
        expect(collection?.operations.some((operation) => operation.id === operationCharlieCollection.operations[0].id)).toBe(true);
        expect(collection?.operations.length).toBe(4);
        expect(collection?.cases.length).toBe(4);
        expect(collection?.signals.some((signal) => signal.id === 'signal-bravo-route-hijack')).toBe(true);
        expect(collection?.artifacts.some((artifact) => artifact.id === 'artifact-charlie-origin-report')).toBe(true);
    });

    it('returns legacy read path', () => {
        expect(MissionEntityStore.getInstance().getReadPath()).toBe('legacy');
    });

    describe('mutations', () => {
        function hydratedStore() {
            const store = MissionEntityStore.getInstance();
            store.clear();
            store.hydrateFromTrainingModules(sampleModules);
            return store;
        }

        it('updateCaseStatus applies a valid lifecycle transition', () => {
            const store = hydratedStore();
            // Alpha case starts at "assessing" — assessing → engaged is valid
            const firstCase = store.getCanonicalCollection()!.cases[0];
            expect(firstCase).toBeDefined();
            expect(firstCase.status).toBe('assessing');

            const result = store.updateCaseStatus(firstCase.id, 'engaged');
            expect(result).toBe(true);
            expect(store.getCanonicalCollection()!.cases.find((c) => c.id === firstCase.id)!.status).toBe('engaged');
        });

        it('updateCaseStatus rejects an invalid lifecycle transition', () => {
            const store = hydratedStore();
            const firstCase = store.getCanonicalCollection()!.cases[0];
            expect(firstCase.status).toBe('assessing');

            // assessing → contained is not a valid direct transition
            const result = store.updateCaseStatus(firstCase.id, 'contained');
            expect(result).toBe(false);
            expect(store.getCanonicalCollection()!.cases.find((c) => c.id === firstCase.id)!.status).toBe('assessing');
        });

        it('updateCaseStatus also updates severity when provided', () => {
            const store = hydratedStore();
            const firstCase = store.getCanonicalCollection()!.cases[0];
            store.updateCaseStatus(firstCase.id, 'engaged', 'critical');
            expect(store.getCanonicalCollection()!.cases.find((c) => c.id === firstCase.id)!.severity).toBe('critical');
        });

        it('updateSignalStatus applies a valid lifecycle transition', () => {
            const store = hydratedStore();
            const signals = store.getCanonicalCollection()!.signals;
            const target = signals.find((s) => s.status === 'new');
            if (!target) return; // skip if no "new" signal in exemplar data

            const result = store.updateSignalStatus(target.id, 'acknowledged');
            expect(result).toBe(true);
            expect(store.getCanonicalCollection()!.signals.find((s) => s.id === target.id)!.status).toBe('acknowledged');
        });

        it('updateSignalStatus rejects an invalid lifecycle transition', () => {
            const store = hydratedStore();
            const signals = store.getCanonicalCollection()!.signals;
            const target = signals.find((s) => s.status === 'new');
            if (!target) return;

            // new → resolved is not a valid direct transition
            const result = store.updateSignalStatus(target.id, 'resolved');
            expect(result).toBe(false);
        });

        it('ingestSignal adds a new signal to the collection', () => {
            const store = hydratedStore();
            const before = store.getCanonicalCollection()!.signals.length;

            const signal: MissionSignal = {
                kind: 'signal',
                id: 'sig-test-inject',
                version: 'v1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                operationId: '',
                title: 'Injected signal',
                detail: 'From test',
                status: 'new',
                severity: 'medium',
                source: 'operator',
                observedAt: new Date().toISOString(),
            };

            const result = store.ingestSignal(signal);
            expect(result).toBe(true);
            expect(store.getCanonicalCollection()!.signals.length).toBe(before + 1);
            expect(store.getCanonicalCollection()!.signals.find((s) => s.id === 'sig-test-inject')).toBeTruthy();
        });

        it('ingestSignal rejects duplicate ids', () => {
            const store = hydratedStore();
            const existing = store.getCanonicalCollection()!.signals[0];
            const duplicate: MissionSignal = { ...existing };

            const result = store.ingestSignal(duplicate);
            expect(result).toBe(false);
        });

        it('promoteArtifact tags description and links to intel packet', () => {
            const store = hydratedStore();
            const artifact = store.getCanonicalCollection()!.artifacts[0];
            if (!artifact) return;

            const result = store.promoteArtifact(artifact.id);
            expect(result).toBe(true);
            expect(store.getCanonicalCollection()!.artifacts.find((a) => a.id === artifact.id)!.description).toMatch(/^\[PROMOTED\]/);
        });

        it('subscribe listener fires on mutation', () => {
            const store = hydratedStore();
            const listener = vi.fn();
            const unsub = store.subscribe(listener);

            const firstCase = store.getCanonicalCollection()!.cases[0];
            store.updateCaseStatus(firstCase.id, 'engaged');

            expect(listener).toHaveBeenCalled();
            unsub();
        });

        it('getVersion increments on each mutation', () => {
            const store = hydratedStore();
            const v0 = store.getVersion();

            const firstCase = store.getCanonicalCollection()!.cases[0];
            // assessing → engaged
            store.updateCaseStatus(firstCase.id, 'engaged');
            const v1 = store.getVersion();
            expect(v1).toBeGreaterThan(v0);

            // engaged → contained
            store.updateCaseStatus(firstCase.id, 'contained');
            expect(store.getVersion()).toBeGreaterThan(v1);
        });

        it('returns false when collection is null', () => {
            const store = MissionEntityStore.getInstance();
            store.clear();

            expect(store.updateCaseStatus('nonexistent', 'assessing')).toBe(false);
            expect(store.updateSignalStatus('nonexistent', 'acknowledged')).toBe(false);
            expect(store.ingestSignal({ kind: 'signal', id: 'x', version: 'v1', createdAt: '', updatedAt: '', operationId: '', title: '', detail: '', status: 'new', severity: 'low', source: 'operator', observedAt: '' })).toBe(false);
            expect(store.promoteArtifact('nonexistent')).toBe(false);
        });
    });
});
