import { describe, it, expect } from 'vitest';
import { applyWorkoutFilters, parseDurationMinutes } from '../workoutFilters';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutFilters } from '../../store/WorkoutFilterStore';

type PartialWorkout = Partial<Workout> & Pick<Workout, 'id' | 'name' | 'description' | 'duration' | 'intensity' | 'difficulty_range'>;

const workout = (overrides: PartialWorkout): Workout => ({
    id: overrides.id,
    name: overrides.name,
    description: overrides.description,
    duration: overrides.duration,
    intensity: overrides.intensity,
    difficulty_range: overrides.difficulty_range,
    equipment: overrides.equipment ?? [],
    themes: overrides.themes ?? [],
    keywords: overrides.keywords ?? [],
    durationMinutes: overrides.durationMinutes,
});

describe('parseDurationMinutes', () => {
    it('parses minutes from strings', () => {
        expect(parseDurationMinutes('10 min')).toBe(10);
        expect(parseDurationMinutes('25 minutes')).toBe(25);
    });

    it('falls back when invalid', () => {
        expect(parseDurationMinutes('n/a', 5)).toBe(5);
    });
});

describe('applyWorkoutFilters', () => {
    const baseFilters: WorkoutFilters = {
        search: '',
        duration: 'any',
        equipment: [],
        themes: [],
        difficultyMin: 1,
        difficultyMax: 10,
    };

    const workouts: Workout[] = [
        workout({ id: 'a', name: 'Quick Push', description: '10 min bodyweight cardio', duration: '10 min', intensity: 'low', difficulty_range: [1, 3], equipment: ['bodyweight'], themes: ['cardio'] }),
        workout({ id: 'b', name: 'Strength 30', description: '30 minute dumbbell strength', duration: '30 min', intensity: 'medium', difficulty_range: [3, 6], equipment: ['dumbbells'], themes: ['strength'] }),
        workout({ id: 'c', name: 'Mobility Flow', description: '20 min stretch', duration: '20 min', intensity: 'low', difficulty_range: [6, 9], equipment: ['bodyweight'], themes: ['mobility'] }),
    ];

    it('filters by duration bucket', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, duration: '10' });
        expect(filtered.map(w => w.id)).toEqual(['a']);
    });

    it('filters by equipment', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, equipment: ['dumbbells'] });
        expect(filtered.map(w => w.id)).toEqual(['b']);
    });

    it('filters by themes', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, themes: ['mobility'] });
        expect(filtered.map(w => w.id)).toEqual(['c']);
    });

    it('filters by difficulty overlap', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, difficultyMin: 5, difficultyMax: 8 });
        expect(filtered.map(w => w.id)).toEqual(['c']);
    });

    it('filters by search across name/description', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, search: 'cardio' });
        expect(filtered.map(w => w.id)).toEqual(['a']);
    });

    it('supports fuzzy subsequence search', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, search: 'qkpsh' });
        expect(filtered.map(w => w.id)).toEqual(['a']);
    });

    it('combines filters conjunctively', () => {
        const filtered = applyWorkoutFilters(workouts, { ...baseFilters, search: 'strength', equipment: ['dumbbells'], duration: '30' });
        expect(filtered.map(w => w.id)).toEqual(['b']);
    });

    it('returns all when filters are empty', () => {
        const filtered = applyWorkoutFilters(workouts, baseFilters);
        expect(filtered.length).toBe(3);
    });
});
