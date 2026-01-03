import { describe, it, expect } from 'vitest';
import { computeBadgeStrip } from '../badgeStrip';

describe('computeBadgeStrip', () => {
    it('returns visible badges up to max and overflow count', () => {
        const result = computeBadgeStrip(['a', 'b', 'c', 'd'], { max: 3 });
        expect(result.visible).toEqual(['a', 'b', 'c']);
        expect(result.overflow).toBe(1);
    });

    it('respects provided totalCount greater than list length', () => {
        const result = computeBadgeStrip(['a', 'b'], { max: 3, totalCount: 5 });
        expect(result.visible).toEqual(['a', 'b']);
        expect(result.overflow).toBe(3);
    });

    it('handles empty input gracefully', () => {
        const result = computeBadgeStrip([], { max: 3 });
        expect(result.visible).toEqual([]);
        expect(result.overflow).toBe(0);
    });
});
