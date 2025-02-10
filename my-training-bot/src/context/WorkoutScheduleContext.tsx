import React, { createContext, useContext, useState, useEffect } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { SubWorkout } from '../types/SubWorkout';

interface WorkoutScheduleContextProps {
    schedule: SubWorkout[];
    createRandomWorkout: () => void;
    shuffleCurrentWorkout: () => void;
    addWorkoutToEnd: (workout: SubWorkout) => void;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
}

const WorkoutScheduleContext = createContext<WorkoutScheduleContextProps | undefined>(undefined);

interface WorkoutScheduleProviderProps {
    children: React.ReactNode;
}

export const WorkoutScheduleProvider: React.FC<WorkoutScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<SubWorkout[]>([]);

    useEffect(() => {
        const initializeSchedule = async () => {
            const newSchedule = await createWorkoutSchedule();
            setSchedule(newSchedule.workouts);
        };
        initializeSchedule();
    }, []);

    const createRandomWorkout = async () => {
        const newSchedule = await createWorkoutSchedule();
        setSchedule(newSchedule.workouts);
    };

    const shuffleCurrentWorkout = () => {
        setSchedule(prevSchedule => [...prevSchedule.sort(() => Math.random() - 0.5)]);
    };

    const addWorkoutToEnd = (workout: SubWorkout) => {
        setSchedule(prevSchedule => [...prevSchedule, workout]);
    };

    const completeCurrentWorkout = async () => {
        const newWorkout = await createWorkoutSchedule({ categories: ['cardio', 'strength', 'agility', 'combat', 'mental'] });
        setSchedule(prevSchedule => {
            if (prevSchedule.length > 0) {
                return [...prevSchedule.slice(1), newWorkout.workouts[0]];
            }
            return prevSchedule;
        });
    };

    const skipCurrentWorkout = async () => {
        const newWorkout = await createWorkoutSchedule({ categories: ['cardio', 'strength', 'agility', 'combat', 'mental'] });
        setSchedule(prevSchedule => {
            if (prevSchedule.length > 1) {
                const [current, ...rest] = prevSchedule;
                return [...rest, current, newWorkout.workouts[0]];
            }
            return prevSchedule;
        });
    };

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, createRandomWorkout, shuffleCurrentWorkout, addWorkoutToEnd, completeCurrentWorkout, skipCurrentWorkout }}>
            {children}
        </WorkoutScheduleContext.Provider>
    );
};

export const useWorkoutSchedule = () => {
    const context = useContext(WorkoutScheduleContext);
    if (!context) {
        throw new Error('useWorkoutSchedule must be used within a WorkoutScheduleProvider');
    }
    return context;
};