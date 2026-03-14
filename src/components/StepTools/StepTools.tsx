import React from 'react';
import { trackEvent } from '../../utils/telemetry';
import type { MissionRoutePath } from '../../utils/missionTelemetryContracts';
import styles from '../MissionFlow/MissionFlow.module.css';

type GuidanceMode = 'assist' | 'ops';

interface TabEntry {
  path: MissionRoutePath;
  label: string;
  icon: string;
}

interface StepToolsProps {
  currentStep: TabEntry;
  nextStep: TabEntry | null;
  activePath: MissionRoutePath;
  guidanceMode: GuidanceMode;
  completedSteps: Record<string, boolean>;
  isMobile: boolean;
  stepStartedAt: number;
  onUpdateGuidanceMode: (mode: GuidanceMode) => void;
  onToggleStepCompleted: () => void;
  onNavigateToNext: () => void;
  onOpenPalette: () => void;
}

/**
 * Mission step tools toolbar — extracted from MissionShell.
 * Shows current/next step badges, guidance mode toggle,
 * step completion, continue button, and palette trigger.
 */
const StepTools: React.FC<StepToolsProps> = ({
  currentStep,
  nextStep,
  activePath,
  guidanceMode,
  completedSteps,
  isMobile,
  stepStartedAt,
  onUpdateGuidanceMode,
  onToggleStepCompleted,
  onNavigateToNext,
  onOpenPalette,
}) => {
  return (
    <div className={styles.stepTools} aria-label="Mission step tools">
      <div className={styles.stepMeta}>
        <span className={styles.stepBadge}>
          Current Step: {currentStep.icon} {currentStep.label}
        </span>
        <span className={styles.stepBadge}>
          Next Step: {nextStep ? `${nextStep.icon} ${nextStep.label}` : 'Mission cycle complete'}
        </span>
      </div>

      <div className={styles.stepActions}>
        <div className={styles.modeToggle} role="group" aria-label="Guidance mode">
          <button
            type="button"
            className={styles.stepButton}
            aria-pressed={guidanceMode === 'assist'}
            onClick={() => onUpdateGuidanceMode('assist')}
          >
            Assist Mode
          </button>
          <button
            type="button"
            className={styles.stepButton}
            aria-pressed={guidanceMode === 'ops'}
            onClick={() => onUpdateGuidanceMode('ops')}
          >
            Ops Mode
          </button>
        </div>

        <button type="button" className={styles.stepButton} onClick={onToggleStepCompleted}>
          {completedSteps[activePath] ? '✓ Step Complete' : 'Mark Step Complete'}
        </button>

        {nextStep && (
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => {
              const durationMs = Date.now() - stepStartedAt;
              if (durationMs > 30000) {
                trackEvent({
                  category: 'ia',
                  action: 'nav_error',
                  route: activePath,
                  data: {
                    kind: 'step_transition_friction',
                    fromStep: activePath,
                    toStep: nextStep.path,
                    durationMs,
                  },
                  source: 'ui',
                });
              }
              onNavigateToNext();
            }}
          >
            Continue to {nextStep.label}
          </button>
        )}

        <button
          type="button"
          className={styles.stepButton}
          onClick={onOpenPalette}
          aria-label="Open mission action palette"
        >
          {isMobile ? 'Actions' : '⌘K Actions'}
        </button>
      </div>
    </div>
  );
};

export default StepTools;
