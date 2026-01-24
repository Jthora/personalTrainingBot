import { withCache, APP_VERSION } from './cache/indexedDbCache';
import { TTL_MS } from './cache/constants';
import { isFeatureEnabled } from '../config/featureFlags';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import { createWorkoutSchedule } from './WorkoutScheduleCreator';

export type ScheduleEventName = 'schedule:stub-ready' | 'schedule:details-ready' | 'schedule:refresh-failed';

const scheduleEventTarget = typeof window !== 'undefined' ? new EventTarget() : null;

interface ScheduleStubPayload {
    schedule: ReturnType<WorkoutSchedule['toJSON']>;
    lastUpdated: number;
    source: 'cache' | 'network' | 'stale-cache';
    stale?: boolean;
}

interface ScheduleDetailsPayload extends ScheduleStubPayload {
    range: string;
}

const emitScheduleEvent = (name: ScheduleEventName, detail: unknown) => {
    if (!scheduleEventTarget || typeof CustomEvent === 'undefined') return;
    try {
        scheduleEventTarget.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {
        // swallow
    }
};

export const onScheduleEvent = (name: ScheduleEventName, listener: (detail: unknown) => void) => {
    if (!scheduleEventTarget) return () => {};
    const handler = (event: Event) => listener((event as CustomEvent).detail);
    scheduleEventTarget.addEventListener(name, handler as EventListener);
    return () => scheduleEventTarget.removeEventListener(name, handler as EventListener);
};

const loadSchedule = async (): Promise<ScheduleStubPayload> => {
    const schedule = await createWorkoutSchedule();
    WorkoutScheduleStore.saveSchedule(schedule);
    return {
        schedule: schedule.toJSON(),
        lastUpdated: Date.now(),
        source: 'network',
    };
};

export async function loadScheduleStub(): Promise<{ schedule: WorkoutSchedule; source: ScheduleStubPayload['source']; stale?: boolean }> {
    const signature = `scheduleStub-${APP_VERSION}`;
    const useCache = isFeatureEnabled('loadingCacheV2');
    try {
        const result = useCache
            ? await withCache<ScheduleStubPayload>(
                  'scheduleStub',
                  'current',
                  TTL_MS.scheduleStub,
                  signature,
                  loadSchedule,
                  { allowStale: true, logger: (msg, meta) => console.info(`scheduleCache: ${msg}`, meta) }
              )
            : { data: await loadSchedule(), source: 'network' as const, stale: false };

        const schedule = WorkoutSchedule.fromJSON(result.data.schedule);
        WorkoutScheduleStore.saveSchedule(schedule);

        emitScheduleEvent('schedule:stub-ready', { source: result.source, stale: result.stale });
        lastRefresh = Date.now();
        return { schedule, source: result.source, stale: result.stale };
    } catch (error) {
        emitScheduleEvent('schedule:refresh-failed', {
            stage: 'stub',
            error: error instanceof Error ? error.message : 'unknown',
        });
        throw error;
    }
}

export const awaitScheduleStub = (): Promise<ScheduleStubPayload> =>
    new Promise((resolve) => {
        if (!scheduleEventTarget) {
            resolve({ schedule: WorkoutScheduleStore.getScheduleSync()?.toJSON() ?? { date: '', scheduleItems: [], difficultySettings: {} as any }, lastUpdated: Date.now(), source: 'network' });
            return;
        }
        const off = onScheduleEvent('schedule:stub-ready', (detail) => {
            off();
            resolve(detail as ScheduleStubPayload);
        });
    });

let lastRefresh = 0;
const FIVE_MIN = 5 * 60 * 1000;

export const registerScheduleRefreshOnFocus = () => {
    if (typeof window === 'undefined') return () => {};
    const handler = () => {
        const now = Date.now();
        if (now - lastRefresh < FIVE_MIN) return;
        lastRefresh = now;
        void loadScheduleStub().catch((error) => console.warn('schedule refresh failed', error));
    };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
};

const BASE_INTERVAL_MS = 10 * 60 * 1000;
const MAX_INTERVAL_MS = 30 * 60 * 1000;

export const registerScheduleRefreshInterval = () => {
    if (typeof window === 'undefined') return () => {};
    let currentInterval = BASE_INTERVAL_MS;
    let timeoutId: number | undefined;

    const tick = async () => {
        timeoutId = undefined;
        try {
            await loadScheduleStub();
            currentInterval = BASE_INTERVAL_MS; // reset backoff on success
        } catch (error) {
            console.warn('schedule interval refresh failed; backing off', error);
            currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL_MS);
        } finally {
            timeoutId = window.setTimeout(tick, currentInterval);
        }
    };

    timeoutId = window.setTimeout(tick, currentInterval);

    return () => {
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
        }
    };
};

const DETAILS_RANGE_DEFAULT = 'current+next-week';

const loadScheduleDetails = async (range: string): Promise<ScheduleDetailsPayload> => {
    // Placeholder: reuse generated schedule as details for now.
    const schedule = await createWorkoutSchedule();
    WorkoutScheduleStore.saveSchedule(schedule);
    return {
        schedule: schedule.toJSON(),
        lastUpdated: Date.now(),
        source: 'network',
        range,
    };
};

export async function loadScheduleDetailsRange(range: string = DETAILS_RANGE_DEFAULT): Promise<{ schedule: WorkoutSchedule; source: ScheduleDetailsPayload['source']; stale?: boolean; range: string }> {
    const signature = `scheduleDetails-${range}-${APP_VERSION}`;
    const useCache = isFeatureEnabled('loadingCacheV2');
    try {
        const result = useCache
            ? await withCache<ScheduleDetailsPayload>(
                  'scheduleStub',
                  `details:${range}`,
                  TTL_MS.scheduleDetails,
                  signature,
                  () => loadScheduleDetails(range),
                  { allowStale: true, logger: (msg, meta) => console.info(`scheduleDetailsCache: ${msg}`, meta) }
              )
            : { data: await loadScheduleDetails(range), source: 'network' as const, stale: false };

        const schedule = WorkoutSchedule.fromJSON(result.data.schedule);
        WorkoutScheduleStore.saveSchedule(schedule);
        emitScheduleEvent('schedule:details-ready', { source: result.source, stale: result.stale, range });

        return { schedule, source: result.source, stale: result.stale, range };
    } catch (error) {
        emitScheduleEvent('schedule:refresh-failed', {
            stage: 'details',
            range,
            error: error instanceof Error ? error.message : 'unknown',
        });
        throw error;
    }
}

export const awaitScheduleDetails = (range: string = DETAILS_RANGE_DEFAULT): Promise<ScheduleDetailsPayload> =>
    new Promise((resolve) => {
        if (!scheduleEventTarget) {
            resolve({
                schedule: WorkoutScheduleStore.getScheduleSync()?.toJSON() ?? { date: '', scheduleItems: [], difficultySettings: {} as any },
                lastUpdated: Date.now(),
                source: 'network',
                range,
            });
            return;
        }
        const off = onScheduleEvent('schedule:details-ready', (detail) => {
            const payload = detail as ScheduleDetailsPayload;
            if (payload.range !== range) return;
            off();
            resolve(payload);
        });
    });
