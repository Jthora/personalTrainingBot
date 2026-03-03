import React from 'react';
import styles from './SettingsSection.module.css';
import Web3Panel from '../../../components/Settings/Web3Panel';

const SettingsSection: React.FC = () => {
    return (
        <section id="section-settings" aria-label="Settings" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Settings & Profile</h2>
                <p className={styles.body}>Manage Web3 connection, profile, and preferences. Full settings remain available on the Settings page.</p>
            </div>
            <div className={styles.card}>
                <p className={styles.body}>For full controls, go to the Settings page.</p>
                <a className={styles.link} href="/settings">Open Settings</a>
            </div>
            <Web3Panel />
        </section>
    );
};

export default SettingsSection;
