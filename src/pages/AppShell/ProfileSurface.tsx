import React, { useState } from 'react';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { isMissionModeEnabled, setMissionMode, MISSION_MODE_STORAGE_KEY } from './appShellTabs';
import styles from './ProfileSurface.module.css';

/**
 * ProfileSurface — identity, settings, mission mode toggle, data management.
 * Replaces portions of the former DebriefSurface.
 */
const ProfileSurface: React.FC = () => {
  const profile = OperativeProfileStore.get();
  const [missionMode, setMissionModeState] = useState(isMissionModeEnabled);

  const handleToggleMissionMode = () => {
    const next = !missionMode;
    setMissionMode(next);
    setMissionModeState(next);
  };

  const handleExportData = () => {
    try {
      const keys = [
        'ptb:user-progress',
        'ptb:card-progress',
        'ptb:operative-profile',
        'ptb:mission-schedule',
        MISSION_MODE_STORAGE_KEY,
      ];
      const data: Record<string, string | null> = {};
      for (const key of keys) {
        data[key] = localStorage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ptb-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail on export error
    }
  };

  return (
    <div className={styles.profile}>
      <h2 className={styles.title}>Profile</h2>

      {/* ── Identity section ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cadet Dossier</h3>
        {profile ? (
          <div className={styles.identityCard}>
            <div className={styles.identityRow}>
              <span className={styles.identityLabel}>Callsign</span>
              <span className={styles.identityValue}>{profile.callsign || 'Unassigned'}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityLabel}>Division</span>
              <span className={styles.identityValue}>{profile.archetypeId || 'None'}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityLabel}>Instructor</span>
              <span className={styles.identityValue}>{profile.handlerId || 'None'}</span>
            </div>
            <div className={styles.identityRow}>
              <span className={styles.identityLabel}>Enrolled</span>
              <span className={styles.identityValue}>
                {profile.enrolledAt ? new Date(profile.enrolledAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        ) : (
          <p className={styles.placeholder}>No cadet profile configured.</p>
        )}
      </section>

      {/* ── Settings ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Settings</h3>

        <label className={styles.toggleRow}>
          <span className={styles.toggleLabel}>
            Active Duty
            <span className={styles.toggleHint}>
              Show full mission workflow tabs (Brief, Triage, Case, Signal, Debrief)
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={missionMode}
            className={`${styles.toggle} ${missionMode ? styles.toggleOn : ''}`}
            onClick={handleToggleMissionMode}
          >
            <span className={styles.toggleKnob} />
          </button>
        </label>
      </section>

      {/* ── Data management ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Management</h3>
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton} onClick={handleExportData}>
            Export Data
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProfileSurface;
