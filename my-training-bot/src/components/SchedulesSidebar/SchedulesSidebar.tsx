import React, { useState, useEffect } from 'react';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './SchedulesSidebar.module.css';

const SchedulesSidebar: React.FC<{ scheduleUpdated: boolean }> = ({ scheduleUpdated }) => {
    const [currentSchedule, setCurrentSchedule] = useState<(WorkoutSet | WorkoutBlock)[]>([]);

    const getCurrentSchedule = () => {
        const schedule = WorkoutScheduleStore.getScheduleSync();
        return schedule ? schedule.scheduleItems : [];
    };

    useEffect(() => {
        setCurrentSchedule(getCurrentSchedule());
    }, [scheduleUpdated]);

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

