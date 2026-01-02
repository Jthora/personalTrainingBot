export type FeatureFlagKey = 'generatorSwap' | 'calendarSurface' | 'migrationBridge';

export type FeatureFlagConfig = Record<FeatureFlagKey, boolean>;

const LOCAL_STORAGE_KEY = 'featureFlagOverrides';

const DEFAULT_FLAGS: FeatureFlagConfig = {
    generatorSwap: true,
    calendarSurface: false,
    migrationBridge: false,
};

const parseOverrides = (): Partial<FeatureFlagConfig> => {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return Object.entries(parsed).reduce<Partial<FeatureFlagConfig>>((acc, [key, value]) => {
            if (isFeatureFlagKey(key) && typeof value === 'boolean') {
                acc[key] = value;
            }
            return acc;
        }, {});
    } catch (error) {
        console.warn('featureFlags: failed to parse overrides, ignoring', error);
        return {};
    }
};

const envOverrides = (): Partial<FeatureFlagConfig> => {
    // Supports a JSON string in VITE_FEATURE_FLAGS, e.g. '{"calendarSurface":true}'
    const envValue = (import.meta as any).env?.VITE_FEATURE_FLAGS as string | undefined;
    if (!envValue) {
        return {};
    }
    try {
        const parsed = JSON.parse(envValue) as Record<string, unknown>;
        return Object.entries(parsed).reduce<Partial<FeatureFlagConfig>>((acc, [key, value]) => {
            if (isFeatureFlagKey(key) && typeof value === 'boolean') {
                acc[key] = value;
            }
            return acc;
        }, {});
    } catch (error) {
        console.warn('featureFlags: failed to parse VITE_FEATURE_FLAGS, ignoring', error);
        return {};
    }
};

let resolvedFlags: FeatureFlagConfig = {
    ...DEFAULT_FLAGS,
    ...envOverrides(),
    ...parseOverrides(),
};

const persistOverrides = (flags: FeatureFlagConfig) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flags));
};

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => resolvedFlags[flag];

export const getFeatureFlags = (): FeatureFlagConfig => ({ ...resolvedFlags });

export const setFeatureFlagOverride = (flag: FeatureFlagKey, value: boolean): FeatureFlagConfig => {
    resolvedFlags = { ...resolvedFlags, [flag]: value };
    persistOverrides(resolvedFlags);
    return getFeatureFlags();
};

export const resetFeatureFlagOverrides = (): FeatureFlagConfig => {
    resolvedFlags = { ...DEFAULT_FLAGS, ...envOverrides() };
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return getFeatureFlags();
};

const isFeatureFlagKey = (key: string): key is FeatureFlagKey => {
    return ['generatorSwap', 'calendarSurface', 'migrationBridge'].includes(key);
};
