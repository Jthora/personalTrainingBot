import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';

interface WorkoutScheduleOptions {
    categories?: string[];
    date?: string;
    duration?: number; // in minutes
    type?: string; // e.g., "cardio", "strength"
}

const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const createWorkoutSchedule = async (options: WorkoutScheduleOptions = {}): Promise<WorkoutSchedule> => {
    const {
        categories = [],
        date = new Date().toISOString().split('T')[0],
    } = options;

    console.log('Starting to create workout schedule with options:', options);

    // Wait for the cache to be ready
    while (WorkoutCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().map(category => category.id);
    const selectedCategories = categories.length > 0 ? categories : allCategories;

    console.log('Selected categories:', selectedCategories);

    const difficultySettings = DifficultySettingsStore.getSettings();
    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);

    console.log('Difficulty settings:', difficultySettings);
    console.log('Calculated difficulty level:', difficultyLevel);

    const workouts: Workout[] = [];
    for (const category of selectedCategories) {
        const categoryWorkouts = await WorkoutCategoryCache.getInstance().fetchAllWorkoutsInCategory(category);
        if (categoryWorkouts) {
            workouts.push(...categoryWorkouts);
        }
    }

    console.log('Total workouts fetched:', workouts.length);

    const filteredWorkouts = workouts.filter(workout => 
        workout.difficulty_range[0] <= difficultyLevel && 
        workout.difficulty_range[1] >= difficultyLevel
    );

    console.log('Filtered workouts based on difficulty level:', filteredWorkouts.length);

    if (filteredWorkouts.length === 0) {
        console.warn('No workouts found within the specified difficulty level.');
    }

    const selectedWorkouts = getRandomItems(filteredWorkouts, 10);

    console.log('Selected workouts:', selectedWorkouts.length);

    return {
        date,
        workouts: selectedWorkouts,
        difficultySettings: {
            level: difficultyLevel,
            range: difficultySettings.range
        }
    };
};