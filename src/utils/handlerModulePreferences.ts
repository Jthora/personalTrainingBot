import TrainingModuleCache from '../cache/TrainingModuleCache';
import { getHandlerDefaultModules } from '../data/handlerModuleMapping';
import OperativeProfileStore from '../store/OperativeProfileStore';
import { resolveModulesForArchetype } from './archetypeModuleResolver';

const OVERRIDES_STORAGE_KEY = 'coachModuleOverrides';

type HandlerModuleOverrides = Record<string, string[]>;

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readOverrides = (): HandlerModuleOverrides => {
    if (!isBrowser()) {
        return {};
    }

    try {
        const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw) as HandlerModuleOverrides;
        return parsed || {};
    } catch (error) {
        console.warn('Failed to parse handler module overrides from storage.', error);
        return {};
    }
};

const writeOverrides = (overrides: HandlerModuleOverrides) => {
    if (!isBrowser()) {
        return;
    }

    try {
        window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
        console.warn('Failed to persist handler module overrides to storage.', error);
    }
};

export const getHandlerOverrideModules = (handlerId: string): string[] | undefined => {
    const overrides = readOverrides();
    return overrides[handlerId];
};

export const saveHandlerOverrideModules = (handlerId: string, moduleIds: string[]) => {
    const overrides = readOverrides();
    const uniqueIds = Array.from(new Set(moduleIds));
    overrides[handlerId] = uniqueIds;
    writeOverrides(overrides);
    syncHandlerModuleSelection(handlerId);
};

export const clearHandlerOverrideModules = (handlerId: string) => {
    const overrides = readOverrides();
    if (overrides[handlerId]) {
        delete overrides[handlerId];
        writeOverrides(overrides);
        syncHandlerModuleSelection(handlerId);
    }
};

export const getModulesForHandler = (handlerId: string): string[] | undefined => {
    // Priority: user overrides > archetype modules > handler defaults
    const overrides = getHandlerOverrideModules(handlerId);
    if (overrides) return overrides;

    const profile = OperativeProfileStore.get();
    if (profile?.archetypeId) {
        const archetypeModules = resolveModulesForArchetype(profile.archetypeId);
        if (archetypeModules && archetypeModules.length > 0) return archetypeModules;
    }

    return getHandlerDefaultModules(handlerId);
};

export const hasHandlerOverride = (handlerId: string): boolean => {
    const modules = getHandlerOverrideModules(handlerId);
    return Array.isArray(modules) && modules.length > 0;
};

export const syncHandlerModuleSelection = (handlerId: string): void => {
    const cache = TrainingModuleCache.getInstance();
    cache.selectModules(getModulesForHandler(handlerId));
};
