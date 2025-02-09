import React from 'react';
import WorkoutTimer from '../WorkoutTimer/WorkoutTimer';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/tiger_fitness_god-icon-512x.png';
import { SubWorkout } from '../../types/SubWorkout';
import SubWorkoutDetails from '../SubWorkoutDetails/SubWorkoutDetails';

const CoachDialog: React.FC<{ currentWorkout: SubWorkout | null, onComplete: () => void, onSkip: () => void }> = ({ currentWorkout, onComplete, onSkip }) => {
    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={tigerIcon} alt="Coach Icon" className={styles.icon} width="128" height="128" />
                <h3 className={styles.title}>Tiger Fitness God - Training Coach Bot</h3>
                <div className={styles.spacer}></div>
            </div>
            <div className={styles.workoutDetails}>
                <SubWorkoutDetails workout={currentWorkout} />
            </div>
            <div className={styles.timer}>
                <WorkoutTimer onComplete={onComplete} />
                <div className={styles.buttons}>
                    <button onClick={onSkip}>Skip Workout</button>
                    <button onClick={onComplete}>Complete Workout</button>
                </div>
            </div>
        </div>
    );
};

export default CoachDialog;