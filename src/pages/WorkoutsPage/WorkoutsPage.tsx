import styles from './WorkoutsPage.module.css';
import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import WorkoutSidebar from '../../components/WorkoutsSidebar/WorkoutsSidebar';
import WorkoutWindow from '../../components/WorkoutsWindow/WorkoutsWindow';
import FiltersSheet from '../../components/WorkoutsSidebar/FiltersSheet';

const WorkoutsPage: React.FC = () => {
    const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
    const [filtersSheetTarget, setFiltersSheetTarget] = useState<'filters' | 'difficulty' | null>(null);

    const openFilters = (target: 'filters' | 'difficulty' = 'filters') => {
        setFiltersSheetTarget(target);
        setFiltersSheetOpen(true);
    };
    const closeFilters = () => {
        setFiltersSheetOpen(false);
        setFiltersSheetTarget(null);
    };

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.content} tabIndex={-1} aria-label="Workouts page">
                <section className={styles.mainPane} aria-label="Workout selection and preview">
                    <WorkoutWindow onOpenFilters={openFilters} filtersOpen={filtersSheetOpen} />
                </section>
                <aside className={styles.sidebar} aria-label="Workout filters and difficulty">
                    <WorkoutSidebar />
                </aside>
            </main>
            <FiltersSheet open={filtersSheetOpen} target={filtersSheetTarget} onClose={closeFilters} />
        </div>
    );
};

export default WorkoutsPage;