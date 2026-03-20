import { useEffect, useRef } from 'react';
import { trackEvent } from '../utils/telemetry';
import {
  buildMissionTransitionPayload,
  missionRoutePaths,
  type MissionRoutePath,
} from '../utils/missionTelemetryContracts';
import { readMissionFlowContext } from '../store/missionFlow/continuity';

export interface MissionTelemetryActions {
  trackTransition: (
    nextPath: MissionRoutePath,
    source: 'tab' | 'select' | 'keyboard' | 'palette',
    extra?: Record<string, unknown>,
  ) => void;
  /** Current mission flow context for palette/telemetry use */
  missionContext: ReturnType<typeof readMissionFlowContext>;
  /** Ref to the timestamp when the current step was entered */
  stepStartedAtRef: React.RefObject<number>;
}

/**
 * Mission-specific telemetry: step_view_start, step_abandon_risk,
 * and tab transition tracking.
 */
export const useMissionTelemetry = (
  activePath: MissionRoutePath,
  completedSteps: Record<string, boolean>,
): MissionTelemetryActions => {
  const stepStartedAtRef = useRef<number>(Date.now());
  const missionContext = readMissionFlowContext();

  // step_view_start + step_abandon_risk on cleanup
  useEffect(() => {
    const now = Date.now();
    stepStartedAtRef.current = now;

    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: {
        kind: 'step_view_start',
        step: activePath,
      },
      source: 'ui',
    });

    return () => {
      const durationMs = Date.now() - now;
      const completed = Boolean(completedSteps[activePath]);
      if (!completed && durationMs > 45000) {
        trackEvent({
          category: 'ia',
          action: 'nav_error',
          route: activePath,
          data: {
            kind: 'step_abandon_risk',
            step: activePath,
            durationMs,
            completed,
          },
          source: 'ui',
        });
      }
    };
  }, [activePath]);

  const trackTransition = (
    nextPath: MissionRoutePath,
    source: 'tab' | 'select' | 'keyboard' | 'palette',
    extra?: Record<string, unknown>,
  ) => {
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: nextPath,
      data: {
        ...buildMissionTransitionPayload({
          fromTab: activePath,
          toTab: nextPath,
          source,
          operationId: missionContext?.operationId,
          caseId: missionContext?.caseId,
          signalId: missionContext?.signalId,
          actionId: typeof extra?.actionId === 'string' ? extra.actionId : undefined,
        }),
      },
      source: 'ui',
    });
  };

  return { trackTransition, missionContext, stepStartedAtRef };
};
