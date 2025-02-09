import React from 'react';
import styles from './WorkoutScheduler.module.css';

interface WorkoutSchedulerProps {
    onCreateRandomWorkout: () => void;
    onShuffleCurrentWorkout: () => void;
}

const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = ({ onCreateRandomWorkout, onShuffleCurrentWorkout }) => {
    return (
        <div className={styles.workoutScheduler}>
            <button onClick={onCreateRandomWorkout}>Create Random Workout</button>
            <button onClick={onShuffleCurrentWorkout}>Shuffle Current Workout</button>
        </div>
    );
};

export default WorkoutScheduler;