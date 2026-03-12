/**
 * MissionScheduleStore — Unified schedule + selection persistence store.
 *
 * Consolidated from missionSchedule/{keys, defaults, selectionState,
 * scheduleState, selectionListeners}.
 */
import { createMissionSchedule, createMissionScheduleSync } from '../utils/MissionScheduleCreator';
import DrillCategoryCache from '../cache/DrillCategoryCache';
import { logAlignmentForSchedule } from '../utils/alignmentCheck';
import { recordMetric } from '../utils/metrics';
import { emitCacheMetric } from '../utils/cacheMetrics';
import { MissionSchedule, MissionScheduleJSON } from '../types/MissionSchedule';
import {
    SelectedDrillCategories,
    SelectedDrillGroups,
    SelectedDrillSubCategories,
    SelectedDrills,
} from '../types/DrillCategory';

// ── Storage keys ──────────────────────────────────────────────

const P = 'workout:v2:';
const KEYS = {
    schedule: `${P}schedule`,
    categories: `${P}selectedWorkoutCategories`,
    subcategories: `${P}selectedWorkoutSubCategories`,
    groups: `${P}selectedWorkoutGroups`,
    drills: `${P}selectedWorkouts`,
    taxonomy: `${P}taxonomySignature`,
    preset: `${P}lastPreset`,
} as const;

const ALL_KEYS = Object.values(KEYS);

// ── Change notification ───────────────────────────────────────

export type ScheduleStoreChangeType = 'selection' | 'schedule' | 'reset';
type StoreChangeListener = (type: ScheduleStoreChangeType) => void;

const storeListeners = new Set<StoreChangeListener>();

const notify = (type: ScheduleStoreChangeType) => {
    storeListeners.forEach(fn => {
        try { fn(type); } catch (e) { console.warn('MissionScheduleStore: listener failed', e); }
    });
};

// ── Default selections ────────────────────────────────────────

interface DrillCategorySource {
    getDrillCategories(): Array<{
        id: string;
        subCategories: Array<{
            id: string;
            drillGroups: Array<{ id: string; drills: Array<{ id: string }> }>;
        }>;
    }>;
    getAllDrills(): Array<{ id: string }>;
}

const defaultCategories = (c: DrillCategorySource): SelectedDrillCategories =>
    Object.fromEntries(c.getDrillCategories().map(cat => [cat.id, true]));

const defaultGroups = (c: DrillCategorySource): SelectedDrillGroups =>
    Object.fromEntries(
        c.getDrillCategories()
            .flatMap(cat => cat.subCategories.flatMap(sc => sc.drillGroups))
            .map(g => [g.id, true]),
    );

const defaultSubCategories = (c: DrillCategorySource): SelectedDrillSubCategories =>
    Object.fromEntries(
        c.getDrillCategories()
            .flatMap(cat => cat.subCategories)
            .map(sc => [sc.id, true]),
    );

const defaultDrills = (c: DrillCategorySource): SelectedDrills =>
    Object.fromEntries(c.getAllDrills().map(d => [d.id, true]));

// ── Helpers ───────────────────────────────────────────────────

const isBooleanRecord = (v: unknown): v is Record<string, boolean> =>
    !!v && typeof v === 'object' &&
    Object.values(v as Record<string, unknown>).every(e => typeof e === 'boolean');

const isMissionScheduleJSON = (v: unknown): v is MissionScheduleJSON => {
    if (!v || typeof v !== 'object') return false;
    const c = v as Partial<MissionScheduleJSON>;
    return typeof c.date === 'string'
        && Array.isArray(c.scheduleItems)
        && typeof c.difficultySettings === 'object'
        && c.difficultySettings !== null;
};

const parseSchedule = (raw: string): MissionSchedule | null => {
    try {
        const parsed = JSON.parse(raw) as unknown;
        return isMissionScheduleJSON(parsed) ? MissionSchedule.fromJSON(parsed) : null;
    } catch { return null; }
};

const cache = () => DrillCategoryCache.getInstance();

// ── Internal state helpers ────────────────────────────────────

const resetAll = (reason: string) => {
    try {
        ALL_KEYS.forEach(k => localStorage.removeItem(k));
        recordMetric('store_reset_drift', { reason });
        emitCacheMetric({ dataset: 'mission_schedule', status: 'clear', source: 'localStorage', reason });
    } catch (e) { console.error('MissionScheduleStore: reset failed', e); }
};

/** Read a boolean-record selection key, falling back to defaults on miss/corruption. */
const readSelection = <T extends Record<string, boolean>>(
    key: string,
    defaultFn: (c: DrillCategorySource) => T,
): T => {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw) as unknown;
            if (isBooleanRecord(parsed)) return parsed as T;
            console.warn(`MissionScheduleStore: invalid data at ${key}, resetting to defaults.`);
        }
    } catch (e) { console.error(`MissionScheduleStore: read failed for ${key}:`, e); }
    const defaults = defaultFn(cache());
    try { localStorage.setItem(key, JSON.stringify(defaults)); notify('selection'); } catch { /* ignore */ }
    return defaults;
};

const saveScheduleInternal = (schedule: MissionSchedule) => {
    try {
        localStorage.setItem(KEYS.schedule, JSON.stringify(schedule.toJSON()));
        emitCacheMetric({ dataset: 'mission_schedule', status: 'write', source: 'localStorage' });
    } catch (e) { console.error('MissionScheduleStore: save failed:', e); }
};

