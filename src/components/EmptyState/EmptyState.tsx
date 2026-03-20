import styles from './EmptyState.module.css';

interface EmptyStateProps {
  /** Emoji or icon character */
  icon: string;
  /** Heading text */
  title: string;
  /** Descriptive body text */
  message: string;
  /** Optional CTA rendered below message */
  children?: React.ReactNode;
}

/** Standardized empty state across all surfaces */
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children }) => (
  <div className={styles.container} role="status">
    <span className={styles.icon} aria-hidden="true">{icon}</span>
    <p className={styles.title}>{title}</p>
    <p className={styles.message}>{message}</p>
    {children}
  </div>
);

export default EmptyState;
