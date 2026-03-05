import React, { useEffect, useState } from 'react';
import type { DurationBucket, WorkoutFilters } from '../../store/WorkoutFilterStore';
import WorkoutFilterStore from '../../store/WorkoutFilterStore';
import styles from './WorkoutFilters.module.css';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { applyWorkoutFilters } from '../../utils/workoutFilters';
import { Workout } from '../../types/WorkoutCategory';

const DURATION_OPTIONS: { label: string; value: DurationBucket }[] = [
    { label: 'Any', value: 'any' },
    { label: '10 min', value: '10' },
    { label: '20 min', value: '20' },
    { label: '30 min', value: '30' },
    { label: '30+ min', value: '30_plus' },
];

const EQUIPMENT_OPTIONS = ['bodyweight', 'dumbbells', 'bands'];
const THEME_OPTIONS = ['mobility', 'strength', 'cardio', 'hiit'];

const PRESET_OPTIONS: { label: string; value: 'quick20' | 'upper_lower' | 'cardio'; helper?: string }[] = [
    { label: 'Quick 20', value: 'quick20', helper: '≤20 min picks' },
    { label: 'Upper / Lower', value: 'upper_lower', helper: 'Split-friendly' },
    { label: 'Cardio / HIIT', value: 'cardio', helper: 'Intervals + burners' },
];

const WorkoutFilters: React.FC = () => {
    const [filters, setFilters] = useState<WorkoutFilters>(WorkoutFilterStore.getFiltersSync());
    const [searchDraft, setSearchDraft] = useState<string>(filters.search);
    const [filteredCount, setFilteredCount] = useState<number | null>(null);

    useEffect(() => {
        const unsubscribe = WorkoutFilterStore.addListener((next) => {
            setFilters(next);
            setSearchDraft(next.search);
        });
        return unsubscribe;
    }, []);

    const updateFilters = (next: WorkoutFilters) => {
        setFilters(next);
        WorkoutFilterStore.saveFilters(next);
    };

    useEffect(() => {
        const id = setTimeout(() => {
            updateFilters({ ...filters, search: searchDraft });
        }, 200);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchDraft]);

    useEffect(() => {
        // compute filtered count for zero-state UX
        const cache = WorkoutCategoryCache.getInstance();
        const all: Workout[] = cache.getAllWorkouts();
        const result = applyWorkoutFilters(all, { ...filters, search: searchDraft });
        setFilteredCount(result.length);
    }, [filters, searchDraft]);

    const toggleValue = (list: string[], value: string): string[] =>
        list.includes(value) ? list.filter(item => item !== value) : [...list, value];

    return (
        <div className={styles.filtersCard}>
            <div className={styles.headerRow}>
                <div>
                    <p className={styles.eyebrow}>Refine</p>
                    <h3>Filters</h3>
                </div>
                <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => updateFilters({ search: '', duration: 'any', equipment: [], themes: [], difficultyMin: 1, difficultyMax: 10 })}
                >
                    Clear
                </button>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="workout-search">Search</label>
                <input
                    id="workout-search"
                    type="text"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="Search drills..."
                    className={styles.searchInput}
                    aria-label="Search drills"
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.presetSection}`} aria-label="Presets">
                <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Presets</span>
                    <span className={styles.helperText}>Quickly apply common selections</span>
                </div>
                <div className={styles.presetRow}>
                    {PRESET_OPTIONS.map(preset => (
                        <button
                            key={preset.value}
                            type="button"
                            className={styles.presetPill}
                            onClick={() => {
                                const cache = WorkoutCategoryCache.getInstance();
                                cache.applyPreset(preset.value);
                            }}
                            aria-label={`Apply ${preset.label} preset${preset.helper ? ` – ${preset.helper}` : ''}`}
                        >
                            <span className={styles.presetLabel}>{preset.label}</span>
                            {preset.helper && <span className={styles.presetHelper}>{preset.helper}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Difficulty</span>
                    <span className={styles.helperText}>Filter by range</span>
                </div>
                <div className={styles.sliderRow}>
                    <label className={styles.sliderLabel}>
                        Min
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={filters.difficultyMin}
                            onChange={(e) => {
                                const nextMin = Math.min(Number(e.target.value), filters.difficultyMax);
                                updateFilters({ ...filters, difficultyMin: nextMin });
                            }}
                        />
                        <span className={styles.sliderValue}>{filters.difficultyMin}</span>
                    </label>
                    <label className={styles.sliderLabel}>
                        Max
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={filters.difficultyMax}
                            onChange={(e) => {
                                const nextMax = Math.max(Number(e.target.value), filters.difficultyMin);
                                updateFilters({ ...filters, difficultyMax: nextMax });
                            }}
                        />
                        <span className={styles.sliderValue}>{filters.difficultyMax}</span>
                    </label>
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Duration</span>
                    <span className={styles.helperText}>Choose one</span>
                </div>
                <div className={styles.chipRow}>
                    {DURATION_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className={filters.duration === option.value ? styles.chipActive : styles.chip}
                            onClick={() => updateFilters({ ...filters, duration: option.value })}
                            aria-pressed={filters.duration === option.value}
                            aria-label={`Filter duration ${option.label}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Equipment</span>
                    <span className={styles.helperText}>Select all that apply</span>
                </div>
                <div className={styles.checkboxGrid}>
                    {EQUIPMENT_OPTIONS.map(option => (
                        <label key={option} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={filters.equipment.includes(option)}
                                onChange={() => updateFilters({ ...filters, equipment: toggleValue(filters.equipment, option) })}
                                aria-label={`Equipment ${option}`}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Themes</span>
                    <span className={styles.helperText}>Select all that apply</span>
                </div>
                <div className={styles.checkboxGrid}>
                    {THEME_OPTIONS.map(option => (
                        <label key={option} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={filters.themes.includes(option)}
                                onChange={() => updateFilters({ ...filters, themes: toggleValue(filters.themes, option) })}
                                aria-label={`Theme ${option}`}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.zeroState} aria-live="polite">
                {filteredCount === 0 ? (
                    <div className={styles.zeroStateCard}>
                        <div>No drills match the current filters.</div>
                        <div className={styles.zeroStateActions}>
                            <button type="button" onClick={() => updateFilters({ search: '', duration: 'any', equipment: [], themes: [], difficultyMin: 1, difficultyMax: 10 })}>Clear filters</button>
                        </div>
                    </div>
                ) : filteredCount !== null ? (
                    <div className={styles.countHint}>{filteredCount} drills match filters</div>
                ) : null}
            </div>
        </div>
    );
};

export default WorkoutFilters;
