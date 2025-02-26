import React from 'react';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutSet } from '../../types/WorkoutSchedule';
import styles from './SchedulesWindow.module.css';

const SchedulesWindow: React.FC = () => {
    const { createNewSchedule } = useWorkoutSchedule();
    const getCurrentSchedule = () => {
        const schedule = WorkoutScheduleStore.getScheduleSync();
        return schedule ? schedule.scheduleItems : [];
    };

    const createNewWorkoutSchedule = async () => {
        console.log('Creating a new workout schedule...');
        await createNewSchedule();
    };

    const currentSchedule = getCurrentSchedule();

    return (
        <div className={styles.schedulesWindow}>
            <button onClick={createNewWorkoutSchedule} className={styles.createNewScheduleButton}>Generate Random Workout Schedule</button>
            <h3>Current Workout Schedule</h3>
            <ul className={styles.scheduleList}>
                {currentSchedule.map((item, index) => (
                    <li key={index}>
                        {item instanceof WorkoutSet ? (
                            <div>
                                <span>Workout Set</span>
                                <ul>
                                    {item.workouts.map(([workout], idx) => (
                                        <li key={idx}>{workout.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <span>{item.name}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SchedulesWindow;
