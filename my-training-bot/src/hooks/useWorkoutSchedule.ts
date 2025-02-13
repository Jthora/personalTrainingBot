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
        if (isLoading) return;
        setIsLoading(true);
        console.log('useWorkoutSchedule: Loading schedule...');
        try {
            const storedSchedule = await WorkoutScheduleStore.getSchedule(options);
            setSchedule(storedSchedule);
        } catch (error) {
            console.error('useWorkoutSchedule: Failed to load schedule:', error);
        } finally {
            setIsLoading(false);
            console.log('useWorkoutSchedule: Finished loading schedule.');
        }
    }, [isLoading]);

    const createRandomWorkout = useCallback(async (options = {}) => {
        if (isLoading) return;
        setIsLoading(true);
        console.log('useWorkoutSchedule: Creating random workout...');
        try {
            const newSchedule: WorkoutSchedule = await createWorkoutSchedule(options);
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
        } catch (error) {
            console.error('useWorkoutSchedule: Failed to create random workout:', error);
        } finally {
            setIsLoading(false);
            console.log('useWorkoutSchedule: Finished creating random workout.');
        }
    }, [isLoading]);

    const completeCurrentWorkout = useCallback(() => {
        if (schedule && schedule.workouts.length > 0) {
            const remainingWorkouts = schedule.workouts.slice(1);
            const newSchedule = { ...schedule, workouts: remainingWorkouts };
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
            console.log('useWorkoutSchedule: Completed current workout.');
        }
    }, [schedule]);

    const skipCurrentWorkout = useCallback(() => {
        if (schedule && schedule.workouts.length > 0) {
            const skippedWorkout = schedule.workouts[0];
            const remainingWorkouts = schedule.workouts.slice(1);
            const newSchedule = { ...schedule, workouts: [...remainingWorkouts, skippedWorkout] };
            WorkoutScheduleStore.saveSchedule(newSchedule);
            setSchedule(newSchedule);
            console.log('useWorkoutSchedule: Skipped current workout.');
        }
    }, [schedule]);

    return {
        schedule,
        isLoading,
        loadSchedule,
        createRandomWorkout,
        completeCurrentWorkout,
        skipCurrentWorkout
    };
};

export default useWorkoutSchedule;
