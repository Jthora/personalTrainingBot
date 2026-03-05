import type { TrackedEvent } from './telemetry';

export type TelemetrySchemaSnapshot = {
  generatedAt: string;
  eventSchemas: Record<string, string[]>;
};

export type TelemetrySchemaDrift = {
  missingEventKeys: string[];
  newEventKeys: string[];
  changedDataKeys: Array<{ eventKey: string; missingKeys: string[]; newKeys: string[] }>;
};

const eventKey = (event: TrackedEvent): string => `${event.category}:${event.action}`;

const toSorted = (items: Iterable<string>): string[] => Array.from(new Set(items)).sort();

const collectDataKeys = (value: unknown): string[] => {
  if (!value || typeof value !== 'object') return [];
  return Object.keys(value as Record<string, unknown>).sort();
};

export const buildTelemetrySchemaSnapshot = (
  events: TrackedEvent[],
  generatedAt = new Date().toISOString(),
): TelemetrySchemaSnapshot => {
  const map = new Map<string, Set<string>>();
  events.forEach((event) => {
    const key = eventKey(event);
    const existing = map.get(key) ?? new Set<string>();
    collectDataKeys(event.data).forEach((dataKey) => existing.add(dataKey));
    map.set(key, existing);
  });

  const eventSchemas = Object.fromEntries(
    Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, keys]) => [key, toSorted(keys)]),
  );

  return {
    generatedAt,
    eventSchemas,
  };
};

export const diffTelemetrySchemas = (
  baseline: TelemetrySchemaSnapshot,
  current: TelemetrySchemaSnapshot,
): TelemetrySchemaDrift => {
  const baselineKeys = Object.keys(baseline.eventSchemas);
  const currentKeys = Object.keys(current.eventSchemas);

  const missingEventKeys = baselineKeys.filter((key) => !currentKeys.includes(key));
  const newEventKeys = currentKeys.filter((key) => !baselineKeys.includes(key));

  const changedDataKeys = baselineKeys
    .filter((key) => currentKeys.includes(key))
    .map((key) => {
      const baselineDataKeys = baseline.eventSchemas[key] ?? [];
      const currentDataKeys = current.eventSchemas[key] ?? [];
      const missingKeys = baselineDataKeys.filter((item) => !currentDataKeys.includes(item));
      const newKeys = currentDataKeys.filter((item) => !baselineDataKeys.includes(item));
      return { eventKey: key, missingKeys, newKeys };
    })
    .filter((entry) => entry.missingKeys.length > 0 || entry.newKeys.length > 0);

  return {
    missingEventKeys: missingEventKeys.sort(),
    newEventKeys: newEventKeys.sort(),
    changedDataKeys,
  };
};

export const hasTelemetrySchemaDrift = (drift: TelemetrySchemaDrift): boolean => {
  return drift.missingEventKeys.length > 0 || drift.newEventKeys.length > 0 || drift.changedDataKeys.length > 0;
};
