import coachTrainingCache from '../cache/CoachTrainingCache';
import { SubWorkout } from '../types/SubWorkout';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

interface WorkoutScheduleOptions {
    categories?: string[];
    date?: string;
}

export const createWorkoutSchedule = async (options: WorkoutScheduleOptions = {}): Promise<WorkoutSchedule> => {
    const {
        categories = ['cardio', 'strength', 'agility', 'combat', 'mental'],
        date = new Date().toISOString().split('T')[0]
    } = options;

    // Wait for the cache to be ready
    while (coachTrainingCache.isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const subWorkouts: SubWorkout[] = [];

    for (const category of categories) {
        const categorySubWorkouts = coachTrainingCache.getSubWorkoutsByCategory(category);
        if (categorySubWorkouts) {
            subWorkouts.push(...categorySubWorkouts);
        } else {
            console.warn(`No sub-workouts found for category ${category}`);
        }
    }

    return {
        date,
        workouts: subWorkouts,
    };
};