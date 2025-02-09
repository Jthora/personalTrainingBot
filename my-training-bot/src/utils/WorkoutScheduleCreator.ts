import coachTrainingCache from '../cache/CoachTrainingCache';
import { Workout } from '../types/Workout';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

interface WorkoutScheduleOptions {
    categories?: string[];
    includeSubWorkouts?: boolean;
    date?: string;
}

export const createWorkoutSchedule = async (options: WorkoutScheduleOptions = {}): Promise<WorkoutSchedule> => {
    const {
        categories = ['cardio', 'strength', 'agility', 'combat', 'mental'],
        includeSubWorkouts = false,
        date = new Date().toISOString().split('T')[0]
    } = options;

    const workouts: Workout[] = [];

    for (const category of categories) {
        const categoryWorkouts = coachTrainingCache.getWorkoutByCategory(category, 'default');
        if (categoryWorkouts) {
            if (includeSubWorkouts) {
                for (const workout of categoryWorkouts) {
                    workouts.push(workout);
                    if (workout.sub_workouts) {
                        workouts.push(...workout.sub_workouts.map(subWorkout => ({
                            ...subWorkout,
                            sub_workouts: []
                        })));
                    }
                }
            } else {
                workouts.push(...categoryWorkouts);
            }
        } else {
            console.warn(`No workouts found for category ${category}`);
        }
    }

    return {
        date,
        workouts,
    };
};