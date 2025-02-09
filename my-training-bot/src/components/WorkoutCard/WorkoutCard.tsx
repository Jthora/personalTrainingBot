import React from 'react';
import styles from './WorkoutCard.module.css';
import { Workout } from '../../types/Workout';

const WorkoutCard: React.FC<{ workout: any }> = ({ workout }) => {
    return (
        <div className={styles.workoutCard}>
            {/* Display workout summary details here */}
        </div>
    );
};

export default WorkoutCard;