import React, { useState } from 'react';
import WorkoutTimer from '../WorkoutTimer/WorkoutTimer';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/tiger_fitness_god-icon-512x.png';
import { Workout } from '../../types/Workout';

const CoachDialog: React.FC<{ currentWorkout: Workout | null, onComplete: () => void }> = ({ currentWorkout, onComplete }) => {
    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={tigerIcon} alt="Coach Icon" className={styles.icon} />
                <div className={styles.workoutDetails}>
                    {currentWorkout ? (
                        <>
                            <h3>{currentWorkout.name}</h3>
                            <p>{currentWorkout.description}</p>
                            <ul>
                                {currentWorkout.sub_workouts.map((subWorkout, index) => (
                                    <li key={index}>{subWorkout.name}</li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No current workout</p>
                    )}
                </div>
            </div>
            <WorkoutTimer />
            <button onClick={onComplete}>Complete Workout</button>
        </div>
    );
};

export default CoachDialog;