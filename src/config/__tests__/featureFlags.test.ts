import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => import('../featureFlags');

const mockEnv = (mode: string, featureJson?: string) => {
    vi.stubEnv('VITE_APP_ENV', mode);
    vi.stubEnv('MODE', mode);
    if (featureJson) {
        vi.stubEnv('VITE_FEATURE_FLAGS', featureJson);
    }
    (import.meta as any).env = { MODE: mode, VITE_FEATURE_FLAGS: featureJson };
};

describe('featureFlags', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('uses production defaults when in production', async () => {
        mockEnv('production');
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
        expect(mod.isFeatureEnabled('loadingCacheV2')).toBe(false);
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(false);
        expect(mod.isFeatureEnabled('ipfsContent')).toBe(false);
    });

    it('uses development defaults when in staging', async () => {
        mockEnv('staging');
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(true);
        expect(mod.isFeatureEnabled('loadingCacheV2')).toBe(true);
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(true);
        expect(mod.isFeatureEnabled('ipfsContent')).toBe(false);
    });

    it('honors VITE_FEATURE_FLAGS overrides', async () => {
        mockEnv('staging', JSON.stringify({
            performanceInstrumentation: false,
            p2pIdentity: false,
        }));
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(false);
    });

    it('applies global kill switch across features', async () => {
        mockEnv('development');
        const mod = await loadModule();
        mod.setGlobalKillSwitch(true);
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(false);
    });

    it('reset clears overrides and recomputes env defaults', async () => {
        mockEnv('production');
        let mod = await loadModule();
        mod.setFeatureFlagOverride('p2pIdentity', true);
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(true);
        mod.resetFeatureFlagOverrides();
        // re-import to ensure recompute stays stable with env
        vi.resetModules();
        mockEnv('production');
        mod = await loadModule();
        expect(mod.isFeatureEnabled('p2pIdentity')).toBe(false);
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
    });
});
