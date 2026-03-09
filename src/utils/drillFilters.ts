import { Drill } from '../types/DrillCategory';
import { DrillFilters, DurationBucket } from '../store/DrillFilterStore';

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

const matchesDifficulty = (drill: Drill, min: number, max: number) => {
    const [wMin, wMax] = drill.difficulty_range;
    const midpoint = (wMin + wMax) / 2;
    return midpoint >= min && midpoint <= max;
};

const matchesDuration = (drill: Drill, bucket: DurationBucket) => {
    const minutes = drill.durationMinutes ?? parseDurationMinutes(drill.duration, 0);
    const matcher = DURATIONS[bucket];
    return matcher ? matcher(minutes) : true;
};

const matchesEquipment = (drill: Drill, equipment: string[]) => {
    if (!equipment.length) return true;
    const workoutEquipment = drill.equipment ?? [];
    return hasOverlap(workoutEquipment, equipment);
};

const matchesThemes = (drill: Drill, themes: string[]) => {
    if (!themes.length) return true;
    const workoutThemes = drill.themes ?? [];
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

const matchesSearch = (drill: Drill, search: string) => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    const haystack = [drill.name, drill.description, ...(drill.keywords ?? []), ...(drill.themes ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return fuzzyIncludes(haystack, query);
};

export const applyDrillFilters = (drills: Drill[], filters: DrillFilters): Drill[] => {
    return drills.filter(drill =>
        matchesDuration(drill, filters.duration)
        && matchesEquipment(drill, filters.equipment)
        && matchesThemes(drill, filters.themes)
        && matchesSearch(drill, filters.search)
        && matchesDifficulty(drill, filters.difficultyMin, filters.difficultyMax)
    );
};

export const DEFAULT_FILTERS: DrillFilters = {
    search: '',
    duration: 'any',
    equipment: [],
    themes: [],
    difficultyMin: 1,
    difficultyMax: 10,
};
