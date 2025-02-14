import React from 'react';
import styles from './WorkoutsWindow.module.css';
import WorkoutSelector from '../WorkoutSelector/WorkoutSelector';

const WorkoutsWindow: React.FC = () => {
    return (
        <div className={styles.workoutsWindow}>
            <WorkoutSelector />
        </div>
    );
};

export default WorkoutsWindow;
