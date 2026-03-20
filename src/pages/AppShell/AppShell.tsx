import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import CelebrationLayer from '../../components/CelebrationLayer/CelebrationLayer';
import MissionActionPalette from '../../components/MissionActionPalette/MissionActionPalette';
import type { MissionPaletteAction } from '../../components/MissionActionPalette/model';
import OnboardingFlow from '../../components/Onboarding/OnboardingFlow';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import BottomNav from './BottomNav';
import useIsMobile from '../../hooks/useIsMobile';
import { trackEvent } from '../../utils/telemetry';
import CardProgressStore from '../../store/CardProgressStore';
import {
  primaryTabs,
  missionTabs,
  getAllTabs,
  isMissionModeEnabled,
  type AppShellTab,
} from './appShellTabs';
import { migrateNavStorage } from '../../utils/migrateNavStorage';
import { useShellKeyboardShortcuts } from '../../hooks/useShellKeyboardShortcuts';
import { useMissionPaletteActions } from '../../hooks/useMissionPaletteActions';
import { useMissionFlowContinuity } from '../../hooks/useMissionFlowContinuity';
import { PaletteContext } from '../../contexts/PaletteContext';
import styles from './AppShell.module.css';

// Run once on first import — idempotent
migrateNavStorage();

const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [missionMode, setMissionMode] = useState(isMissionModeEnabled);

  const isMissionRoute = location.pathname.startsWith('/mission/') || location.pathname === '/mission';
  const { routeSearch } = useMissionFlowContinuity();

  // ── Onboarding flow ──
  const onboarding = useOnboardingState({
    fastPathTarget: '/train',
    onNavigate: (path) => navigate(path),
  });

  // Re-check mission mode when navigating (handles Profile toggle)
  useEffect(() => {
    setMissionMode(isMissionModeEnabled());
  }, [location.pathname]);

  const tabs = useMemo(() => getAllTabs(missionMode), [missionMode]);

  const dueCount = useMemo(() => {
    try {
      return CardProgressStore.getCardsDueForReview().length;
    } catch {
      return 0;
    }
  }, [location.pathname]);

  const activePath = useMemo(() => {
    return tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? '/train';
  }, [tabs, location.pathname]);

  // ── Keyboard shortcuts: ⌘1-9 for tabs, ⌘K for palette ──
  const togglePalette = useCallback(() => setPaletteOpen((prev) => !prev), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  useShellKeyboardShortcuts({
    tabs,
    onTogglePalette: togglePalette,
    onClosePalette: closePalette,
    onNavigate: navigate,
  });

  // ── Tab-view telemetry ──
  useEffect(() => {
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: activePath,
      data: { kind: 'step_view_start', step: activePath, shell: 'v2' },
      source: 'ui',
    });
  }, [activePath]);

  // ── Palette actions (merges mission-specific actions when on mission route) ──
  const missionPaletteActions = useMissionPaletteActions(isMissionRoute, routeSearch);

  const paletteActions: MissionPaletteAction[] = useMemo(() => {
    const actions: MissionPaletteAction[] = tabs.map((tab) => ({
      id: `tab:${tab.path}`,
      label: `${tab.icon} ${tab.label}`,
      keywords: [tab.label.toLowerCase()],
      path: tab.path,
      search: '',
    }));

    actions.push({
      id: 'action:start-review',
      label: '🔄 Start Review',
      keywords: ['review', 'due', 'spaced repetition'],
      path: '/review',
      search: '',
    });

    return [...missionPaletteActions, ...actions];
  }, [tabs, missionPaletteActions]);

  const handleTabClick = (tab: AppShellTab) => {
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: tab.path,
      data: { source: 'tab', shell: 'v2' },
      source: 'ui',
    });
    navigate(tab.path);
  };

  const paletteControl = useMemo(
    () => ({ open: () => setPaletteOpen(true) }),
    [],
  );

  return (
    <PaletteContext.Provider value={paletteControl}>
    <div className={styles.pageContainer}>
      <Header />
      <CelebrationLayer />

      <div className={styles.shell}>
        {/* ── Onboarding gates (first-run flow) ── */}
        {onboarding.isOnboarding ? (
          <OnboardingFlow
            state={onboarding}
            onStartBriefing={() => navigate('/train')}
          />
        ) : (
        <>
        {/* ── Desktop tab bar ── */}
        {!isMobile && (
          <div className={styles.tabBar} role="tablist" aria-label="Primary navigation">
            {primaryTabs.map((tab) => (
              <button
                key={tab.path}
                type="button"
                role="tab"
                aria-selected={activePath === tab.path}
                className={`${styles.tab} ${activePath === tab.path ? styles.tabActive : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                <span aria-hidden>{tab.icon}</span> {tab.label}
                {tab.label === 'Review' && dueCount > 0 && (
                  <span className={styles.tabBadge} aria-label={`${dueCount} due`}>
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </button>
            ))}

            <button
              type="button"
              className={styles.paletteButton}
              onClick={() => setPaletteOpen(true)}
              aria-label="Open action palette"
            >
              ⌘K
            </button>
          </div>
        )}

        {/* ── Mission Mode tabs (desktop only) ── */}
        {!isMobile && missionMode && (
          <div className={styles.missionSection}>
            <div className={styles.missionLabel}>Active Duty</div>
            <div className={styles.missionTabs} role="tablist" aria-label="Mission navigation">
              {missionTabs.map((tab) => (
                <button
                  key={tab.path}
                  type="button"
                  role="tab"
                  aria-selected={activePath === tab.path}
                  className={`${styles.tab} ${activePath === tab.path ? styles.tabActive : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  <span aria-hidden>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content via Outlet ── */}
        <main id="main-content" className={styles.content} aria-live="polite">
          <Outlet />
        </main>
        </>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      {isMobile && <BottomNav tabs={tabs} dueBadge={dueCount} />}

      {/* ── Action palette ── */}
      <MissionActionPalette
        actions={paletteActions}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={(action) => {
          trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: action.path,
            data: { source: 'palette', actionId: action.id, shell: 'v2' },
            source: 'ui',
          });
          navigate({ pathname: action.path, search: action.search ?? '' });
          setPaletteOpen(false);
        }}
      />
    </div>
    </PaletteContext.Provider>
  );
};

export default AppShell;
