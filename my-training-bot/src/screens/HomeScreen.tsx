import React, { useState } from 'react';
import CoachDialog from '../components/CoachDialog/CoachDialog';
import WorkoutList from '../components/SubWorkoutList/SubWorkoutList';
import { Workout } from '../types/Workout';
import styles from './HomeScreen.module.css';

const HomeScreen: React.FC = () => {
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

    const handleWorkoutComplete = (nextWorkout: Workout) => {
        setCurrentWorkout(nextWorkout);
    };

    const handleSkipWorkout = () => {
        // Logic to skip the current workout and move to the next one
        // This can be similar to handleWorkoutComplete
        setCurrentWorkout(null); // or set to the next workout in the queue
    };

    return (
        <div className={styles.homeScreen}>
            <div className={styles.sidebar}>
                <CoachDialog currentWorkout={currentWorkout} onComplete={handleWorkoutComplete} onSkip={handleSkipWorkout} />
                <WorkoutList onWorkoutComplete={handleWorkoutComplete} />
            </div>
        </div>
    );
};

export default HomeScreen;