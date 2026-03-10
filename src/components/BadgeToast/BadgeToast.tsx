import React, { useEffect } from 'react';
import styles from './BadgeToast.module.css';
import { getBadgeCatalog } from '../../data/badgeCatalog';

export interface BadgeToastProps {
  badgeId: string;
  onDismiss: () => void;
  /** Auto-dismiss after ms. Default 3000. */
  autoDismissMs?: number;
}

const BadgeToast: React.FC<BadgeToastProps> = ({ badgeId, onDismiss, autoDismissMs = 3000 }) => {
  const catalog = getBadgeCatalog();
  const badge = catalog.find((b) => b.id === badgeId);

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [onDismiss, autoDismissMs]);

  return (
    <div className={styles.toast} role="status" aria-label="Badge unlocked" data-testid="badge-toast">
      <span className={styles.icon} aria-hidden="true">{badge?.icon ?? '🏅'}</span>
      <div className={styles.text}>
        <span className={styles.heading}>Badge Unlocked</span>
        <span className={styles.badge}>{badge?.name ?? badgeId}</span>
      </div>
    </div>
  );
};

export default BadgeToast;
