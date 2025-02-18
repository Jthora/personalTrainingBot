import React from 'react';
import DifficultySettingsStore from '../../store/DifficultySettingsStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
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

    return (
        <div className={styles.cookieSettings}>
            <h2>Cookie Settings</h2>
            <h3>Reset to Defaults</h3>
            <button onClick={clearDifficultySettings}>Clear Difficulty Settings</button>
            <button onClick={clearWorkoutSchedule}>Clear Workout Schedule</button>
        </div>
    );
};

export default CookieSettings;
