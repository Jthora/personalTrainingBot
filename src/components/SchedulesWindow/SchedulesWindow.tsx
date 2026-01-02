import React from 'react';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import CustomScheduleCreatorView from '../CustomScheduleCreatorView/CustomScheduleCreatorView';
import styles from './SchedulesWindow.module.css';

const SchedulesWindow: React.FC = () => {
    const { createNewSchedule, error } = useWorkoutSchedule();

    const createNewWorkoutSchedule = async () => {
        console.log('Creating a new workout schedule...');
        await createNewSchedule();
    };

    return (
        <div className={styles.schedulesWindow}>
            <button onClick={createNewWorkoutSchedule} className={styles.createNewScheduleButton}>Generate Random Workout Schedule</button>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <CustomScheduleCreatorView />
        </div>
    );
};

export default SchedulesWindow;
