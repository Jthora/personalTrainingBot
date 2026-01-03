import { describe, expect, it, beforeEach, vi } from 'vitest';
import FeatureFlagsStore from '../FeatureFlagsStore';
import UserProgressStore from '../UserProgressStore';
import { getFeatureFlags } from '../../config/featureFlags';

const mockConfigFlags = {
    generatorSwap: true,
    calendarSurface: false,
    migrationBridge: false,
    globalKillSwitch: false,
};

vi.mock('../../config/featureFlags', () => ({
    getFeatureFlags: vi.fn(() => ({ ...mockConfigFlags })),
}));

vi.mock('../UserProgressStore', () => {
    let state = {
        quietMode: false,
        flags: {
            recapEnabled: true,
            recapShareEnabled: true,
            recapAnimationsEnabled: true,
            challengesEnabled: true,
            challengeRemindersEnabled: true,
            badgeStripEnabled: true,
            progressEnabled: true,
        },
    } as any;

    return {
        default: {
            get: vi.fn(() => ({ ...state })),
            save: vi.fn((next) => { state = { ...state, ...next }; }),
        },
    };
});

const mockStorage: Record<string, string> = {};

const installMockStorage = () => {
    // @ts-expect-error mock
    global.localStorage = {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, value: string) => { mockStorage[key] = value; },
        removeItem: (key: string) => { delete mockStorage[key]; },
    };
};

describe('FeatureFlagsStore', () => {
    beforeEach(() => {
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
        installMockStorage();
        vi.clearAllMocks();
    vi.mocked(getFeatureFlags).mockImplementation(() => ({ ...mockConfigFlags }));
        mockConfigFlags.globalKillSwitch = false;
        mockConfigFlags.calendarSurface = false;
        UserProgressStore.save({
            quietMode: undefined as any,
            flags: {
                recapEnabled: true,
                recapShareEnabled: true,
                recapAnimationsEnabled: true,
                challengeRemindersEnabled: true,
                progressEnabled: true,
                animationsEnabled: true,
                soundsEnabled: true,
                promptFrequency: 'default',
                challengeOptIn: true,
            },
        } as any);
    });

    it('returns defaults when none set', () => {
        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(false);
        expect(flags.recapEnabled).toBe(true);
        expect(flags.challengeRemindersEnabled).toBe(true);
    });

    it('persists and merges updates', () => {
        FeatureFlagsStore.set({ quietMode: true, soundsEnabled: false, promptFrequency: 'reduced' });
        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(true);
        expect(flags.soundsEnabled).toBe(false);
        expect(flags.promptFrequency).toBe('reduced');
    });

    it('toggleQuietMode disables animations', () => {
        FeatureFlagsStore.toggleQuietMode(true);
        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(true);
        expect(flags.animationsEnabled).toBe(false);
        expect(FeatureFlagsStore.animationsAllowed()).toBe(false);
    });

    it('respects quiet mode for animationsAllowed helper', () => {
        FeatureFlagsStore.set({ quietMode: false, animationsEnabled: true });
        expect(FeatureFlagsStore.animationsAllowed()).toBe(true);
        FeatureFlagsStore.set({ quietMode: true });
        expect(FeatureFlagsStore.animationsAllowed()).toBe(false);
    });

    it('applies global kill switch to gate recap/progress surfaces', () => {
        mockConfigFlags.globalKillSwitch = true;
        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(true);
        expect(flags.recapEnabled).toBe(false);
        expect(flags.recapShareEnabled).toBe(false);
        expect(flags.animationsEnabled).toBe(false);
        expect(flags.progressEnabled).toBe(false);
    });

    it('returns defaults when stored flags are malformed JSON', () => {
        mockStorage['featureFlags:v1'] = '{ bad json';
        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(false);
        expect(flags.recapEnabled).toBe(true);
    });

    it('falls back gracefully when storage is unavailable during persist', () => {
        const setItemSpy = vi.spyOn(global.localStorage, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });

        expect(() => FeatureFlagsStore.set({ quietMode: true, recapEnabled: false })).not.toThrow();

        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(true);
        expect(flags.recapEnabled).toBe(false);

        setItemSpy.mockRestore();
    });

    it('prefers progress quietMode over stored value', () => {
        FeatureFlagsStore.set({ quietMode: true });
        mockStorage['featureFlags:v1'] = JSON.stringify({ quietMode: false, recapEnabled: true });

        const flags = FeatureFlagsStore.get();
        expect(flags.quietMode).toBe(true);
    });
});
