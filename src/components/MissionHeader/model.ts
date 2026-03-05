import type { MissionEntityCollection, MissionOperation } from '../../domain/mission/types';
import type { MissionFlowContext } from '../../store/missionFlow/continuity';

export type MissionHeaderModel =
  | {
      kind: 'loading';
      title: string;
      objective: string;
      statusLabel: string;
      readinessLabel: string;
      timeboxLabel: string;
    }
  | {
      kind: 'empty' | 'error';
      title: string;
      objective: string;
      statusLabel: string;
      readinessLabel: string;
      timeboxLabel: string;
    }
  | {
      kind: 'ready';
      title: string;
      objective: string;
      statusLabel: string;
      readinessLabel: string;
      timeboxLabel: string;
      operation: MissionOperation;
    };

const humanizeStatus = (status: MissionOperation['status']) => status.replace(/_/g, ' ').toUpperCase();

export const formatMissionTimebox = (createdAt: string, nowMs = Date.now()): string => {
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) {
    return '—';
  }

  const deltaMs = Math.max(0, nowMs - createdMs);
  const totalMinutes = Math.floor(deltaMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);

  if (days > 0) {
    return `T+${days}d ${hours}h`;
  }

  return `T+${hours}h`;
};

export const getMissionHeaderModel = (
  collection: MissionEntityCollection | null,
  context: MissionFlowContext | null,
  fallbackReadinessScore: number,
): MissionHeaderModel => {
  if (!collection) {
    return {
      kind: 'loading',
      title: 'Loading mission operation',
      objective: 'Hydrating operation context and readiness telemetry.',
      statusLabel: 'LOADING',
      readinessLabel: 'Readiness --',
      timeboxLabel: 'Timebox --',
    };
  }

  if (collection.operations.length === 0) {
    return {
      kind: 'empty',
      title: 'No active operation',
      objective: 'Mission data is unavailable. Load a mission pack to continue.',
      statusLabel: 'EMPTY',
      readinessLabel: 'Readiness --',
      timeboxLabel: 'Timebox --',
    };
  }

  const operation = collection.operations.find((item) => item.id === context?.operationId) ?? collection.operations[0];

  if (context?.operationId && !collection.operations.some((item) => item.id === context.operationId)) {
    return {
      kind: 'error',
      title: 'Operation context mismatch',
      objective: 'Saved operation context is stale. Reset to re-anchor mission continuity.',
      statusLabel: 'ERROR',
      readinessLabel: 'Readiness --',
      timeboxLabel: 'Timebox --',
    };
  }

  const boundedReadiness = Math.max(0, Math.min(100, operation.readinessScore || fallbackReadinessScore));

  return {
    kind: 'ready',
    title: operation.codename,
    objective: operation.objective,
    statusLabel: humanizeStatus(operation.status),
    readinessLabel: `Readiness ${Math.round(boundedReadiness)}`,
    timeboxLabel: `Timebox ${formatMissionTimebox(operation.createdAt)}`,
    operation,
  };
};