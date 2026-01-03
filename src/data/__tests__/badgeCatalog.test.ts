import { describe, it, expect } from 'vitest';
import { getBadgeCatalog, findBadge } from '../badgeCatalog';
import { getBadgeVisualTokens } from '../badgeVisualTokens';
import { getBadgeArtworkTokens } from '../badgeArtworkTokens';

describe('badgeCatalog', () => {
    it('exposes a lean catalog of 8-12 badges with unique ids', () => {
        const catalog = getBadgeCatalog();
        const ids = catalog.map(b => b.id);
        expect(catalog.length).toBeGreaterThanOrEqual(8);
        expect(catalog.length).toBeLessThanOrEqual(12);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('includes required fields and findBadge works', () => {
        const catalog = getBadgeCatalog();
        const first = catalog[0];
        expect(first.name).toBeTruthy();
        expect(first.description).toBeTruthy();
        expect(['common', 'rare', 'epic']).toContain(first.rarity);
        expect(findBadge(first.id)).toEqual(first);
        expect(findBadge('does_not_exist')).toBeUndefined();
    });

    it('keeps rarity values visual-only and within allowed set', () => {
        const catalog = getBadgeCatalog();
        const allowed = ['common', 'rare', 'epic'];
        catalog.forEach(badge => {
            expect(allowed).toContain(badge.rarity);
        });
    });

    it('defines tiered badges with sequential tiers and consistent maxTier per group', () => {
        const catalog = getBadgeCatalog();
        const grouped = catalog.reduce<Record<string, typeof catalog>>( (acc, badge) => {
            if (badge.tierGroup) {
                acc[badge.tierGroup] = acc[badge.tierGroup] || [];
                acc[badge.tierGroup].push(badge);
            }
            return acc;
        }, {});

        Object.values(grouped).forEach(groupBadges => {
            const tiers = groupBadges.map(b => b.tier).filter((t): t is number => typeof t === 'number');
            expect(tiers.length).toBe(groupBadges.length);

            const sorted = [...tiers].sort((a, b) => a - b);
            expect(sorted[0]).toBe(1);
            sorted.forEach((tier, index) => {
                expect(tier).toBe(index + 1);
            });

            const maxTiers = groupBadges.map(b => b.maxTier).filter((m): m is number => typeof m === 'number');
            if (groupBadges.length > 1) {
                expect(maxTiers.length).toBe(groupBadges.length);
                const uniqueMax = new Set(maxTiers);
                expect(uniqueMax.size).toBe(1);
                const maxTier = maxTiers[0];
                expect(maxTier).toBe(sorted[sorted.length - 1]);
            }
        });
    });

    it('maps every badge to a visual token and artwork token', () => {
        const catalog = getBadgeCatalog();
        const visualTokens = getBadgeVisualTokens();
        const artworkTokens = getBadgeArtworkTokens();

        catalog.forEach(badge => {
            const colorKey = (badge.colorTokenId ?? badge.rarity) as keyof typeof visualTokens;
            expect(visualTokens[colorKey]).toBeDefined();
            expect(visualTokens[colorKey].background).toBeTruthy();
            expect(visualTokens[colorKey].border).toBeTruthy();
            expect(visualTokens[colorKey].glow).toBeTruthy();

            const artworkKey = (badge.artworkTokenId ?? 'default') as keyof typeof artworkTokens;
            expect(artworkTokens[artworkKey]).toBeDefined();
            expect(artworkTokens[artworkKey].sprite).toBeTruthy();
        });
    });
});
