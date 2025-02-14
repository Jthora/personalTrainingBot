import React, { useEffect } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';

const WorkoutList: React.FC = () => {
    const { schedule, loadSchedule, isLoading, scheduleVersion } = useWorkoutSchedule();

    useEffect(() => {
        console.log('WorkoutList: Loading schedule...');
        loadSchedule().catch(error => {
            console.error('Failed to load schedule:', error);
        }); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule, scheduleVersion]);

    if (isLoading) {
        console.log('Schedule is loading...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!schedule || schedule.scheduleItems.length === 0) {
        console.warn('No workouts available in the schedule.');
        return <div className={styles.noWorkouts}>No workouts available</div>;
    }

    console.log('Rendering workout list...');
    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.scheduleItems.slice(1).map((item, index) => {
                if ('workouts' in item) {
                    return item.workouts.map(([workout, completed], workoutIndex) => (
                        <WorkoutCard key={`${index}-${workoutIndex}`} item={workout} onClick={() => {
                            console.log('WorkoutList Card Clicked:', workout.id);
                        }} />
                    ));
                } else {
                    return (
                        <WorkoutCard key={index} item={item} onClick={() => {
                            console.log('WorkoutList Card Clicked:', index);
                        }} />
                    );
                }
            })}
        </div>
    );
};

export default WorkoutList;