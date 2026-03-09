import styles from './SurfaceLoader.module.css';

const SurfaceLoader: React.FC = () => (
  <div className={styles.container} aria-label="Loading surface" role="status">
    <div className={styles.spinner} />
  </div>
);

export default SurfaceLoader;
