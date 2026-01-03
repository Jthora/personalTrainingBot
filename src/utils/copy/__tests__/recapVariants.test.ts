import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { logCopyImpression, selectRecapModalCopy, selectRecapToastCopy } from '../recapVariants';
import * as metrics from '../../metrics';
import FeatureFlagsStore from '../../../store/FeatureFlagsStore';
import { RecapSummary } from '../../../types/RecapSummary';

const baseRecap: RecapSummary = {
    xp: 50,
    xpDelta: 50,
    minutes: 32,
    streakCount: 3,
    streakStatus: 'active',
    level: 2,
    levelProgressPercent: 40,
    xpToNextLevel: 120,
    dailyGoalPercent: 60,
    weeklyGoalPercent: 50,
    badges: [],
};

const flagStub = {
    quietMode: false,
    soundsEnabled: true,
    promptFrequency: 'default' as const,
    challengeOptIn: true,
    animationsEnabled: true,
    recapEnabled: true,
    recapShareEnabled: true,
    recapAnimationsEnabled: true,
    challengeRemindersEnabled: true,
    progressEnabled: true,
};

describe('recapVariants', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        vi.spyOn(metrics, 'recordMetric').mockImplementation(() => {});
        vi.spyOn(FeatureFlagsStore, 'get').mockReturnValue(flagStub as any);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns stable variant within cooldown and logs serve once', () => {
        const recordSpy = vi.spyOn(metrics, 'recordMetric');
        const first = selectRecapToastCopy(baseRecap);
        const second = selectRecapToastCopy(baseRecap);

        expect(second.meta.variantId).toBe(first.meta.variantId);
        const serveEvents = recordSpy.mock.calls.filter(([name]) => name === 'copy_variant_served');
        expect(serveEvents.length).toBe(1);
    });

    it('marks cached selection when within cooldown window', () => {
        const first = selectRecapToastCopy(baseRecap);
        const cached = selectRecapToastCopy(baseRecap);
        expect(cached.meta.fromCache).toBe(true);
        expect(cached.meta.variantId).toBe(first.meta.variantId);
    });

    it('reissues a serve after cooldown elapses', () => {
        vi.useFakeTimers();
        const recordSpy = vi.spyOn(metrics, 'recordMetric');

        selectRecapToastCopy(baseRecap);
        sessionStorage.clear();
        vi.advanceTimersByTime(7 * 60 * 60 * 1000);
        const next = selectRecapToastCopy(baseRecap);

        expect(next.meta.fromCache).toBe(false);
        const serveEvents = recordSpy.mock.calls.filter(([name]) => name === 'copy_variant_served');
        expect(serveEvents.length).toBeGreaterThanOrEqual(2);
    });

    it('logs impressions with variant metadata', () => {
        const recordSpy = vi.spyOn(metrics, 'recordMetric');
        const selection = selectRecapModalCopy(baseRecap);
        logCopyImpression(selection.meta, { foo: 'bar' });

        const impression = recordSpy.mock.calls.find(([name]) => name === 'copy_variant_impression');
        expect(impression?.[1]).toMatchObject({
            surface: 'recap_modal',
            variantId: selection.meta.variantId,
            foo: 'bar',
        });
    });

    it('falls back gracefully when storage is unavailable', () => {
        const originalLocal = global.localStorage;
        const originalSession = global.sessionStorage;
        // Simulate storage failures
        const brokenStorage = {
            setItem: () => { throw new Error('no storage'); },
            getItem: () => { throw new Error('no storage'); },
            removeItem: () => { throw new Error('no storage'); },
            clear: () => { throw new Error('no storage'); },
            key: () => null,
            length: 0,
        } as unknown as Storage;
        // @ts-ignore - test override
        global.localStorage = brokenStorage;
        // @ts-ignore - test override
        global.sessionStorage = brokenStorage;

        const selection = selectRecapToastCopy(baseRecap);
        expect(selection.copy.title).toBeTruthy();
        expect(selection.meta.variantId).toBeDefined();
        expect(selection.meta.fromCache).toBe(false);

        // restore storages
        global.localStorage = originalLocal;
        global.sessionStorage = originalSession;
    });

    it('extends cooldown when prompt frequency is off', () => {
    vi.useFakeTimers();
    vi.spyOn(FeatureFlagsStore, 'get').mockReturnValue({ ...flagStub, promptFrequency: 'off' } as any);

    selectRecapToastCopy(baseRecap);
    vi.advanceTimersByTime(12 * 60 * 60 * 1000);
    const mid = selectRecapToastCopy(baseRecap);
    expect(mid.meta.fromCache).toBe(true);

    vi.advanceTimersByTime(12 * 60 * 60 * 1000);
    const afterDay = selectRecapToastCopy(baseRecap);
    expect(afterDay.meta.fromCache).toBe(false);
    });

    it('recovers when stored variant state is corrupt JSON', () => {
        localStorage.setItem('copyVariants:recap:v1', '{ invalid');
        const selection = selectRecapToastCopy(baseRecap);

        expect(selection.meta.variantId).toBeTruthy();
        expect(selection.meta.fromCache).toBe(false);
    });

    it('recovers serve log when session storage is corrupt', () => {
        sessionStorage.setItem('copyVariants:serves', '{ bad');

        const selection = selectRecapModalCopy(baseRecap);
        logCopyImpression(selection.meta, {});

        // Should still log impression even after resetting serve log
        const recordSpy = vi.spyOn(metrics, 'recordMetric');
        logCopyImpression(selection.meta, {});
        const impressions = recordSpy.mock.calls.filter(([name]) => name === 'copy_variant_impression');
        expect(impressions.length).toBeGreaterThanOrEqual(1);
    });
});
