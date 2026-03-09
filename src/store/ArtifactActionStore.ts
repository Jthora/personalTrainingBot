/**
 * ArtifactActionStore — persists review/promote flags for artifacts to localStorage
 * so they survive navigation between mission surfaces.
 */

export type ArtifactActionRecord = {
  reviewed: boolean;
  promoted: boolean;
  updatedAt: number;
};

const STORE_KEY = 'ptb:artifact-actions';

type Listener = (state: Record<string, ArtifactActionRecord>) => void;
const listeners = new Set<Listener>();

const readState = (): Record<string, ArtifactActionRecord> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ArtifactActionRecord>) : {};
  } catch (err) {
    console.warn('[ArtifactActionStore] read failed', err);
    return {};
  }
};

const writeState = (state: Record<string, ArtifactActionRecord>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[ArtifactActionStore] write failed', err);
  }
};

const notify = (state: Record<string, ArtifactActionRecord>) => {
  listeners.forEach((fn) => fn(state));
};

const ensureRecord = (existing: ArtifactActionRecord | undefined): ArtifactActionRecord =>
  existing ?? { reviewed: false, promoted: false, updatedAt: Date.now() };

export const ArtifactActionStore = {
  subscribe(cb: Listener) {
    listeners.add(cb);
    cb(this.getAll());
    return () => { listeners.delete(cb); };
  },

  getAll(): Record<string, ArtifactActionRecord> {
    return readState();
  },

  get(artifactId: string): ArtifactActionRecord | null {
    return readState()[artifactId] ?? null;
  },

  markReviewed(artifactId: string) {
    const state = readState();
    const record = ensureRecord(state[artifactId]);
    state[artifactId] = { ...record, reviewed: true, updatedAt: Date.now() };
    writeState(state);
    notify(state);
  },

  markPromoted(artifactId: string) {
    const state = readState();
    const record = ensureRecord(state[artifactId]);
    state[artifactId] = { ...record, promoted: true, updatedAt: Date.now() };
    writeState(state);
    notify(state);
  },

  toggleReviewed(artifactId: string) {
    const state = readState();
    const record = ensureRecord(state[artifactId]);
    state[artifactId] = { ...record, reviewed: !record.reviewed, updatedAt: Date.now() };
    writeState(state);
    notify(state);
  },

  togglePromoted(artifactId: string) {
    const state = readState();
    const record = ensureRecord(state[artifactId]);
    state[artifactId] = { ...record, promoted: !record.promoted, updatedAt: Date.now() };
    writeState(state);
    notify(state);
  },

  clear(artifactId: string) {
    const state = readState();
    delete state[artifactId];
    writeState(state);
    notify(state);
  },

  clearAll() {
    writeState({});
    notify({});
  },

  /** Count of artifacts that have been reviewed. */
  reviewedCount(): number {
    return Object.values(readState()).filter((r) => r.reviewed).length;
  },

  /** Count of artifacts that have been promoted to intel. */
  promotedCount(): number {
    return Object.values(readState()).filter((r) => r.promoted).length;
  },
};
