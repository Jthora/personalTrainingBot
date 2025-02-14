import React from 'react';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import styles from './WorkoutScheduler.module.css';

const WorkoutScheduler: React.FC = () => {
    const { createRandomWorkout } = useWorkoutSchedule();

    return (
        <div className={styles.workoutScheduler}>
            <button onClick={createRandomWorkout}>Create Random Workout</button>
        </div>
    );
};

export default WorkoutScheduler;