import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { Workout } from '../types/WorkoutCategory';
import { WorkoutSchedule, WorkoutSet, WorkoutBlock } from '../types/WorkoutSchedule';
import DifficultySettingsStore from '../store/DifficultySettingsStore';
import { isFeatureEnabled } from '../config/featureFlags';

const getRandomItems = <T>(array: T[], count: number): T[] => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const createDefaultWorkoutBlock = (index: number): WorkoutBlock => {
    const duration = Math.floor(Math.random() * (45 - 30 + 1)) + 30; // Random duration between 30 and 45 minutes
    return new WorkoutBlock(
        `Block ${index + 1}`,
        'Do something productive!',
        duration,
        'Take a break and do something productive between workout sets.'
    );
};

const createModernWorkoutSchedule = async (): Promise<WorkoutSchedule> => {
    const workoutCount = 10;
    const date = new Date().toISOString().split('T')[0];
    
    // Wait for the cache to be ready
    while (WorkoutCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cache = WorkoutCategoryCache.getInstance();
    const workouts = cache.getAllWorkoutsSelected();

    const difficultySettings = DifficultySettingsStore.getSettings();
    const difficultyLevel = DifficultySettingsStore.getWeightedRandomDifficulty(difficultySettings);

    console.log('Difficulty settings:', difficultySettings);
    console.log('Calculated difficulty level:', difficultyLevel);
    console.log('Total workouts fetched:', workouts.length);

    const filteredWorkouts = workouts.filter(workout => 
        workout.difficulty_range[0] <= difficultyLevel && 
        workout.difficulty_range[1] >= difficultyLevel
    );

    console.log('Filtered workouts based on difficulty level:', filteredWorkouts.length);

    if (filteredWorkouts.length === 0) {
        console.warn(`No workouts found within the specified difficulty level [${difficultyLevel}].`);
        return new WorkoutSchedule(date, [], difficultySettings);
    }

    const selectedWorkouts = getRandomItems(filteredWorkouts, Math.min(workoutCount, filteredWorkouts.length));
    console.log('Selected workouts:', selectedWorkouts.length);

    const workoutSets: WorkoutSet[] = [];
    for (let i = 0; i < selectedWorkouts.length; i += 3) {
        const workoutsSlice = selectedWorkouts.slice(i, i + 3);
        const workoutsWithCompletion = workoutsSlice.map(workout => [workout, false] as [Workout, boolean]);
        const workoutSet = new WorkoutSet(workoutsWithCompletion);
        workoutSets.push(workoutSet);
    }

    const workoutBlocks: WorkoutBlock[] = workoutSets.map((_, index) => createDefaultWorkoutBlock(index));

    const scheduleItems: (WorkoutSet | WorkoutBlock)[] = [];
    workoutSets.forEach((set, index) => {
        scheduleItems.push(set);
        if (workoutBlocks[index]) {
            scheduleItems.push(workoutBlocks[index]);
        }
    });

    return new WorkoutSchedule(date, scheduleItems, difficultySettings);
};

const createLegacyWorkoutSchedule = async (): Promise<WorkoutSchedule> => {
    const workoutCount = 8;
    const date = new Date().toISOString().split('T')[0];

    while (WorkoutCategoryCache.getInstance().isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cache = WorkoutCategoryCache.getInstance();
    const workouts = cache.getAllWorkouts();

    const difficultySettings = DifficultySettingsStore.getSettings();
    const selectedWorkouts = getRandomItems(workouts, Math.min(workoutCount, workouts.length));

    if (selectedWorkouts.length === 0) {
        console.warn('Legacy generator: no workouts available; returning empty schedule.');
        return new WorkoutSchedule(date, [], difficultySettings);
    }

    const workoutSets: WorkoutSet[] = [];
    for (let i = 0; i < selectedWorkouts.length; i += 2) {
        const workoutsSlice = selectedWorkouts.slice(i, i + 2);
        const workoutsWithCompletion = workoutsSlice.map(workout => [workout, false] as [Workout, boolean]);
        const workoutSet = new WorkoutSet(workoutsWithCompletion);
        workoutSets.push(workoutSet);
    }

    const workoutBlocks: WorkoutBlock[] = workoutSets.map((_, index) => createDefaultWorkoutBlock(index));

    const scheduleItems: (WorkoutSet | WorkoutBlock)[] = [];
    workoutSets.forEach((set, index) => {
        scheduleItems.push(set);
        if (workoutBlocks[index]) {
            scheduleItems.push(workoutBlocks[index]);
        }
    });

    return new WorkoutSchedule(date, scheduleItems, difficultySettings);
};

export const createWorkoutSchedule = async (): Promise<WorkoutSchedule> => {
    const generatorSwapEnabled = isFeatureEnabled('generatorSwap');
    const migrationBridgeEnabled = isFeatureEnabled('migrationBridge');

    if (!generatorSwapEnabled) {
        return createLegacyWorkoutSchedule();
    }

    try {
        const modernSchedule = await createModernWorkoutSchedule();
        if (migrationBridgeEnabled && modernSchedule.scheduleItems.length === 0) {
            console.warn('Modern generator produced empty schedule; falling back to legacy via migration bridge.');
            return createLegacyWorkoutSchedule();
        }
        return modernSchedule;
    } catch (error) {
        if (migrationBridgeEnabled) {
            console.warn('Modern generator failed; falling back to legacy via migration bridge.', error);
            return createLegacyWorkoutSchedule();
        }
        throw error;
    }
};