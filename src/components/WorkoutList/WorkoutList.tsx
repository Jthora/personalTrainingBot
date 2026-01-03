import React, { useEffect } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import WorkoutFilterStore from '../../store/WorkoutFilterStore';

const WorkoutList: React.FC = () => {
    const { schedule, isLoading, scheduleVersion } = useWorkoutSchedule();

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule, scheduleVersion]);

    if (isLoading) {
        console.log('Schedule is loading...');
        return (
            <div className={styles.loadingSkeleton} aria-label="Loading workout list">
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
            </div>
        );
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
    const { search } = WorkoutFilterStore.getFiltersSync();
    const upcomingItems = schedule.scheduleItems.flatMap((item, index) => {
        if (item instanceof WorkoutSet) {
            return item.workouts
                .filter(([, completed]) => !completed)
                .map(([workout], workoutIndex) => (
                    <WorkoutCard
                        key={`${index}-${workoutIndex}`}
                        item={workout}
                        highlight={search}
                        onClick={() => console.log('WorkoutList Card Clicked:', workout.id)}
                    />
                ));
        }

        if (item instanceof WorkoutBlock) {
            return [
                <WorkoutCard
                    key={`block-${index}`}
                    item={item}
                    highlight={search}
                    onClick={() => console.log('WorkoutList Card Clicked:', index)}
                />
            ];
        }

        console.error('Unknown item type in schedule:', item);
        return [
            <div key={`unknown-${index}`} className={styles.unknownItem}>Unknown Item</div>
        ];
    });

    const limitedItems = upcomingItems.slice(0, 4);
    const overflow = Math.max(0, upcomingItems.length - limitedItems.length);

    return (
        <div className={styles.workoutList}>
            <div className={styles.listHeader}>
                <span>Up Next</span>
                <span className={styles.listMeta}>{schedule.date}</span>
            </div>
            <div className={styles.cardStack}>
                {limitedItems.length > 0 ? limitedItems : (
                    <div className={styles.noWorkouts}>Workout schedule is empty</div>
                )}
                {overflow > 0 && <div className={styles.overflow}>+{overflow} more scheduled</div>}
            </div>
        </div>
    );
};

export default WorkoutList;