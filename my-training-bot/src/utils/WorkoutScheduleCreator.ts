import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';

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
    while (WorkoutCategoryCache.isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allCategories = WorkoutCategoryCache.getWorkoutCategories().map(category => category.id);
    const selectedCategories = categories.length > 0 ? categories : allCategories;

    const workouts: Workout[] = [];
    for (const category of selectedCategories) {
        const categoryWorkouts = await WorkoutCategoryCache.fetchAllWorkoutsInCategory(category);
        if (categoryWorkouts) {
            workouts.push(...categoryWorkouts);
        }
    }

    const selectedWorkouts = getRandomItems(workouts, 10).map(() => {
        return WorkoutCategoryCache.getWeightedRandomWorkout();
    }).filter(workout => workout !== null) as Workout[];

    const difficultySettings = DifficultySettingsStore.getSettings();
    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);

    return {
        date,
        workouts: selectedWorkouts,
        difficultySettings: {
            level: difficultyLevel,
            range: difficultySettings.range
        }
    };
};