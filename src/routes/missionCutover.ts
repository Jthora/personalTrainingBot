import { isFeatureEnabled, type FeatureFlagKey } from '../config/featureFlags';

export const missionRoutePaths = [
  '/mission/brief',
  '/mission/triage',
  '/mission/case',
  '/mission/signal',
  '/mission/checklist',
  '/mission/debrief',
] as const;

export type MissionRoutePath = (typeof missionRoutePaths)[number];

export const legacyAliasPaths = [
  '/schedules',
  '/workouts',
  '/training',
  '/training/run',
  '/settings',
] as const;

export type LegacyAliasPath = (typeof legacyAliasPaths)[number];

const missionSurfaceFlags: Record<MissionRoutePath, FeatureFlagKey> = {
  '/mission/brief': 'missionSurfaceBrief',
  '/mission/triage': 'missionSurfaceTriage',
  '/mission/case': 'missionSurfaceCase',
  '/mission/signal': 'missionSurfaceSignal',
  '/mission/checklist': 'missionSurfaceChecklist',
  '/mission/debrief': 'missionSurfaceDebrief',
};

const missionHomeFallbacks: Record<MissionRoutePath, string> = {
  '/mission/brief': '/home/plan',
  '/mission/triage': '/home/cards',
  '/mission/case': '/home/progress',
  '/mission/signal': '/home/coach',
  '/mission/checklist': '/home/cards',
  '/mission/debrief': '/home/settings',
};

const legacyAliasMap: Record<LegacyAliasPath, string> = {
  '/schedules': '/mission/brief',
  '/workouts': '/mission/triage',
  '/training': '/mission/checklist',
  '/training/run': '/mission/checklist',
  '/settings': '/mission/debrief',
};

export const getDefaultRootPath = (
  readFlag: (flag: FeatureFlagKey) => boolean = isFeatureEnabled,
): string => (readFlag('missionDefaultRoutes') ? '/mission/brief' : '/home/plan');

export const resolveLegacyAliasPath = (route: LegacyAliasPath): string => legacyAliasMap[route];

export const toHomeFallbackPath = (route: MissionRoutePath): string => missionHomeFallbacks[route];

export const isMissionRouteEnabled = (
  route: MissionRoutePath,
  readFlag: (flag: FeatureFlagKey) => boolean = isFeatureEnabled,
): boolean => {
  if (!readFlag('missionDefaultRoutes')) return false;
  return readFlag(missionSurfaceFlags[route]);
};
