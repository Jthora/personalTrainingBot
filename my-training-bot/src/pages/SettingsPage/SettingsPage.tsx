import React from 'react';
import Header from '../../components/Header/Header';
import CardSelector from '../../components/CardSelector/CardSelector';
import SettingsWindow from '../../components/SettingsWindow/SettingsWindow';
import SettingsSidebar from '../../components/SettingsSidebar/SettingsSidebar';
import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer} style={{ overflowX: 'hidden', overflowY: 'auto'  }}>
            <Header />
            <div className={styles.contentContainer}>
                <div className={styles.cardSelectorContainer}>
                    <CardSelector />
                </div>
                <div className={styles.settingsWindowContainer}>
                    <SettingsWindow />
                </div>
                <div className={styles.settingsSidebarContainer}>
                    <SettingsSidebar />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;