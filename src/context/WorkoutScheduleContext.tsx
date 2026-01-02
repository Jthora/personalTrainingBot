import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import { DifficultySetting } from '../types/DifficultySetting';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';
import { recordMetric, nowMs } from '../utils/metrics';

interface WorkoutScheduleContextProps {
    schedule: WorkoutSchedule;
    loadSchedule: () => Promise<void>;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
    createNewSchedule: () => Promise<void>;
    setCurrentSchedule: (schedule: WorkoutSchedule) => void;
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
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                [...prevSchedule.scheduleItems],
                prevSchedule.difficultySettings
            );
            updatedSchedule.completeNextItem();
            console.log('WorkoutScheduleProvider: Updated schedule after completion:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            recordMetric('workout_completed', { remaining: updatedSchedule.scheduleItems.length });
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

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
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, createNewSchedule, setCurrentSchedule, isLoading, error, scheduleVersion }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;