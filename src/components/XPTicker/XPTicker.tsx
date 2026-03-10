import React, { useEffect } from 'react';
import styles from './XPTicker.module.css';

export interface XPTickerProps {
  amount: number;
  onDone: () => void;
  /** Duration in ms before auto-removing. Default 2000. */
  durationMs?: number;
}

const XPTicker: React.FC<XPTickerProps> = ({ amount, onDone, durationMs = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, durationMs);
    return () => clearTimeout(timer);
  }, [onDone, durationMs]);

  return (
    <div className={styles.ticker} role="status" aria-label={`+${amount} XP`} data-testid="xp-ticker">
      +{amount} XP
    </div>
  );
};

export default XPTicker;
