import { useState, useCallback } from 'react';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

const useWorkoutSchedule = () => {
    const [schedule, setSchedule] = useState<WorkoutSchedule | null>(() => {
        return WorkoutScheduleStore.getScheduleSync();
    });
    const [isLoading, setIsLoading] = useState(false);

    const loadSchedule = useCallback(async (options = {}) => {
        setIsLoading(true);
        const storedSchedule = await WorkoutScheduleStore.getSchedule(options);
        if (storedSchedule) {
            setSchedule(storedSchedule);
        } else {
            const newSchedule: WorkoutSchedule = await createWorkoutSchedule(options);
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
        }
        setIsLoading(false);
    }, []);

    const createRandomWorkout = useCallback(async (options = {}) => {
        setIsLoading(true);
        const newSchedule: WorkoutSchedule = await createWorkoutSchedule(options);
        WorkoutScheduleStore.saveSchedule(newSchedule);
        setSchedule(newSchedule);
        setIsLoading(false);
    }, []);

    const shuffleCurrentWorkout = useCallback(() => {
        if (schedule && schedule.workouts.length > 0) {
            const shuffledWorkouts = [...schedule.workouts].sort(() => 0.5 - Math.random());
            const newSchedule = { ...schedule, workouts: shuffledWorkouts };
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
        }
    }, [schedule]);

    const completeCurrentWorkout = useCallback(() => {
        if (schedule && schedule.workouts.length > 0) {
            const remainingWorkouts = schedule.workouts.slice(1);
            const newSchedule = { ...schedule, workouts: remainingWorkouts };
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
        }
    }, [schedule]);

    const skipCurrentWorkout = useCallback(() => {
        if (schedule && schedule.workouts.length > 0) {
            const skippedWorkout = schedule.workouts[0];
            const remainingWorkouts = schedule.workouts.slice(1);
            const newSchedule = { ...schedule, workouts: [...remainingWorkouts, skippedWorkout] };
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
        }
    }, [schedule]);

    return {
        schedule,
        isLoading,
        loadSchedule,
        createRandomWorkout,
        shuffleCurrentWorkout,
        completeCurrentWorkout,
        skipCurrentWorkout
    };
};

export default useWorkoutSchedule;
