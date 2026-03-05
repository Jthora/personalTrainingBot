import type { MissionSeverity } from '../../domain/mission/types';

export type MissionEntityIconKey = 'operation' | 'case' | 'lead' | 'signal' | 'artifact' | 'intel' | 'debrief';

export const missionEntityIcons: Record<MissionEntityIconKey, string> = {
  operation: '🛰️',
  case: '🗂️',
  lead: '🧭',
  signal: '📡',
  artifact: '🧾',
  intel: '🧠',
  debrief: '📝',
};

export const missionSeverityIcons: Record<MissionSeverity, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};
