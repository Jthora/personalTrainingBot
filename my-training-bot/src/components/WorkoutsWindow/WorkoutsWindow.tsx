import React from 'react';
import styles from './WorkoutsWindow.module.css';
import WorkoutScheduler from '../WorkoutScheduler/WorkoutScheduler';

const WorkoutsWindow: React.FC = () => {
    return (
        <div className={styles.workoutsWindow}>
            {/* Add your workouts window content here */}
            <WorkoutScheduler />
        </div>
    );
};

export default WorkoutsWindow;
