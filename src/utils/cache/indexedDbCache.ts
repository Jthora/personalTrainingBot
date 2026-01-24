import { CACHE_DB_NAME, CACHE_DB_VERSION, CACHE_STORES, APP_VERSION, CACHE_SCHEMA_VERSION } from './constants';
import type { CachedEntry, CacheResult, CacheSource } from './types';

const isBrowser = typeof window !== 'undefined';
const supportsIndexedDb = isBrowser && typeof indexedDB !== 'undefined';

const localKey = (store: (typeof CACHE_STORES)[number], key: IDBValidKey) => `ptb-cache:${store}:${String(key)}`;
const hasLocalStorage = (): boolean => {
    if (!isBrowser || typeof localStorage === 'undefined') return false;
    try {
        const probeKey = '__ptb_cache_probe__';
        localStorage.setItem(probeKey, '1');
        localStorage.removeItem(probeKey);
        return true;
    } catch (error) {
        console.warn('cache:localStorage unavailable', error);
        return false;
    }
};

const isCacheDisabled = (): boolean => {
    if (!hasLocalStorage()) return false;
    try {
        return localStorage.getItem('DEBUG_CACHE_DISABLE') === 'true';
    } catch {
        return false;
    }
};

const getCachedFromLocal = <T>(store: (typeof CACHE_STORES)[number], key: IDBValidKey): CachedEntry<T> | null => {
    if (!hasLocalStorage()) return null;
    const raw = localStorage.getItem(localKey(store, key));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as CachedEntry<T>;
    } catch (error) {
        console.warn('cache:local parse failed', error);
        return null;
    }
};

const setCachedToLocal = <T>(store: (typeof CACHE_STORES)[number], key: IDBValidKey, entry: CachedEntry<T>): void => {
    if (!hasLocalStorage()) return;
    try {
        localStorage.setItem(localKey(store, key), JSON.stringify(entry));
    } catch (error) {
        console.warn('cache:local set failed', error);
    }
};

const clearLocalStore = (store: (typeof CACHE_STORES)[number]): void => {
    if (!hasLocalStorage()) return;
    const prefix = `ptb-cache:${store}:`;
    Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(prefix)) {
            localStorage.removeItem(k);
        }
    });
};

const ensureSchemaVersion = (db: IDBDatabase): Promise<void> => {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(CACHE_STORES, 'readwrite');
        const metaStore = tx.objectStore('meta');
        const getReq = metaStore.get('schemaVersion');

        getReq.onsuccess = () => {
            const existing = getReq.result as { schemaVersion?: number } | undefined;
            const needsReset = !existing || existing.schemaVersion !== CACHE_SCHEMA_VERSION;

            if (needsReset) {
                CACHE_STORES.forEach((store) => {
                    if (store === 'meta') return;
                    tx.objectStore(store).clear();
                });
                metaStore.put({ schemaVersion: CACHE_SCHEMA_VERSION, updatedAt: now() }, 'schemaVersion');
            }
        };

        getReq.onerror = () => reject(getReq.error ?? new Error('meta read failed'));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('schema version transaction failed'));
    });
};

const openDB = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        if (!supportsIndexedDb) {
            return reject(new Error('indexedDB not available'));
        }
        const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            CACHE_STORES.forEach((store) => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store);
                }
            });
        };
        request.onsuccess = () => {
            const db = request.result;
            ensureSchemaVersion(db)
                .then(() => resolve(db))
                .catch((err) => reject(err));
        };
        request.onerror = () => reject(request.error ?? new Error('indexedDB open failed'));
    });

export async function resetCacheSchema(): Promise<void> {
    if (!isBrowser) return;
    if (supportsIndexedDb) {
        await new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(CACHE_DB_NAME);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error ?? new Error('indexedDB delete failed'));
            req.onblocked = () => {
                console.warn('cache: deleteDatabase blocked');
            };
        }).catch((error) => console.warn('cache: reset schema failed', error));
    }
    CACHE_STORES.forEach(clearLocalStore);
}

const runTx = async <T>(storeName: (typeof CACHE_STORES)[number], mode: IDBTransactionMode, fn: (store: IDBObjectStore) => void): Promise<T> => {
    const db = await openDB();
    return new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let result: T;
        try {
            result = fn(store) as unknown as T;
        } catch (error) {
            reject(error);
            return;
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('transaction failed'));
    });
};

