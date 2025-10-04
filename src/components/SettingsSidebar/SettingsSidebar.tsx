import React from 'react';
import SoundSettings from '../SoundSettings/SoundSettings';
import CookieSettings from '../CookieSettings/CookieSettings';
import styles from './SettingsSidebar.module.css';

const SettingsSidebar: React.FC = () => {
    return (
        <div className={styles.settingsSidebar}>
            <div className={styles.scrollableContent}>
                <h2>Sound Settings</h2>
                <SoundSettings />
                <hr className={styles.divider} />
                <CookieSettings />
            </div>
        </div>
    );
};

export default SettingsSidebar;
