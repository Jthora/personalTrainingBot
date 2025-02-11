import styles from './WorkoutPlannerPage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';

const WorkoutPlannerPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <h1>Training Sequence Page</h1>
        </div>
    );
};

export default WorkoutPlannerPage;