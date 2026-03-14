import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CardProgressStore from '../../store/CardProgressStore';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import styles from './ReviewDashboard.module.css';

interface ModuleReviewGroup {
  moduleId: string;
  moduleName: string;
  dueCount: number;
}

/**
 * ReviewDashboard — shows cards due for spaced-repetition review,
 * grouped by module. Acts as the landing for the /review tab.
 */
const ReviewDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dueCards = useMemo(() => CardProgressStore.getCardsDueForReview(), []);
  const totalTracked = useMemo(() => CardProgressStore.count(), []);

  const moduleGroups: ModuleReviewGroup[] = useMemo(() => {
    const cache = TrainingModuleCache.getInstance();
    const moduleMap = new Map<string, ModuleReviewGroup>();

    for (const entry of dueCards) {
      const moduleId = entry.moduleId ?? 'unknown';
      if (!moduleMap.has(moduleId)) {
        let moduleName = moduleId;
        try {
          const mod = cache.getModule(moduleId);
          if (mod?.name) moduleName = mod.name;
        } catch {
          // Module not cached
        }
        moduleMap.set(moduleId, { moduleId, moduleName, dueCount: 0 });
      }
      moduleMap.get(moduleId)!.dueCount++;
    }

    return Array.from(moduleMap.values()).sort((a, b) => b.dueCount - a.dueCount);
  }, [dueCards]);

  const handleStartReview = () => {
    navigate('/train/quiz');
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Review</h2>
      <p className={styles.subtitle}>
        Spaced repetition keeps knowledge fresh. Cards appear here when they're due.
      </p>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{dueCards.length}</span>
          <span className={styles.statLabel}>Due Now</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalTracked}</span>
          <span className={styles.statLabel}>Tracked</span>
        </div>
      </div>

      {dueCards.length > 0 ? (
        <>
          <button type="button" className={styles.startButton} onClick={handleStartReview}>
            Start Review ({dueCards.length} card{dueCards.length !== 1 ? 's' : ''})
          </button>

          <div className={styles.moduleList}>
            <h3 className={styles.moduleListTitle}>Due by Module</h3>
            {moduleGroups.map((group) => (
              <div key={group.moduleId} className={styles.moduleRow}>
                <span className={styles.moduleName}>{group.moduleName}</span>
                <span className={styles.moduleBadge}>{group.dueCount}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden>✅</span>
          <p className={styles.emptyText}>
            No cards due for review right now.
            {totalTracked === 0 && ' Complete some training drills to start tracking progress.'}
            {totalTracked > 0 && ' Check back later — your schedule adapts as you learn.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewDashboard;
