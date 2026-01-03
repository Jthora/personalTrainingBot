import React from 'react';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import styles from './WorkoutsSidebar.module.css';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import WorkoutFilters from '../WorkoutFilters/WorkoutFilters';

const WorkoutsSidebar: React.FC = () => {
    const applyPreset = (preset: 'quick20' | 'upper_lower' | 'cardio') => {
        WorkoutCategoryCache.getInstance().applyPreset(preset);
    };

    return (
        <div className={styles.workoutsSidebar}>
            <div className={styles.scrollableContent}>
                <h2>Difficulty Settings</h2>
                <DifficultySettings />
                <WorkoutFilters />
                <div className={styles.presetSection}>
                    <h3>Presets</h3>
                    <div className={styles.presetButtons}>
                        <button type="button" onClick={() => applyPreset('quick20')}>Quick 20</button>
                        <button type="button" onClick={() => applyPreset('upper_lower')}>Upper/Lower</button>
                        <button type="button" onClick={() => applyPreset('cardio')}>Cardio</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutsSidebar;
