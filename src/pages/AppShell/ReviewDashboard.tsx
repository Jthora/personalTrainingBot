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
  const forecast = useMemo(() => CardProgressStore.forecastDue(7), []);
  const overallStats = useMemo(() => CardProgressStore.getOverallStats(), []);

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
    navigate('/train/quiz?mode=review');
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

      {/* SR Health Stats */}
      {overallStats.total > 0 && (
        <div className={styles.srStats} data-testid="sr-stats">
          <h3 className={styles.moduleListTitle}>Card Health</h3>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#4ade80' }}>{overallStats.mature}</span>
              <span className={styles.statLabel}>Mature</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#fbbf24' }}>{overallStats.learning}</span>
              <span className={styles.statLabel}>Learning</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#94a3b8' }}>{overallStats.newCards}</span>
              <span className={styles.statLabel}>New</span>
            </div>
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      {totalTracked > 0 && (
        <div className={styles.forecast} data-testid="review-forecast">
          <h3 className={styles.moduleListTitle}>7-Day Forecast</h3>
          <div className={styles.forecastBars}>
            {forecast.map((bucket) => {
              const maxCount = Math.max(1, ...forecast.map((b) => b.count));
              const heightPct = bucket.count > 0 ? Math.max(8, (bucket.count / maxCount) * 100) : 0;
              const dayLabel = bucket.day === 0 ? 'Today' : bucket.day === 1 ? 'Tmrw' : new Date(bucket.date).toLocaleDateString('en', { weekday: 'short' });
              return (
                <div key={bucket.day} className={styles.forecastCol}>
                  <span className={styles.forecastCount}>{bucket.count || ''}</span>
                  <div className={styles.forecastBar} style={{ height: `${heightPct}%` }} />
                  <span className={styles.forecastDay}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
