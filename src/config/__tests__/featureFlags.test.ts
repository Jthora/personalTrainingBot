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

    it('uses production mission-first defaults when in production', async () => {
        mockEnv('production');
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('calendarSurface')).toBe(false);
        expect(mod.isFeatureEnabled('migrationBridge')).toBe(false);
        expect(mod.isFeatureEnabled('generatorSwap')).toBe(true);
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
        expect(mod.isFeatureEnabled('canonicalReadPath')).toBe(false);
        expect(mod.isFeatureEnabled('missionDefaultRoutes')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceBrief')).toBe(true);
    });

    it('uses mission-first defaults when in staging', async () => {
        mockEnv('staging');
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('missionDefaultRoutes')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceBrief')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceTriage')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceCase')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceSignal')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceChecklist')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceDebrief')).toBe(true);
    });

    it('honors VITE_FEATURE_FLAGS overrides', async () => {
        mockEnv('staging', JSON.stringify({
            calendarSurface: false,
            migrationBridge: true,
            performanceInstrumentation: false,
            canonicalReadPath: true,
            missionDefaultRoutes: true,
            missionSurfaceBrief: true,
            missionSurfaceTriage: true,
        }));
        const mod = await loadModule();
        expect(mod.isFeatureEnabled('calendarSurface')).toBe(false);
        expect(mod.isFeatureEnabled('migrationBridge')).toBe(true);
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
        expect(mod.isFeatureEnabled('canonicalReadPath')).toBe(true);
        expect(mod.isFeatureEnabled('missionDefaultRoutes')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceBrief')).toBe(true);
        expect(mod.isFeatureEnabled('missionSurfaceTriage')).toBe(true);
    });

    it('applies global kill switch across features', async () => {
        mockEnv('development');
        const mod = await loadModule();
        mod.setGlobalKillSwitch(true);
        expect(mod.isFeatureEnabled('generatorSwap')).toBe(false);
        expect(mod.isFeatureEnabled('calendarSurface')).toBe(false);
    });

    it('reset clears overrides and recomputes env defaults', async () => {
        mockEnv('production');
        let mod = await loadModule();
        mod.setFeatureFlagOverride('calendarSurface', true);
        expect(mod.isFeatureEnabled('calendarSurface')).toBe(true);
        mod.resetFeatureFlagOverrides();
        // re-import to ensure recompute stays stable with env
        vi.resetModules();
        mockEnv('production');
        mod = await loadModule();
        expect(mod.isFeatureEnabled('calendarSurface')).toBe(false);
        expect(mod.isFeatureEnabled('performanceInstrumentation')).toBe(false);
    });
});
