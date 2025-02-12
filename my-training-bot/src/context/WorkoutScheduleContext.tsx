import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';
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
        const savedSchedule = WorkoutScheduleStore.getSchedule();
        return savedSchedule || { date: '', workouts: [], difficultySettings: { level: 0, range: [0, 0] } };
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadSchedule = useCallback(async (options = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Loading schedule with options:', options);
            const newSchedule = await createWorkoutSchedule(options);
            console.log('New schedule created:', newSchedule);
            setSchedule(newSchedule);
            WorkoutScheduleStore.saveSchedule(newSchedule);
        } catch (error) {
            console.error('Failed to load schedule:', error);
            setError('Failed to load schedule');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializeSchedule = async () => {
            const savedSchedule = WorkoutScheduleStore.getSchedule();
            if (!savedSchedule) {
                await loadSchedule(); // Load the workout schedule on provider mount if not already saved
            } else {
                console.log('Loaded saved schedule:', savedSchedule);
                setSchedule(savedSchedule);
                setIsLoading(false);
            }
        };

        initializeSchedule().catch(error => {
            console.error('Failed to initialize schedule:', error);
            setError('Failed to initialize schedule');
            setIsLoading(false);
        });
    }, [loadSchedule]);

    const completeCurrentWorkout = () => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return prevSchedule;
            const updatedSchedule = {
                ...prevSchedule,
                workouts: prevSchedule.workouts.slice(1)
            };
            console.log('Completed current workout. Updated schedule:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            return updatedSchedule;
        });
    };

    const skipCurrentWorkout = () => {
        setSchedule(prevSchedule => {
            if (!prevSchedule) return prevSchedule;
            const updatedSchedule = {
                ...prevSchedule,
                workouts: prevSchedule.workouts.slice(1)
            };
            console.log('Skipped current workout. Updated schedule:', updatedSchedule);
            WorkoutScheduleStore.saveSchedule(updatedSchedule);
            return updatedSchedule;
        });
    };

    const resetSchedule = async () => {
        setIsLoading(true);
        try {
            const newSchedule = await createWorkoutSchedule();
            console.log('Reset schedule. New schedule:', newSchedule);
            setSchedule(newSchedule);
            WorkoutScheduleStore.saveSchedule(newSchedule);
        } catch (error) {
            console.error('Failed to reset schedule:', error);
            setError('Failed to reset schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const updateSchedule = (newSchedule: WorkoutSchedule) => {
        setSchedule(newSchedule);
        WorkoutScheduleStore.saveSchedule(newSchedule);
    };

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, resetSchedule, updateSchedule, isLoading, error }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;