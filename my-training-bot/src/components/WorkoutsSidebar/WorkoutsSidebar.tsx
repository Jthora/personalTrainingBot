import React from 'react';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import styles from './WorkoutsSidebar.module.css';

const WorkoutsSidebar: React.FC = () => {
    return (
        <div className={styles.workoutsSidebar}>
            <div className={styles.scrollableContent}>
                <h2>Difficulty Settings</h2>
                <DifficultySettings />
            </div>
        </div>
    );
};

export default WorkoutsSidebar;
