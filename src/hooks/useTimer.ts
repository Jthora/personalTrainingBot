import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'complete';

export interface UseTimerOptions {
  /** Duration in seconds. 0 = count-up (stopwatch mode). */
  durationSec?: number;
  /** Called once when a countdown reaches 0. */
  onComplete?: () => void;
  /** Auto-start on mount. Default false. */
  autoStart?: boolean;
}

export interface UseTimerReturn {
  /** Elapsed seconds since start (pauses excluded). */
  elapsed: number;
  /** Remaining seconds for countdown mode. -1 in stopwatch mode. */
  remaining: number;
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * General-purpose timer hook.
 * - `durationSec > 0` → countdown mode (remaining ticks to 0, then `onComplete`).
 * - `durationSec === 0 | undefined` → stopwatch mode (elapsed counts up indefinitely).
 */
export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { durationSec = 0, onComplete, autoStart = false } = options;
  const isCountdown = durationSec > 0;

  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState<TimerState>(autoStart ? 'running' : 'idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeFired = useRef(false);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Core tick
  useEffect(() => {
    if (state !== 'running') {
      clearTick();
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return clearTick;
  }, [state, clearTick]);

  // Detect countdown completion
  useEffect(() => {
    if (isCountdown && state === 'running' && elapsed >= durationSec && !completeFired.current) {
      completeFired.current = true;
      setState('complete');
      onComplete?.();
    }
  }, [elapsed, state, isCountdown, durationSec, onComplete]);

  const start = useCallback(() => {
    setElapsed(0);
    completeFired.current = false;
    setState('running');
  }, []);

  const pause = useCallback(() => {
    if (state === 'running') setState('paused');
  }, [state]);

  const resume = useCallback(() => {
    if (state === 'paused') setState('running');
  }, [state]);

  const reset = useCallback(() => {
    clearTick();
    setElapsed(0);
    completeFired.current = false;
    setState('idle');
  }, [clearTick]);

  const remaining = isCountdown ? Math.max(0, durationSec - elapsed) : -1;

  return { elapsed, remaining, state, start, pause, resume, reset };
}
