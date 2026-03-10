import React, { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import styles from './InstallBanner.module.css';

/**
 * A banner that appears when the browser offers a PWA install prompt.
 * Dismissed banners stay hidden for the session.
 */
const InstallBanner: React.FC = () => {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <div className={styles.banner} role="status" aria-label="Install app" data-testid="install-banner">
      <span className={styles.text}>Install the Training Console for offline access</span>
      <button type="button" className={styles.installBtn} onClick={handleInstall} data-testid="install-btn">
        Install
      </button>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install banner"
        data-testid="install-dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default InstallBanner;
