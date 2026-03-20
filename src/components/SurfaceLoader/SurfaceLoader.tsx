import styles from './SurfaceLoader.module.css';

const SurfaceLoader: React.FC = () => (
  <div className={styles.container} aria-label="Loading surface" role="status" aria-live="polite">
    <div className={styles.spinner} />
    <span className={styles.srOnly}>Loading surface…</span>
  </div>
);

export default SurfaceLoader;
