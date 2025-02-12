import React, { useEffect } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';

const WorkoutList: React.FC<{ onWorkoutComplete: (workout: Workout) => void }> = ({ onWorkoutComplete }) => {
    const { schedule, loadSchedule, isLoading } = useWorkoutSchedule();

    useEffect(() => {
        loadSchedule(); // Load the workout schedule on component mount
    }, [loadSchedule]);

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.workouts.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} onClick={() => onWorkoutComplete(workout)} />
            ))}
        </div>
    );
};

export default WorkoutList;