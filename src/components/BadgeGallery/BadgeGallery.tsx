import React, { useMemo } from 'react';
import styles from './BadgeGallery.module.css';
import UserProgressStore from '../../store/UserProgressStore';
import { getBadgeCatalog } from '../../data/badgeCatalog';

export interface BadgeGalleryProps {
  /** Earned badge IDs. Falls back to UserProgressStore. */
  earnedIds?: string[];
}

const rarityOrder: Record<string, number> = { common: 0, rare: 1, epic: 2 };

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ earnedIds: overrideIds }) => {
  const catalog = useMemo(() => getBadgeCatalog(), []);
  const earnedIds = useMemo(() => {
    if (overrideIds) return new Set(overrideIds);
    const progress = UserProgressStore.get();
    return new Set(progress.badges ?? []);
  }, [overrideIds]);

  const sorted = useMemo(
    () =>
      [...catalog].sort((a, b) => {
        const aEarned = earnedIds.has(a.id) ? 0 : 1;
        const bEarned = earnedIds.has(b.id) ? 0 : 1;
        if (aEarned !== bEarned) return aEarned - bEarned;
        return (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0);
      }),
    [catalog, earnedIds],
  );

  const earnedCount = [...earnedIds].filter(id => catalog.some(b => b.id === id)).length;

  return (
    <section className={styles.gallery} aria-label="Badge gallery">
      <div className={styles.headRow}>
        <h3 className={styles.heading}>Badges</h3>
        <span className={styles.counter}>{earnedCount} / {catalog.length}</span>
      </div>
      <div className={styles.grid}>
        {sorted.map(badge => {
          const earned = earnedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`${styles.badgeCard} ${earned ? styles.earned : styles.locked}`}
              data-rarity={badge.rarity}
              aria-label={`${badge.name}${earned ? '' : ' (locked)'}`}
            >
              <span className={styles.icon}>{badge.icon ?? '🔒'}</span>
              <span className={styles.name}>{badge.name}</span>
              <span className={styles.rarity}>{badge.rarity}</span>
              {!earned && <span className={styles.lockOverlay}>🔒</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BadgeGallery;
