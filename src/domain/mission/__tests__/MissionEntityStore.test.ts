import { describe, expect, it, vi } from 'vitest';
import MissionEntityStore from '../MissionEntityStore';
import type { TrainingModule } from '../../../types/TrainingModule';
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

    it('switches read path based on canonicalReadPath feature flag', async () => {
        const mod = await import('../../../config/featureFlags');
        const setOverrideSpy = vi.spyOn(mod, 'setFeatureFlagOverride');

        mod.setFeatureFlagOverride('canonicalReadPath', false);
        expect(MissionEntityStore.getInstance().getReadPath()).toBe('legacy');

        mod.setFeatureFlagOverride('canonicalReadPath', true);
        expect(MissionEntityStore.getInstance().getReadPath()).toBe('canonical');

        setOverrideSpy.mockRestore();
        mod.resetFeatureFlagOverrides();
    });
});
