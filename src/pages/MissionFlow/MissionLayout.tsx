/**
 * MissionLayout — Nested layout route for /mission/* inside AppShell.
 *
 * Renders mission-specific chrome (MissionHeader, StepToolsBar, OperatorAssistant)
 * around an Outlet. Shell-level concerns (Header, CelebrationLayer, keyboard shortcuts,
 * palette, bottom nav) are handled by the parent AppShell.
 */
import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMissionFlowContinuity } from '../../hooks/useMissionFlowContinuity';
import useIsMobile from '../../hooks/useIsMobile';
import MissionHeader from '../../components/MissionHeader/MissionHeader';
import { composeMissionTabs } from '../../data/missionTabs';
import { assistantHints, FALLBACK_ROUTE } from '../../data/sopHints';
import { useStepCompletion } from '../../hooks/useStepCompletion';
import { useGuidanceMode } from '../../hooks/useGuidanceMode';
import { useMissionTelemetry } from '../../hooks/useMissionTelemetry';
import { usePalette } from '../../contexts/PaletteContext';
import OperatorAssistant from '../../components/OperatorAssistant/OperatorAssistant';
import StepToolsBar from '../../components/StepToolsBar/StepToolsBar';
import type { MissionRoutePath } from '../../utils/missionTelemetryContracts';
import styles from './MissionSurfaces.module.css';

const MissionLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { routeSearch } = useMissionFlowContinuity();
  const palette = usePalette();

  const navigateWithContext = (pathname: string) => {
    navigate({ pathname, search: routeSearch ? `?${routeSearch}` : '' });
  };

  // ── Tabs ──
  const tabs = useMemo(() => composeMissionTabs(), []);
  const activePath = (tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? FALLBACK_ROUTE) as MissionRoutePath;
  const currentStepIndex = tabs.findIndex((tab) => tab.path === activePath);
  const currentStep = currentStepIndex >= 0 ? tabs[currentStepIndex] : tabs[0];
  const nextStep = currentStepIndex >= 0 && currentStepIndex < tabs.length - 1 ? tabs[currentStepIndex + 1] : null;
  const currentHints = assistantHints[activePath] ?? assistantHints[FALLBACK_ROUTE]!;

  // ── Extracted hooks ──
  const stepCompletion = useStepCompletion();
  const guidance = useGuidanceMode(activePath);
  const telemetry = useMissionTelemetry(activePath, stepCompletion.completedSteps);

  return (
    <>
      <MissionHeader />

      <StepToolsBar
        currentStep={currentStep}
        nextStep={nextStep}
        activePath={activePath}
        guidanceMode={guidance.mode}
        isCompleted={stepCompletion.isCompleted(activePath)}
        isMobile={isMobile}
        stepStartedAtRef={telemetry.stepStartedAtRef}
        onToggleComplete={() => stepCompletion.toggle(activePath)}
        onUpdateGuidanceMode={guidance.update}
        onContinueToNext={() => {
          if (nextStep) {
            telemetry.trackTransition(nextStep.path, 'keyboard');
            navigateWithContext(nextStep.path);
          }
        }}
        onOpenPalette={palette.open}
      />

      <OperatorAssistant
        guidanceMode={guidance.mode}
        hints={currentHints}
        activePath={activePath}
        isMobile={isMobile}
      />

      <div className={styles.content}>
        <Outlet />
      </div>
    </>
  );
};

export default MissionLayout;
