import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './MissionFlow.module.css';
import { trackEvent } from '../../utils/telemetry';
import { useMissionFlowContinuity } from '../../hooks/useMissionFlowContinuity';
import useIsMobile from '../../hooks/useIsMobile';
import { missionEntityIcons } from '../../utils/mission/iconography';
import MissionHeader from '../../components/MissionHeader/MissionHeader';
import MissionActionPalette from '../../components/MissionActionPalette/MissionActionPalette';
import MissionIntakePanel from '../../components/MissionIntakePanel/MissionIntakePanel';
import ArchetypePicker from '../../components/ArchetypePicker/ArchetypePicker';
import HandlerPicker from '../../components/HandlerPicker/HandlerPicker';
import type { MissionPaletteAction } from '../../components/MissionActionPalette/model';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';
import {
  buildMissionTransitionPayload,
  missionRoutePaths,
  type MissionRoutePath,
} from '../../utils/missionTelemetryContracts';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import type { ArchetypeDefinition } from '../../data/archetypes';
import { getArchetypeHints } from '../../utils/archetypeHints';
import CelebrationLayer from '../../components/CelebrationLayer/CelebrationLayer';

const coreTabs: Array<{ path: MissionRoutePath; label: string; icon: string }> = [
  { path: '/mission/brief', label: 'Brief', icon: missionEntityIcons.operation },
  { path: '/mission/triage', label: 'Triage', icon: missionEntityIcons.lead },
  { path: '/mission/case', label: 'Case', icon: missionEntityIcons.case },
  { path: '/mission/signal', label: 'Signal', icon: missionEntityIcons.signal },
  { path: '/mission/checklist', label: 'Checklist', icon: missionEntityIcons.artifact },
  { path: '/mission/debrief', label: 'Debrief', icon: missionEntityIcons.debrief },
];

const statsTab: { path: MissionRoutePath; label: string; icon: string } = {
  path: '/mission/stats', label: 'Stats', icon: '📊',
};

const planTab: { path: MissionRoutePath; label: string; icon: string } = {
  path: '/mission/plan', label: 'Plan', icon: '📅',
};

type GuidanceMode = 'assist' | 'ops';

const assistantHints: Partial<Record<MissionRoutePath, { sopPrompt: string; contextHint: string; nextActionHint: string }>> = {
  '/mission/brief': {
    sopPrompt: 'SOP: Confirm objective, constraints, and escalation threshold before moving to Triage.',
    contextHint: 'Use Mission Header and Readiness to anchor priorities before acting.',
    nextActionHint: 'When objective and constraints are clear, continue to Triage.',
  },
  '/mission/triage': {
    sopPrompt: 'SOP: Acknowledge critical signals first, then assign/defer lower-priority items.',
    contextHint: 'Keep one primary case in focus to avoid split decision paths.',
    nextActionHint: 'Once triage queue is stable, continue to Case.',
  },
  '/mission/case': {
    sopPrompt: 'SOP: Promote only evidence-backed findings; avoid assumptions without artifacts.',
    contextHint: 'Cross-check Timeline and Artifact List before escalating conclusions.',
    nextActionHint: 'When findings are traceable, continue to Signal.',
  },
  '/mission/signal': {
    sopPrompt: 'SOP: Resolve or escalate each active signal with explicit rationale.',
    contextHint: 'Keep signal actions synchronized with case evidence and mission constraints.',
    nextActionHint: 'When signal actions are clear, continue to Checklist.',
  },
  '/mission/checklist': {
    sopPrompt: 'SOP: Execute checklist in order, recording outcomes and exceptions immediately.',
    contextHint: 'Use drill completion outcomes as direct input to Debrief quality.',
    nextActionHint: 'After execution outcomes are captured, continue to Debrief.',
  },
  '/mission/debrief': {
    sopPrompt: 'SOP: Capture outcomes, lessons learned, and readiness impact before closing cycle.',
    contextHint: 'Ensure unresolved risks are clearly listed for next mission brief.',
    nextActionHint: 'When AAR is complete, start the next mission brief.',
  },
  '/mission/stats': {
    sopPrompt: 'SOP: Review operative metrics, competency trends, and progress toward next milestone.',
    contextHint: 'Use the dashboard to identify weak competency dimensions and prioritize drills.',
    nextActionHint: 'After reviewing stats, return to Brief to start your next mission cycle.',
  },
  '/mission/plan': {
    sopPrompt: 'SOP: Review weekly training plan, adjust schedule, and confirm upcoming drills.',
    contextHint: 'Use the plan view to see your week at a glance and ensure balanced training load.',
    nextActionHint: 'When your plan is set, head to Checklist to execute today\'s drills.',
  },
};

