import type { MissionEntityCollection } from '../../domain/mission/types';
import type { MissionFlowContext } from '../../store/missionFlow/continuity';

export type TimelineEvent = {
  id: string;
  label: string;
  timestamp: string;
  marker: string;
  path: '/mission/brief' | '/mission/triage' | '/mission/case' | '/mission/signal' | '/mission/debrief';
  eventType: 'operation' | 'case' | 'signal' | 'artifact' | 'debrief';
};

const toIso = (value: string): string => {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return new Date(0).toISOString();
  return new Date(ts).toISOString();
};

export const buildTimelineEvents = (
  collection: MissionEntityCollection | null,
  context: MissionFlowContext | null,
): TimelineEvent[] => {
  if (!collection) return [];

  const operationId = context?.operationId ?? collection.operations[0]?.id ?? null;
  const caseId = context?.caseId ?? collection.cases.find((item) => item.operationId === operationId)?.id ?? null;

  const operation = collection.operations.find((item) => item.id === operationId);
  const activeCase = collection.cases.find((item) => item.id === caseId);
  const activeSignals = collection.signals.filter((item) => item.operationId === operationId);
  const activeArtifacts = collection.artifacts.filter((item) => (caseId ? item.caseId === caseId : true));
  const debrief = operation?.debriefOutcomeId
    ? collection.debriefOutcomes.find((item) => item.id === operation.debriefOutcomeId)
    : undefined;

  const events: TimelineEvent[] = [];

  if (operation) {
    events.push({
      id: `operation:${operation.id}`,
      label: `Operation ${operation.codename}`,
      timestamp: toIso(operation.createdAt),
      marker: '🛰️',
      path: '/mission/brief',
      eventType: 'operation',
    });
  }

  if (activeCase) {
    events.push({
      id: `case:${activeCase.id}`,
      label: `Case ${activeCase.title}`,
      timestamp: toIso(activeCase.updatedAt),
      marker: '🗂️',
      path: '/mission/case',
      eventType: 'case',
    });
  }

  activeSignals.slice(0, 3).forEach((signal) => {
    events.push({
      id: `signal:${signal.id}`,
      label: `Signal ${signal.title}`,
      timestamp: toIso(signal.observedAt),
      marker: '📡',
      path: '/mission/signal',
      eventType: 'signal',
    });
  });

  activeArtifacts.slice(0, 2).forEach((artifact) => {
    events.push({
      id: `artifact:${artifact.id}`,
      label: `Artifact ${artifact.title}`,
      timestamp: toIso(artifact.collectedAt),
      marker: '🧾',
      path: '/mission/case',
      eventType: 'artifact',
    });
  });

  if (debrief) {
    events.push({
      id: `debrief:${debrief.id}`,
      label: `Debrief ${debrief.rating.toUpperCase()}`,
      timestamp: toIso(debrief.updatedAt),
      marker: '📝',
      path: '/mission/debrief',
      eventType: 'debrief',
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};