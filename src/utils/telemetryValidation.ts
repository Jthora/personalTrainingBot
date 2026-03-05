import type {
  AppTelemetryEvent,
  AarAction,
  DrillsAction,
  IaAction,
  OfflineAction,
  ReadinessAction,
  SettingsAction,
  SignalsAction,
  TrackedEvent,
} from './telemetry';

export const allowedActionsByCategory: Record<AppTelemetryEvent['category'], readonly string[]> = {
  ia: ['tab_view', 'deep_link_load', 'nav_error'],
  readiness: ['score_render', 'score_source', 'next_action_click'],
  offline: ['offline_enter', 'offline_exit', 'cache_hit', 'cache_miss', 'sw_install', 'sw_update_available', 'sw_update_applied'],
  drills: ['drill_start', 'step_complete', 'drill_complete', 'drill_abort', 'drill_export'],
  signals: ['signal_create', 'signal_ack', 'signal_resolve'],
  aar: ['aar_create', 'aar_save', 'aar_export'],
  settings: ['toggle_low_data', 'toggle_mute', 'preload_trigger'],
};

export const requiredFieldsByCategory: Partial<Record<AppTelemetryEvent['category'], Record<string, string[]>>> = {
  ia: {
    tab_view: ['data.tab'],
  },
  readiness: {
    score_render: ['data.score', 'data.confidence'],
    next_action_click: ['data.actionId'],
  },
  drills: {
    drill_start: ['data.drillId'],
    step_complete: ['data.stepId'],
    drill_complete: ['data.drillId'],
  },
  signals: {
    signal_create: ['data.id', 'data.role'],
    signal_ack: ['data.id'],
    signal_resolve: ['data.id'],
  },
  aar: {
    aar_save: ['data.id'],
    aar_export: ['data.id'],
  },
};

const expectOffline: Partial<Record<OfflineAction, boolean>> = {
  offline_enter: true,
  offline_exit: false,
};

const hasPath = (obj: unknown, pathStr: string): boolean => {
  const parts = pathStr.split('.');
  let cursor: any = obj;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== 'object' || !(part in cursor)) {
      return false;
    }
    cursor = cursor[part];
  }
  return true;
};

export const validateTrackedEvent = (evt: any): string[] => {
  const issues: string[] = [];
  if (!evt || typeof evt !== 'object') {
    issues.push('Event is not an object');
    return issues;
  }

  const category = evt.category as AppTelemetryEvent['category'];
  if (!category || !(category in allowedActionsByCategory)) {
    issues.push('Missing/invalid category');
    return issues;
  }

  const action = evt.action as IaAction | ReadinessAction | OfflineAction | DrillsAction | SignalsAction | AarAction | SettingsAction;
  if (!action || !allowedActionsByCategory[category].includes(action)) {
    issues.push(`Action "${action}" not allowed for category ${category}`);
  }

  if (!evt.ts || typeof evt.ts !== 'string') {
    issues.push('Missing ts (ISO timestamp expected)');
  }

  if (typeof evt.offline !== 'boolean') {
    issues.push('Missing offline boolean');
  }

  if (category === 'offline' && action in expectOffline) {
    const expected = expectOffline[action as OfflineAction];
    if (evt.offline !== expected) {
      issues.push(`Offline flag ${evt.offline} does not match expected ${expected} for ${action}`);
    }
  }

  const fieldRequirements = requiredFieldsByCategory[category]?.[action];
  if (fieldRequirements) {
    fieldRequirements.forEach((field) => {
      if (!hasPath(evt, field)) {
        issues.push(`Missing required field ${field}`);
      }
    });
  }

  if (category === 'ia' && action === 'tab_view') {
    const tabPath = typeof evt?.data?.tab === 'string' ? evt.data.tab : typeof evt?.route === 'string' ? evt.route : '';
    if (tabPath.startsWith('/mission/')) {
      ['data.fromTab', 'data.toTab', 'data.transitionType', 'data.source'].forEach((field) => {
        if (!hasPath(evt, field)) {
          issues.push(`Missing required mission transition field ${field}`);
        }
      });
    }
  }

  return issues;
};

export type TelemetryValidationIssue = {
  index: number;
  problems: string[];
};

export type TelemetryValidationReport = {
  total: number;
  summary: Array<{ key: string; count: number }>;
  issues: TelemetryValidationIssue[];
};

export const summarizeTelemetryEvents = (events: TrackedEvent[]): Array<{ key: string; count: number }> => {
  const summary = events.reduce<Record<string, number>>((acc, evt) => {
    const key = `${evt.category}:${evt.action}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));
};

export const buildTelemetryValidationReport = (events: TrackedEvent[]): TelemetryValidationReport => {
  const issues: TelemetryValidationIssue[] = [];
  events.forEach((evt, idx) => {
    const problems = validateTrackedEvent(evt);
    if (problems.length) {
      issues.push({ index: idx, problems });
    }
  });

  return {
    total: events.length,
    summary: summarizeTelemetryEvents(events),
    issues,
  };
};
