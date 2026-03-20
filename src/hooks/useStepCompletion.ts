import { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '../utils/telemetry';

const STORAGE_KEY = 'mission:step-complete:v1';

export interface StepCompletionState {
  completedSteps: Record<string, boolean>;
  isCompleted: (path: string) => boolean;
  toggle: (activePath: string) => void;
}

/**
 * Manages per-step completion state with localStorage persistence and telemetry.
 */
export const useStepCompletion = (): StepCompletionState => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setCompletedSteps(parsed);
      } catch {
        setCompletedSteps({});
      }
    }
  }, []);

  const isCompleted = useCallback(
    (path: string) => Boolean(completedSteps[path]),
    [completedSteps],
  );

  const toggle = useCallback(
    (activePath: string) => {
      setCompletedSteps((prev) => {
        const next = { ...prev, [activePath]: !prev[activePath] };
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        trackEvent({
          category: 'ia',
          action: 'tab_view',
          route: activePath,
          data: {
            kind: 'step_complete_toggle',
            tab: activePath,
            completed: !prev[activePath],
          },
          source: 'ui',
        });
        return next;
      });
    },
    [],
  );

  return { completedSteps, isCompleted, toggle };
};
