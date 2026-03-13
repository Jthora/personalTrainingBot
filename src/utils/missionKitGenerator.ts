/**
 * missionKitGenerator.ts — Generates a MissionKit from the user's selected training modules.
 *
 * Picks decks across active modules, builds drill entries with cardId-bearing steps,
 * and applies archetype weighting so core modules get more drills than secondary/other.
 */

import TrainingModuleCache from '../cache/TrainingModuleCache';
import OperativeProfileStore from '../store/OperativeProfileStore';
import { findArchetype } from '../data/archetypes';
import { DOMAIN_CATALOG } from '../utils/readiness/domainProgress';
import { buildDrillStepsFromModule } from '../utils/drillStepBuilder';
import type { MissionKit, Drill, DrillStep } from '../data/missionKits/sampleMissionKit';

/** Number of cards per drill. */
const CARDS_PER_DRILL = 8;

/** Default number of drills in a generated kit. */
const DEFAULT_DRILL_COUNT = 4;

/** Weight multipliers for archetype-based distribution. */
const CORE_WEIGHT = 3;
const SECONDARY_WEIGHT = 2;
const BASE_WEIGHT = 1;

interface WeightedModule {
  moduleId: string;
  moduleName: string;
  weight: number;
}

/**
 * Build a weighted list of modules based on archetype and selection state.
 * Returns only modules that are selected and have cards loaded.
 */
const getWeightedModules = (): WeightedModule[] => {
  const cache = TrainingModuleCache.getInstance();
  if (!cache.isLoaded()) return [];

  const profile = OperativeProfileStore.get();
  const archetype = profile?.archetypeId ? findArchetype(profile.archetypeId) : null;
  const coreSet = new Set(archetype?.coreModules ?? []);
  const secondarySet = new Set(archetype?.secondaryModules ?? []);

  const modules: WeightedModule[] = [];
  for (const domain of DOMAIN_CATALOG) {
    if (!cache.isModuleSelected(domain.id)) continue;
    const stats = cache.getModuleStats(domain.id);
    if (stats.totalCards === 0) continue;

    let weight = BASE_WEIGHT;
    if (coreSet.has(domain.id)) weight = CORE_WEIGHT;
    else if (secondarySet.has(domain.id)) weight = SECONDARY_WEIGHT;

    modules.push({ moduleId: domain.id, moduleName: domain.name, weight });
  }

  return modules;
};

/**
 * Weighted random pick from modules (without replacement).
 */
const weightedPick = (modules: WeightedModule[], count: number): WeightedModule[] => {
  const remaining = [...modules];
  const result: WeightedModule[] = [];
  const target = Math.min(count, remaining.length);

  while (result.length < target && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, m) => sum + m.weight, 0);
    let roll = Math.random() * totalWeight;
    let picked = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      roll -= remaining[i].weight;
      if (roll <= 0) { picked = i; break; }
    }
    result.push(remaining[picked]);
    remaining.splice(picked, 1);
  }

  return result;
};

/**
 * Generate a MissionKit from the user's selected training modules.
 *
 * @param drillCount — Number of drills to generate (default 4)
 * @returns A MissionKit with cardId-bearing steps, or null if no modules are available.
 */
export const generateMissionKit = (drillCount: number = DEFAULT_DRILL_COUNT): MissionKit | null => {
  const weighted = getWeightedModules();
  if (weighted.length === 0) return null;

  const selected = weightedPick(weighted, drillCount);

  const drills: Drill[] = selected.map((mod, i) => {
    const steps: DrillStep[] = buildDrillStepsFromModule(mod.moduleId, CARDS_PER_DRILL);
    return {
      id: `gen-drill-${mod.moduleId}-${i}`,
      title: `${mod.moduleName} Training`,
      type: 'rapid-response' as const,
      difficulty: 3 as const,
      durationMinutes: Math.max(5, steps.length * 2),
      steps,
      moduleId: mod.moduleId,
    };
  });

  return {
    id: `generated-kit-${Date.now()}`,
    title: 'Dynamic Training Kit',
    synopsis: `Auto-generated kit covering ${selected.map((m) => m.moduleName).join(', ')}.`,
    missionType: 'cyber', // default; the individual drills carry moduleId for proper attribution
    drills,
  };
};
