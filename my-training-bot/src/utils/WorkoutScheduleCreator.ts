import coachTrainingCache from '../cache/CoachTrainingCache';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule } from '../types/WorkoutSchedule';

interface WorkoutScheduleOptions {
    categories?: string[];
    date?: string;
}

const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const createWorkoutSchedule = async (options: WorkoutScheduleOptions = {}): Promise<WorkoutSchedule> => {
    const {
        categories = [],
        date = new Date().toISOString().split('T')[0]
    } = options;

    // Wait for the cache to be ready
    while (coachTrainingCache.isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allCategories = coachTrainingCache.getWorkoutCategories().map(category => category.id);
    const selectedCategories = categories.length > 0 ? categories : allCategories;

    const workouts: Workout[] = [];
    for (const category of selectedCategories) {
        const categoryWorkouts = await coachTrainingCache.fetchAllWorkoutsInCategory(category);
        if (categoryWorkouts) {
            workouts.push(...categoryWorkouts);
        }
    }

    const selectedWorkouts = getRandomItems(workouts, 10).map(() => {
        return coachTrainingCache.getWeightedRandomWorkout();
    }).filter(workout => workout !== null) as Workout[];

    return {
        date,
        workouts: selectedWorkouts,
    };
};