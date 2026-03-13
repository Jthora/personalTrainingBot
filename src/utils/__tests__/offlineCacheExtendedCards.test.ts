import { beforeEach, describe, expect, it } from 'vitest';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import type { TrainingModule } from '../../types/TrainingModule';
import type { Exercise } from '../../types/Card';

/**
 * Verify that extended card data (exercises, learningObjectives, keyTerms, etc.)
 * round-trips correctly through TrainingModuleCache — simulating the offline
 * scenario where data is loaded once and then retrieved from in-memory cache.
 */

const exercises: Exercise[] = [
  { type: 'recall', prompt: 'What are the three pillars?', expectedOutcome: 'A, B, C' },
  { type: 'self-check', prompt: 'Verify your knowledge:', hints: ['I understand X', 'I can explain Y'] },
];

const extendedModules: TrainingModule[] = [
  {
    id: 'mod-offline-test',
    name: 'Offline Verification Module',
    description: 'Tests extended card data through the cache.',
    color: '#ff0000',
    submodules: [
      {
        id: 'sub-offline',
        name: 'Offline Sub',
        description: 'Sub-module for cache testing.',
        difficulty: 'Standard',
        estimated_time: '1 week',
        focus: ['Caching'],
        cardDecks: [
          {
            id: 'deck-offline',
            name: 'Offline Deck',
            description: 'Deck with extended card fields.',
            focus: ['Testing'],
            cards: [
              {
                id: 'card-extended-1',
                title: 'Extended Card Alpha',
                description: 'A card with all new optional fields populated for cache verification.',
                bulletpoints: ['Point one', 'Point two', 'Point three'],
                duration: 10,
                difficulty: 'Standard',
                summaryText: 'This is a summary for the extended card.',
                content: '# Extended Content\n\nMarkdown body for rich rendering.',
                exercises,
                keyTerms: ['caching', 'offline', 'verification'],
                references: ['https://example.com/cache-docs'],
                prerequisites: ['card-basic-1'],
                learningObjectives: ['Understand caching', 'Verify offline data integrity'],
              },
              {
                id: 'card-minimal-1',
                title: 'Minimal Card',
                description: 'A card with NO new fields — backward compatibility test.',
                bulletpoints: ['Basic point'],
                duration: 5,
                difficulty: 'Beginner',
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Offline cache: extended card data round-trip', () => {
  const cache = TrainingModuleCache.getInstance();

  beforeEach(() => {
    cache.clearCache();
    localStorage.clear();
  });

  it('retrieves a card with all extended fields from cache', async () => {
    await cache.loadData(extendedModules);

    const card = cache.getCardById('card-extended-1');
    expect(card).toBeDefined();
    expect(card!.title).toBe('Extended Card Alpha');

    // Core fields
    expect(card!.bulletpoints).toEqual(['Point one', 'Point two', 'Point three']);
    expect(card!.duration).toBe(10);
    expect(card!.difficulty).toBe('Standard');
    expect(card!.summaryText).toBe('This is a summary for the extended card.');

    // Extended fields
    expect(card!.content).toBe('# Extended Content\n\nMarkdown body for rich rendering.');
    expect(card!.exercises).toHaveLength(2);
    expect(card!.exercises![0].type).toBe('recall');
    expect(card!.exercises![0].prompt).toBe('What are the three pillars?');
    expect(card!.exercises![1].type).toBe('self-check');
    expect(card!.exercises![1].hints).toEqual(['I understand X', 'I can explain Y']);
    expect(card!.keyTerms).toEqual(['caching', 'offline', 'verification']);
    expect(card!.references).toEqual(['https://example.com/cache-docs']);
    expect(card!.prerequisites).toEqual(['card-basic-1']);
    expect(card!.learningObjectives).toEqual(['Understand caching', 'Verify offline data integrity']);
  });

  it('retrieves a minimal card without extended fields from cache', async () => {
    await cache.loadData(extendedModules);

    const card = cache.getCardById('card-minimal-1');
    expect(card).toBeDefined();
    expect(card!.title).toBe('Minimal Card');
    expect(card!.bulletpoints).toEqual(['Basic point']);
    expect(card!.duration).toBe(5);

    // Extended fields should be absent
    expect(card!.exercises).toBeUndefined();
    expect(card!.content).toBeUndefined();
    expect(card!.keyTerms).toBeUndefined();
    expect(card!.references).toBeUndefined();
    expect(card!.prerequisites).toBeUndefined();
    expect(card!.learningObjectives).toBeUndefined();
  });

  it('extended fields survive a re-load cycle', async () => {
    await cache.loadData(extendedModules);
    const slug = cache.getSlugForCard('card-extended-1');
    expect(slug).toBeDefined();

    // Simulate an app restart — clearCache + re-load
    cache.clearCache();
    await cache.loadData(extendedModules);

    const card = cache.getCardById('card-extended-1');
    expect(card!.exercises).toHaveLength(2);
    expect(card!.learningObjectives).toEqual(['Understand caching', 'Verify offline data integrity']);

    // Slug should be stable
    const reloadSlug = cache.getSlugForCard('card-extended-1');
    expect(reloadSlug).toBe(slug);
  });

  it('card metadata includes extended card in index', async () => {
    await cache.loadData(extendedModules);

    const meta = cache.getCardMeta('card-extended-1');
    expect(meta).toBeDefined();
    expect(meta!.moduleName).toBe('Offline Verification Module');
    expect(meta!.cardDeckName).toBe('Offline Deck');
  });
});
