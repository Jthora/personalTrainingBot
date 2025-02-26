import React, { useState } from 'react';
import styles from './DeleteExistingWorkoutSchedulePopup.module.css';
import { CustomWorkoutSchedule } from '../../types/WorkoutSchedule';

interface DeleteExistingWorkoutSchedulePopupProps {
    schedules: CustomWorkoutSchedule[];
    onClose: () => void;
    onDelete: (scheduleId: string) => void;
}

const DeleteExistingWorkoutSchedulePopup: React.FC<DeleteExistingWorkoutSchedulePopupProps> = ({ schedules, onClose, onDelete }) => {
    const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

    const handleDelete = () => {
        if (selectedSchedule) {
            onDelete(selectedSchedule);
            onClose();
        }
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <h1>Delete Workout Schedule</h1>
                <select onChange={(e) => setSelectedSchedule(e.target.value)} value={selectedSchedule || ''}>
                    <option value="" disabled>Select Schedule to Delete</option>
                    {schedules.map(schedule => (
                        <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                    ))}
                </select>
                <button onClick={handleDelete} disabled={!selectedSchedule}>Delete</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default DeleteExistingWorkoutSchedulePopup;
