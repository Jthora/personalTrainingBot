import DrillCategoryCache from '../../cache/DrillCategoryCache';
import { SelectedDrillCategories, SelectedDrillGroups, SelectedDrillSubCategories, SelectedDrills } from '../../types/DrillCategory';

export const getDefaultSelectedDrillCategories = (): SelectedDrillCategories => {
    const allCategories = DrillCategoryCache.getInstance().getWorkoutCategories();
    return allCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
    }, {} as SelectedDrillCategories);
};

export const getDefaultSelectedDrillGroups = (): SelectedDrillGroups => {
    const allGroups = DrillCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories.flatMap(subCategory => subCategory.drillGroups));

    return allGroups.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
    }, {} as SelectedDrillGroups);
};

export const getDefaultSelectedDrillSubCategories = (): SelectedDrillSubCategories => {
    const allSubCategories = DrillCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories);

    return allSubCategories.reduce((acc, subCategory) => {
        acc[subCategory.id] = true;
        return acc;
    }, {} as SelectedDrillSubCategories);
};

export const getDefaultSelectedDrills = (): SelectedDrills => {
    const allWorkouts = DrillCategoryCache.getInstance().getAllWorkouts();
    return allWorkouts.reduce((acc, drill) => {
        acc[drill.id] = true;
        return acc;
    }, {} as SelectedDrills);
};
