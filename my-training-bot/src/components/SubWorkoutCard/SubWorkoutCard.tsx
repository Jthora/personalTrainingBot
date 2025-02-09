import React from 'react';
import styles from './SubWorkoutCard.module.css';
import { SubWorkout } from '../../types/SubWorkout';

const SubWorkoutCard: React.FC<{ workout: SubWorkout }> = ({ workout }) => {
    return (
        <div className={styles.workoutCard}>
            <h3>{workout.name}</h3>
            <p>{workout.description}</p>
            <p>Duration: {workout.duration}</p>
            <p>Intensity: {workout.intensity}</p>
        </div>
    );
};

export default SubWorkoutCard;
