import type { MissionSeverity } from '../domain/mission/types';

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

const STORE_KEY = 'ptb:triage-actions';

type Listener = (state: Record<string, TriageActionRecord>) => void;
const listeners = new Set<Listener>();

const readState = (): Record<string, TriageActionRecord> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TriageActionRecord>) : {};
  } catch (err) {
    console.warn('[TriageActionStore] read failed', err);
    return {};
  }
};

const writeState = (state: Record<string, TriageActionRecord>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[TriageActionStore] write failed', err);
  }
};

const notify = (state: Record<string, TriageActionRecord>) => {
  listeners.forEach((fn) => fn(state));
};

export const TriageActionStore = {
  subscribe(cb: Listener) {
    listeners.add(cb);
    cb(this.getAll());
    return () => { listeners.delete(cb); };
  },

  getAll(): Record<string, TriageActionRecord> {
    return readState();
  },

  get(entityId: string): TriageActionRecord | null {
    return readState()[entityId] ?? null;
  },

  record(entityId: string, action: TriageActionRecord['action'], severity: MissionSeverity, status: string, domainStatus: string) {
    const state = readState();
    state[entityId] = { severity, status, domainStatus, action, updatedAt: Date.now() };
    writeState(state);
    notify(state);
  },

  clear(entityId: string) {
    const state = readState();
    delete state[entityId];
    writeState(state);
    notify(state);
  },

  clearAll() {
    writeState({});
    notify({});
  },

  /** Count of entities that have been triaged. */
  count(): number {
    return Object.keys(readState()).length;
  },

  /** All entity IDs grouped by action type. */
  byAction(): Record<TriageActionRecord['action'], string[]> {
    const state = readState();
    const groups: Record<TriageActionRecord['action'], string[]> = {
      ack: [], escalate: [], defer: [], resolve: [],
    };
    for (const [id, record] of Object.entries(state)) {
      groups[record.action].push(id);
    }
    return groups;
  },
};