export async function getCached<T>(store: (typeof CACHE_STORES)[number], key: IDBValidKey): Promise<CachedEntry<T> | null> {
    try {
        if (!supportsIndexedDb) {
            return getCachedFromLocal<T>(store, key);
        }
        return await runTx<CachedEntry<T> | null>(store, 'readonly', (s) => s.get(key) as unknown as CachedEntry<T> | null);
    } catch (error) {
        console.warn('cache:getCached failed; falling back to localStorage', error);
        return getCachedFromLocal<T>(store, key);
    }
}

export async function setCached<T>(store: (typeof CACHE_STORES)[number], key: IDBValidKey, entry: CachedEntry<T>): Promise<void> {
    try {
        if (supportsIndexedDb) {
            await runTx(store, 'readwrite', (s) => {
                s.put(entry, key);
            });
            return;
        }
    } catch (error) {
        console.warn('cache:setCached failed in indexedDB; attempting localStorage', error);
    }
    setCachedToLocal(store, key, entry);
}

export async function clearStore(store: (typeof CACHE_STORES)[number]): Promise<void> {
    try {
        if (supportsIndexedDb) {
            await runTx(store, 'readwrite', (s) => s.clear());
        }
    } catch (error) {
        console.warn('cache:clearStore failed', error);
    } finally {
        clearLocalStore(store);
    }
}

export async function clearAll(): Promise<void> {
    if (!isBrowser) return;
    await Promise.all(CACHE_STORES.map((store) => clearStore(store)));
}

export const now = () => Date.now();

const emitCacheEvent = (detail: { store: (typeof CACHE_STORES)[number]; key: IDBValidKey; source: CacheSource; stale?: boolean }) => {
    if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
    try {
        window.dispatchEvent(new CustomEvent('ptb-cache-status', { detail }));
    } catch {
        // no-op
    }
};

export async function withCache<T>(
    store: (typeof CACHE_STORES)[number],
    key: IDBValidKey,
    ttlMs: number,
    signature: string,
    loader: () => Promise<T>,
    options?: { allowStale?: boolean; logger?: (msg: string, meta?: Record<string, unknown>) => void }
): Promise<CacheResult<T>> {
    const { allowStale = true, logger } = options ?? {};

    if (isCacheDisabled()) {
        logger?.('cache disabled via DEBUG_CACHE_DISABLE', { store, key });
        const data = await loader();
        emitCacheEvent({ store, key, source: 'network' });
        return { data, source: 'network' };
    }
    try {
        const cached = await getCached<T>(store, key);
        if (cached) {
            const age = now() - cached.fetchedAt;
            const isFresh = age < ttlMs;
            const signatureMatches = !cached.signature || cached.signature === signature;
            if (signatureMatches && isFresh) {
                logger?.('cache hit', { store, key, ageMs: age, source: 'cache' });
                emitCacheEvent({ store, key, source: 'cache' });
                return { data: cached.data, source: 'cache' };
            }
            if (signatureMatches && allowStale) {
                logger?.('cache stale accepted', { store, key, ageMs: age, source: 'stale-cache' });
                // kick async refresh, but don't await
                void loader().then((data) =>
                    setCached(store, key, { data, fetchedAt: now(), ttlMs, version: APP_VERSION, signature })
                );
                emitCacheEvent({ store, key, source: 'stale-cache', stale: true });
                return { data: cached.data, source: 'stale-cache', stale: true };
            }
            logger?.('cache miss (signature/ttl)', { store, key, ageMs: age, signatureMatches });
        }
    } catch (error) {
        logger?.('cache read failed', { store, key, error: String(error) });
    }

    const start = now();
    const data = await loader();
    const loadDurationMs = now() - start;
    setCached(store, key, { data, fetchedAt: now(), ttlMs, version: APP_VERSION, signature }).catch((error) =>
        logger?.('cache write failed', { store, key, error: String(error) })
    );
    logger?.('cache miss → network fetch', { store, key, durationMs: loadDurationMs, source: 'network' });
    emitCacheEvent({ store, key, source: 'network' });
    return { data, source: 'network' as CacheSource };
}

export { APP_VERSION };
