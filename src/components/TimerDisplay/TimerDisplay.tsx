import React from 'react';
import styles from './TimerDisplay.module.css';
import type { TimerState } from '../../hooks/useTimer';

export interface TimerDisplayProps {
  /** Seconds to display (elapsed or remaining). */
  seconds: number;
  state: TimerState;
  /** Label shown above the time. Default "elapsed". */
  label?: string;
  /** Show pause/resume controls. Default true. */
  showControls?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

/** Format seconds as MM:SS. */
export const formatTime = (totalSec: number): string => {
  const m = Math.floor(Math.abs(totalSec) / 60);
  const s = Math.abs(totalSec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  state,
  label = 'Elapsed',
  showControls = true,
  onPause,
  onResume,
  onReset,
}) => {
  return (
    <div className={styles.timer} data-state={state} data-testid="timer-display">
      <div>
        <span className={styles.label}>{label}</span>
        <div className={styles.display} aria-label={`${label}: ${formatTime(seconds)}`}>
          {formatTime(seconds)}
        </div>
      </div>

      {showControls && (
        <div className={styles.controls}>
          {state === 'running' && onPause && (
            <button
              type="button"
              className={styles.controlBtn}
              onClick={onPause}
              data-testid="timer-pause"
            >
              Pause
            </button>
          )}
          {state === 'paused' && onResume && (
            <button
              type="button"
              className={styles.controlBtn}
              onClick={onResume}
              data-testid="timer-resume"
            >
              Resume
            </button>
          )}
          {(state === 'paused' || state === 'complete') && onReset && (
            <button
              type="button"
              className={styles.controlBtn}
              onClick={onReset}
              data-testid="timer-reset"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
