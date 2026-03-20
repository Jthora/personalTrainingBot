/**
 * Mission tab definitions and composition logic.
 *
 * Centralizes all tab data so MissionLayout simply composes from here.
 */
import { missionEntityIcons } from '../utils/mission/iconography';
import type { MissionRoutePath } from '../utils/missionTelemetryContracts';

export interface MissionTab {
  path: MissionRoutePath;
  label: string;
  icon: string;
}

export const coreTabs: MissionTab[] = [
  { path: '/mission/brief', label: 'Brief', icon: missionEntityIcons.operation },
  { path: '/mission/triage', label: 'Triage', icon: missionEntityIcons.lead },
  { path: '/mission/case', label: 'Case', icon: missionEntityIcons.case },
  { path: '/mission/signal', label: 'Signal', icon: missionEntityIcons.signal },
  { path: '/mission/checklist', label: 'Checklist', icon: missionEntityIcons.artifact },
  { path: '/mission/debrief', label: 'Debrief', icon: missionEntityIcons.debrief },
];

export const statsTab: MissionTab = {
  path: '/mission/stats', label: 'Stats', icon: '📊',
};

export const planTab: MissionTab = {
  path: '/mission/plan', label: 'Plan', icon: '📅',
};

export const trainingTab: MissionTab = {
  path: '/mission/training', label: 'Training', icon: '📚',
};

/**
 * Compose the full ordered tab list for MissionLayout.
 * Training tab is placed at position 2 (after Brief) — the core value proposition.
 */
export const composeMissionTabs = (opts?: {
  stats?: boolean;
  plan?: boolean;
}): MissionTab[] => {
  const { stats = true, plan = true } = opts ?? {};
  const extra = [
    ...(stats ? [statsTab] : []),
    ...(plan ? [planTab] : []),
  ];
  return [coreTabs[0], trainingTab, ...coreTabs.slice(1), ...extra];
};
