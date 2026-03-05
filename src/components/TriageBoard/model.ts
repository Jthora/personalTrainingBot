import type { MissionCase, MissionEntityCollection, MissionSeverity, MissionSignal } from '../../domain/mission/types';

export type TriageAction = 'ack' | 'escalate' | 'defer' | 'resolve';

export type TriageCard = {
  id: string;
  title: string;
  body: string;
  lane: 'Case' | 'Signal';
  severity: MissionSeverity;
  status: string;
};

export type TriageColumn = {
  id: string;
  title: string;
  cards: TriageCard[];
};

const severityOrder: MissionSeverity[] = ['low', 'medium', 'high', 'critical'];

const toCaseCard = (value: MissionCase): TriageCard => ({
  id: value.id,
  title: value.title,
  body: value.summary,
  lane: 'Case',
  severity: value.severity,
  status: value.status.replace(/_/g, ' ').toUpperCase(),
});

const toSignalCard = (value: MissionSignal): TriageCard => ({
  id: value.id,
  title: value.title,
  body: value.detail,
  lane: 'Signal',
  severity: value.severity,
  status: value.status.replace(/_/g, ' ').toUpperCase(),
});

export const severityRank: Record<MissionSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const buildColumns = (collection: MissionEntityCollection | null): TriageColumn[] => {
  if (!collection) return [];

  const intakeCases = collection.cases
    .filter((item) => item.status === 'new' || item.status === 'assessing')
    .map(toCaseCard);
  const activeCases = collection.cases
    .filter((item) => item.status === 'engaged' || item.status === 'contained')
    .map(toCaseCard);
  const signals = collection.signals.map(toSignalCard);

  return [
    { id: 'intake', title: 'Intake', cards: intakeCases },
    { id: 'active', title: 'Active Cases', cards: activeCases },
    { id: 'signals', title: 'Signal Feed', cards: signals },
  ];
};

const actionStatusLabel: Record<TriageAction, string> = {
  ack: 'ACKNOWLEDGED',
  escalate: 'ESCALATED',
  defer: 'DEFERRED',
  resolve: 'RESOLVED',
};

export const applyTriageAction = (card: TriageCard, action: TriageAction): TriageCard => {
  if (action === 'escalate') {
    const currentIndex = severityOrder.indexOf(card.severity);
    const nextSeverity = severityOrder[Math.min(currentIndex + 1, severityOrder.length - 1)] ?? card.severity;
    return {
      ...card,
      severity: nextSeverity,
      status: actionStatusLabel.escalate,
    };
  }

  return {
    ...card,
    status: actionStatusLabel[action],
  };
};

export const resolveShortcutAction = (key: string): TriageAction | null => {
  const normalized = key.toLowerCase();
  if (normalized === 'a') return 'ack';
  if (normalized === 'e') return 'escalate';
  if (normalized === 'd') return 'defer';
  if (normalized === 'r') return 'resolve';
  return null;
};
