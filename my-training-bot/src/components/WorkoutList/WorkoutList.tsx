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

    if (!schedule) {
        console.warn('WorkoutList: The schedule is missing.');
        return <div className={styles.noWorkouts}>No workout schedule</div>;
    }

    if (schedule.scheduleItems.length === 0) {
        console.log('WorkoutList: No workouts available in the schedule.');
        return (
            <div>
                <div className={styles.noWorkouts}>Workout schedule is empty</div>
            </div>
        );
    }

    console.log('Rendering workout list...');
    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.scheduleItems.map((item, index) => {
                if (item instanceof WorkoutSet) {
                    return item.workouts
                        .filter(([_, completed]) => !completed)
                        .map(([workout, _], workoutIndex) => (
                            <WorkoutCard key={`${index}-${workoutIndex}`} item={workout} onClick={() => {
                                console.log('WorkoutList Card Clicked:', workout.id);
                            }} />
                        ));
                } else if (item instanceof WorkoutBlock) {
                    return (
                        <WorkoutCard key={index} item={item} onClick={() => {
                            console.log('WorkoutList Card Clicked:', index);
                        }} />
                    );
                } else {
                    console.error('Unknown item type in schedule:', item);
                    return <div key={index} className={styles.unknownItem}>Unknown Item</div>;
                }
            })}
        </div>
    );
};

export default WorkoutList;