import React from 'react';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './SchedulesSidebar.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const SchedulesSidebar: React.FC = () => {
    const { schedule } = useWorkoutSchedule();
    const currentSchedule = schedule.scheduleItems as (WorkoutSet | WorkoutBlock)[];

    return (
        <div className={styles.schedulesSidebar}>
            <div className={styles.scrollContainer}>
                <div className={styles.scrollableContent}>
                    <h1>Current</h1>
                    <h2>Workout Schedule</h2>
                    <ul className={styles.scheduleList}>
                        {currentSchedule.map((item, index) => (
                            <li key={index} className={styles.scheduleItem}>
                                {item instanceof WorkoutSet ? (
                                    <div className={styles.workoutSet}>
                                        <span className={styles.workoutSetTitle}>Workout Set</span>
                                        <ul className={styles.workoutList}>
                                            {item.workouts.map(([workout], idx) => (
                                                <li key={idx} className={styles.workoutItem}>{workout.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className={styles.workoutBlock}>
                                        <span className={styles.workoutBlockTitle}>Workout Block</span>
                                        <ul className={styles.workoutDetails}>
                                            <li className={styles.workoutDetail}>{item.name}</li>
                                            <li className={styles.workoutDetail}>{item.description}</li>
                                            <li className={styles.workoutDetail}>{item.duration} minutes</li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SchedulesSidebar;

