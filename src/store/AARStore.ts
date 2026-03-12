import { trackEvent } from '../utils/telemetry';
import { createStore } from './createStore';

type AARRole = 'ops' | 'intel' | 'medical' | 'training';

export type AAREntry = {
  id: string;
  title: string;
  context: string;
  actions: string;
  outcomes: string;
  lessons: string;
  followups: string;
  owner: string;
  dueDate?: string;
  role: AARRole;
  createdAt: number;
  updatedAt: number;
};

const starterEntry = (): AAREntry => {
  const now = Date.now();
  return {
    id: 'aar-starter',
    title: 'Starter AAR',
    context: 'Dry-run of drill runner and offline sync.',
    actions: 'Ran starter drill offline; captured notes on cache hits.',
    outcomes: 'Shell loads offline; telemetry queued.',
    lessons: 'Add explicit offline indicator during drills.',
    followups: 'Ship offline indicator, attach to drill runner.',
    owner: 'Ops Lead',
    role: 'ops',
    createdAt: now,
    updatedAt: now,
  };
};

const store = createStore<AAREntry[]>({
  key: 'ptb:aar-entries',
  defaultValue: [starterEntry()],
  validate: (raw) => {
    if (!Array.isArray(raw)) return null;
    return raw.length > 0 ? (raw as AAREntry[]) : null; // null → seed with starter
  },
});

const nextId = () => `aar-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

export const AARStore = {
  subscribe: store.subscribe.bind(store),

  list(): AAREntry[] {
    return store.get().sort((a, b) => b.updatedAt - a.updatedAt);
  },

  create(): AAREntry {
    const now = Date.now();
    const entry: AAREntry = {
      id: nextId(),
      title: 'New AAR',
      context: '',
      actions: '',
      outcomes: '',
      lessons: '',
      followups: '',
      owner: '',
      role: 'ops',
      createdAt: now,
      updatedAt: now,
    };
    store.update((entries) => [entry, ...entries]);
    trackEvent({ category: 'aar', action: 'aar_create', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
    return entry;
  },

  save(entry: AAREntry) {
    store.update((entries) => [entry, ...entries.filter((e) => e.id !== entry.id)]);
    trackEvent({ category: 'aar', action: 'aar_save', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
  },

  replaceAll(entries: AAREntry[]): void {
    store.set([...entries].sort((a, b) => b.updatedAt - a.updatedAt));
  },

  exportEntry(id: string): string | null {
    const entry = store.get().find((e) => e.id === id);
    if (!entry) return null;
    trackEvent({ category: 'aar', action: 'aar_export', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
    return JSON.stringify(entry, null, 2);
  },
};
