import React, { useState } from 'react';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import styles from './WorkoutsSidebar.module.css';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import WorkoutFilters from '../WorkoutFilters/WorkoutFilters';

const WorkoutsSidebar: React.FC = () => {
    const applyPreset = (preset: 'quick20' | 'upper_lower' | 'cardio') => {
        WorkoutCategoryCache.getInstance().applyPreset(preset);
    };

    const [filtersOpen, setFiltersOpen] = useState(true);

    return (
        <div className={styles.workoutsSidebar}>
            <div className={styles.sidebarHeader}>
                <div>
                    <p className={styles.eyebrow}>Plan tuning</p>
                    <h2>Filters & presets</h2>
                </div>
                <button
                    type="button"
                    className={styles.toggleFilters}
                    onClick={() => setFiltersOpen(open => !open)}
                    aria-expanded={filtersOpen}
                    aria-controls="workout-filters-region"
                >
                    {filtersOpen ? 'Hide filters' : 'Show filters'}
                </button>
            </div>

            <div className={styles.scrollableContent}>
                <section aria-label="Difficulty settings" className={styles.cardSection}>
                    <h3>Difficulty</h3>
                    <DifficultySettings />
                </section>

                <section
                    id="workout-filters-region"
                    className={`${styles.cardSection} ${filtersOpen ? '' : styles.collapsed}`}
                    aria-label="Workout filters"
                >
                    <WorkoutFilters />
                </section>

                <section className={styles.presetSection} aria-label="Filter presets">
                    <h3>Presets</h3>
                    <div className={styles.presetButtons}>
                        <button type="button" onClick={() => applyPreset('quick20')}>Quick 20</button>
                        <button type="button" onClick={() => applyPreset('upper_lower')}>Upper/Lower</button>
                        <button type="button" onClick={() => applyPreset('cardio')}>Cardio</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WorkoutsSidebar;
