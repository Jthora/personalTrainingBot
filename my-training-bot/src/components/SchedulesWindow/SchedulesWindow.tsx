import React from 'react';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import CustomScheduleCreatorView from '../CustomScheduleCreatorView/CustomScheduleCreatorView';
import styles from './SchedulesWindow.module.css';

interface SchedulesWindowProps {
    onScheduleUpdate: () => void;
}

const SchedulesWindow: React.FC<SchedulesWindowProps> = ({ onScheduleUpdate }) => {
    const { createNewSchedule } = useWorkoutSchedule();

    const createNewWorkoutSchedule = async () => {
        console.log('Creating a new workout schedule...');
        await createNewSchedule();
        onScheduleUpdate();
    };

    return (
        <div className={styles.schedulesWindow}>
            <button onClick={createNewWorkoutSchedule} className={styles.createNewScheduleButton}>Generate Random Workout Schedule</button>
            <CustomScheduleCreatorView onScheduleUpdate={onScheduleUpdate} />
        </div>
    );
};

export default SchedulesWindow;
