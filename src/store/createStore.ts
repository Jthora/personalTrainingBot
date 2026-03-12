/** Generic localStorage-backed store factory. Domain logic composes on top. */

// Types -------------------------------------------------------------------

export type Listener<T> = (state: T) => void;

export interface StoreOptions<T> {
    key: string;
    defaultValue: T;
    /** Version suffix appended to key (`key:v{version}`). */
    version?: number;
    /** Validate parsed JSON — return `null` to fall back to `defaultValue`. */
    validate?: (raw: unknown) => T | null;
    /** Cap array length after every write (drops oldest). */
    maxEntries?: number;
}

export interface Store<T> {
    get(): T;
    set(value: T): void;
    update(fn: (prev: T) => T): void;
    /** Immediate call + subsequent changes. Returns unsubscribe. */
    subscribe(listener: Listener<T>): () => void;
    reset(): void;
    /** Re-read from localStorage (cross-tab / external writes). */
    hydrate(): void;
    readonly storageKey: string;
}

// Helpers -----------------------------------------------------------------

const isBrowser = (): boolean =>
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function resolveKey(key: string, version?: number): string {
    return version != null ? `${key}:v${version}` : key;
}
// Factory -----------------------------------------------------------------

export function createStore<T>(options: StoreOptions<T>): Store<T> {
    const { defaultValue, validate, maxEntries } = options;
    const storageKey = resolveKey(options.key, options.version);
    const listeners = new Set<Listener<T>>();

    function readFromStorage(): T {
        if (!isBrowser()) return defaultValue;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (raw === null) return defaultValue;
            const parsed: unknown = JSON.parse(raw);
            if (validate) {
                const validated = validate(parsed);
                return validated !== null ? validated : defaultValue;
            }
            return parsed as T;
        } catch {
            return defaultValue;
        }
    }

    function writeToStorage(value: T): void {
        if (!isBrowser()) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (err) {
            console.warn(`[createStore] Failed to persist "${storageKey}":`, err);
        }
    }

    function capEntries(value: T): T {
        if (maxEntries != null && Array.isArray(value) && value.length > maxEntries) {
            return value.slice(-maxEntries) as unknown as T;
        }
        return value;
    }

    function notify(snapshot: T): void {
        listeners.forEach((fn) => {
            try { fn(snapshot); } catch (err) {
                console.error(`[createStore] Listener error for "${storageKey}":`, err);
            }
        });
    }

    const store: Store<T> = {
        get storageKey() { return storageKey; },

        get(): T { return readFromStorage(); },

        set(value: T): void {
            const capped = capEntries(value);
            writeToStorage(capped);
            notify(capped);
        },

        update(fn: (prev: T) => T): void { store.set(fn(store.get())); },

        subscribe(listener: Listener<T>): () => void {
            listeners.add(listener);
            try { listener(store.get()); } catch (err) {
                console.error(`[createStore] Listener error for "${storageKey}":`, err);
            }
            return () => { listeners.delete(listener); };
        },

        reset(): void {
            if (isBrowser()) {
                try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
            }
            notify(defaultValue);
        },

        hydrate(): void { notify(readFromStorage()); },
    };

    return store;
}
