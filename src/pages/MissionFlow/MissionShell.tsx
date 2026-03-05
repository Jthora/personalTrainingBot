import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './MissionFlow.module.css';
import { trackEvent } from '../../utils/telemetry';
import { useMissionFlowContinuity } from '../../hooks/useMissionFlowContinuity';
import { missionEntityIcons } from '../../utils/mission/iconography';
import MissionHeader from '../../components/MissionHeader/MissionHeader';
import MissionActionPalette from '../../components/MissionActionPalette/MissionActionPalette';
import type { MissionPaletteAction } from '../../components/MissionActionPalette/model';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';
import {
  buildMissionTransitionPayload,
  isMissionRoutePath,
  missionRoutePaths,
  type MissionRoutePath,
} from '../../utils/missionTelemetryContracts';

const tabs = [
  { path: '/mission/brief', label: 'Brief', icon: missionEntityIcons.operation, sectionId: 'section-mission-brief' },
  { path: '/mission/triage', label: 'Triage', icon: missionEntityIcons.lead, sectionId: 'section-mission-triage' },
  { path: '/mission/case', label: 'Case', icon: missionEntityIcons.case, sectionId: 'section-mission-case' },
  { path: '/mission/signal', label: 'Signal', icon: missionEntityIcons.signal, sectionId: 'section-mission-signal' },
  { path: '/mission/checklist', label: 'Checklist', icon: missionEntityIcons.artifact, sectionId: 'section-mission-checklist' },
  { path: '/mission/debrief', label: 'Debrief', icon: missionEntityIcons.debrief, sectionId: 'section-mission-debrief' },
 ] satisfies Array<{ path: MissionRoutePath; label: string; icon: string; sectionId: string }>;

const MissionShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { routeSearch } = useMissionFlowContinuity();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const activePath = tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? '/mission/brief';

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.path === activePath);
    if (currentIndex === -1) return;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    const nextPath = tabs[nextIndex].path;
    trackMissionTransition(nextPath, 'keyboard');
    navigateWithContext(nextPath);
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.shell}>
        <MissionHeader />

        <div className={styles.tabSelectRow}>
          <label className={styles.tabSelectLabel} htmlFor="mission-tab-select">Mission step</label>
          <select
            id="mission-tab-select"
            className={styles.tabSelect}
            value={activePath}
            onChange={(e) => {
              const nextPath = e.target.value;
              if (!isMissionRoutePath(nextPath)) return;
              trackMissionTransition(nextPath, 'select');
              navigateWithContext(nextPath);
            }}
          >
            {tabs.map((tab) => (
              <option key={tab.path} value={tab.path}>{tab.icon} {tab.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.tabBar} role="tablist" aria-label="Mission flow" onKeyDown={handleKeyDown}>
          {tabs.map((tab) => {
            const isActive = activePath === tab.path;
            return (
              <button
                key={tab.path}
                role="tab"
                aria-selected={isActive}
                aria-controls={tab.sectionId}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                onClick={() => {
                  if (!isActive) {
                    trackMissionTransition(tab.path, 'tab');
                  }
                  navigateWithContext(tab.path);
                }}
                type="button"
              >
                <span aria-hidden>{tab.icon}</span> {tab.label}
              </button>
            );
          })}

          <button
            type="button"
            className={styles.tab}
            onClick={() => setPaletteOpen(true)}
            aria-label="Open mission action palette"
          >
            ⌘K Actions
          </button>
        </div>

        <main id="main-content" className={styles.content} aria-live="polite">
          <Outlet />
        </main>

        <MissionActionPalette
          actions={paletteActions}
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelect={(action) => {
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
