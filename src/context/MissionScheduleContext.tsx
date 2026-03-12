import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { createMissionSchedule } from '../utils/MissionScheduleCreator';
import { MissionBlock, MissionSchedule, MissionSet } from '../types/MissionSchedule';
import { DifficultySetting } from '../types/DifficultySetting';
import MissionScheduleStore from '../store/MissionScheduleStore';
import { recordMetric, nowMs } from '../utils/metrics';
import { ProgressEventRecorder } from '../store/UserProgressEvents';
import { checkScheduleAlignment } from '../utils/alignmentCheck';
import UserProgressStore from '../store/UserProgressStore';
import { RecapSummary } from '../types/RecapSummary';
import { mark } from '../utils/perf';
import { loadScheduleStub } from '../utils/ScheduleLoader';
import { useRecap } from '../hooks/useRecap';

interface MissionScheduleContextProps {
    schedule: MissionSchedule;
    loadSchedule: () => Promise<void>;
    completeCurrentDrill: () => void;
    skipCurrentDrill: () => void;
    timeoutCurrentDrill: () => void;
    createNewSchedule: () => Promise<void>;
    setCurrentSchedule: (schedule: MissionSchedule) => void;
    recap: RecapSummary | null;
    recapOpen: boolean;
    recapToastVisible: boolean;
    openRecap: () => void;
    dismissRecap: () => void;
    dismissRecapToast: (reason?: string) => void;
    isLoading: boolean;
    error: string | null;
    scheduleVersion: number;
    scheduleStatus: ScheduleStatus;
}

const MissionScheduleContext = createContext<MissionScheduleContextProps | undefined>(undefined);

interface MissionScheduleProviderProps {
    children: React.ReactNode;
}

type ScheduleStatus = {
    source: 'cache' | 'network' | 'stale-cache' | 'fallback' | 'store';
    stale: boolean;
    status: 'idle' | 'loading' | 'ready' | 'stale' | 'error' | 'optimistic';
    lastUpdated?: number;
    message?: string;
};

