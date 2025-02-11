import React, { createContext, useState, useEffect } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { Workout } from '../types/WorkoutCategory';

interface WorkoutScheduleContextProps {
    schedule: Workout[];
    createRandomWorkout: () => void;
    shuffleCurrentWorkout: () => void;
    addWorkoutToEnd: (workout: Workout) => void;
    completeCurrentWorkout: () => void;
    skipCurrentWorkout: () => void;
}

const WorkoutScheduleContext = createContext<WorkoutScheduleContextProps | undefined>(undefined);

interface WorkoutScheduleProviderProps {
    children: React.ReactNode;
}

export const WorkoutScheduleProvider: React.FC<WorkoutScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<Workout[]>([]);

    useEffect(() => {
        const initializeSchedule = async () => {
            const newSchedule = await createWorkoutSchedule();
            setSchedule(newSchedule.workouts as unknown as Workout[]);
        };
        initializeSchedule();
    }, []);

    const createRandomWorkout = async () => {
        const newSchedule = await createWorkoutSchedule();
        setSchedule(newSchedule.workouts as unknown as Workout[]);
    };

    const shuffleCurrentWorkout = () => {
        setSchedule(prevSchedule => [...prevSchedule.sort(() => Math.random() - 0.5)]);
    };

    const addWorkoutToEnd = (workout: Workout) => {
        setSchedule(prevSchedule => [...prevSchedule, workout]);
    };

    const completeCurrentWorkout = async () => {
        const newWorkout = await createWorkoutSchedule();
        setSchedule(prevSchedule => {
            if (prevSchedule.length > 0) {
                return [...prevSchedule.slice(1), newWorkout.workouts[0] as unknown as Workout];
            }
            return prevSchedule;
        });
    };

    const skipCurrentWorkout = async () => {
        const newWorkout = await createWorkoutSchedule();
        setSchedule(prevSchedule => {
            if (prevSchedule.length > 1) {
                const [current, ...rest] = prevSchedule;
                return [...rest, current, newWorkout.workouts[0] as unknown as Workout];
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

export default WorkoutScheduleContext;