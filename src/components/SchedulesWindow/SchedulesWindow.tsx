import React from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import CustomScheduleCreatorView from '../CustomScheduleCreatorView/CustomScheduleCreatorView';
import styles from './SchedulesWindow.module.css';

const SchedulesWindow: React.FC = () => {
    const { createNewSchedule, error } = useWorkoutSchedule();
    const navigate = useNavigate();

    const createNewWorkoutSchedule = async () => {
        console.log('Creating a new workout schedule...');
        await createNewSchedule();
    };

    return (
        <div className={styles.schedulesWindow}>
            <div className={styles.actionsRow}>
                <button
                    onClick={() => navigate('/workouts?source=schedules')}
                    className={styles.addWorkoutsButton}
                >
                    Add workouts
                </button>
                <button onClick={createNewWorkoutSchedule} className={styles.createNewScheduleButton}>Generate Random Workout Schedule</button>
            </div>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <CustomScheduleCreatorView />
        </div>
    );
};

export default SchedulesWindow;
