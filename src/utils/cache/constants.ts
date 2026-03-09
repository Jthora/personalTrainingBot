export const CACHE_DB_NAME = 'ptb-loading-cache';
export const CACHE_DB_VERSION = 1;
export const CACHE_STORES = ['coachCatalog', 'moduleCatalog', 'workoutCategories', 'scheduleStub', 'drillDetails', 'meta'] as const;
export const CACHE_SCHEMA_VERSION = 1;

export const TTL_MS = {
    coachCatalog: 24 * 60 * 60 * 1000,
    moduleCatalog: 24 * 60 * 60 * 1000,
    workoutCategories: 12 * 60 * 60 * 1000,
    scheduleStub: 15 * 60 * 1000,
    scheduleDetails: 30 * 60 * 1000,
    drillDetails: 6 * 60 * 60 * 1000,
} as const;

export const APP_VERSION = (import.meta as any).env?.VITE_APP_VERSION ?? process.env.VITE_APP_VERSION ?? 'dev';
