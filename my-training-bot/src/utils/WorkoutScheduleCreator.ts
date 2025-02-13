import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule } from '../types/WorkoutSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';
import WorkoutScheduleStore from '../store/WorkoutScheduleStore';

interface WorkoutScheduleOptions {
    categories?: string[];
    date?: string;
    workoutCount?: number; // number of workouts to include
}

const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const createWorkoutSchedule = async (options: WorkoutScheduleOptions = {}): Promise<WorkoutSchedule> => {
    const {
        categories = [],
        date = new Date().toISOString().split('T')[0],
        workoutCount = 10 // default to 10 workouts
    } = options;

    console.log('Starting to create workout schedule with options:', options);

    // Wait for the cache to be ready
    while (WorkoutCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
    const selectedCategories = await WorkoutScheduleStore.getSelectedWorkoutCategories();

    console.log('All categories:', allCategories);
    console.log('Selected categories:', selectedCategories);

    const difficultySettings = DifficultySettingsStore.getSettings();
    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);

    console.log('Difficulty settings:', difficultySettings);
    console.log('Calculated difficulty level:', difficultyLevel);

    const workouts: Workout[] = [];

    // Use selectedCategories to randomly select workouts
    allCategories.forEach(category => {
        category.subCategories.forEach(subCategory => {
            subCategory.workoutGroups.forEach(group => {
                group.workouts.forEach(workout => {
                    if (selectedCategories[workout.id]) {
                        workouts.push(workout);
                    }
                });
            });
        });
    });

    console.log('Total workouts fetched:', workouts.length);

    const filteredWorkouts = workouts.filter(workout => 
        workout.difficulty_range[0] <= difficultyLevel && 
        workout.difficulty_range[1] >= difficultyLevel
    );

    console.log('Filtered workouts based on difficulty level:', filteredWorkouts.length);

    if (filteredWorkouts.length === 0) {
        console.warn('No workouts found within the specified difficulty level.');
        return {
            date,
            workouts: [],
            difficultySettings: {
                level: difficultyLevel,
                range: difficultySettings.range
            }
        };
    }

    const selectedWorkouts = getRandomItems(filteredWorkouts, Math.min(workoutCount, filteredWorkouts.length));

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