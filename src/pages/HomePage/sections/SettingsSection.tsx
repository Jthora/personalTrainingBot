import React from 'react';
import styles from './SettingsSection.module.css';
import { useSettings } from '../../../context/SettingsContext';

const SettingsSection: React.FC = () => {
    const { lowDataMode, toggleLowDataMode, syncState, triggerSync, lastSyncAt } = useSettings();
    const statusText = lastSyncAt ? `Last sync: ${new Date(lastSyncAt).toLocaleTimeString()}` : 'No sync yet';

    return (
        <section id="section-settings" aria-label="Ops and Settings" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Ops / Settings</h2>
                <p className={styles.body}>Configure low-data and privacy posture. Web3 hooks are removed for this mission build.</p>
            </div>
            <div className={styles.card}>
                <p className={styles.body}>Data stays on-device; readiness and drill telemetry are logged locally for now. Clear storage to reset.</p>
                <div className={styles.row}>
                    <div>
                        <p className={styles.bodyStrong}>Low-data mode</p>
                        <p className={styles.body}>{lowDataMode ? 'Enabled — prefetch/warmth skipped.' : 'Disabled — full warming allowed.'}</p>
                    </div>
                    <label className={styles.inlineSwitch}>
                        <input type="checkbox" checked={lowDataMode} onChange={toggleLowDataMode} />
                        <span>{lowDataMode ? 'On' : 'Off'}</span>
                    </label>
                </div>
                <div className={styles.row}>
                    <div>
                        <p className={styles.bodyStrong}>Preload starter kit</p>
                        <p className={styles.body}>{statusText}</p>
                    </div>
                    <button className={styles.button} onClick={triggerSync} disabled={syncState === 'running'}>
                        {syncState === 'running' ? 'Syncing…' : 'Preload now'}
                    </button>
                </div>
                <a className={styles.link} href="/settings">Open Settings</a>
            </div>
        </section>
    );
};

export default SettingsSection;
