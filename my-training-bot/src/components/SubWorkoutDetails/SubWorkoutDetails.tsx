import React from 'react';
import { SubWorkout } from '../../types/SubWorkout';
import styles from './SubWorkoutDetails.module.css';

interface SubWorkoutDetailsProps {
    workout: SubWorkout | null;
}

const SubWorkoutDetails: React.FC<SubWorkoutDetailsProps> = ({ workout }) => {
    if (!workout) {
        return <div className={styles.noWorkout}>No workout selected</div>;
    }

    return (
        <div className={styles.workoutDetails}>
            <h2>{workout.name}</h2>
            <p>{workout.description}</p>
            <p>Duration: {workout.duration}</p>
            <p>Intensity: {workout.intensity}</p>
        </div>
    );
};

export default SubWorkoutDetails;