import React from 'react';
import styles from './RestInterval.module.css';
import TimerDisplay from '../TimerDisplay/TimerDisplay';
import { useTimer } from '../../hooks/useTimer';

export interface RestIntervalProps {
  /** Rest duration in seconds. */
  durationSec: number;
  /** Called when the rest timer runs out or the user skips. */
  onComplete: () => void;
  /** Optional hint text, e.g. "Hydrate and reset focus." */
  hint?: string;
}

const RestInterval: React.FC<RestIntervalProps> = ({ durationSec, onComplete, hint }) => {
  const timer = useTimer({ durationSec, onComplete, autoStart: true });

  return (
    <div className={styles.panel} data-testid="rest-interval">
      <h4 className={styles.heading}>Rest Period</h4>
      <TimerDisplay
        seconds={timer.remaining}
        state={timer.state}
        label="Remaining"
        showControls={false}
      />
      {hint && <p className={styles.hint}>{hint}</p>}
      <button
        type="button"
        className={styles.skipBtn}
        onClick={onComplete}
        data-testid="rest-skip"
      >
        Skip rest
      </button>
    </div>
  );
};

export default RestInterval;
