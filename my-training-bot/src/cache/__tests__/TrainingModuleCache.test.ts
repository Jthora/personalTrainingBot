import { beforeEach, describe, expect, it } from 'vitest';
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

describe('TrainingModuleCache', () => {
    const cache = TrainingModuleCache.getInstance();

    beforeEach(() => {
        cache.clearCache();
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
});
