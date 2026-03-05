import React from 'react';
import { Workout } from '../../types/WorkoutCategory';
import { parseDurationMinutes } from '../../utils/workoutFilters';
import { DurationBucket, WorkoutFilters } from '../../store/WorkoutFilterStore';

export const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.split(regex).map((part, index) => {
        regex.lastIndex = 0;
        const isMatch = regex.test(part);
        return isMatch ? <mark key={index}>{part}</mark> : <React.Fragment key={index}>{part}</React.Fragment>;
    });
};

export const formatDuration = (workout: Workout) => {
    const minutes = workout.durationMinutes ?? parseDurationMinutes(workout.duration, 0);
    if (minutes) return `${minutes} min`;
    return workout.duration || '—';
};

export const formatDifficulty = (workout: Workout) => `${workout.difficulty_range[0]}–${workout.difficulty_range[1]}`;

export const buildAppliedLabels = (filters: WorkoutFilters): string[] => {
    const labels: string[] = [];
    if (filters.search.trim()) labels.push(`Search: “${filters.search.trim()}”`);
    if (filters.duration !== 'any') {
        const map: Record<DurationBucket, string> = { any: 'Any', '10': '10 min', '20': '20 min', '30': '30 min', '30_plus': '30+ min' };
        labels.push(`Duration: ${map[filters.duration]}`);
    }
    if (filters.equipment.length) labels.push(`Equipment: ${filters.equipment.join(', ')}`);
    if (filters.themes.length) labels.push(`Themes: ${filters.themes.join(', ')}`);
    if (filters.difficultyMin !== 1 || filters.difficultyMax !== 10) {
        labels.push(`Difficulty: ${filters.difficultyMin}–${filters.difficultyMax}`);
    }
    return labels;
};
