import React, { useEffect } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';

const WorkoutList: React.FC = () => {
    const { schedule, isLoading, scheduleVersion } = useWorkoutSchedule();

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
    const upcomingItems = schedule.scheduleItems.flatMap((item, index) => {
        if (item instanceof WorkoutSet) {
            return item.workouts
                .filter(([, completed]) => !completed)
                .map(([workout], workoutIndex) => (
                    <WorkoutCard
                        key={`${index}-${workoutIndex}`}
                        item={workout}
                        onClick={() => console.log('WorkoutList Card Clicked:', workout.id)}
                    />
                ));
        }

        if (item instanceof WorkoutBlock) {
            return [
                <WorkoutCard
                    key={`block-${index}`}
                    item={item}
                    onClick={() => console.log('WorkoutList Card Clicked:', index)}
                />
            ];
        }

        console.error('Unknown item type in schedule:', item);
        return [
            <div key={`unknown-${index}`} className={styles.unknownItem}>Unknown Item</div>
        ];
    });

    return (
        <div className={styles.workoutList}>
            <div className={styles.listHeader}>
                <span>Up Next</span>
                <span className={styles.listMeta}>{schedule.date}</span>
            </div>
            <div className={styles.cardStack}>
                {upcomingItems.length > 0 ? upcomingItems : (
                    <div className={styles.noWorkouts}>Workout schedule is empty</div>
                )}
            </div>
        </div>
    );
};

export default WorkoutList;