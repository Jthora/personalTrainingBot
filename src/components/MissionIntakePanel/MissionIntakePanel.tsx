import React from 'react';
import styles from './MissionIntakePanel.module.css';

type MissionIntakePanelProps = {
  onStartBriefing: () => void;
  onDismiss: () => void;
};

const MissionIntakePanel: React.FC<MissionIntakePanelProps> = ({ onStartBriefing, onDismiss }) => {
  return (
    <section className={styles.card} aria-label="Mission intake">
      <p className={styles.eyebrow}>Welcome</p>
      <h2 className={styles.title}>Your Training Hub</h2>
      <p className={styles.body}>
        This is your Starcom Academy training console. Start drills, track progress across 19 disciplines, and build real competency over time.
      </p>

      <div className={styles.grid}>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>How it works</h3>
          <p className={styles.blockBody}>Pick a module, review training cards, rate your understanding, and the app schedules your next review automatically.</p>
        </article>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>Your first session</h3>
          <p className={styles.blockBody}>Start with &ldquo;Today&rsquo;s Training&rdquo; on the Brief page — it picks the best cards for you right now.</p>
        </article>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>Track your growth</h3>
          <p className={styles.blockBody}>Earn XP, maintain streaks, unlock badges, and watch your domain scores climb in the Stats tab.</p>
        </article>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onStartBriefing}>Start Training</button>
        <button type="button" className={styles.secondary} onClick={onDismiss}>Skip</button>
      </div>
    </section>
  );
};

export default MissionIntakePanel;
