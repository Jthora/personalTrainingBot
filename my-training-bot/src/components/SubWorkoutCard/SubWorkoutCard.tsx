import React from 'react';
import styles from './SubWorkoutCard.module.css';
import { SubWorkout } from '../../types/SubWorkout';

const SubWorkoutCard: React.FC<{ workout: SubWorkout; onClick: () => void }> = ({ workout, onClick }) => {
    return (
        <div className={styles.workoutCard} onClick={onClick}>
            <h3>{workout.name}</h3>
            <p>{workout.description}</p>
            <p>Duration: {workout.duration}</p>
            <p>Intensity: {workout.intensity}</p>
        </div>
    );
};

export default SubWorkoutCard;