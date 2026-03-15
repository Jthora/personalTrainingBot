import { describe, expect, it } from 'vitest';
import { getArchetypeCatalog, findArchetype } from '../archetypes';

/** All module IDs present in training_modules_manifest.json */
const VALID_MODULE_IDS = new Set([
    'agencies', 'combat', 'counter_biochem', 'counter_psyops', 'cybersecurity',
    'dance', 'equations', 'espionage', 'fitness', 'intelligence', 'investigation',
    'martial_arts', 'psiops', 'war_strategy', 'web_three', 'self_sovereignty',
    'anti_psn', 'anti_tcs_idc_cbc', 'space_force',
]);

const VALID_HANDLER_IDS = new Set([
    'tiger_fitness_god', 'jono_thora', 'tara_van_dekar', 'agent_simon', 'star_commander_raynor',
]);

const COMPETENCY_DIMENSIONS = [
    'triage_execution', 'signal_analysis', 'artifact_traceability', 'decision_quality',
] as const;

describe('archetypes catalog', () => {
    const catalog = getArchetypeCatalog();

    it('returns all 8 archetypes', () => {
        expect(catalog).toHaveLength(8);
    });

    it('has unique IDs', () => {
        const ids = catalog.map((a) => a.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — has required string fields', (_id, a) => {
        expect(a.name).toBeTruthy();
        expect(a.icon).toBeTruthy();
        expect(a.description.length).toBeGreaterThan(20);
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — coreModules reference valid modules', (_id, a) => {
        expect(a.coreModules.length).toBeGreaterThanOrEqual(3);
        for (const m of a.coreModules) {
            expect(VALID_MODULE_IDS.has(m)).toBe(true);
        }
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — secondaryModules reference valid modules', (_id, a) => {
        expect(a.secondaryModules.length).toBeGreaterThanOrEqual(1);
        for (const m of a.secondaryModules) {
            expect(VALID_MODULE_IDS.has(m)).toBe(true);
        }
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — no overlap between core and secondary modules', (_id, a) => {
        const overlap = a.coreModules.filter((m) => a.secondaryModules.includes(m));
        expect(overlap).toEqual([]);
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — recommendedHandler is a valid handler', (_id, a) => {
        expect(VALID_HANDLER_IDS.has(a.recommendedHandler)).toBe(true);
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — milestoneLabels has exactly 4 entries', (_id, a) => {
        expect(a.milestoneLabels).toHaveLength(4);
        for (const label of a.milestoneLabels) {
            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
        }
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — competencyWeights sum to 1.0', (_id, a) => {
        const sum = Object.values(a.competencyWeights).reduce((acc, v) => acc + v, 0);
        expect(sum).toBeCloseTo(1.0, 5);
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — competencyWeights cover all 4 dimensions', (_id, a) => {
        for (const dim of COMPETENCY_DIMENSIONS) {
            expect(a.competencyWeights[dim]).toBeGreaterThan(0);
        }
    });

    it.each(catalog.map((a) => [a.id, a] as const))('%s — tier gates reference valid dimensions', (_id, a) => {
        const validDims = new Set<string>(COMPETENCY_DIMENSIONS);
        expect(validDims.has(a.tier3Gate.dimension)).toBe(true);
        expect(validDims.has(a.tier4Gate.dimension)).toBe(true);
        expect(a.tier3Gate.threshold).toBeGreaterThanOrEqual(50);
        expect(a.tier3Gate.threshold).toBeLessThanOrEqual(100);
        expect(a.tier4Gate.threshold).toBeGreaterThanOrEqual(50);
        expect(a.tier4Gate.threshold).toBeLessThanOrEqual(100);
        expect(a.tier4Gate.threshold).toBeGreaterThanOrEqual(a.tier3Gate.threshold);
    });
});

describe('findArchetype', () => {
    it('returns the matching archetype', () => {
        const result = findArchetype('rescue_ranger');
        expect(result).toBeDefined();
        expect(result!.name).toBe('Search & Rescue');
    });

    it('returns undefined for unknown id', () => {
        expect(findArchetype('nonexistent_archetype')).toBeUndefined();
    });

    it('returns same object reference as catalog entry', () => {
        const catalog = getArchetypeCatalog();
        const fromFind = findArchetype('cyber_sentinel');
        const fromCatalog = catalog.find((a) => a.id === 'cyber_sentinel');
        expect(fromFind).toBe(fromCatalog);
    });
});
