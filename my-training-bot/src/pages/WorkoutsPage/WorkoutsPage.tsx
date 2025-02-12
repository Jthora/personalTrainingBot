import styles from './WorkoutsPage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import WorkoutSidebar from '../../components/WorkoutsSidebar/WorkoutsSidebar';
import WorkoutWindow from '../../components/WorkoutsWindow/WorkoutsWindow';

const WorkoutsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.contentContainer}>
                <div className={styles.workoutsWindowContainer}>
                    <WorkoutWindow />
                </div>
                <div className={styles.workoutsSidebarContainer}>
                    <WorkoutSidebar />
                </div>
            </div>
        </div>
    );
};

export default WorkoutsPage;