const MissionShell: React.FC = () => {
  const intakeStorageKey = 'mission:intake:v1';
  const completionStorageKey = 'mission:step-complete:v1';
  const guidanceModeStorageKey = 'mission:guidance-mode:v1';
  const guidanceOverlayStorageKey = 'mission:guidance-overlay:v1';
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { routeSearch } = useMissionFlowContinuity();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode>('assist');
  const [showGuidanceOverlay, setShowGuidanceOverlay] = useState(false);
  const stepStartedAtRef = useRef<number>(Date.now());
  const paletteOpenedAtRef = useRef<number | null>(null);
  const paletteSelectedRef = useRef<boolean>(false);

  // ── Stage 22: Archetype/Handler intake gates ────────────────────────
  const archetypeEnabled = true;
  const statsSurfaceEnabled = true;
  const planSurfaceEnabled = true;
  const existingProfile = OperativeProfileStore.get();
  const [showArchetypePicker, setShowArchetypePicker] = useState(
      archetypeEnabled && !existingProfile,
  );
  const [showHandlerPicker, setShowHandlerPicker] = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState<ArchetypeDefinition | null>(null);

  const tabs = useMemo(
    () => {
      const extra = [
        ...(statsSurfaceEnabled ? [statsTab] : []),
        ...(planSurfaceEnabled ? [planTab] : []),
      ];
      return [...coreTabs, ...extra];
    },
    [statsSurfaceEnabled, planSurfaceEnabled],
  );

  const activePath = tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? '/mission/brief';
  const currentStepIndex = tabs.findIndex((tab) => tab.path === activePath);
  const currentStep = currentStepIndex >= 0 ? tabs[currentStepIndex] : tabs[0];
  const nextStep = currentStepIndex >= 0 && currentStepIndex < tabs.length - 1 ? tabs[currentStepIndex + 1] : null;
  const currentHints = assistantHints[activePath] ?? assistantHints['/mission/brief']!;

  const missionContext = readMissionFlowContext();

  const paletteActions: MissionPaletteAction[] = useMemo(() => {
    const tabActions: MissionPaletteAction[] = tabs.map((tab) => ({
      id: `tab:${tab.path}`,
      label: `${tab.label}`,
      keywords: [tab.label.toLowerCase(), 'mission'],
      path: tab.path,
      search: routeSearch ? `?${routeSearch}` : '',
    }));

    const contextActions: MissionPaletteAction[] = [
      {
        id: 'context:brief',
        label: `Operation Brief${missionContext?.operationId ? ` (${missionContext.operationId})` : ''}`,
        keywords: ['operation', 'brief', missionContext?.operationId ?? ''],
        path: '/mission/brief',
        search: routeSearch ? `?${routeSearch}` : '',
      },
      {
        id: 'context:case',
        label: `Active Case${missionContext?.caseId ? ` (${missionContext.caseId})` : ''}`,
        keywords: ['case', 'investigation', missionContext?.caseId ?? ''],
        path: '/mission/case',
        search: routeSearch ? `?${routeSearch}` : '',
      },
      {
        id: 'context:signal',
        label: `Active Signal${missionContext?.signalId ? ` (${missionContext.signalId})` : ''}`,
        keywords: ['signal', 'alert', missionContext?.signalId ?? ''],
        path: '/mission/signal',
        search: routeSearch ? `?${routeSearch}` : '',
      },
    ];

    return [...contextActions, ...tabActions];
  }, [missionContext?.caseId, missionContext?.operationId, missionContext?.signalId, routeSearch]);

  const navigateWithContext = (pathname: string) => {
    navigate({ pathname, search: routeSearch ? `?${routeSearch}` : '' });
  };

  const trackMissionTransition = (
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSeenIntake = window.localStorage.getItem(intakeStorageKey) === 'seen';
    setShowIntake(!hasSeenIntake);

    const raw = window.localStorage.getItem(completionStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setCompletedSteps(parsed);
    } catch {
      setCompletedSteps({});
    }

    const savedMode = window.localStorage.getItem(guidanceModeStorageKey);
    if (savedMode === 'assist' || savedMode === 'ops') {
      setGuidanceMode(savedMode);
    }

    const hasSeenGuidanceOverlay = window.localStorage.getItem(guidanceOverlayStorageKey) === 'seen';
    setShowGuidanceOverlay(!hasSeenGuidanceOverlay);

    if (!hasSeenGuidanceOverlay) {
      trackEvent({
        category: 'ia',
        action: 'tab_view',
        route: activePath,
        data: {
          kind: 'onboarding_overlay_shown',
          step: activePath,
        },
        source: 'ui',
      });
    }
  }, []);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isMetaShortcut) {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
        return;
      }

      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const dismissIntake = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(intakeStorageKey, 'seen');
    }
    setShowIntake(false);
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: {
        kind: 'onboarding_intake_dismiss',
        step: activePath,
      },
      source: 'ui',
    });
  };

  const toggleStepCompleted = () => {
    const next = { ...completedSteps, [activePath]: !completedSteps[activePath] };
    setCompletedSteps(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(completionStorageKey, JSON.stringify(next));
    }
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: {
        kind: 'step_complete_toggle',
        tab: activePath,
        completed: !completedSteps[activePath],
      },
      source: 'ui',
    });
  };

  const updateGuidanceMode = (mode: GuidanceMode) => {
    setGuidanceMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(guidanceModeStorageKey, mode);
    }
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: {
        kind: 'guidance_mode_change',
        mode,
      },
      source: 'ui',
    });
  };

  const dismissGuidanceOverlay = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(guidanceOverlayStorageKey, 'seen');
    }
    setShowGuidanceOverlay(false);
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: {
        kind: 'onboarding_overlay_dismiss',
        step: activePath,
      },
      source: 'ui',
    });
  };

  // Phase 1.2 + 1.4: Determine onboarding state for sequenced rendering.
  // Guidance overlay shows first; intake shows only after overlay is dismissed.
  // While either onboarding surface is active, hide all shell chrome (MissionHeader,
  // stepTools, assistantCard, Outlet) so the onboarding surface fills the viewport.
  // Stage 22: Archetype and handler pickers gate between guidance overlay and intake.
  const isOnboarding = showGuidanceOverlay || showArchetypePicker || showHandlerPicker || showIntake;

  return (
    <div className={styles.pageContainer}>
      <Header />
      <CelebrationLayer />
      <div className={styles.shell}>
        {showGuidanceOverlay && (
          <section className={styles.guidanceOverlay} role="dialog" aria-label="Guided training quick start">
            <h2 className={styles.guidanceTitle}>Guided Training Quick Start</h2>
            <p className={styles.guidanceBody}>
              Assist mode is enabled for first-time operators. You will see SOP prompts, context hints, and explicit next-action guidance on each mission step.
            </p>
            <ul className={styles.guidanceList}>
              {!isMobile && <li><strong>⌘/Ctrl + K</strong>: Open mission action palette.</li>}
              <li><strong>Esc</strong>: Close action palette and overlays.</li>
              <li><strong>Assist/Ops toggle</strong>: Switch between guided and compact operating modes.</li>
            </ul>
            <div className={styles.guidanceActions}>
              <button type="button" className={styles.stepButton} onClick={() => updateGuidanceMode('assist')}>Stay in Assist Mode</button>
              <button type="button" className={styles.stepButton} onClick={() => updateGuidanceMode('ops')}>Switch to Ops Mode</button>
              <button type="button" className={styles.stepButton} onClick={dismissGuidanceOverlay}>Continue</button>
            </div>
          </section>
        )}

        {/* Phase 1.2: Intake only shows after guidance overlay is dismissed */}
        {!showGuidanceOverlay && !showArchetypePicker && !showHandlerPicker && showIntake && (
          <MissionIntakePanel
            onStartBriefing={() => {
              dismissIntake();
              navigateWithContext('/mission/brief');
            }}
            onDismiss={dismissIntake}
          />
        )}

        {/* Stage 22: Archetype picker — shows after guidance overlay dismissed, before handler */}
        {!showGuidanceOverlay && showArchetypePicker && (
          <ArchetypePicker
            onSelect={(archetype) => {
              setPendingArchetype(archetype);
              setShowArchetypePicker(false);
              setShowHandlerPicker(true);
            }}
            onSkip={() => {
              setShowArchetypePicker(false);
              // Skip both pickers, proceed to intake/brief
            }}
          />
        )}

        {/* Stage 22: Handler picker — shows after archetype confirmed */}
        {!showGuidanceOverlay && !showArchetypePicker && showHandlerPicker && pendingArchetype && (
          <HandlerPicker
            recommendedHandlerId={pendingArchetype.recommendedHandler}
            onSelect={(handler) => {
              OperativeProfileStore.set({
                archetypeId: pendingArchetype.id,
                handlerId: handler.id,
                callsign: '',
                enrolledAt: new Date().toISOString(),
              });
              setShowHandlerPicker(false);
              // Intake panel shows next (or dismiss it automatically)
              trackEvent({
                category: 'ia',
                action: 'tab_view',
                route: '/mission/brief',
                data: {
                  kind: 'archetype_intake_complete',
                  archetypeId: pendingArchetype.id,
                  handlerId: handler.id,
                },
                source: 'ui',
              });
            }}
            onBack={() => {
              setShowHandlerPicker(false);
              setShowArchetypePicker(true);
            }}
          />
        )}

        {/* Phase 1.4: Hide shell chrome while onboarding is active */}
        {!isOnboarding && (
          <>
            <MissionHeader />

        <div className={styles.stepTools} aria-label="Mission step tools">
          <div className={styles.stepMeta}>
            <span className={styles.stepBadge}>Current Step: {currentStep.icon} {currentStep.label}</span>
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
                onClick={() => updateGuidanceMode('assist')}
              >
                Assist Mode
              </button>
              <button
                type="button"
                className={styles.stepButton}
                aria-pressed={guidanceMode === 'ops'}
                onClick={() => updateGuidanceMode('ops')}
              >
                Ops Mode
              </button>
            </div>

            <button type="button" className={styles.stepButton} onClick={toggleStepCompleted}>
              {completedSteps[activePath] ? '✓ Step Complete' : 'Mark Step Complete'}
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
                  trackMissionTransition(nextStep.path, 'keyboard');
                  navigateWithContext(nextStep.path);
                }}
              >
                Continue to {nextStep.label}
              </button>
            )}

            <button
              type="button"
              className={styles.stepButton}
              onClick={() => {
                paletteOpenedAtRef.current = Date.now();
                paletteSelectedRef.current = false;
                setPaletteOpen(true);
              }}
              aria-label="Open mission action palette"
            >
              {isMobile ? 'Actions' : '⌘K Actions'}
            </button>
          </div>
        </div>

        <section className={styles.assistantCard} aria-label="Operator assistant guidance">
          <h2 className={styles.assistantTitle}>Operator Assistant · {guidanceMode === 'assist' ? 'Assist Mode' : 'Ops Mode'}</h2>
          <p className={styles.assistantHint}><strong>SOP prompt:</strong> {currentHints.sopPrompt}</p>

          {guidanceMode === 'assist' ? (
            <>
              <p className={styles.assistantHint}><strong>Context hint:</strong> {
                (() => {
                  if (archetypeEnabled) {
                    const profile = OperativeProfileStore.get();
                    if (profile?.archetypeId) {
                      const archetypeHint = getArchetypeHints(profile.archetypeId, activePath);
                      if (archetypeHint) return archetypeHint.contextHint;
                    }
                  }
                  return currentHints.contextHint;
                })()
              }</p>
              <p className={styles.assistantHint}><strong>Next action:</strong> {
                (() => {
                  if (archetypeEnabled) {
                    const profile = OperativeProfileStore.get();
                    if (profile?.archetypeId) {
                      const archetypeHint = getArchetypeHints(profile.archetypeId, activePath);
                      if (archetypeHint) return archetypeHint.nextActionHint;
                    }
                  }
                  return currentHints.nextActionHint;
                })()
              }</p>
              {!isMobile && <p className={styles.assistantHint}><strong>Keyboard:</strong> Use ⌘/Ctrl + K for fast actions, Esc to close overlays.</p>}
            </>
          ) : (
            !isMobile && <p className={styles.assistantHint}><strong>Keyboard:</strong> ⌘/Ctrl + K actions · Esc close.</p>
          )}
        </section>
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
              trackMissionTransition(nextPath, 'palette', { actionId: action.id });
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