const getScheduleSyncInternal = (): MissionSchedule | null => {
    try {
        const raw = localStorage.getItem(KEYS.schedule);
        if (!raw) {
            emitCacheMetric({ dataset: 'mission_schedule', status: 'miss', source: 'localStorage' });
            return null;
        }
        emitCacheMetric({ dataset: 'mission_schedule', status: 'hit', source: 'localStorage' });
        const s = parseSchedule(raw);
        if (!s || s.scheduleItems.length === 0) {
            emitCacheMetric({ dataset: 'mission_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule_sync' });
            resetAll('invalid_schedule_sync');
            const fresh = createMissionScheduleSync();
            saveScheduleInternal(fresh);
            return fresh;
        }
        return s;
    } catch { return null; }
};

/** Write a selection key, run alignment check, and notify listeners. */
const writeSelection = (key: string, value: Record<string, boolean>) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        const s = getScheduleSyncInternal();
        if (s) logAlignmentForSchedule(s);
        notify('selection');
    } catch (e) { console.error(`MissionScheduleStore: write failed for ${key}:`, e); }
};

const clearSelection = (key: string) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
};

// ── Public store ──────────────────────────────────────────────

const MissionScheduleStore = {
    // ── Schedule ──

    async getSchedule(): Promise<MissionSchedule | null> {
        try {
            const raw = localStorage.getItem(KEYS.schedule);
            if (raw) {
                emitCacheMetric({ dataset: 'mission_schedule', status: 'hit', source: 'localStorage' });
                const s = parseSchedule(raw);
                if (s && s.scheduleItems.length > 0) return s;
                emitCacheMetric({ dataset: 'mission_schedule', status: 'invalid', source: 'localStorage', reason: 'invalid_schedule' });
                resetAll('invalid_schedule');
            } else {
                emitCacheMetric({ dataset: 'mission_schedule', status: 'miss', source: 'localStorage' });
            }
            const created = await createMissionSchedule();
            saveScheduleInternal(created);
            return created;
        } catch {
            const created = await createMissionSchedule();
            saveScheduleInternal(created);
            return created;
        }
    },

    getScheduleSync(): MissionSchedule | null {
        return getScheduleSyncInternal();
    },

    saveSchedule(schedule: MissionSchedule) {
        saveScheduleInternal(schedule);
    },

    createNewScheduleSync(): MissionSchedule {
        return createMissionScheduleSync();
    },

    // ── Preset ──

    saveLastPreset(preset: string) {
        try { localStorage.setItem(KEYS.preset, preset); } catch { /* ignore */ }
    },

    getLastPreset(): string | null {
        try { return localStorage.getItem(KEYS.preset); } catch { return null; }
    },

    // ── Selections ──

    getSelectedDrillCategoriesSync(): SelectedDrillCategories {
        return readSelection(KEYS.categories, defaultCategories);
    },
    saveSelectedDrillCategories(categories: Record<string, boolean>) {
        writeSelection(KEYS.categories, categories);
    },

    getSelectedDrillGroupsSync(): SelectedDrillGroups {
        return readSelection(KEYS.groups, defaultGroups);
    },
    saveSelectedDrillGroups(groups: Record<string, boolean>) {
        writeSelection(KEYS.groups, groups);
    },

    getSelectedDrillSubCategoriesSync(): SelectedDrillSubCategories {
        return readSelection(KEYS.subcategories, defaultSubCategories);
    },
    saveSelectedDrillSubCategories(subCategories: Record<string, boolean>) {
        writeSelection(KEYS.subcategories, subCategories);
    },

    getSelectedDrillsSync(): SelectedDrills {
        return readSelection(KEYS.drills, defaultDrills);
    },
    saveSelectedDrills(drills: Record<string, boolean>) {
        writeSelection(KEYS.drills, drills);
    },

    getSelectionCounts() {
        const cats = readSelection<SelectedDrillCategories>(KEYS.categories, defaultCategories);
        const drills = readSelection<SelectedDrills>(KEYS.drills, defaultDrills);
        return {
            categories: Object.values(cats).filter(Boolean).length,
            drills: Object.values(drills).filter(Boolean).length,
        };
    },

    // ── Taxonomy ──

    syncTaxonomySignature(signature: string): boolean {
        try {
            const existing = localStorage.getItem(KEYS.taxonomy);
            if (!existing) {
                localStorage.setItem(KEYS.taxonomy, signature);
                return true;
            }
            if (existing === signature) return true;

            console.warn('MissionScheduleStore: Taxonomy signature mismatch. Clearing stored selections.');
            [KEYS.categories, KEYS.groups, KEYS.subcategories, KEYS.drills].forEach(clearSelection);
            localStorage.setItem(KEYS.taxonomy, signature);
            notify('selection');
            emitCacheMetric({ dataset: 'mission_schedule', status: 'clear', source: 'localStorage', reason: 'taxonomy_mismatch' });
            return false;
        } catch { return false; }
    },

    // ── Subscription ──

    subscribeToScheduleStoreChanges(listener: () => void) {
        storeListeners.add(listener as StoreChangeListener);
        return () => storeListeners.delete(listener as StoreChangeListener);
    },
};

export default MissionScheduleStore;
