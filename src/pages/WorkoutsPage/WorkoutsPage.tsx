import styles from './WorkoutsPage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import WorkoutSidebar from '../../components/WorkoutsSidebar/WorkoutsSidebar';
import WorkoutWindow from '../../components/WorkoutsWindow/WorkoutsWindow';

const WorkoutsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.content} tabIndex={-1} aria-label="Workouts page">
                <section className={styles.mainPane} aria-label="Workout selection and preview">
                    <WorkoutWindow />
                </section>
                <aside className={styles.sidebar} aria-label="Workout filters and difficulty">
                    <WorkoutSidebar />
                </aside>
            </main>
        </div>
    );
};

export default WorkoutsPage;