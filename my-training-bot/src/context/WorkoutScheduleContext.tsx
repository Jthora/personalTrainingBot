import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

interface WorkoutScheduleContextProps {
    schedule: WorkoutSchedule;
    loadSchedule: () => Promise<void>;
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
    const [schedule, setSchedule] = useState<WorkoutSchedule>({ date: '', workouts: [] });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadSchedule = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newSchedule = await createWorkoutSchedule();
            setSchedule(newSchedule);
        } catch {
            setError('WorkoutScheduleContext Failed to load schedule');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSchedule(); // Load the workout schedule on provider mount
    }, [loadSchedule]);

    const completeCurrentWorkout = () => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            workouts: prevSchedule.workouts.slice(1)
        }));
    };

    const skipCurrentWorkout = () => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            workouts: prevSchedule.workouts.slice(1)
        }));
    };

    const resetSchedule = () => {
        setSchedule({ date: '', workouts: [] });
    };

    const updateSchedule = (newSchedule: WorkoutSchedule) => {
        setSchedule(newSchedule);
    };

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, resetSchedule, updateSchedule, isLoading, error }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export default WorkoutScheduleContext;