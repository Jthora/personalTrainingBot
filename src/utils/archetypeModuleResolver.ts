/**
 * archetypeModuleResolver — resolves the training module set for a given archetype.
 * Returns core + secondary modules as a single ordered array.
 */
import { findArchetype } from '../data/archetypes';

/**
 * Returns the full module ID set for a given archetype: core modules first, then secondary.
 * Returns undefined if the archetype is not found.
 */
export const resolveModulesForArchetype = (archetypeId: string): string[] | undefined => {
    const archetype = findArchetype(archetypeId);
    if (!archetype) return undefined;
    return [...archetype.coreModules, ...archetype.secondaryModules];
};
