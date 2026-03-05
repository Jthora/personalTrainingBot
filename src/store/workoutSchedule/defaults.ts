import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { SelectedWorkoutCategories, SelectedWorkoutGroups, SelectedWorkoutSubCategories, SelectedWorkouts } from '../../types/WorkoutCategory';

export const getDefaultSelectedWorkoutCategories = (): SelectedWorkoutCategories => {
    const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
    return allCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
    }, {} as SelectedWorkoutCategories);
};

export const getDefaultSelectedWorkoutGroups = (): SelectedWorkoutGroups => {
    const allGroups = WorkoutCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories.flatMap(subCategory => subCategory.workoutGroups));

    return allGroups.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
    }, {} as SelectedWorkoutGroups);
};

export const getDefaultSelectedWorkoutSubCategories = (): SelectedWorkoutSubCategories => {
    const allSubCategories = WorkoutCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories);

    return allSubCategories.reduce((acc, subCategory) => {
        acc[subCategory.id] = true;
        return acc;
    }, {} as SelectedWorkoutSubCategories);
};

export const getDefaultSelectedWorkouts = (): SelectedWorkouts => {
    const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
    return allWorkouts.reduce((acc, workout) => {
        acc[workout.id] = true;
        return acc;
    }, {} as SelectedWorkouts);
};
