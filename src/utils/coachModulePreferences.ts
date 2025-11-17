import TrainingModuleCache from '../cache/TrainingModuleCache';
import { getCoachDefaultModules } from '../data/coachModuleMapping';

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
        console.warn('Failed to parse coach module overrides from storage.', error);
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
        console.warn('Failed to persist coach module overrides to storage.', error);
    }
};

export const getCoachOverrideModules = (coachId: string): string[] | undefined => {
    const overrides = readOverrides();
    return overrides[coachId];
};

export const saveCoachOverrideModules = (coachId: string, moduleIds: string[]) => {
    const overrides = readOverrides();
    const uniqueIds = Array.from(new Set(moduleIds));
    overrides[coachId] = uniqueIds;
    writeOverrides(overrides);
    syncCoachModuleSelection(coachId);
};

export const clearCoachOverrideModules = (coachId: string) => {
    const overrides = readOverrides();
    if (overrides[coachId]) {
        delete overrides[coachId];
        writeOverrides(overrides);
        syncCoachModuleSelection(coachId);
    }
};

export const getModulesForCoach = (coachId: string): string[] | undefined => {
    return getCoachOverrideModules(coachId) ?? getCoachDefaultModules(coachId);
};

export const hasCoachOverride = (coachId: string): boolean => {
    const modules = getCoachOverrideModules(coachId);
    return Array.isArray(modules) && modules.length > 0;
};

export const syncCoachModuleSelection = (coachId: string): void => {
    const cache = TrainingModuleCache.getInstance();
    cache.selectModules(getModulesForCoach(coachId));
};
