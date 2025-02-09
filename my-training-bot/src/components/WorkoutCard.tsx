import React from 'react';
import styles from './WorkoutCard.module.css';
import { Workout } from '../../types/Workout';
import { SubWorkout } from '../types/SubWorkout';

const WorkoutCard: React.FC<{ workout: Workout }> = ({ workout }) => {
    return (
        <div className={styles.workoutCard}>
            <h3>{workout.name}</h3>
            <p>{workout.description}</p>
            <ul>
                {workout.sub_workouts.map((subWorkout: SubWorkout, index: number) => (
                    <li key={index}>{subWorkout.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default WorkoutCard;
