export interface CachedEntry<T> {
    version: string;
    signature?: string;
    ttlMs: number;
    fetchedAt: number;
    data: T;
}

export type CacheSource = 'cache' | 'network' | 'stale-cache';

export interface CacheResult<T> {
    data: T;
    source: CacheSource;
    stale?: boolean;
}
