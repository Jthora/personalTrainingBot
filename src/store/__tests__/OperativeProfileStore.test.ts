import { beforeEach, describe, expect, it, vi } from 'vitest';
import OperativeProfileStore from '../OperativeProfileStore';
import type { OperativeProfile } from '../OperativeProfileStore';

const SAMPLE_PROFILE: OperativeProfile = {
    archetypeId: 'rescue_ranger',
    handlerId: 'tiger_fitness_god',
    callsign: 'Phoenix',
    enrolledAt: '2026-01-01T00:00:00.000Z',
};

describe('OperativeProfileStore', () => {
    beforeEach(() => {
        localStorage.clear();
        OperativeProfileStore.reset();
    });

    describe('get / set', () => {
        it('returns null when no profile exists', () => {
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('persists and retrieves a profile', () => {
            OperativeProfileStore.set(SAMPLE_PROFILE);
            const result = OperativeProfileStore.get();
            expect(result).toEqual(SAMPLE_PROFILE);
        });

        it('writes to localStorage under the correct key', () => {
            OperativeProfileStore.set(SAMPLE_PROFILE);
            const raw = localStorage.getItem('operative:profile:v1');
            expect(raw).toBeTruthy();
            expect(JSON.parse(raw!)).toEqual(SAMPLE_PROFILE);
        });
    });

    describe('patch', () => {
        it('updates only specified fields', () => {
            OperativeProfileStore.set(SAMPLE_PROFILE);
            OperativeProfileStore.patch({ callsign: 'Raven' });
            const result = OperativeProfileStore.get();
            expect(result!.callsign).toBe('Raven');
            expect(result!.archetypeId).toBe('rescue_ranger');
        });

        it('does nothing when no profile exists', () => {
            OperativeProfileStore.patch({ callsign: 'Ghost' });
            expect(OperativeProfileStore.get()).toBeNull();
        });
    });

    describe('reset', () => {
        it('removes profile from storage', () => {
            OperativeProfileStore.set(SAMPLE_PROFILE);
            OperativeProfileStore.reset();
            expect(OperativeProfileStore.get()).toBeNull();
            expect(localStorage.getItem('operative:profile:v1')).toBeNull();
        });
    });

    describe('subscribe', () => {
        it('fires listener on set', () => {
            const listener = vi.fn();
            const unsub = OperativeProfileStore.subscribe(listener);
            OperativeProfileStore.set(SAMPLE_PROFILE);
            expect(listener).toHaveBeenCalledTimes(1);
            unsub();
        });

        it('fires listener on patch', () => {
            OperativeProfileStore.set(SAMPLE_PROFILE);
            const listener = vi.fn();
            const unsub = OperativeProfileStore.subscribe(listener);
            OperativeProfileStore.patch({ callsign: 'Raven' });
            // patch calls set internally, so listener should fire
            expect(listener).toHaveBeenCalled();
            unsub();
        });

        it('fires listener on reset', () => {
            const listener = vi.fn();
            const unsub = OperativeProfileStore.subscribe(listener);
            OperativeProfileStore.reset();
            expect(listener).toHaveBeenCalledTimes(1);
            unsub();
        });

        it('stops firing after unsubscribe', () => {
            const listener = vi.fn();
            const unsub = OperativeProfileStore.subscribe(listener);
            unsub();
            OperativeProfileStore.set(SAMPLE_PROFILE);
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('getVersion', () => {
        it('increments on each mutation', () => {
            const v1 = OperativeProfileStore.getVersion();
            OperativeProfileStore.set(SAMPLE_PROFILE);
            const v2 = OperativeProfileStore.getVersion();
            OperativeProfileStore.reset();
            const v3 = OperativeProfileStore.getVersion();
            expect(v2).toBe(v1 + 1);
            expect(v3).toBe(v2 + 1);
        });
    });

    describe('safeParse validation', () => {
        it('rejects invalid JSON', () => {
            localStorage.setItem('operative:profile:v1', 'not-json');
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('rejects profile missing archetypeId', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify({
                handlerId: 'tiger_fitness_god',
                callsign: 'Test',
            }));
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('rejects profile missing handlerId', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify({
                archetypeId: 'rescue_ranger',
                callsign: 'Test',
            }));
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('rejects profile with empty archetypeId', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify({
                archetypeId: '',
                handlerId: 'tiger_fitness_god',
            }));
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('defaults callsign to empty string if missing', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify({
                archetypeId: 'rescue_ranger',
                handlerId: 'tiger_fitness_god',
                enrolledAt: '2026-01-01T00:00:00.000Z',
            }));
            const result = OperativeProfileStore.get();
            expect(result).not.toBeNull();
            expect(result!.callsign).toBe('');
        });

        it('defaults enrolledAt if missing', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify({
                archetypeId: 'rescue_ranger',
                handlerId: 'tiger_fitness_god',
            }));
            const result = OperativeProfileStore.get();
            expect(result).not.toBeNull();
            expect(result!.enrolledAt).toBeTruthy();
        });

        it('rejects non-object values', () => {
            localStorage.setItem('operative:profile:v1', JSON.stringify('string-value'));
            expect(OperativeProfileStore.get()).toBeNull();
        });

        it('rejects null', () => {
            localStorage.setItem('operative:profile:v1', 'null');
            expect(OperativeProfileStore.get()).toBeNull();
        });
    });
});
