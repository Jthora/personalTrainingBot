import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';

interface WorkoutScheduleContextProps {
    schedule: WorkoutSchedule;
    loadSchedule: () => Promise<void>;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
    createNewSchedule: () => Promise<void>;
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
        return savedSchedule || new WorkoutSchedule('', [], { level: 0, range: [0, 0] });
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scheduleVersion, setScheduleVersion] = useState(0);

    const incrementScheduleVersion = useCallback(() => {
        setScheduleVersion(prevVersion => prevVersion + 1);
    }, []);

    const loadSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log('WorkoutScheduleProvider: Loading schedule...');
        try {
            let newSchedule = await WorkoutScheduleStore.getSchedule();
            if (!newSchedule || newSchedule.workouts.length === 0) {
                console.warn('WorkoutScheduleProvider: No workouts in the schedule. Creating a new schedule.');
                newSchedule = await createWorkoutSchedule();
                WorkoutScheduleStore.saveSchedule(newSchedule);
            }
            setSchedule(newSchedule);
            incrementScheduleVersion();
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to load schedule:', error);
            setError('Failed to load schedule');
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished loading schedule.');
        }
    }, [incrementScheduleVersion]);

    const createNewSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log('WorkoutScheduleProvider: Creating new schedule...');
        try {
            const newSchedule = await createWorkoutSchedule();
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
            incrementScheduleVersion();
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to create new schedule:', error);
            setError('Failed to create new schedule');
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished creating new schedule.');
        }
    }, [incrementScheduleVersion]);

    const completeCurrentWorkout = useCallback(() => {
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.workouts.length === 0) return prevSchedule;
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                prevSchedule.workouts.slice(1),
                prevSchedule.difficultySettings
            );
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

    const skipCurrentWorkout = useCallback(() => {
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.workouts.length === 0) return prevSchedule;
            const skippedWorkout = prevSchedule.workouts[0];
            const updatedSchedule = new WorkoutSchedule(
                prevSchedule.date,
                [...prevSchedule.workouts.slice(1), skippedWorkout],
                prevSchedule.difficultySettings
            );
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            incrementScheduleVersion();
            return updatedSchedule;
        });
    }, [incrementScheduleVersion]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, createNewSchedule, isLoading, error, scheduleVersion }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;