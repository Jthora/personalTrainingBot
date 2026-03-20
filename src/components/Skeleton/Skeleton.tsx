import styles from './Skeleton.module.css';

interface SkeletonProps {
  /** Accessible label for the skeleton placeholder */
  label?: string;
  children: React.ReactNode;
}

/** Generic skeleton container with shimmer animation */
const Skeleton: React.FC<SkeletonProps> = ({ label = 'Loading content', children }) => (
  <div className={styles.container} aria-label={label} role="status" aria-busy="true">
    {children}
  </div>
);

/* ── Primitives ── */

/** Full-width shimmer line (14px) */
const Line: React.FC = () => <div className={styles.line} />;

/** 60% width shimmer line (14px) */
const LineShort: React.FC = () => <div className={styles.lineShort} />;

/** 40% width shimmer line (10px) */
const LineNarrow: React.FC = () => <div className={styles.lineNarrow} />;

/** Tall block placeholder — charts, cards (80px) */
const Block: React.FC = () => <div className={styles.block} />;

/** Stat chip placeholder (56px) */
const Chip: React.FC = () => <div className={styles.chip} />;

/** Flex row container for side-by-side elements */
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.row}>{children}</div>
);

export default Object.assign(Skeleton, {
  Line,
  LineShort,
  LineNarrow,
  Block,
  Chip,
  Row,
});
