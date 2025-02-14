import React from 'react';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import styles from './WorkoutScheduler.module.css';

const WorkoutScheduler: React.FC = () => {
    const { createNewSchedule } = useWorkoutSchedule();

    return (
        <div className={styles.workoutScheduler}>
            <button onClick={createNewSchedule}>Create New Workout Schedule</button>
        </div>
    );
};

export default WorkoutScheduler;