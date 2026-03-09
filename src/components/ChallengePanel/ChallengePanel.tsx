import React, { useCallback, useEffect, useState } from 'react';
import styles from './ChallengePanel.module.css';
import UserProgressStore from '../../store/UserProgressStore';
import type { ChallengeInstance } from '../../types/Challenge';

const ChallengePanel: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeInstance[]>([]);

  const refresh = useCallback(() => {
    const progress = UserProgressStore.get();
    setChallenges(progress.challenges ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClaim = (id: string) => {
    const { claimed, xpAwarded } = UserProgressStore.claimChallenge(id);
    if (claimed) {
      console.log(`[ChallengePanel] Claimed challenge ${id}, awarded ${xpAwarded} XP`);
    }
    refresh();
  };

  if (challenges.length === 0) {
    return (
      <section className={styles.panel} aria-label="Active Challenges">
        <p className={styles.heading}>Active Challenges</p>
        <p className={styles.empty}>No active challenges. Complete a drill to trigger challenge rotation.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Active Challenges">
      <p className={styles.heading}>Active Challenges</p>
      {challenges.map(challenge => {
        const pct = Math.min(100, Math.round((challenge.progress / Math.max(1, challenge.target)) * 100));
        return (
          <div key={challenge.id} className={styles.challengeCard}>
            <div className={styles.cardHeader}>
              <p className={styles.title}>{challenge.title}</p>
              <span className={styles.timeframe}>{challenge.timeframe}</span>
            </div>
            <p className={styles.description}>{challenge.description}</p>
            <div className={styles.progressBar}>
              <div
                className={challenge.completed ? styles.progressFillComplete : styles.progressFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className={styles.meta}>
              <span>{challenge.progress}/{challenge.target} {challenge.unit}</span>
              {challenge.completed && !challenge.claimed ? (
                <button className={styles.claimButton} onClick={() => handleClaim(challenge.id)}>
                  Claim +{challenge.rewardXp} XP
                </button>
              ) : challenge.claimed ? (
                <span className={styles.claimed}>Claimed ✓</span>
              ) : (
                <span className={styles.xpReward}>+{challenge.rewardXp} XP</span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ChallengePanel;
