import React from 'react';
import styles from './SubWorkoutCard.module.css';
import { Workout } from '../../types/WorkoutCategory';

const SubWorkoutCard: React.FC<{ workout: Workout; onClick: () => void }> = ({ workout, onClick }) => {
    return (
        <div className={styles.workoutCard} onClick={onClick}>
            <h3>{workout.name}</h3>
            <p>{workout.description}</p>
            <p>Duration: {workout.duration}</p>
            <p>Intensity: {workout.intensity}</p>
            <p>Difficulty Range: {workout.difficultyRange[0]} - {workout.difficultyRange[1]}</p>
        </div>
    );
};

export default SubWorkoutCard;