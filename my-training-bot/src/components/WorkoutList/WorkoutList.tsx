import React, { useEffect } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const WorkoutList: React.FC = () => {
    const { schedule, loadSchedule, isLoading } = useWorkoutSchedule();

    useEffect(() => {
        console.log('WorkoutList: Loading schedule...');
        loadSchedule().catch(error => {
            console.error('Failed to load schedule:', error);
        }); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule]);

    if (isLoading) {
        console.log('Schedule is loading...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!schedule || schedule.workouts.length === 0) {
        console.warn('No workouts available in the schedule.');
        return <div className={styles.noWorkouts}>No workouts available</div>;
    }

    console.log('Rendering workout list...');
    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.workouts.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} onClick={() => {
                    console.log('WorkoutList Card Clicked:', workout.id);
                }} />
            ))}
        </div>
    );
};

export default WorkoutList;