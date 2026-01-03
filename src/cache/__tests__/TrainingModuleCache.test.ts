import { beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingModuleCache from '../TrainingModuleCache';
import type { TrainingModule } from '../../types/TrainingModule';

const sampleModules: TrainingModule[] = [
    {
        id: 'module-alpha',
        name: 'Cognitive Sculpt',
        description: 'Sharpen your thinking routines.',
        color: '#3355ff',
        submodules: [
            {
                id: 'submodule-focus',
                name: 'Focus Lab',
                description: 'Dial in deliberate focus.',
                difficulty: 'Intermediate',
                estimated_time: '6-8 weeks',
                focus: ['Focus', 'Habits'],
                cardDecks: [
                    {
                        id: 'deck-morning',
                        name: 'Morning Momentum',
                        description: 'Start fast and steady.',
                        focus: ['Momentum'],
                        cards: [
                            {
                                id: 'card-one',
                                title: 'Morning Focus Primer',
                                description: 'Establish priorities before distractions hit.',
                                bulletpoints: [
                                    'Scan schedule for the highest leverage item',
                                    'Commit to a 45 minute deep work block',
                                    'Send accountability update to partner',
                                ],
                                duration: 15,
                                difficulty: 'Intermediate',
                            },
                            {
                                id: 'card-two',
                                title: 'Decision Journal Sprint',
                                description: 'Capture major decisions and hypotheses.',
                                bulletpoints: [
                                    'Log decisions with timestamp',
                                    'State the expected outcome explicitly',
                                ],
                                duration: 20,
                                difficulty: 'Standard',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const modulesWithAdditionalCard: TrainingModule[] = [
    {
        ...sampleModules[0],
        submodules: [
            {
                ...sampleModules[0].submodules[0],
                cardDecks: [
                    {
                        ...sampleModules[0].submodules[0].cardDecks[0],
                        cards: [
                            ...sampleModules[0].submodules[0].cardDecks[0].cards,
                            {
                                id: 'card-three',
                                title: 'Cognitive Cooldown',
                                description: 'A gentle wrap-up routine.',
                                bulletpoints: ['Reflect on progress', 'Log one insight'],
                                duration: 10,
                                difficulty: 'Light',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

describe('TrainingModuleCache', () => {
    const cache = TrainingModuleCache.getInstance();

    beforeEach(() => {
        cache.clearCache();
        localStorage.clear();
    });

    it('indexes card metadata and supports slug round-trips', async () => {
        await cache.loadData(sampleModules);

        const meta = cache.getCardMeta('card-one');
        expect(meta).toBeDefined();
        expect(meta?.moduleName).toBe('Cognitive Sculpt');
        expect(meta?.cardDeckName).toBe('Morning Momentum');

        const slug = cache.getSlugForCard('card-one');
        expect(slug).toBeDefined();
        const resolvedCardId = cache.getCardIdBySlug(slug!);
        expect(resolvedCardId).toBe('card-one');

        const card = cache.getCardById('card-one');
        expect(card?.title).toBe('Morning Focus Primer');
    });

    it('produces stable slugs on subsequent loads', async () => {
        await cache.loadData(sampleModules);
        const initialSlug = cache.getSlugForCard('card-two');
        expect(initialSlug).toBeDefined();

        await cache.loadData(sampleModules);
        const reloadedSlug = cache.getSlugForCard('card-two');
        expect(reloadedSlug).toBe(initialSlug);
    });

    it('hydrates persisted selections when the training data signature matches', async () => {
        await cache.loadData(sampleModules);

        cache.toggleCardSelection('card-two');
        expect(cache.isCardSelected('card-two')).toBe(false);

        await cache.loadData(sampleModules);

        expect(cache.isCardSelected('card-two')).toBe(false);
    });

    it('resets stored selections when the training data signature changes', async () => {
        await cache.loadData(sampleModules);
        cache.toggleCardSelection('card-two');
        expect(cache.isCardSelected('card-two')).toBe(false);

        await cache.loadData(modulesWithAdditionalCard);

        expect(cache.isCardSelected('card-two')).toBe(true);
        expect(cache.isCardSelected('card-three')).toBe(true);
    });

    it('continues with select-all defaults when selection storage read fails', async () => {
        const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
            throw new Error('storage read blocked');
        });

        await cache.loadData(sampleModules);

        expect(cache.isCardSelected('card-one')).toBe(true);

        getItemSpy.mockRestore();
    });

    it('ignores invalid persisted selection data and preserves selections', async () => {
        await cache.loadData(sampleModules);

        localStorage.setItem('trainingSelection:v2:modules', '{ not-json');
        localStorage.setItem('trainingSelection:v2:subModules', '{"bad":"data"}');
        localStorage.setItem('trainingSelection:v2:cardDecks', '{"deck-morning":"yes"}');
        localStorage.setItem('trainingSelection:v2:cards', '{"card-one":"maybe"}');

        await cache.loadData(sampleModules);

        expect(cache.isCardSelected('card-one')).toBe(true);
        expect(cache.isCardDeckSelected('deck-morning')).toBe(true);
    });
});
