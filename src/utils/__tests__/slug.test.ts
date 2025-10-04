import { describe, expect, it } from 'vitest';
import { generateCardSlug } from '../slug';

const parts = {
    moduleId: 'module-123',
    subModuleId: 'sub-456',
    cardDeckId: 'deck-789',
    cardId: 'card-abc',
};

describe('generateCardSlug', () => {
    it('produces deterministic slugs for identical inputs', () => {
        const slug1 = generateCardSlug(parts);
        const slug2 = generateCardSlug(parts);
        expect(slug1).toBe(slug2);
        expect(slug1.length).toBeGreaterThanOrEqual(8);
    });

    it('changes when salt differs', () => {
        const slugWithSalt = generateCardSlug(parts, 1);
        expect(slugWithSalt).not.toBe(generateCardSlug(parts));
    });
});
