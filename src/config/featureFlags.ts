import { getAppEnv, AppEnv } from './env';

export type FeatureFlagKey =
    | 'performanceInstrumentation'
    | 'loadingCacheV2'
    | 'p2pIdentity'
    | 'ipfsContent';

type GlobalFlagKey = 'globalKillSwitch';

export type FeatureFlagConfig = Record<FeatureFlagKey, boolean> & Record<GlobalFlagKey, boolean>;

const LOCAL_STORAGE_KEY = 'featureFlagOverrides';

const DEFAULT_FLAGS: FeatureFlagConfig = {
    performanceInstrumentation: false,
    loadingCacheV2: false,
    p2pIdentity: false,
    ipfsContent: false,
    globalKillSwitch: false,
};

const ENV_DEFAULT_FLAGS: Record<AppEnv, Partial<FeatureFlagConfig>> = {
    development: {
        performanceInstrumentation: true,
        loadingCacheV2: true,
        p2pIdentity: true,
        ipfsContent: true,
        globalKillSwitch: false,
    },
    staging: {
        performanceInstrumentation: true,
        loadingCacheV2: true,
        p2pIdentity: true,
        ipfsContent: false,
        globalKillSwitch: false,
    },
    production: {
        performanceInstrumentation: false,
        loadingCacheV2: false,
        p2pIdentity: false,
        ipfsContent: false,
        globalKillSwitch: false,
    },
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
    const envValue = ((import.meta as any).env?.VITE_FEATURE_FLAGS as string | undefined) || process.env.VITE_FEATURE_FLAGS;
    if (!envValue) {
        return {};
    }
    try {
        const parsed = JSON.parse(envValue) as Record<string, unknown>;
        return Object.entries(parsed).reduce<Partial<FeatureFlagConfig>>((acc, [key, value]) => {
            if ((isFeatureFlagKey(key) || isGlobalFlagKey(key)) && typeof value === 'boolean') {
                acc[key as FeatureFlagKey | GlobalFlagKey] = value;
            }
            return acc;
        }, {});
    } catch (error) {
        console.warn('featureFlags: failed to parse VITE_FEATURE_FLAGS, ignoring', error);
        return {};
    }
};

const computeResolvedFlags = (): FeatureFlagConfig => {
    const env = getAppEnv();
    return {
        ...DEFAULT_FLAGS,
        ...(ENV_DEFAULT_FLAGS[env] ?? {}),
        ...envOverrides(),
        ...parseOverrides(),
    };
};

let resolvedFlags: FeatureFlagConfig = computeResolvedFlags();

const persistOverrides = (flags: FeatureFlagConfig) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flags));
};

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
    if (resolvedFlags.globalKillSwitch) {
        return false;
    }
    return resolvedFlags[flag];
};

export const getFeatureFlags = (): FeatureFlagConfig => ({ ...resolvedFlags });

export const setFeatureFlagOverride = (flag: FeatureFlagKey, value: boolean): FeatureFlagConfig => {
    resolvedFlags = { ...resolvedFlags, [flag]: value };
    persistOverrides(resolvedFlags);
    return getFeatureFlags();
};

export const setGlobalKillSwitch = (enabled: boolean): FeatureFlagConfig => {
    resolvedFlags = { ...resolvedFlags, globalKillSwitch: enabled };
    persistOverrides(resolvedFlags);
    return getFeatureFlags();
};

export const resetFeatureFlagOverrides = (): FeatureFlagConfig => {
    resolvedFlags = computeResolvedFlags();
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return getFeatureFlags();
};

function isFeatureFlagKey(key: string): key is FeatureFlagKey {
    return [
        'performanceInstrumentation',
        'loadingCacheV2',
        'p2pIdentity',
        'ipfsContent',
    ].includes(key);
}

function isGlobalFlagKey(key: string): key is GlobalFlagKey {
    return key === 'globalKillSwitch';
}
