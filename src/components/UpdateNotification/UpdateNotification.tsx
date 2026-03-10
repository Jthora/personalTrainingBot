import React from 'react';
import { useServiceWorkerUpdate } from '../../hooks/useServiceWorkerUpdate';
import styles from './UpdateNotification.module.css';

/**
 * Top-bar notification that appears when a new service worker is ready.
 * Prompts the user to reload and pick up updated assets.
 */
const UpdateNotification: React.FC = () => {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className={styles.bar} role="alert" aria-label="Update available" data-testid="update-notification">
      <span className={styles.text}>A new version is available.</span>
      <button type="button" className={styles.reloadBtn} onClick={applyUpdate} data-testid="update-reload">
        Reload
      </button>
    </div>
  );
};

export default UpdateNotification;
