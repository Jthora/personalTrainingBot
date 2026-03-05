export type MissionRouteTier = 'tier_1_core' | 'tier_2_analysis' | 'tier_3_support';

export type MissionRouteBudget = {
  route: string;
  tier: MissionRouteTier;
  maxTransferBytes: number;
};

const kb = (value: number) => Math.round(value * 1024);

export const missionRouteBudgets: MissionRouteBudget[] = [
  { route: '/mission/brief', tier: 'tier_1_core', maxTransferBytes: kb(8200) },
  { route: '/mission/triage', tier: 'tier_1_core', maxTransferBytes: kb(8200) },
  { route: '/mission/checklist', tier: 'tier_1_core', maxTransferBytes: kb(8200) },
  { route: '/mission/case', tier: 'tier_2_analysis', maxTransferBytes: kb(8250) },
  { route: '/mission/signal', tier: 'tier_2_analysis', maxTransferBytes: kb(8250) },
  { route: '/mission/debrief', tier: 'tier_3_support', maxTransferBytes: kb(8300) },
];
