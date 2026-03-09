import React from 'react';
import styles from './MissionIntakePanel.module.css';

type MissionIntakePanelProps = {
  onStartBriefing: () => void;
  onDismiss: () => void;
};

const MissionIntakePanel: React.FC<MissionIntakePanelProps> = ({ onStartBriefing, onDismiss }) => {
  return (
    <section className={styles.card} aria-label="Mission intake">
      <p className={styles.eyebrow}>Archangel Knights Intake</p>
      <h2 className={styles.title}>Psi Operative Super Hero Cyber Investigator Training</h2>
      <p className={styles.body}>
        You are entering the Advanced Internship mission flow. Use this console to assess signals, investigate cases,
        and deliver debrief-quality outcomes.
      </p>

      <div className={styles.grid}>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>Who this is for</h3>
          <p className={styles.blockBody}>Operatives enrolled in the Archangel Knights Advanced Internship Training Program.</p>
        </article>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>Objective</h3>
          <p className={styles.blockBody}>Complete one mission cycle from Brief to Debrief with clear, evidence-backed decisions.</p>
        </article>
        <article className={styles.block}>
          <h3 className={styles.blockTitle}>Session outcome</h3>
          <p className={styles.blockBody}>Leave this session with triaged signals, case findings, and a completed after-action report.</p>
        </article>
      </div>

      <div className={styles.metrics}>
        <h3 className={styles.blockTitle}>Mission chips explained</h3>
        <ul className={styles.metricList}>
          <li>📅 Left: drills still queued for this cycle.</li>
          <li>🎚️ L#: your current training intensity level.</li>
          <li>⚖️ Aligned/Check mix: whether your current drill mix matches mission targets.</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onStartBriefing}>Start Briefing</button>
        <button type="button" className={styles.secondary} onClick={onDismiss}>Dismiss</button>
      </div>
    </section>
  );
};

export default MissionIntakePanel;
