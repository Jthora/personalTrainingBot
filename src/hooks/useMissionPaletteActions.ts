import { useMemo } from 'react';
import type { MissionPaletteAction } from '../components/MissionActionPalette/model';
import { readMissionFlowContext } from '../store/missionFlow/continuity';
import { composeMissionTabs } from '../data/missionTabs';

/**
 * Returns mission-specific palette actions when on a /mission/* route.
 * Returns empty array otherwise, making it safe to always call.
 */
export const useMissionPaletteActions = (
  isMissionRoute: boolean,
  routeSearch: string,
): MissionPaletteAction[] => {
  return useMemo(() => {
    if (!isMissionRoute) return [];

    const tabs = composeMissionTabs();
    const ctx = readMissionFlowContext();

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
  }, [isMissionRoute, routeSearch]);
};
