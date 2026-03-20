import styles from './OnboardingFlow.module.css';

interface GuidanceOverlayProps {
  onFastPath: () => void;
  onChooseFocus: () => void;
}

/** First-run welcome screen with two CTAs: fast-path or archetype selection */
const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({ onFastPath, onChooseFocus }) => (
  <section className={styles.guidanceOverlay} role="dialog" aria-label="Welcome">
    <h2 className={styles.guidanceTitle}>Train 19 Disciplines. Track Your Growth.</h2>
    <p className={styles.guidanceBody}>
      Cybersecurity, intelligence, fitness, martial arts, and more — 4,300+ training cards
      with spaced repetition that adapts to what you know.
    </p>
    <ul className={styles.guidanceList}>
      <li><strong>Smart scheduling</strong> — the app prioritises cards you're about to forget.</li>
      <li><strong>Works offline</strong> — train anywhere, no connection needed.</li>
      <li><strong>Your pace</strong> — track XP, streaks, and domain mastery over time.</li>
    </ul>
    <div className={styles.guidanceActions}>
      <button type="button" className={styles.stepButton} onClick={onFastPath}>
        Start Training Now
      </button>
      <button type="button" className={styles.stepButton} onClick={onChooseFocus}>
        Choose Your Focus First
      </button>
    </div>
  </section>
);

export default GuidanceOverlay;
