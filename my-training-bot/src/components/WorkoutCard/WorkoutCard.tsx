import React from 'react';
import styles from './WorkoutCard.module.css';
import { Workout } from '../../types/WorkoutCategory';

const WorkoutCard: React.FC<{ workout: Workout; onClick: () => void }> = ({ workout, onClick }) => {
    return (
        <div className={styles.workoutCard} onClick={onClick}>
            <h3>{workout.name}</h3>
            <p>{workout.description}</p>
            <p>Duration: {workout.duration}</p>
            <p>Intensity: {workout.intensity}</p>
            <p>Difficulty Range: {workout.difficulty_range[0]} - {workout.difficulty_range[1]}</p>
        </div>
    );
};

export default WorkoutCard;