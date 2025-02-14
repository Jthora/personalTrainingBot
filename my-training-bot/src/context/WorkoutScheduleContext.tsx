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
            if (!newSchedule || newSchedule.scheduleItems.length === 0) {
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