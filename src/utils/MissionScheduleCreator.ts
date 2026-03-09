import DrillCategoryCache from '../cache/DrillCategoryCache';
import { Drill } from '../types/DrillCategory';
import { MissionSchedule, MissionSet, MissionBlock } from '../types/MissionSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';
import { isFeatureEnabled } from '../config/featureFlags';
import OperativeProfileStore from '../store/OperativeProfileStore';
import { findArchetype } from '../data/archetypes';

const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

/**
 * Stage 22: Weighted random selection that favors drills from the active archetype's
 * core modules (weight 3×) and secondary modules (weight 2×) over unrelated drills (1×).
 */
const getArchetypeWeightedItems = (drills: Drill[], count: number): Drill[] => {
    if (!isFeatureEnabled('archetypeSystem')) return getRandomItems(drills, count);

    const profile = OperativeProfileStore.get();
    if (!profile?.archetypeId) return getRandomItems(drills, count);

    const archetype = findArchetype(profile.archetypeId);
    if (!archetype) return getRandomItems(drills, count);

    const coreSet = new Set(archetype.coreModules);
    const secondarySet = new Set(archetype.secondaryModules);

    // Build drill → moduleId map from the cache hierarchy
    const drillModuleMap = new Map<string, string>();
    const cache = DrillCategoryCache.getInstance();
    cache.cache.forEach((category, categoryId) => {
        category.subCategories.forEach((sub) => {
            sub.drillGroups.forEach((group) => {
                group.drills.forEach((drill) => {
                    drillModuleMap.set(drill.id, categoryId);
                });
            });
        });
    });

    // Build weighted pool: each entry's weight determines how many tickets it gets
    const weighted: Array<{ drill: Drill; weight: number }> = drills.map((drill) => {
        const moduleId = drillModuleMap.get(drill.id) ?? '';
        if (coreSet.has(moduleId)) return { drill, weight: 3 };
        if (secondarySet.has(moduleId)) return { drill, weight: 2 };
        return { drill, weight: 1 };
    });

    // Weighted shuffle: for each slot, pick without replacement weighted by ticket count
    const result: Drill[] = [];
    const remaining = [...weighted];
    const target = Math.min(count, drills.length);

    while (result.length < target && remaining.length > 0) {
        const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;
        let picked = remaining.length - 1;
        for (let i = 0; i < remaining.length; i++) {
            roll -= remaining[i].weight;
            if (roll <= 0) { picked = i; break; }
        }
        result.push(remaining[picked].drill);
        remaining.splice(picked, 1);
    }

    return result;
};

const createDefaultMissionBlock = (index: number): MissionBlock => {
    const duration = Math.floor(Math.random() * (45 - 30 + 1)) + 30; // Random duration between 30 and 45 minutes
    return new MissionBlock(
        `Standby ${index + 1}`,
        'Review intel and prepare for the next phase.',
        duration,
        'Consolidate findings, update case notes, and verify continuity before proceeding.'
    );
};

const createModernMissionSchedule = async (): Promise<MissionSchedule> => {
    const workoutCount = 10;
    const date = new Date().toISOString().split('T')[0];
    
    // Wait for the cache to be ready
    while (DrillCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cache = DrillCategoryCache.getInstance();
    const drills = cache.getAllWorkoutsSelected();

    const difficultySettings = DifficultySettingsStore.getSettings();
    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);

    console.log('Difficulty settings:', difficultySettings);
    console.log('Calculated difficulty level:', difficultyLevel);
    console.log('Total drills fetched:', drills.length);

    const filteredWorkouts = drills.filter(drill => 
        drill.difficulty_range[0] <= difficultyLevel && 
        drill.difficulty_range[1] >= difficultyLevel
    );

    console.log('Filtered drills based on difficulty level:', filteredWorkouts.length);

    if (filteredWorkouts.length === 0) {
        console.warn(`No drills found within the specified difficulty level [${difficultyLevel}].`);
        return new MissionSchedule(date, [], difficultySettings);
    }

    const selectedDrills = getArchetypeWeightedItems(filteredWorkouts, Math.min(workoutCount, filteredWorkouts.length));
    console.log('Selected drills:', selectedDrills.length);

    const missionSets: MissionSet[] = [];
    for (let i = 0; i < selectedDrills.length; i += 3) {
        const workoutsSlice = selectedDrills.slice(i, i + 3);
        const workoutsWithCompletion = workoutsSlice.map(drill => [drill, false] as [Drill, boolean]);
        const missionSet = new MissionSet(workoutsWithCompletion);
        missionSets.push(missionSet);
    }

    const missionBlocks: MissionBlock[] = missionSets.map((_, index) => createDefaultMissionBlock(index));

    const scheduleItems: (MissionSet | MissionBlock)[] = [];
    missionSets.forEach((set, index) => {
        scheduleItems.push(set);
        if (missionBlocks[index]) {
            scheduleItems.push(missionBlocks[index]);
        }
    });

    return new MissionSchedule(date, scheduleItems, difficultySettings);
};

const createLegacyMissionSchedule = async (): Promise<MissionSchedule> => {
    const workoutCount = 8;
    const date = new Date().toISOString().split('T')[0];

    while (DrillCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cache = DrillCategoryCache.getInstance();
    const drills = cache.getAllWorkouts();

    const difficultySettings = DifficultySettingsStore.getSettings();
    const selectedDrills = getRandomItems(drills, Math.min(workoutCount, drills.length));

    if (selectedDrills.length === 0) {
        console.warn('Legacy generator: no drills available; returning empty schedule.');
        return new MissionSchedule(date, [], difficultySettings);
    }

    const missionSets: MissionSet[] = [];
    for (let i = 0; i < selectedDrills.length; i += 2) {
        const workoutsSlice = selectedDrills.slice(i, i + 2);
        const workoutsWithCompletion = workoutsSlice.map(drill => [drill, false] as [Drill, boolean]);
        const missionSet = new MissionSet(workoutsWithCompletion);
        missionSets.push(missionSet);
    }

    const missionBlocks: MissionBlock[] = missionSets.map((_, index) => createDefaultMissionBlock(index));

    const scheduleItems: (MissionSet | MissionBlock)[] = [];
    missionSets.forEach((set, index) => {
        scheduleItems.push(set);
        if (missionBlocks[index]) {
            scheduleItems.push(missionBlocks[index]);
        }
    });

    return new MissionSchedule(date, scheduleItems, difficultySettings);
};

export const createMissionSchedule = async (): Promise<MissionSchedule> => {
    const generatorSwapEnabled = isFeatureEnabled('generatorSwap');
    const migrationBridgeEnabled = isFeatureEnabled('migrationBridge');

    if (!generatorSwapEnabled) {
        return createLegacyMissionSchedule();
    }

    try {
        const modernSchedule = await createModernMissionSchedule();
        if (migrationBridgeEnabled && modernSchedule.scheduleItems.length === 0) {
            console.warn('Modern generator produced empty schedule; falling back to legacy via migration bridge.');
            return createLegacyMissionSchedule();
        }
        return modernSchedule;
    } catch (error) {
        if (migrationBridgeEnabled) {
            console.warn('Modern generator failed; falling back to legacy via migration bridge.', error);
            return createLegacyMissionSchedule();
        }
        throw error;
    }
};