export const missionRoutePaths = [
  '/mission/brief',
  '/mission/triage',
  '/mission/case',
  '/mission/signal',
  '/mission/checklist',
  '/mission/debrief',
] as const;

export type MissionRoutePath = (typeof missionRoutePaths)[number];

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
