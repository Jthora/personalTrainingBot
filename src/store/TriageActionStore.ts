import type { MissionSeverity } from '../domain/mission/types';
import { createStore } from './createStore';

/**
 * TriageActionStore — persists triage A/E/D/R decisions to localStorage
 * so they survive navigation between mission surfaces.
 */

export type TriageActionRecord = {
  severity: MissionSeverity;
  status: string;
  /** Domain-level status used for lifecycle validation on subsequent actions. */
  domainStatus: string;
  action: 'ack' | 'escalate' | 'defer' | 'resolve';
  updatedAt: number;
};

type State = Record<string, TriageActionRecord>;

const store = createStore<State>({ key: 'ptb:triage-actions', defaultValue: {} });

export const TriageActionStore = {
  subscribe: store.subscribe.bind(store),

  getAll(): State {
    return store.get();
  },

  get(entityId: string): TriageActionRecord | null {
    return store.get()[entityId] ?? null;
  },

  record(entityId: string, action: TriageActionRecord['action'], severity: MissionSeverity, status: string, domainStatus: string) {
    store.update((s) => ({ ...s, [entityId]: { severity, status, domainStatus, action, updatedAt: Date.now() } }));
  },

  clear(entityId: string) {
    store.update((s) => { const next = { ...s }; delete next[entityId]; return next; });
  },

  clearAll() {
    store.set({});
  },

  /** Count of entities that have been triaged. */
  count(): number {
    return Object.keys(store.get()).length;
  },

  /** All entity IDs grouped by action type. */
  byAction(): Record<TriageActionRecord['action'], string[]> {
    const state = store.get();
    const groups: Record<TriageActionRecord['action'], string[]> = {
      ack: [], escalate: [], defer: [], resolve: [],
    };
    for (const [id, record] of Object.entries(state)) {
      groups[record.action].push(id);
    }
    return groups;
  },
};
