import { trackEvent } from '../utils/telemetry';

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

const AAR_KEY = 'ptb:aar-entries';

type Listener = (entries: AAREntry[]) => void;
const listeners = new Set<Listener>();

const readJSON = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn('[AARStore] read failed', key, err);
    return null;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[AARStore] write failed', key, err);
  }
};

const ensureEntries = (): AAREntry[] => {
  const existing = readJSON<AAREntry[]>(AAR_KEY);
  if (existing && existing.length > 0) return existing;
  const now = Date.now();
  const starter: AAREntry = {
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
  writeJSON(AAR_KEY, [starter]);
  return [starter];
};

const setEntries = (entries: AAREntry[]) => {
  writeJSON(AAR_KEY, entries);
  listeners.forEach((cb) => cb(entries));
};

const nextId = () => `aar-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

export const AARStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(ensureEntries());
    return () => {
      listeners.delete(listener);
    };
  },

  list(): AAREntry[] {
    return ensureEntries().sort((a, b) => b.updatedAt - a.updatedAt);
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
    const entries = [entry, ...ensureEntries()];
    setEntries(entries);
    trackEvent({ category: 'aar', action: 'aar_create', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
    return entry;
  },

  save(entry: AAREntry) {
    const entries = ensureEntries();
    const next = [entry, ...entries.filter((e) => e.id !== entry.id)];
    setEntries(next);
    trackEvent({ category: 'aar', action: 'aar_save', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
  },

  replaceAll(entries: AAREntry[]): void {
    setEntries([...entries].sort((a, b) => b.updatedAt - a.updatedAt));
  },

  exportEntry(id: string): string | null {
    const entry = ensureEntries().find((e) => e.id === id);
    if (!entry) return null;
    trackEvent({ category: 'aar', action: 'aar_export', data: { id: entry.id, role: entry.role, title: entry.title }, source: 'ui' });
    return JSON.stringify(entry, null, 2);
  },
};
