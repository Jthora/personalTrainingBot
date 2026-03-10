import React, { useEffect } from 'react';
import styles from './LevelUpModal.module.css';

export interface LevelUpModalProps {
  previousLevel: number;
  newLevel: number;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. 0 disables. Default 5000. */
  autoDismissMs?: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  previousLevel,
  newLevel,
  onDismiss,
  autoDismissMs = 5000,
}) => {
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [onDismiss, autoDismissMs]);

  return (
    <div className={styles.overlay} role="dialog" aria-label="Level up" data-testid="level-up-modal">
      <div className={styles.modal}>
        <span className={styles.icon} aria-hidden="true">⬆️</span>
        <h2 className={styles.heading}>Level Up!</h2>
        <p className={styles.detail}>
          Level {previousLevel} → Level {newLevel}
        </p>
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={onDismiss}
          data-testid="level-up-dismiss"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
