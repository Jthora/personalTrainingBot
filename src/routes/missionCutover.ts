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

const legacyAliasMap: Record<LegacyAliasPath, string> = {
  '/schedules': '/mission/brief',
  '/drills': '/mission/triage',
  '/training': '/mission/training',
  '/training/run': '/mission/training',
  '/settings': '/mission/debrief',
};

export const resolveLegacyAliasPath = (route: LegacyAliasPath): string => legacyAliasMap[route];
