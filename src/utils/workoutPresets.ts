import { WorkoutCategory, Workout } from '../types/WorkoutCategory';

export type WorkoutPreset = 'quick20' | 'upper_lower' | 'cardio';

const parseMinutes = (duration: string | number): number => {
    if (typeof duration === 'number') return duration;
    const match = duration.match(/\d+/);
    if (!match) return Number.POSITIVE_INFINITY;
    const minutes = Number(match[0]);
    return Number.isNaN(minutes) ? Number.POSITIVE_INFINITY : minutes;
};

interface MatchContext {
    categoryName: string;
    subCategoryName: string;
    groupName: string;
}

type WorkoutMatch = (workout: Workout, ctx: MatchContext) => boolean;

const quick20Matcher: WorkoutMatch = (workout) => parseMinutes(workout.duration) <= 20;

const upperLowerMatcher: WorkoutMatch = (workout, ctx) => {
    const haystack = `${workout.name} ${ctx.categoryName} ${ctx.subCategoryName} ${ctx.groupName}`.toLowerCase();
    return haystack.includes('upper') || haystack.includes('lower');
};

const cardioMatcher: WorkoutMatch = (workout, ctx) => {
    const haystack = `${workout.name} ${ctx.categoryName} ${ctx.subCategoryName} ${ctx.groupName} ${workout.intensity}`.toLowerCase();
    return haystack.includes('cardio') || haystack.includes('hiit') || haystack.includes('interval');
};

const matchers: Record<WorkoutPreset, WorkoutMatch> = {
    quick20: quick20Matcher,
    upper_lower: upperLowerMatcher,
    cardio: cardioMatcher,
};

export const buildPresetSelections = (categories: WorkoutCategory[], preset: WorkoutPreset) => {
    const matcher = matchers[preset];
    const categoryIds = new Set<string>();
    const subCategoryIds = new Set<string>();
    const groupIds = new Set<string>();
    const workoutIds = new Set<string>();

    categories.forEach(category => {
        category.subCategories.forEach(sub => {
            sub.workoutGroups.forEach(group => {
                group.workouts.forEach(workout => {
                    const ctx: MatchContext = { categoryName: category.name, subCategoryName: sub.name, groupName: group.name };
                    if (matcher(workout, ctx)) {
                        categoryIds.add(category.id);
                        subCategoryIds.add(sub.id);
                        groupIds.add(group.id);
                        workoutIds.add(workout.id);
                    }
                });
            });
        });
    });

    return { categoryIds, subCategoryIds, groupIds, workoutIds };
};
