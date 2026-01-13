import React, { useState } from 'react';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import styles from './WorkoutsSidebar.module.css';
import WorkoutFilters from '../WorkoutFilters/WorkoutFilters';

const WorkoutsSidebar: React.FC = () => {
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
                <section aria-label="Difficulty settings" className={styles.cardSection} id="difficulty-controls" tabIndex={-1}>
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

            </div>
        </div>
    );
};

export default WorkoutsSidebar;
