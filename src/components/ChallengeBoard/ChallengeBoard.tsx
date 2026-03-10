import React, { useCallback, useEffect, useState } from 'react';
import styles from './ChallengeBoard.module.css';
import UserProgressStore from '../../store/UserProgressStore';
import type { ChallengeInstance } from '../../types/Challenge';

export interface ChallengeBoardProps {
  /** Override challenges for testing. Falls back to UserProgressStore. */
  challenges?: ChallengeInstance[];
}

const percent = (progress: number, target: number) =>
  Math.min(100, Math.round((progress / Math.max(1, target)) * 100));

const ChallengeBoard: React.FC<ChallengeBoardProps> = ({ challenges: overrideChallenges }) => {
  const [challenges, setChallenges] = useState<ChallengeInstance[]>(overrideChallenges ?? []);

  const refresh = useCallback(() => {
    if (overrideChallenges) return;
    const progress = UserProgressStore.get();
    setChallenges(progress.challenges ?? []);
  }, [overrideChallenges]);

  useEffect(() => {
    if (!overrideChallenges) refresh();
  }, [refresh, overrideChallenges]);

  const handleClaim = (id: string) => {
    const { claimed } = UserProgressStore.claimChallenge(id);
    if (claimed) refresh();
  };

  const active = challenges.filter(c => !c.hidden);

  if (active.length === 0) {
    return (
      <section className={styles.board} aria-label="Challenges">
        <h3 className={styles.heading}>Active Challenges</h3>
        <p className={styles.empty}>No active challenges. Complete ops to unlock new challenges.</p>
      </section>
    );
  }

  return (
    <section className={styles.board} aria-label="Challenges">
      <h3 className={styles.heading}>Active Challenges</h3>
      <div className={styles.list}>
        {active.map(c => {
          const pct = percent(c.progress, c.target);
          const canClaim = c.completed && !c.claimed;

          return (
            <div key={c.id} className={styles.challengeCard}>
              <div className={styles.cardHeader}>
                <span className={styles.title}>{c.title}</span>
                <span className={styles.timeframe}>{c.timeframe}</span>
              </div>
              {c.description && <p className={styles.description}>{c.description}</p>}
              <div className={styles.progressBar}>
                <div
                  className={c.completed ? styles.progressFillComplete : styles.progressFill}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className={styles.meta}>
                <span>{c.progress} / {c.target} {c.unit}</span>
                <span className={styles.xpReward}>+{c.rewardXp} XP</span>
              </div>
              {canClaim && (
                <button
                  type="button"
                  className={styles.claimButton}
                  onClick={() => handleClaim(c.id)}
                >
                  Claim Reward
                </button>
              )}
              {c.claimed && <span className={styles.claimed}>Claimed ✓</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ChallengeBoard;
