import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutBlock, WorkoutSchedule, WorkoutSet } from '../types/WorkoutSchedule';
import { DifficultySetting } from '../types/DifficultySetting';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';
import { recordMetric, nowMs } from '../utils/metrics';
import { ProgressEventRecorder } from '../store/UserProgressEvents';
import FeatureFlagsStore from '../store/FeatureFlagsStore';
import { checkScheduleAlignment } from '../utils/alignmentCheck';
import UserProgressStore from '../store/UserProgressStore';
import { RecapSummary } from '../types/RecapSummary';
import { summarizeSchedule } from '../utils/scheduleSummary';
import { buildRecapShareText } from '../utils/recapShareText';

interface WorkoutScheduleContextProps {
    schedule: WorkoutSchedule;
    loadSchedule: () => Promise<void>;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
    timeoutCurrentWorkout: () => void;
    createNewSchedule: () => Promise<void>;
    setCurrentSchedule: (schedule: WorkoutSchedule) => void;
    recap: RecapSummary | null;
    recapOpen: boolean;
    recapToastVisible: boolean;
    openRecap: () => void;
    dismissRecap: () => void;
    dismissRecapToast: (reason?: string) => void;
    isLoading: boolean;
    error: string | null;
    scheduleVersion: number;
}

const WorkoutScheduleContext = createContext<WorkoutScheduleContextProps | undefined>(undefined);

interface WorkoutScheduleProviderProps {
    children: React.ReactNode;
}

