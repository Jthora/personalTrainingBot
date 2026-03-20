/**
 * StepToolsBar — Mission step navigation, completion toggle, and guidance mode.
 *
 * Renders current/next step badges, guidance mode toggle (assist/ops),
 * mark-complete button, continue-to-next button, and palette trigger.
 */
import React from 'react';
import type { MissionTab } from '../../data/missionTabs';
import type { GuidanceMode } from '../../data/sopHints';
import type { MissionRoutePath } from '../../utils/missionTelemetryContracts';
import { trackEvent } from '../../utils/telemetry';
import styles from '../../pages/MissionFlow/MissionSurfaces.module.css';

interface StepToolsBarProps {
  currentStep: MissionTab;
  nextStep: MissionTab | null;
  activePath: MissionRoutePath;
  guidanceMode: GuidanceMode;
  isCompleted: boolean;
  isMobile: boolean;
  stepStartedAtRef: React.RefObject<number>;
  onToggleComplete: () => void;
  onUpdateGuidanceMode: (mode: GuidanceMode) => void;
  onContinueToNext: () => void;
  onOpenPalette: () => void;
}

const StepToolsBar: React.FC<StepToolsBarProps> = ({
  currentStep,
  nextStep,
  activePath,
  guidanceMode,
  isCompleted,
  isMobile,
  stepStartedAtRef,
  onToggleComplete,
  onUpdateGuidanceMode,
  onContinueToNext,
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

        <button type="button" className={styles.stepButton} onClick={onToggleComplete}>
          {isCompleted ? '✓ Step Complete' : 'Mark Step Complete'}
        </button>

        {nextStep && (
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => {
              const durationMs = Date.now() - stepStartedAtRef.current;
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
              onContinueToNext();
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

export default StepToolsBar;
