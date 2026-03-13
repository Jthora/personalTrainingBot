export const missionRoutePaths = [
  '/mission/brief',
  '/mission/triage',
  '/mission/case',
  '/mission/signal',
  '/mission/checklist',
  '/mission/debrief',
  '/mission/stats',
  '/mission/plan',
  '/mission/training',
] as const;

export type MissionRoutePath = (typeof missionRoutePaths)[number];

/** The 6 core routes that form the canonical mission flow cycle. */
export const coreMissionRoutePaths = [
  '/mission/brief',
  '/mission/triage',
  '/mission/case',
  '/mission/signal',
  '/mission/checklist',
  '/mission/debrief',
] as const satisfies readonly MissionRoutePath[];

export const legacyAliasPaths = [
  '/schedules',
  '/drills',
  '/training',
  '/training/run',
  '/settings',
] as const;

export type LegacyAliasPath = (typeof legacyAliasPaths)[number];

const missionHomeFallbacks: Partial<Record<MissionRoutePath, string>> = {
  '/mission/brief': '/home/plan',
  '/mission/triage': '/home/cards',
  '/mission/case': '/home/progress',
  '/mission/signal': '/home/handler',
  '/mission/checklist': '/home/cards',
  '/mission/debrief': '/home/settings',
};

const legacyAliasMap: Record<LegacyAliasPath, string> = {
  '/schedules': '/mission/brief',
  '/drills': '/mission/triage',
  '/training': '/mission/training',
  '/training/run': '/mission/training',
  '/settings': '/mission/debrief',
};

export const getDefaultRootPath = (
): string => '/mission/brief';

export const resolveLegacyAliasPath = (route: LegacyAliasPath): string => legacyAliasMap[route];

export const toHomeFallbackPath = (route: MissionRoutePath): string | undefined => missionHomeFallbacks[route];

export const isMissionRouteEnabled = (
  _route: MissionRoutePath,
): boolean => {
  return true;
};
