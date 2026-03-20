import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './MissionFlow.module.css';
import { trackEvent } from '../../utils/telemetry';
import { useMissionFlowContinuity } from '../../hooks/useMissionFlowContinuity';
import useIsMobile from '../../hooks/useIsMobile';
import MissionHeader from '../../components/MissionHeader/MissionHeader';
import MissionActionPalette from '../../components/MissionActionPalette/MissionActionPalette';
import OnboardingFlow from '../../components/Onboarding/OnboardingFlow';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import type { MissionPaletteAction } from '../../components/MissionActionPalette/model';
import { missionRoutePaths, type MissionRoutePath } from '../../utils/missionTelemetryContracts';
import CelebrationLayer from '../../components/CelebrationLayer/CelebrationLayer';
import { composeMissionTabs } from '../../data/missionTabs';
import { assistantHints, FALLBACK_ROUTE } from '../../data/sopHints';
import { useStepCompletion } from '../../hooks/useStepCompletion';
import { useGuidanceMode } from '../../hooks/useGuidanceMode';
import { useMissionTelemetry } from '../../hooks/useMissionTelemetry';
import { useShellKeyboardShortcuts } from '../../hooks/useShellKeyboardShortcuts';
import OperatorAssistant from '../../components/OperatorAssistant/OperatorAssistant';
import StepToolsBar from '../../components/StepToolsBar/StepToolsBar';

const MissionShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { routeSearch } = useMissionFlowContinuity();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteOpenedAtRef = useRef<number | null>(null);
  const paletteSelectedRef = useRef<boolean>(false);

  // ── Onboarding flow (shared with AppShell) ──
  const navigateWithContext = (pathname: string) => {
    navigate({ pathname, search: routeSearch ? `?${routeSearch}` : '' });
  };
  const onboarding = useOnboardingState({
    fastPathTarget: '/mission/training',
    onNavigate: navigateWithContext,
  });

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

  // ── Palette actions ──
  const paletteActions: MissionPaletteAction[] = useMemo(() => {
    const ctx = telemetry.missionContext;
    const tabActions: MissionPaletteAction[] = tabs.map((tab) => ({
      id: `tab:${tab.path}`,
      label: tab.label,
      keywords: [tab.label.toLowerCase(), 'mission'],
      path: tab.path,
      search: routeSearch ? `?${routeSearch}` : '',
    }));

    const contextActions: MissionPaletteAction[] = [
      {
        id: 'context:brief',
        label: `Operation Brief${ctx?.operationId ? ` (${ctx.operationId})` : ''}`,
        keywords: ['operation', 'brief', ctx?.operationId ?? ''],
        path: '/mission/brief',
        search: routeSearch ? `?${routeSearch}` : '',
      },
      {
        id: 'context:case',
        label: `Active Case${ctx?.caseId ? ` (${ctx.caseId})` : ''}`,
        keywords: ['case', 'investigation', ctx?.caseId ?? ''],
        path: '/mission/case',
        search: routeSearch ? `?${routeSearch}` : '',
      },
      {
        id: 'context:signal',
        label: `Active Signal${ctx?.signalId ? ` (${ctx.signalId})` : ''}`,
        keywords: ['signal', 'alert', ctx?.signalId ?? ''],
        path: '/mission/signal',
        search: routeSearch ? `?${routeSearch}` : '',
      },
    ];

    return [...contextActions, ...tabActions];
  }, [telemetry.missionContext?.caseId, telemetry.missionContext?.operationId, telemetry.missionContext?.signalId, routeSearch]);

  // ── Keyboard shortcut: ⌘K palette ──
  const togglePalette = useCallback(() => setPaletteOpen((prev) => !prev), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  useShellKeyboardShortcuts({
    onTogglePalette: togglePalette,
    onClosePalette: closePalette,
  });

  return (
    <div className={styles.pageContainer}>
      <Header />
      <CelebrationLayer />
      <div className={styles.shell}>
        {/* ── Onboarding gates (shared flow) ── */}
        {onboarding.isOnboarding && (
          <OnboardingFlow
            state={onboarding}
            onStartBriefing={() => navigateWithContext('/mission/brief')}
          />
        )}

        {/* Hide shell chrome while onboarding is active */}
        {!onboarding.isOnboarding && (
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
              onOpenPalette={() => {
                paletteOpenedAtRef.current = Date.now();
                paletteSelectedRef.current = false;
                setPaletteOpen(true);
              }}
            />

            <OperatorAssistant
              guidanceMode={guidance.mode}
              hints={currentHints}
              activePath={activePath}
              isMobile={isMobile}
            />
          </>
        )}

        <main id="main-content" className={styles.content} aria-live="polite">
          <Outlet />
        </main>

        <MissionActionPalette
          actions={paletteActions}
          isOpen={paletteOpen}
          onClose={() => {
            if (paletteOpenedAtRef.current && !paletteSelectedRef.current) {
              const durationMs = Date.now() - paletteOpenedAtRef.current;
              trackEvent({
                category: 'ia',
                action: 'nav_error',
                route: activePath,
                data: {
                  kind: 'action_palette_abandon',
                  step: activePath,
                  durationMs,
                },
                source: 'ui',
              });
            }
            setPaletteOpen(false);
          }}
          onSelect={(action) => {
            paletteSelectedRef.current = true;
            const nextPath = missionRoutePaths.find((path) => path === action.path);
            if (nextPath) {
              telemetry.trackTransition(nextPath, 'palette', { actionId: action.id });
            } else {
              trackEvent({ category: 'ia', action: 'tab_view', route: action.path, data: { tab: action.path, source: 'palette', actionId: action.id }, source: 'ui' });
            }
            navigate({ pathname: action.path, search: action.search ?? '' });
            setPaletteOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default MissionShell;
