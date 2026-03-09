import { DrillCategory, Drill } from '../types/DrillCategory';

export type DrillPreset = 'quick20' | 'upper_lower' | 'cardio';

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

type DrillMatch = (drill: Drill, ctx: MatchContext) => boolean;

const quick20Matcher: DrillMatch = (drill) => parseMinutes(drill.duration) <= 20;

const upperLowerMatcher: DrillMatch = (drill, ctx) => {
    const haystack = `${drill.name} ${ctx.categoryName} ${ctx.subCategoryName} ${ctx.groupName}`.toLowerCase();
    return haystack.includes('upper') || haystack.includes('lower');
};

const cardioMatcher: DrillMatch = (drill, ctx) => {
    const haystack = `${drill.name} ${ctx.categoryName} ${ctx.subCategoryName} ${ctx.groupName} ${drill.intensity}`.toLowerCase();
    return haystack.includes('cardio') || haystack.includes('hiit') || haystack.includes('interval');
};

const matchers: Record<DrillPreset, DrillMatch> = {
    quick20: quick20Matcher,
    upper_lower: upperLowerMatcher,
    cardio: cardioMatcher,
};

export const buildPresetSelections = (categories: DrillCategory[], preset: DrillPreset) => {
    const matcher = matchers[preset];
    const categoryIds = new Set<string>();
    const subCategoryIds = new Set<string>();
    const groupIds = new Set<string>();
    const workoutIds = new Set<string>();

    categories.forEach(category => {
        category.subCategories.forEach(sub => {
            sub.drillGroups.forEach(group => {
                group.drills.forEach(drill => {
                    const ctx: MatchContext = { categoryName: category.name, subCategoryName: sub.name, groupName: group.name };
                    if (matcher(drill, ctx)) {
                        categoryIds.add(category.id);
                        subCategoryIds.add(sub.id);
                        groupIds.add(group.id);
                        workoutIds.add(drill.id);
                    }
                });
            });
        });
    });

    return { categoryIds, subCategoryIds, groupIds, workoutIds };
};
