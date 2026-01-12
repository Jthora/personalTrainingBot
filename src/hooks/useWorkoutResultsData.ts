import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import WorkoutDataLoader from '../utils/WorkoutDataLoader';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';
import WorkoutFilterStore, { WorkoutFilters } from '../store/WorkoutFilterStore';
import { Workout } from '../types/WorkoutCategory';
import { applyWorkoutFilters } from '../utils/workoutFilters';

const LAST_UPDATED_KEY = 'workouts:lastUpdated:v1';
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const readTimestamp = (): number | null => {
    try {
        const raw = localStorage.getItem(LAST_UPDATED_KEY);
        if (!raw) return null;
        const parsed = Number.parseInt(raw, 10);
        return Number.isFinite(parsed) ? parsed : null;
    } catch (error) {
        console.warn('useWorkoutResultsData: unable to read last updated timestamp', error);
        return null;
    }
};

const writeTimestamp = (timestamp: number) => {
    try {
        localStorage.setItem(LAST_UPDATED_KEY, String(timestamp));
    } catch (error) {
        console.warn('useWorkoutResultsData: unable to persist last updated timestamp', error);
    }
};

export type WorkoutDataState = {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
    isStale: boolean;
};

export type WorkoutDataControls = {
    refresh: (reason?: string) => Promise<void>;
};

export const useWorkoutResultsData = (
    filters: WorkoutFilters,
    options?: { ttlMs?: number; autoRefreshOnFocus?: boolean }
): WorkoutDataState & WorkoutDataControls => {
    const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
    const [baseWorkouts, setBaseWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(() => readTimestamp());
    const [isStale, setIsStale] = useState<boolean>(false);
    const isMountedRef = useRef(true);

    const markUpdated = useCallback((timestamp: number) => {
        if (!isMountedRef.current) return;
        setLastUpdated(timestamp);
        writeTimestamp(timestamp);
    }, []);

    const deriveFromCache = useCallback(() => {
        const cache = WorkoutCategoryCache.getInstance();
        const selected = cache.getAllWorkoutsSelected();
        setBaseWorkouts(selected);
        if (!lastUpdated) {
            markUpdated(Date.now());
        }
        setLoading(false);
    }, [lastUpdated, markUpdated]);

    const refresh = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const loader = new WorkoutDataLoader();
            const categories = await loader.loadAllData(() => {});
            const cache = WorkoutCategoryCache.getInstance();
            await cache.reloadData(categories);
            deriveFromCache();
            markUpdated(Date.now());
        } catch (err) {
            console.error('useWorkoutResultsData: refresh failed', err);
            setError('We couldn\'t refresh workouts. Please try again.');
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [deriveFromCache, loading, markUpdated]);

    useEffect(() => {
        deriveFromCache();
    }, [deriveFromCache]);

    useEffect(() => {
        const unsubscribeSelection = WorkoutScheduleStore.subscribeToSelectionChanges(() => deriveFromCache());
        const unsubscribeFilters = WorkoutFilterStore.addListener(() => deriveFromCache());
        return () => {
            unsubscribeSelection();
            unsubscribeFilters();
        };
    }, [deriveFromCache]);

    useEffect(() => {
        const checkStale = () => {
            const now = Date.now();
            const stale = lastUpdated ? now - lastUpdated > ttlMs : true;
            setIsStale(stale);
        };

        checkStale();
        const interval = window.setInterval(checkStale, Math.min(ttlMs, 15000));
        return () => window.clearInterval(interval);
    }, [lastUpdated, ttlMs]);

    useEffect(() => {
        const onFocus = () => {
            if (options?.autoRefreshOnFocus === false) return;
            if (isStale && !loading) {
                refresh();
            }
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [isStale, loading, options?.autoRefreshOnFocus, refresh]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const workouts = useMemo(
        () => applyWorkoutFilters(baseWorkouts, filters),
        [baseWorkouts, filters]
    );

    return useMemo(() => ({
        workouts,
        loading,
        error,
        lastUpdated,
        isStale,
        refresh,
    }), [workouts, loading, error, lastUpdated, isStale, refresh]);
};

export default useWorkoutResultsData;
