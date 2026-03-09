import TrainingModuleCache from '../cache/TrainingModuleCache';
import { getCoachDefaultModules } from '../data/handlerModuleMapping';
import { isFeatureEnabled } from '../config/featureFlags';
import OperativeProfileStore from '../store/OperativeProfileStore';
import { resolveModulesForArchetype } from './archetypeModuleResolver';

const OVERRIDES_STORAGE_KEY = 'coachModuleOverrides';

type CoachModuleOverrides = Record<string, string[]>;

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readOverrides = (): CoachModuleOverrides => {
    if (!isBrowser()) {
        return {};
    }

    try {
        const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw) as CoachModuleOverrides;
        return parsed || {};
    } catch (error) {
        console.warn('Failed to parse handler module overrides from storage.', error);
        return {};
    }
};

const writeOverrides = (overrides: CoachModuleOverrides) => {
    if (!isBrowser()) {
        return;
    }

    try {
        window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
        console.warn('Failed to persist handler module overrides to storage.', error);
    }
};

export const getHandlerOverrideModules = (coachId: string): string[] | undefined => {
    const overrides = readOverrides();
    return overrides[coachId];
};

export const saveHandlerOverrideModules = (coachId: string, moduleIds: string[]) => {
    const overrides = readOverrides();
    const uniqueIds = Array.from(new Set(moduleIds));
    overrides[coachId] = uniqueIds;
    writeOverrides(overrides);
    syncHandlerModuleSelection(coachId);
};

export const clearHandlerOverrideModules = (coachId: string) => {
    const overrides = readOverrides();
    if (overrides[coachId]) {
        delete overrides[coachId];
        writeOverrides(overrides);
        syncHandlerModuleSelection(coachId);
    }
};

export const getModulesForHandler = (coachId: string): string[] | undefined => {
    // Priority: user overrides > archetype modules > handler defaults
    const overrides = getHandlerOverrideModules(coachId);
    if (overrides) return overrides;

    if (isFeatureEnabled('archetypeSystem')) {
        const profile = OperativeProfileStore.get();
        if (profile?.archetypeId) {
            const archetypeModules = resolveModulesForArchetype(profile.archetypeId);
            if (archetypeModules && archetypeModules.length > 0) return archetypeModules;
        }
    }

    return getCoachDefaultModules(coachId);
};

export const hasHandlerOverride = (coachId: string): boolean => {
    const modules = getHandlerOverrideModules(coachId);
    return Array.isArray(modules) && modules.length > 0;
};

export const syncHandlerModuleSelection = (coachId: string): void => {
    const cache = TrainingModuleCache.getInstance();
    cache.selectModules(getModulesForHandler(coachId));
};
