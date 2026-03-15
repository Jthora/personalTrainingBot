/**
 * Tab configuration for the simplified 4-tab AppShell (v2).
 *
 * Primary tabs are always visible. Mission tabs appear only when
 * the user enables Active Duty via Profile → Settings.
 */

export interface AppShellTab {
  path: string;
  label: string;
  icon: string;
  /** Only visible when Active Duty is enabled */
  missionOnly?: boolean;
}

export const primaryTabs: AppShellTab[] = [
  { path: '/train', label: 'Train', icon: '📚' },
  { path: '/review', label: 'Review', icon: '🔄' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export const missionTabs: AppShellTab[] = [
  { path: '/mission/brief', label: 'Brief', icon: '🏠', missionOnly: true },
  { path: '/mission/triage', label: 'Triage', icon: '🧭', missionOnly: true },
  { path: '/mission/case', label: 'Case', icon: '🗂️', missionOnly: true },
  { path: '/mission/signal', label: 'Signal', icon: '📡', missionOnly: true },
  { path: '/mission/debrief', label: 'Debrief', icon: '📝', missionOnly: true },
];

export const MISSION_MODE_STORAGE_KEY = 'ptb:mission-mode:v1';

export const isMissionModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MISSION_MODE_STORAGE_KEY) === 'enabled';
};

export const setMissionMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(MISSION_MODE_STORAGE_KEY, 'enabled');
  } else {
    window.localStorage.removeItem(MISSION_MODE_STORAGE_KEY);
  }
};

export const getAllTabs = (missionModeEnabled: boolean): AppShellTab[] => {
  if (missionModeEnabled) {
    return [...primaryTabs, ...missionTabs];
  }
  return primaryTabs;
};
