import UserProgressStore, { UserProgress } from './UserProgressStore';
import { getFeatureFlags } from '../config/featureFlags';

export type PromptFrequency = 'default' | 'reduced' | 'off';

export interface FeatureFlags {
    quietMode: boolean;
    soundsEnabled: boolean;
    promptFrequency: PromptFrequency;
    challengeOptIn: boolean;
    animationsEnabled: boolean;
    recapEnabled: boolean;
    recapShareEnabled: boolean;
    recapAnimationsEnabled: boolean;
    challengeRemindersEnabled: boolean;
    progressEnabled: boolean;
}

const STORAGE_KEY = 'featureFlags:v1';

const defaults: FeatureFlags = {
    quietMode: false,
    soundsEnabled: true,
    promptFrequency: 'default',
    challengeOptIn: true,
    animationsEnabled: true,
    recapEnabled: true,
    recapShareEnabled: true,
    recapAnimationsEnabled: true,
    challengeRemindersEnabled: true,
    progressEnabled: true,
};

const storageAvailable = () => {
    try {
        const key = '__featureFlags:probe__';
        localStorage.setItem(key, '1');
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn('FeatureFlagsStore: localStorage unavailable, falling back to UserProgressStore only', error);
        return false;
    }
};

const loadFromStorage = (): Partial<FeatureFlags> | null => {
    if (!storageAvailable()) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        console.warn('FeatureFlagsStore: failed to parse flags, using defaults', error);
        return null;
    }
};

const persist = (flags: FeatureFlags) => {
    if (!storageAvailable()) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch (error) {
        console.warn('FeatureFlagsStore: failed to persist flags', error);
    }
};

const applyGlobalKillSwitch = (effective: FeatureFlags, killSwitch: boolean): FeatureFlags => {
    if (!killSwitch) return effective;
    return {
        ...effective,
        quietMode: true,
        animationsEnabled: false,
        recapEnabled: false,
        recapShareEnabled: false,
        recapAnimationsEnabled: false,
        challengeRemindersEnabled: false,
        progressEnabled: false,
    };
};

const mergeWithProgress = (flags: Partial<FeatureFlags>) => {
    const progress = UserProgressStore.get();
    const configFlags = getFeatureFlags();
    const baseMerged = { ...defaults, ...configFlags, ...progress.flags, ...flags } as FeatureFlags;
    const mergedFlags = applyGlobalKillSwitch(baseMerged, Boolean(configFlags.globalKillSwitch));
    const payload: UserProgress = {
        ...progress,
        quietMode: flags.quietMode ?? progress.quietMode ?? mergedFlags.quietMode ?? defaults.quietMode,
        flags: mergedFlags,
    };
    UserProgressStore.save(payload);
    return mergedFlags;
};

export const FeatureFlagsStore = {
    get(): FeatureFlags {
        const progress = UserProgressStore.get();
        const stored = loadFromStorage();
        const configFlags = getFeatureFlags();
        const merged = { ...defaults, ...configFlags, ...progress.flags, ...stored } as FeatureFlags;
        const withKill = applyGlobalKillSwitch(merged, Boolean(configFlags.globalKillSwitch));
        return { ...withKill, quietMode: progress.quietMode ?? withKill.quietMode };
    },

    set(flags: Partial<FeatureFlags>) {
        const merged = mergeWithProgress(flags);
        persist({ ...defaults, ...merged });
    },

    toggleQuietMode(enabled: boolean) {
        this.set({ quietMode: enabled, animationsEnabled: enabled ? false : undefined });
    },

    isQuiet() {
        return this.get().quietMode;
    },

    animationsAllowed() {
        const flags = this.get();
        return flags.animationsEnabled && !flags.quietMode;
    },
};

export default FeatureFlagsStore;