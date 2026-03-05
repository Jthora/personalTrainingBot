import React from 'react';
import styles from './SettingsWindow.module.css';
import { useSettings } from '../../context/SettingsContext';

const SettingsWindow: React.FC = () => {
    const { lowDataMode, toggleLowDataMode, syncState, syncError, lastSyncAt, triggerSync } = useSettings();

    const formatLastSync = () => {
        if (!lastSyncAt) return 'Not yet synced';
        const date = new Date(lastSyncAt);
        return `Last sync: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <div className={styles.settingsWindow}>
            <div className={styles.card}>
                <h2 className={styles.title}>Privacy and Offline Behavior</h2>
                <p className={styles.body}>Data stays local to this device. Readiness and drill telemetry are logged to console only; no network sink is configured.</p>
                <p className={styles.body}>Offline: the service worker caches the starter kit JSON and manifest. Clear storage and reload to reset.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <h3 className={styles.subtitle}>Low-data mode</h3>
                        <p className={styles.body}>Skip prefetch and background warming to reduce network use. Media still streams on demand.</p>
                    </div>
                    <label className={styles.switchLabel}>
                        <input type="checkbox" checked={lowDataMode} onChange={toggleLowDataMode} />
                        <span className={styles.switchText}>{lowDataMode ? 'On' : 'Off'}</span>
                    </label>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <h3 className={styles.subtitle}>Preload starter kit</h3>
                        <p className={styles.body}>Fetch the manifest and starter shard now so they are available offline.</p>
                        <p className={styles.status}>{formatLastSync()}</p>
                        {syncError && <p className={styles.error}>Sync failed: {syncError}</p>}
                    </div>
                    <button className={styles.button} onClick={triggerSync} disabled={syncState === 'running'}>
                        {syncState === 'running' ? 'Syncing…' : 'Preload now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsWindow;
