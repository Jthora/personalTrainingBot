import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../createStore';

describe('createStore', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('returns defaultValue when localStorage is empty', () => {
        const store = createStore({ key: 'test:empty', defaultValue: 42 });
        expect(store.get()).toBe(42);
    });

    it('reads and parses from localStorage', () => {
        localStorage.setItem('test:read', JSON.stringify({ name: 'alpha' }));
        const store = createStore({ key: 'test:read', defaultValue: { name: '' } });
        expect(store.get()).toEqual({ name: 'alpha' });
    });

    it('writes and notifies on set()', () => {
        const store = createStore({ key: 'test:set', defaultValue: 'init' });
        const spy = vi.fn();
        store.subscribe(spy);
        spy.mockClear(); // ignore initial call

        store.set('updated');
        expect(store.get()).toBe('updated');
        expect(JSON.parse(localStorage.getItem('test:set')!)).toBe('updated');
        expect(spy).toHaveBeenCalledWith('updated');
    });

    it('applies functional transform on update()', () => {
        const store = createStore({ key: 'test:update', defaultValue: [1, 2] });
        store.update(prev => [...prev, 3]);
        expect(store.get()).toEqual([1, 2, 3]);
        expect(JSON.parse(localStorage.getItem('test:update')!)).toEqual([1, 2, 3]);
    });

    it('returns unsubscribe function from subscribe()', () => {
        const store = createStore({ key: 'test:unsub', defaultValue: 0 });
        const spy = vi.fn();
        const unsub = store.subscribe(spy);
        spy.mockClear();

        store.set(1);
        expect(spy).toHaveBeenCalledTimes(1);

        unsub();
        store.set(2);
        expect(spy).toHaveBeenCalledTimes(1); // not called again
    });

    it('resets to defaultValue on reset()', () => {
        const store = createStore({ key: 'test:reset', defaultValue: 'original' });
        store.set('changed');
        store.reset();
        expect(store.get()).toBe('original');
        // reset() removes the key; get() returns defaultValue
        expect(localStorage.getItem('test:reset')).toBeNull();
    });

    it('re-reads from localStorage on hydrate() and notifies', () => {
        const store = createStore({ key: 'test:hydrate', defaultValue: 0 });
        store.set(10);

        // External write — simulates cross-tab update
        localStorage.setItem('test:hydrate', JSON.stringify(99));
        expect(store.get()).toBe(99); // always reads from localStorage

        const spy = vi.fn();
        store.subscribe(spy);
        spy.mockClear();
        store.hydrate();
        expect(spy).toHaveBeenCalledWith(99);
    });

    it('falls back to default on corrupt JSON', () => {
        localStorage.setItem('test:corrupt', '{ broken json !!!');
        const store = createStore({ key: 'test:corrupt', defaultValue: 'safe' });
        expect(store.get()).toBe('safe');
    });

    it('falls back to default on validation failure', () => {
        localStorage.setItem('test:validate', JSON.stringify('not-a-number'));
        const store = createStore({
            key: 'test:validate',
            defaultValue: 0,
            validate: (raw) => typeof raw === 'number' ? raw : null,
        });
        expect(store.get()).toBe(0);
    });

    it('returns validated value when validation succeeds', () => {
        localStorage.setItem('test:validate-ok', JSON.stringify(42));
        const store = createStore({
            key: 'test:validate-ok',
            defaultValue: 0,
            validate: (raw) => typeof raw === 'number' ? raw : null,
        });
        expect(store.get()).toBe(42);
    });

    it('caps array length when maxEntries is set', () => {
        const store = createStore<number[]>({
            key: 'test:cap',
            defaultValue: [],
            maxEntries: 3,
        });
        store.set([1, 2, 3, 4, 5]);
        expect(store.get()).toEqual([3, 4, 5]);
        expect(JSON.parse(localStorage.getItem('test:cap')!)).toEqual([3, 4, 5]);
    });

    it('catches listener errors without breaking other subscribers', () => {
        const store = createStore({ key: 'test:error', defaultValue: 0 });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const badListener = () => { throw new Error('boom'); };
        const goodListener = vi.fn();

        store.subscribe(badListener);
        store.subscribe(goodListener);
        goodListener.mockClear();

        store.set(1);
        expect(goodListener).toHaveBeenCalledWith(1);
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('applies version suffix to key when specified', () => {
        const store = createStore({ key: 'test:versioned', defaultValue: 'v2data', version: 2 });
        store.set('v2data');
        expect(localStorage.getItem('test:versioned:v2')).toBe(JSON.stringify('v2data'));
        expect(store.storageKey).toBe('test:versioned:v2');
    });

    it('calls subscriber immediately with current value on subscribe()', () => {
        const store = createStore({ key: 'test:immediate', defaultValue: 'hello' });
        store.set('world');
        const spy = vi.fn();
        store.subscribe(spy);
        expect(spy).toHaveBeenCalledWith('world');
    });

    it('handles undefined localStorage gracefully (SSR)', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('not available');
        });
        const store = createStore({ key: 'test:ssr', defaultValue: 'fallback' });
        expect(store.get()).toBe('fallback');
        getItemSpy.mockRestore();
    });
});
