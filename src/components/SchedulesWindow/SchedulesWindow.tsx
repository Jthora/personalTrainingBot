import React from 'react';
import { useNavigate } from 'react-router-dom';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import CustomScheduleCreatorView from '../CustomScheduleCreatorView/CustomScheduleCreatorView';
import styles from './SchedulesWindow.module.css';

const SchedulesWindow: React.FC = () => {
    const { createNewSchedule, error, scheduleStatus, loadSchedule, isLoading } = useWorkoutSchedule();
    const navigate = useNavigate();

    const showStale = scheduleStatus.stale || scheduleStatus.source === 'fallback';
    const statusMessage = scheduleStatus.message;

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
            <div className={styles.statusRow}>
                {showStale && <span className={styles.statusPill}>Stale</span>}
                {scheduleStatus.status === 'optimistic' && (
                    <span className={styles.statusSubtle} role="status">{statusMessage ?? 'Saving changes…'}</span>
                )}
            </div>

            {(error || scheduleStatus.status === 'error') && (
                <div className={styles.errorBanner} role="status">
                    <div>{error ?? statusMessage ?? 'Unable to refresh schedule.'}</div>
                    <button onClick={loadSchedule} disabled={isLoading} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            )}
            <CustomScheduleCreatorView />
        </div>
    );
};

export default SchedulesWindow;
