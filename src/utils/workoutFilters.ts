import { Workout } from '../types/WorkoutCategory';
import { WorkoutFilters, DurationBucket } from '../store/WorkoutFilterStore';

const DURATIONS: Record<DurationBucket, (minutes: number) => boolean> = {
    any: () => true,
    '10': (m) => m <= 10,
    '20': (m) => m > 10 && m <= 20,
    '30': (m) => m > 20 && m <= 30,
    '30_plus': (m) => m > 30,
};

export const parseDurationMinutes = (duration: string | undefined, fallback = 0): number => {
    if (!duration) return fallback;
    const parsedFromNumber = typeof duration === 'number' ? duration : undefined;
    if (parsedFromNumber !== undefined && Number.isFinite(parsedFromNumber)) return parsedFromNumber;
    const match = /([0-9]+)\s*(min|minutes)?/i.exec(duration.toString());
    if (match) {
        return parseInt(match[1], 10);
    }
    return fallback;
};

const hasOverlap = (a: string[] = [], b: string[] = []) => a.some(item => b.includes(item));

const matchesDifficulty = (workout: Workout, min: number, max: number) => {
    const [wMin, wMax] = workout.difficulty_range;
    const midpoint = (wMin + wMax) / 2;
    return midpoint >= min && midpoint <= max;
};

const matchesDuration = (workout: Workout, bucket: DurationBucket) => {
    const minutes = workout.durationMinutes ?? parseDurationMinutes(workout.duration, 0);
    const matcher = DURATIONS[bucket];
    return matcher ? matcher(minutes) : true;
};

const matchesEquipment = (workout: Workout, equipment: string[]) => {
    if (!equipment.length) return true;
    const workoutEquipment = workout.equipment ?? [];
    return hasOverlap(workoutEquipment, equipment);
};

const matchesThemes = (workout: Workout, themes: string[]) => {
    if (!themes.length) return true;
    const workoutThemes = workout.themes ?? [];
    return hasOverlap(workoutThemes, themes);
};

const fuzzyIncludes = (haystack: string, needle: string): boolean => {
    if (!needle) return true;
    if (haystack.includes(needle)) return true;
    // simple subsequence match for fuzzy support
    let i = 0;
    for (const char of haystack) {
        if (char === needle[i]) i += 1;
        if (i === needle.length) return true;
    }
    return false;
};

const matchesSearch = (workout: Workout, search: string) => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    const haystack = [workout.name, workout.description, ...(workout.keywords ?? []), ...(workout.themes ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return fuzzyIncludes(haystack, query);
};

export const applyWorkoutFilters = (workouts: Workout[], filters: WorkoutFilters): Workout[] => {
    return workouts.filter(workout =>
        matchesDuration(workout, filters.duration)
        && matchesEquipment(workout, filters.equipment)
        && matchesThemes(workout, filters.themes)
        && matchesSearch(workout, filters.search)
        && matchesDifficulty(workout, filters.difficultyMin, filters.difficultyMax)
    );
};

export const DEFAULT_FILTERS: WorkoutFilters = {
    search: '',
    duration: 'any',
    equipment: [],
    themes: [],
    difficultyMin: 1,
    difficultyMax: 10,
};