export const WorkoutScheduleProvider: React.FC<WorkoutScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<WorkoutSchedule>(() => {
        const savedSchedule = WorkoutScheduleStore.getScheduleSync(); // Use a synchronous method
        return savedSchedule || new WorkoutSchedule('', [], new DifficultySetting(0, [0, 0]));
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scheduleVersion, setScheduleVersion] = useState(0);
    const [recap, setRecap] = useState<RecapSummary | null>(null);
    const [recapOpen, setRecapOpen] = useState(false);
    const [recapToastVisible, setRecapToastVisible] = useState(false);
    const [promptShown, setPromptShown] = useState(false);

    const incrementScheduleVersion = useCallback(() => {
        setScheduleVersion(prevVersion => prevVersion + 1);
    }, []);

    const invalidReason = (candidate: WorkoutSchedule | null): 'empty' | 'zero-difficulty' | null => {
        if (!candidate) return 'empty';

        const noItems = !candidate.scheduleItems || candidate.scheduleItems.length === 0;
        const allSetsEmpty = candidate.scheduleItems.every(item => item instanceof Object && 'workouts' in item && Array.isArray((item as any).workouts) && (item as any).workouts.length === 0);
        const zeroDifficulty = candidate.difficultySettings.level <= 0 || candidate.difficultySettings.range.every(value => value <= 0);

        if (noItems || allSetsEmpty) return 'empty';
        if (zeroDifficulty) return 'zero-difficulty';
        return null;
    };

    const loadSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const start = nowMs();
        console.log('WorkoutScheduleProvider: Loading schedule...');
        try {
            let source: 'store' | 'generated' = 'store';
            let newSchedule = await WorkoutScheduleStore.getSchedule();
            if (!newSchedule || newSchedule.scheduleItems.length === 0) {
                console.warn('WorkoutScheduleProvider: No workouts in the schedule. Creating a new schedule.');
                source = 'generated';
                newSchedule = await createWorkoutSchedule();
                if (!invalidReason(newSchedule)) {
                    WorkoutScheduleStore.saveSchedule(newSchedule);
                }
            }
            setSchedule(newSchedule);
            const reason = invalidReason(newSchedule);
            if (reason) {
                setError('No workouts available or difficulty is zero. Adjust selections or regenerate.');
                recordMetric('schedule_empty_generated', { reason, source, durationMs: nowMs() - start });
            } else {
                recordMetric('schedule_load_success', {
                    source,
                    durationMs: nowMs() - start,
                    items: newSchedule?.scheduleItems.length ?? 0,
                    difficultyLevel: newSchedule?.difficultySettings.level,
                });
            }
            incrementScheduleVersion();
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to load schedule:', error);
            setError('Failed to load schedule');
            recordMetric('schedule_load_failure', { message: error instanceof Error ? error.message : 'unknown' });
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished loading schedule.');
        }
    }, [incrementScheduleVersion]);

    const createNewSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const start = nowMs();
        console.log('WorkoutScheduleProvider: Creating new schedule...');
        try {
            const newSchedule = await createWorkoutSchedule();
            const reason = invalidReason(newSchedule);
            if (!reason) {
                WorkoutScheduleStore.saveSchedule(newSchedule);
                ProgressEventRecorder.recordScheduleSet(newSchedule);
                recordMetric('schedule_generation_success', {
                    items: newSchedule.scheduleItems.length,
                    durationMs: nowMs() - start,
                    difficultyLevel: newSchedule.difficultySettings.level,
                });
            } else {
                setError('No workouts available or difficulty is zero. Adjust selections or regenerate.');
                recordMetric('schedule_generation_failure', { reason, durationMs: nowMs() - start });
                recordMetric('schedule_empty_generated', { reason, source: 'generated' });
            }
            setSchedule(newSchedule);
            incrementScheduleVersion();
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to create new schedule:', error);
            setError('Failed to create new schedule');
            recordMetric('schedule_generation_failure', { message: error instanceof Error ? error.message : 'unknown' });
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished creating new schedule.');
        }
    }, [incrementScheduleVersion]);

    const setCurrentSchedule = useCallback((newSchedule: WorkoutSchedule) => {
        setSchedule(newSchedule);
        WorkoutScheduleStore.saveSchedule(newSchedule);
        ProgressEventRecorder.recordScheduleSet(newSchedule);
        incrementScheduleVersion();
    }, [incrementScheduleVersion]);

    const completeCurrentWorkout = useCallback(() => {
        console.log('WorkoutScheduleProvider: completeCurrentWorkout called');
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.scheduleItems.length === 0) {
                console.log('WorkoutScheduleProvider: No items to complete');
                return prevSchedule;
            }
            console.log('WorkoutScheduleProvider: Current schedule:', prevSchedule);
            const prevProgress = UserProgressStore.get();
            const scheduleSummary = summarizeSchedule(prevSchedule);
            const progressItem: WorkoutSet | WorkoutBlock = prevSchedule.scheduleItems[0] instanceof WorkoutSet
                ? new WorkoutSet(prevSchedule.scheduleItems[0].workouts.map(([workout, completed]) => [workout, completed]))
                : prevSchedule.scheduleItems[0] instanceof WorkoutBlock
                    ? new WorkoutBlock(
                        prevSchedule.scheduleItems[0].name,
                        prevSchedule.scheduleItems[0].description,
                        prevSchedule.scheduleItems[0].duration,
                        prevSchedule.scheduleItems[0].intervalDetails,
                    )
                    : prevSchedule.scheduleItems[0];
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.completeNextItem();
            console.log('WorkoutScheduleProvider: Updated schedule after completion:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('workout_completed', { remaining: updatedSchedule.scheduleItems.length });
            const recapResult = ProgressEventRecorder.recordCompletion({ item: progressItem, scheduleAfter: updatedSchedule });
            const progressPrefs = UserProgressStore.get();
            const flagPrefs = FeatureFlagsStore.get();
            const recapEnabled = flagPrefs.recapEnabled ?? true;
            const shareEnabled = flagPrefs.recapShareEnabled ?? true;
            const recapMotionEnabled = flagPrefs.recapAnimationsEnabled ?? true;
            const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
            if (recapResult.scheduleEmpty && recapEnabled && !flagPrefs.quietMode && !promptShown) {
                const latestProgress = UserProgressStore.get();
                const vm = UserProgressStore.getViewModel();
                const unlockedBadges = latestProgress.badges.filter(badge => !prevProgress.badges.includes(badge));
                const challengeProgress = (latestProgress.challenges || []).map(challenge => ({
                    id: challenge.id,
                    title: challenge.title,
                    progress: challenge.progress,
                    target: challenge.target,
                    timeframe: challenge.timeframe,
                    rewardXp: challenge.rewardXp,
                    endsAt: challenge.endsAt,
                    completed: challenge.completed,
                    claimed: challenge.claimed,
                }));
                const baseRecap: RecapSummary = {
                    xp: recapResult.xp,
                    minutes: recapResult.minutes,
                    streakCount: progressPrefs.streakCount,
                    streakStatus: vm.streakStatus,
                    xpDelta: Math.max(0, latestProgress.xp - prevProgress.xp),
                    streakDelta: Math.max(0, latestProgress.streakCount - prevProgress.streakCount),
                    level: progressPrefs.level,
                    levelProgressPercent: vm.levelProgressPercent,
                    xpToNextLevel: vm.xpToNextLevel,
                    dailyGoalPercent: vm.dailyGoalPercent,
                    weeklyGoalPercent: vm.weeklyGoalPercent,
                    badges: vm.badgesPreview,
                    badgeTotal: progressPrefs.badges.length,
                    selectionFocus: scheduleSummary?.focus,
                    presetUsed: WorkoutScheduleStore.getLastPreset() ?? 'Custom selection',
                    focusRationale: scheduleSummary?.rationale,
                    animationsEnabled: recapMotionEnabled,
                    isOffline,
                    unlockedBadges,
                    challengeProgress,
                };
                const share = shareEnabled && !isOffline ? buildRecapShareText(baseRecap) : null;
                setRecap({
                    ...baseRecap,
                    shareAvailable: Boolean(share?.text),
                    shareText: share?.text,
                });
                setRecapToastVisible(true);
                setRecapOpen(false);
                setPromptShown(true);
            }
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion, promptShown]);

    const skipCurrentWorkout = useCallback(() => {
        console.log('WorkoutScheduleProvider: skipCurrentWorkout called');
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.scheduleItems.length === 0) {
                console.log('WorkoutScheduleProvider: No items to skip');
                return prevSchedule;
            }
            console.log('WorkoutScheduleProvider: Current schedule:', prevSchedule);
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.skipNextItem();
            console.log('WorkoutScheduleProvider: Updated schedule after skipping:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('workout_skipped', { remaining: updatedSchedule.scheduleItems.length });
            ProgressEventRecorder.recordSkip('skip');
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

    const timeoutCurrentWorkout = useCallback(() => {
        console.log('WorkoutScheduleProvider: timeoutCurrentWorkout called');
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.scheduleItems.length === 0) {
                console.log('WorkoutScheduleProvider: No items to timeout');
                return prevSchedule;
            }
            console.log('WorkoutScheduleProvider: Current schedule:', prevSchedule);
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.skipNextItem();
            console.log('WorkoutScheduleProvider: Updated schedule after timeout (treated as skip):', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('workout_skipped', { remaining: updatedSchedule.scheduleItems.length, reason: 'timeout' });
            ProgressEventRecorder.recordSkip('timeout');
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

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
                recordMetric('alignment_check_warn', { outOfRange: result.outOfRangeCount, total: result.totalWorkouts });
            } else {
                recordMetric('alignment_check_pass', { total: result.totalWorkouts });
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

    const dismissRecap = useCallback(() => {
        setRecap(null);
        setRecapOpen(false);
        setRecapToastVisible(false);
    }, []);

    const openRecap = useCallback(() => {
        if (!recap) return;
        setRecapOpen(true);
        setRecapToastVisible(false);
    }, [recap]);

    const dismissRecapToast = useCallback((reason?: string) => {
        setRecapToastVisible(false);
        if (reason) recordMetric('recap_toast_dismiss', { reason });
    }, []);

    return (
        <WorkoutScheduleContext.Provider
            value={{
                schedule,
                loadSchedule,
                completeCurrentWorkout,
                skipCurrentWorkout,
                timeoutCurrentWorkout,
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
            }}
        >
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;