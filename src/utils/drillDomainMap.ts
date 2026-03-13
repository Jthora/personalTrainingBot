/**
 * drillDomainMap.ts — Maps physical drill IDs to training domain (module) IDs.
 *
 * DrillCategoryCache organizes drills in a Category → SubCategory → Group → Drill
 * hierarchy. The category ID at the top level maps 1:1 to DOMAIN_CATALOG IDs
 * (both use training module IDs like 'cybersecurity', 'combat', 'fitness', etc.).
 *
 * This utility walks the cache hierarchy once to build a lookup map, then provides
 * O(1) resolution from any drill ID to its parent domain.
 */

import DrillCategoryCache from '../cache/DrillCategoryCache';

/**
 * Resolve the training domain (module) ID for a physical drill.
 *
 * @param drillId — The drill ID (e.g. `"active_recovery_jog"`)
 * @returns The parent category ID which matches a DOMAIN_CATALOG entry, or `undefined` if not found.
 */
export const resolveDomainForDrillCategory = (drillId: string): string | undefined => {
  const cache = DrillCategoryCache.getInstance();
  if (cache.cache.size === 0) {
    console.warn('drillDomainMap: DrillCategoryCache is empty — domain resolution will fail. Is the cache loaded?');
    return undefined;
  }
  for (const [categoryId, category] of cache.cache) {
    for (const sub of category.subCategories) {
      for (const group of sub.drillGroups) {
        for (const drill of group.drills) {
          if (drill.id === drillId) return categoryId;
        }
      }
    }
  }
  return undefined;
};

/**
 * Build a complete drill → domain lookup map.
 * Useful when resolving many drills at once (avoids repeated hierarchy walks).
 */
export const buildDrillDomainMap = (): Map<string, string> => {
  const map = new Map<string, string>();
  const cache = DrillCategoryCache.getInstance();
  for (const [categoryId, category] of cache.cache) {
    for (const sub of category.subCategories) {
      for (const group of sub.drillGroups) {
        for (const drill of group.drills) {
          map.set(drill.id, categoryId);
        }
      }
    }
  }
  return map;
};
