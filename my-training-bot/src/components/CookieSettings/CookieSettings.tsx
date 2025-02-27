import React from 'react';
import DifficultySettingsStore from '../../store/DifficultySettingsStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import CustomWorkoutSchedulesStore from '../../store/CustomWorkoutSchedulesStore';
import ScheduleCalendarTimerStore from '../../store/ScheduleCalendarTimerStore';
import styles from './CookieSettings.module.css';

const CookieSettings: React.FC = () => {
    const clearDifficultySettings = () => {
        DifficultySettingsStore.clearSettings();
        alert('Difficulty settings cleared.');
    };

    const clearWorkoutSchedule = () => {
        WorkoutScheduleStore.clearSchedule();
        alert('Workout schedule cleared.');
    };

    const clearCustomSchedules = () => {
        CustomWorkoutSchedulesStore.clearCustomSchedules();
        alert('Custom workout schedules cleared.');
    };

    const clearScheduleCalendar = () => {
        ScheduleCalendarTimerStore.clearScheduleCalendarTimer();
        alert('Schedule calendar cleared.');
    };

    const setToFactoryDefault = () => {
        clearDifficultySettings();
        clearWorkoutSchedule();
        clearCustomSchedules();
        clearScheduleCalendar();
        alert('All settings reset to factory defaults.');
    };

    return (
        <div className={styles.cookieSettings}>
            <h2>Cookie Settings</h2>
            <h3>Reset to Defaults</h3>
            <button onClick={clearDifficultySettings}>Clear Difficulty Settings</button>
            <button onClick={clearWorkoutSchedule}>Clear Workout Schedule</button>
            <button onClick={clearCustomSchedules}>Clear Custom Schedules</button>
            <button onClick={clearScheduleCalendar}>Clear Schedule Calendar</button>
            <button onClick={setToFactoryDefault}>Set to Factory Default</button>
        </div>
    );
};

export default CookieSettings;