export const MissionScheduleProvider: React.FC<MissionScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<MissionSchedule>(() => {
        const savedSchedule = MissionScheduleStore.getScheduleSync(); // Use a synchronous method
        return savedSchedule || new MissionSchedule('', [], new DifficultySetting(0, [0, 0]));
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scheduleVersion, setScheduleVersion] = useState(0);
    const scheduleReadyMarkedRef = useRef(false);
    const scheduleRef = useRef<MissionSchedule | null>(schedule);
    const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus>({ source: 'network', stale: false, status: 'loading' });
    const { recap, recapOpen, recapToastVisible, openRecap, dismissRecap, dismissRecapToast, tryBuildRecap } = useRecap();

    const incrementScheduleVersion = useCallback(() => {
        setScheduleVersion(prevVersion => prevVersion + 1);
    }, []);

    const invalidReason = (candidate: MissionSchedule | null): 'empty' | 'zero-difficulty' | null => {
        if (!candidate) return 'empty';

        const noItems = !candidate.scheduleItems || candidate.scheduleItems.length === 0;
        const allSetsEmpty = candidate.scheduleItems.every(item => item instanceof Object && 'drills' in item && Array.isArray((item as any).drills) && (item as any).drills.length === 0);
        const zeroDifficulty = candidate.difficultySettings.level <= 0 || candidate.difficultySettings.range.every(value => value <= 0);

        if (noItems || allSetsEmpty) return 'empty';
        if (zeroDifficulty) return 'zero-difficulty';
        return null;
    };

    useEffect(() => {
        scheduleRef.current = schedule;
    }, [schedule]);

    const loadSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const start = nowMs();
        console.log('MissionScheduleProvider: Loading schedule...');
        setScheduleStatus(prev => ({ ...prev, status: 'loading', stale: false, message: undefined }));

        try {
            let source: ScheduleStatus['source'] = 'cache';
            let stale = false;
            let loaded: MissionSchedule | null = null;

            // First try stored schedule (respects test mocks and avoids unnecessary network)
            try {
                loaded = await MissionScheduleStore.getSchedule();
                if (loaded) {
                    source = 'store';
                }
            } catch (storeErr) {
                console.warn('MissionScheduleProvider: store load failed, aborting load', storeErr);
                throw storeErr;
            }

            if (!loaded) {
                const result = await loadScheduleStub();
                loaded = result.schedule;
                source = result.source;
                stale = Boolean(result.stale);
            }

            const reason = invalidReason(loaded);
            setSchedule(loaded ?? new MissionSchedule('', [], new DifficultySetting(0, [0, 0])));

            if (reason) {
                setError('No drills available or difficulty is zero. Adjust selections or regenerate.');
                recordMetric('schedule_empty_generated', { reason, source, durationMs: nowMs() - start });
            } else if (loaded) {
                recordMetric('schedule_load_success', {
                    source,
                    durationMs: nowMs() - start,
                    items: loaded.scheduleItems.length,
                    difficultyLevel: loaded.difficultySettings.level,
                });
            }

            setScheduleStatus({
                source,
                stale,
                status: stale ? 'stale' : 'ready',
                lastUpdated: Date.now(),
                message: stale ? 'Showing cached schedule while refreshing…' : undefined,
            });
            incrementScheduleVersion();
        } catch (error) {
            console.error('MissionScheduleProvider: Failed to load schedule:', error);
            const fallback = MissionScheduleStore.getScheduleSync();
            if (fallback) {
                setSchedule(fallback);
            }
            setError('Failed to load schedule');
            recordMetric('schedule_load_failure', { message: error instanceof Error ? error.message : 'unknown' });
            setScheduleStatus({
                source: fallback ? 'fallback' : 'network',
                stale: true,
                status: 'error',
                lastUpdated: Date.now(),
                message: 'Unable to refresh. Retry to sync latest schedule.',
            });
        } finally {
            setIsLoading(false);
            console.log('MissionScheduleProvider: Finished loading schedule.');
            if (!scheduleReadyMarkedRef.current) {
                mark('load:schedule_ready');
                scheduleReadyMarkedRef.current = true;
            }
        }
    }, [incrementScheduleVersion]);

    const createNewSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const start = nowMs();
        console.log('MissionScheduleProvider: Creating new schedule...');
        const previous = scheduleRef.current;
        try {
            const newSchedule = await createMissionSchedule();
            const reason = invalidReason(newSchedule);
            setSchedule(newSchedule);
            scheduleRef.current = newSchedule;
            if (!reason) {
                try {
                    MissionScheduleStore.saveSchedule(newSchedule);
                    ProgressEventRecorder.recordScheduleSet(newSchedule);
                    recordMetric('schedule_generation_success', {
                        items: newSchedule.scheduleItems.length,
                        durationMs: nowMs() - start,
                        difficultyLevel: newSchedule.difficultySettings.level,
                    });
                    setScheduleStatus({ source: 'network', stale: false, status: 'ready', lastUpdated: Date.now(), message: 'Schedule ready' });
                } catch (persistError) {
                    console.warn('MissionScheduleProvider: failed to persist new schedule, reverting', persistError);
                    if (previous) {
                        setSchedule(previous);
                        scheduleRef.current = previous;
                        MissionScheduleStore.saveSchedule(previous);
                    }
                    setError('Failed to save new schedule; reverted to previous.');
                    setScheduleStatus({ source: 'fallback', stale: true, status: 'error', lastUpdated: Date.now(), message: 'Reverted after failed save' });
                    return;
                }
            } else {
                setError('No drills available or difficulty is zero. Adjust selections or regenerate.');
                recordMetric('schedule_generation_failure', { reason, durationMs: nowMs() - start });
                recordMetric('schedule_empty_generated', { reason, source: 'generated' });
                setScheduleStatus({ source: 'cache', stale: true, status: 'stale', lastUpdated: Date.now(), message: 'Schedule may be incomplete' });
            }
            incrementScheduleVersion();
        } catch (error) {
            console.error('MissionScheduleProvider: Failed to create new schedule:', error);
            setError('Failed to create new schedule');
            recordMetric('schedule_generation_failure', { message: error instanceof Error ? error.message : 'unknown' });
            if (previous) {
                setSchedule(previous);
                scheduleRef.current = previous;
                MissionScheduleStore.saveSchedule(previous);
            }
            setScheduleStatus({ source: 'fallback', stale: true, status: 'error', lastUpdated: Date.now(), message: 'Reverted after failed sync' });
        } finally {
            setIsLoading(false);
            console.log('MissionScheduleProvider: Finished creating new schedule.');
        }
    }, [incrementScheduleVersion]);

    const setCurrentSchedule = useCallback((newSchedule: MissionSchedule) => {
        setSchedule(newSchedule);
        MissionScheduleStore.saveSchedule(newSchedule);
        ProgressEventRecorder.recordScheduleSet(newSchedule);
        incrementScheduleVersion();
        setScheduleStatus({ source: 'cache', stale: false, status: 'ready', lastUpdated: Date.now(), message: 'Set manually' });
    }, [incrementScheduleVersion]);

    const completeCurrentDrill = useCallback(() => {
        console.log('MissionScheduleProvider: completeCurrentDrill called');
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.scheduleItems.length === 0) {
                console.log('MissionScheduleProvider: No items to complete');
                return prevSchedule;
            }
            const prevProgress = UserProgressStore.get();
            const progressItem: MissionSet | MissionBlock = prevSchedule.scheduleItems[0] instanceof MissionSet
                ? new MissionSet(prevSchedule.scheduleItems[0].drills.map(([drill, completed]) => [drill, completed]))
                : prevSchedule.scheduleItems[0] instanceof MissionBlock
                    ? new MissionBlock(
                        prevSchedule.scheduleItems[0].name,
                        prevSchedule.scheduleItems[0].description,
                        prevSchedule.scheduleItems[0].duration,
                        prevSchedule.scheduleItems[0].intervalDetails,
                    )
                    : prevSchedule.scheduleItems[0];
            const updatedSchedule = new MissionSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.completeNextItem();
            MissionScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('drill_completed', { remaining: updatedSchedule.scheduleItems.length });
            const recapResult = ProgressEventRecorder.recordCompletion({ item: progressItem, scheduleAfter: updatedSchedule });
            tryBuildRecap({ recapResult, prevProgress, prevSchedule });
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion, tryBuildRecap]);

    const advanceSchedule = useCallback((reason: 'skip' | 'timeout') => {
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.scheduleItems.length === 0) return prevSchedule;
            const updatedSchedule = new MissionSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.skipNextItem();
            MissionScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('drill_skipped', { remaining: updatedSchedule.scheduleItems.length, ...(reason === 'timeout' && { reason }) });
            ProgressEventRecorder.recordSkip(reason);
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

    const skipCurrentDrill = useCallback(() => advanceSchedule('skip'), [advanceSchedule]);
    const timeoutCurrentDrill = useCallback(() => advanceSchedule('timeout'), [advanceSchedule]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    const alignmentDebounceRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const hit = alignmentDebounceRef.current !== undefined;
        if (alignmentDebounceRef.current !== undefined) {
            clearTimeout(alignmentDebounceRef.current);
        }
        recordMetric(hit ? 'alignment_check_debounce_hit' : 'alignment_check_debounce_miss');
        alignmentDebounceRef.current = window.setTimeout(() => {
            const result = checkScheduleAlignment(schedule);
            if (result.status === 'warn') {
                recordMetric('alignment_check_warn', { outOfRange: result.outOfRangeCount, total: result.totalDrills });
            } else {
                recordMetric('alignment_check_pass', { total: result.totalDrills });
            }
            alignmentDebounceRef.current = undefined;
        }, 400);

        return () => {
            if (alignmentDebounceRef.current !== undefined) {
                clearTimeout(alignmentDebounceRef.current);
                alignmentDebounceRef.current = undefined;
            }
        };
    }, [schedule.difficultySettings.level, scheduleVersion]);

    return (
        <MissionScheduleContext.Provider
            value={{
                schedule,
                loadSchedule,
                completeCurrentDrill,
                skipCurrentDrill,
                timeoutCurrentDrill,
                createNewSchedule,
                setCurrentSchedule,
                recap,
                recapOpen,
                recapToastVisible,
                openRecap,
                dismissRecap,
                dismissRecapToast,
                isLoading,
                error,
                scheduleVersion,
                scheduleStatus,
            }}
        >
            {children}
        </MissionScheduleContext.Provider>
    );
};

export default MissionScheduleContext;