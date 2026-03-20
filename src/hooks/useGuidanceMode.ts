import { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '../utils/telemetry';
import type { GuidanceMode } from '../data/sopHints';

const STORAGE_KEY = 'mission:guidance-mode:v1';

export interface GuidanceModeState {
  mode: GuidanceMode;
  update: (next: GuidanceMode) => void;
}

/**
 * Manages guidance mode (assist | ops) with localStorage persistence and telemetry.
 */
export const useGuidanceMode = (activePath: string): GuidanceModeState => {
  const [mode, setMode] = useState<GuidanceMode>('assist');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'assist' || saved === 'ops') {
      setMode(saved);
    }
  }, []);

  const update = useCallback(
    (next: GuidanceMode) => {
      setMode(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      trackEvent({
        category: 'ia',
        action: 'tab_view',
        route: activePath,
        data: {
          kind: 'guidance_mode_change',
          mode: next,
        },
        source: 'ui',
      });
    },
    [activePath],
  );

  return { mode, update };
};
