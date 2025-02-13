import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';

interface WorkoutScheduleContextProps {
    schedule: WorkoutSchedule;
    loadSchedule: (options?: { categories?: string[], date?: string, duration?: number, type?: string }) => Promise<void>;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
    resetSchedule: () => void;
    updateSchedule: (newSchedule: WorkoutSchedule) => void;
    isLoading: boolean;
    error: string | null;
}

const WorkoutScheduleContext = createContext<WorkoutScheduleContextProps | undefined>(undefined);

interface WorkoutScheduleProviderProps {
    children: React.ReactNode;
}

export const WorkoutScheduleProvider: React.FC<WorkoutScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<WorkoutSchedule>(() => {
        const savedSchedule = WorkoutScheduleStore.getScheduleSync(); // Use a synchronous method
        return savedSchedule || { date: '', workouts: [], difficultySettings: { level: 0, range: [0, 0] } };
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadSchedule = useCallback(async (options = {}) => {
        setIsLoading(true);
        setError(null);
        console.log('WorkoutScheduleProvider: Loading schedule with options:', options);
        try {
            const newSchedule = await createWorkoutSchedule(options);
            console.log('WorkoutScheduleProvider: New schedule created:', newSchedule);
            setSchedule(newSchedule);
            WorkoutScheduleStore.saveSchedule(newSchedule);
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to load schedule:', error);
            setError('WorkoutScheduleProvider: Failed to load schedule');
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished loading schedule.');
        }
    }, []);

    useEffect(() => {
        const initializeSchedule = async () => {
            console.log('WorkoutScheduleProvider: Initializing schedule...');
            const savedSchedule = await WorkoutScheduleStore.getSchedule();
            if (!savedSchedule) {
                await loadSchedule(); // Load the workout schedule on provider mount if not already saved
            } else {
                console.log('WorkoutScheduleProvider: Loaded saved schedule:', savedSchedule);
                setSchedule(savedSchedule);
                setIsLoading(false);
            }
        };

        initializeSchedule().catch(error => {
            console.error('WorkoutScheduleProvider: Failed to initialize schedule:', error);
            setError('WorkoutScheduleProvider: Failed to initialize schedule');
            setIsLoading(false);
        });
    }, [loadSchedule]);

    const completeCurrentWorkout = () => {
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.workouts.length === 0) return prevSchedule;
            const updatedSchedule = {
                ...prevSchedule,
                workouts: prevSchedule.workouts.slice(1)
            };
            console.log('WorkoutScheduleProvider: Completed current workout. Updated schedule:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            return updatedSchedule;
        });
    };

    const skipCurrentWorkout = () => {
        setSchedule(prevSchedule => {
            if (!prevSchedule || prevSchedule.workouts.length === 0) return prevSchedule;
            const updatedSchedule = {
                ...prevSchedule,
                workouts: prevSchedule.workouts.slice(1)
            };
            console.log('WorkoutScheduleProvider: Skipped current workout. Updated schedule:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            return updatedSchedule;
        });
    };

    const resetSchedule = async () => {
        setIsLoading(true);
        console.log('WorkoutScheduleProvider: Resetting schedule...');
        try {
            const newSchedule = await createWorkoutSchedule();
            console.log('WorkoutScheduleProvider: Reset schedule. New schedule:', newSchedule);
            setSchedule(newSchedule);
            WorkoutScheduleStore.saveSchedule(newSchedule);
        } catch (error) {
            console.error('WorkoutScheduleProvider: Failed to reset schedule:', error);
            setError('WorkoutScheduleProvider: Failed to reset schedule');
        } finally {
            setIsLoading(false);
            console.log('WorkoutScheduleProvider: Finished resetting schedule.');
        }
    };

    const updateSchedule = (newSchedule: WorkoutSchedule) => {
        setSchedule(newSchedule);
        WorkoutScheduleStore.saveSchedule(newSchedule);
        console.log('WorkoutScheduleProvider: Updated schedule:', newSchedule);
    };

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, resetSchedule, updateSchedule, isLoading, error }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;