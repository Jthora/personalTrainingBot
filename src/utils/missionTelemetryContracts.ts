import { missionRoutePaths, type MissionRoutePath } from '../routes/missionCutover';

export { missionRoutePaths, type MissionRoutePath };

/* ── App shell v2 route paths ── */
export const appRoutePaths = [
  '/train',
  '/review',
  '/progress',
  '/profile',
] as const;

export type AppRoutePath = (typeof appRoutePaths)[number];

export type MissionTransitionSource = 'tab' | 'select' | 'keyboard' | 'palette' | 'system';

export type MissionTransitionContract = {
  eventKey: 'ia:tab_view';
  toRoute: MissionRoutePath;
  requiredFields: string[];
  optionalFields: string[];
};

export const missionStepTransitionContracts: MissionTransitionContract[] = missionRoutePaths.map((toRoute) => ({
  eventKey: 'ia:tab_view',
  toRoute,
  requiredFields: ['data.tab', 'data.fromTab', 'data.toTab', 'data.transitionType', 'data.source'],
  optionalFields: ['data.operationId', 'data.caseId', 'data.signalId', 'data.actionId'],
}));

export const isMissionRoutePath = (value: string): value is MissionRoutePath => {
  return (missionRoutePaths as readonly string[]).includes(value);
};

export const isAppRoutePath = (value: string): value is AppRoutePath => {
  return (appRoutePaths as readonly string[]).includes(value);
};

export const buildMissionTransitionPayload = (input: {
  fromTab: MissionRoutePath;
  toTab: MissionRoutePath;
  source: MissionTransitionSource;
  operationId?: string | null;
  caseId?: string | null;
  signalId?: string | null;
  actionId?: string;
}) => ({
  tab: input.toTab,
  fromTab: input.fromTab,
  toTab: input.toTab,
  transitionType: 'mission_step_transition',
  source: input.source,
  operationId: input.operationId ?? undefined,
  caseId: input.caseId ?? undefined,
  signalId: input.signalId ?? undefined,
  actionId: input.actionId,
});

export const buildAppTransitionPayload = (input: {
  fromTab: AppRoutePath | string;
  toTab: AppRoutePath | string;
  source: MissionTransitionSource;
}) => ({
  tab: input.toTab,
  fromTab: input.fromTab,
  toTab: input.toTab,
  transitionType: 'app_tab_transition',
  source: input.source,
  shell: 'v2',
});
