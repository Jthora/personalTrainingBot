import React, { useState, useEffect } from 'react';
import CustomWorkoutSchedulesStore from '../../store/CustomWorkoutSchedulesStore';
import ScheduleCalendarTimerStore from '../../store/ScheduleCalendarTimerStore';
import { ScheduleCalendar, ScheduleCalendarTimer } from '../../types/WorkoutSchedule';
import styles from './ManageWorkoutScheduleCalendarPopup.module.css';

const ManageWorkoutScheduleCalendarPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const customSchedules = CustomWorkoutSchedulesStore.getCustomSchedules();
    const [days, setDays] = useState<{ day: number, scheduleId: string }[]>([{ day: 1, scheduleId: 'none' }]);
    const [dayStartTime, setDayStartTime] = useState('00:00');
    const [dayEndTime, setDayEndTime] = useState('23:59');
    const [dayWakeUpTime, setDayWakeUpTime] = useState('06:00');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setDays([{ day: 1, scheduleId: 'none' }]);
        setDayStartTime('00:00');
        setDayEndTime('23:59');
        setDayWakeUpTime('06:00');
    }, []);

    const handleSave = () => {
        if (days.length < 1 || days.length > 365) {
            setError('Number of days must be between 1 and 365.');
            return;
        }
        setIsSaving(true);
        const calendar = new ScheduleCalendar(days, dayStartTime, dayEndTime, dayWakeUpTime);
        const timer = new ScheduleCalendarTimer(calendar, 0);
        ScheduleCalendarTimerStore.saveScheduleCalendarTimer(timer);
        setIsSaving(false);
        onClose();
    };

    const handleDaysChange = (day: number, scheduleId: string) => {
        setDays(prevDays => prevDays.map(d => d.day === day ? { ...d, scheduleId } : d));
    };

    const handleNumberOfDaysChange = (numDays: number) => {
        if (numDays < 1 || numDays > 365) {
            setError('Number of days must be between 1 and 365.');
            return;
        }
        setError(null);
        setDays(Array.from({ length: numDays }, (_, i) => ({ day: i + 1, scheduleId: 'none' })));
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <h2>Manage Workout Schedule Calendar</h2>
                <div className={styles.divisionContainer}>
                    <div className={styles.leftDivision}>
                        <label>
                            Number of Days:
                            <input 
                                type="number" 
                                min="1" 
                                max="365" 
                                value={days.length} 
                                onChange={(e) => handleNumberOfDaysChange(Number(e.target.value))} 
                                title="Enter the number of days for the schedule (1-365)"
                            />
                        </label>
                        <label>
                            Day Start Time:
                            <input 
                                type="time" 
                                value={dayStartTime} 
                                onChange={(e) => setDayStartTime(e.target.value)} 
                                title="Enter the start time for each day"
                            />
                        </label>
                        <label>
                            Day End Time:
                            <input 
                                type="time" 
                                value={dayEndTime} 
                                onChange={(e) => setDayEndTime(e.target.value)} 
                                title="Enter the end time for each day"
                            />
                        </label>
                        <label>
                            Wake Up Time:
                            <input 
                                type="time" 
                                value={dayWakeUpTime} 
                                onChange={(e) => setDayWakeUpTime(e.target.value)} 
                                title="Enter the wake up time for each day"
                            />
                        </label>
                    </div>
                    <div className={styles.rightDivision}>
                        {days.map((day, index) => (
                            <div key={index} className={styles.dayItem}>
                                <label>Day {day.day}:</label>
                                <select 
                                    onChange={(e) => handleDaysChange(day.day, e.target.value)} 
                                    value={day.scheduleId}
                                    title={`Select a schedule for day ${day.day}`}
                                >
                                    <option value="none">No Schedule</option>
                                    {customSchedules.map(schedule => (
                                        <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.buttonGroup}>
                    <button onClick={handleSave} disabled={isSaving}>Save</button>
                    <button onClick={onClose} disabled={isSaving}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ManageWorkoutScheduleCalendarPopup;

