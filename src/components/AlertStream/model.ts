import type { MissionSeverity, MissionSignal } from '../../domain/mission/types';

export type AlertTimeBucket = 'last_hour' | 'last_24h' | 'older';

export type AlertStreamItem = {
  id: string;
  title: string;
  detail: string;
  severity: MissionSeverity;
  status: string;
  observedAt: string;
};

export type AlertGroup = {
  id: string;
  severity: MissionSeverity;
  timeBucket: AlertTimeBucket;
  label: string;
  items: AlertStreamItem[];
};

const severityOrder: Record<MissionSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const bucketOrder: Record<AlertTimeBucket, number> = {
  last_hour: 0,
  last_24h: 1,
  older: 2,
};

const getTimeBucket = (observedAt: string, nowMs: number): AlertTimeBucket => {
  const observedMs = new Date(observedAt).getTime();
  if (Number.isNaN(observedMs)) return 'older';

  const deltaMs = Math.max(0, nowMs - observedMs);
  if (deltaMs <= 60 * 60 * 1000) return 'last_hour';
  if (deltaMs <= 24 * 60 * 60 * 1000) return 'last_24h';
  return 'older';
};

const bucketLabel: Record<AlertTimeBucket, string> = {
  last_hour: 'Last hour',
  last_24h: 'Last 24h',
  older: 'Earlier',
};

const severityLabel = (severity: MissionSeverity) => severity.toUpperCase();

export const buildAlertGroups = (signals: MissionSignal[], nowMs = Date.now()): AlertGroup[] => {
  const grouped = new Map<string, AlertGroup>();

  signals.forEach((signal) => {
    const timeBucket = getTimeBucket(signal.observedAt, nowMs);
    const key = `${signal.severity}:${timeBucket}`;

    const existing = grouped.get(key) ?? {
      id: key,
      severity: signal.severity,
      timeBucket,
      label: `${severityLabel(signal.severity)} · ${bucketLabel[timeBucket]}`,
      items: [],
    };

    existing.items.push({
      id: signal.id,
      title: signal.title,
      detail: signal.detail,
      severity: signal.severity,
      status: signal.status.replace(/_/g, ' ').toUpperCase(),
      observedAt: signal.observedAt,
    });

    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()),
    }))
    .sort((a, b) => {
      const severityDelta = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDelta !== 0) return severityDelta;
      return bucketOrder[a.timeBucket] - bucketOrder[b.timeBucket];
    });
};