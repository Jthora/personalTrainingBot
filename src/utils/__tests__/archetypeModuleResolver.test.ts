import { describe, expect, it } from 'vitest';
import { resolveModulesForArchetype } from '../archetypeModuleResolver';

describe('resolveModulesForArchetype', () => {
    it('returns core + secondary modules for a valid archetype', () => {
        const modules = resolveModulesForArchetype('rescue_ranger');
        expect(modules).toBeDefined();
        // Search & Rescue: core=[combat, counter_biochem, fitness, investigation], secondary=[intelligence, psiops]
        expect(modules).toEqual(['combat', 'counter_biochem', 'fitness', 'investigation', 'intelligence', 'psiops']);
    });

    it('returns undefined for unknown archetype', () => {
        expect(resolveModulesForArchetype('nonexistent')).toBeUndefined();
    });

    it('returns core modules first, then secondary', () => {
        const modules = resolveModulesForArchetype('cyber_sentinel');
        // core: cybersecurity, intelligence, espionage, investigation
        // secondary: agencies, counter_psyops
        expect(modules!.slice(0, 4)).toEqual(['cybersecurity', 'intelligence', 'espionage', 'investigation']);
        expect(modules!.slice(4)).toEqual(['agencies', 'counter_psyops']);
    });

    it('returns all 6 modules for each archetype', () => {
        const ids = [
            'rescue_ranger', 'cyber_sentinel', 'psi_operative', 'shadow_agent',
            'cosmic_engineer', 'tactical_guardian', 'star_commander', 'field_scholar',
        ];
        for (const id of ids) {
            const modules = resolveModulesForArchetype(id);
            expect(modules).toBeDefined();
            expect(modules!.length).toBe(6);
        }
    });
});
