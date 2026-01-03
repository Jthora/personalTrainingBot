import React from 'react';
import styles from './BadgeStrip.module.css';
import UserProgressStore from '../../store/UserProgressStore';

const BadgeStrip: React.FC = () => {
    const progress = UserProgressStore.get();
    if (UserProgressStore.isDisabled(progress)) return null;
    const enabled = progress.flags?.badgeStripEnabled ?? true;
    if (!enabled) return null;
    const badges = progress.badges || [];
    if (badges.length === 0) return null;
    const recent = badges.slice(-3).reverse();
    const overflow = badges.length - recent.length;

    return (
        <div className={styles.strip}>
            <div className={styles.label}>Badges</div>
            <div className={styles.row}>
                {recent.map(id => (
                    <span key={id} className={styles.badge}>{id}</span>
                ))}
                {overflow > 0 && <span className={styles.more}>+{overflow}</span>}
            </div>
        </div>
    );
};

export default BadgeStrip;
