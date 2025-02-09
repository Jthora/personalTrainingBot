import React, { createContext, useContext, useState, useEffect } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { SubWorkout } from '../types/SubWorkout';

interface WorkoutScheduleContextProps {
    schedule: SubWorkout[];
    createRandomWorkout: () => void;
    shuffleCurrentWorkout: () => void;
}

const WorkoutScheduleContext = createContext<WorkoutScheduleContextProps | undefined>(undefined);

export const WorkoutScheduleProvider: React.FC = ({ children }) => {
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

    return (
        <WorkoutScheduleContext.Provider value={{ schedule, createRandomWorkout, shuffleCurrentWorkout }}>
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