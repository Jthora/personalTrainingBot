import React from 'react';
import SoundSettings from '../SoundSettings/SoundSettings';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import styles from './SettingsSidebar.module.css';

const SettingsSidebar: React.FC = () => {
    return (
        <div className={styles.settingsSidebar}>
            <div className={styles.scrollableContent}>
                <h2>Sound Settings</h2>
                <SoundSettings />
            </div>
        </div>
    );
};

export default SettingsSidebar;
