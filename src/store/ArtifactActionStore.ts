/**
 * ArtifactActionStore — persists review/promote flags for artifacts to localStorage
 * so they survive navigation between mission surfaces.
 */

import { createStore } from './createStore';

export type ArtifactActionRecord = {
  reviewed: boolean;
  promoted: boolean;
  updatedAt: number;
};

type State = Record<string, ArtifactActionRecord>;

const store = createStore<State>({ key: 'ptb:artifact-actions', defaultValue: {} });

const ensureRecord = (existing: ArtifactActionRecord | undefined): ArtifactActionRecord =>
  existing ?? { reviewed: false, promoted: false, updatedAt: Date.now() };

export const ArtifactActionStore = {
  subscribe: store.subscribe.bind(store),

  getAll(): State {
    return store.get();
  },

  get(artifactId: string): ArtifactActionRecord | null {
    return store.get()[artifactId] ?? null;
  },

  markReviewed(artifactId: string) {
    store.update((s) => ({ ...s, [artifactId]: { ...ensureRecord(s[artifactId]), reviewed: true, updatedAt: Date.now() } }));
  },

  markPromoted(artifactId: string) {
    store.update((s) => ({ ...s, [artifactId]: { ...ensureRecord(s[artifactId]), promoted: true, updatedAt: Date.now() } }));
  },

  toggleReviewed(artifactId: string) {
    store.update((s) => {
      const record = ensureRecord(s[artifactId]);
      return { ...s, [artifactId]: { ...record, reviewed: !record.reviewed, updatedAt: Date.now() } };
    });
  },

  togglePromoted(artifactId: string) {
    store.update((s) => {
      const record = ensureRecord(s[artifactId]);
      return { ...s, [artifactId]: { ...record, promoted: !record.promoted, updatedAt: Date.now() } };
    });
  },

  clear(artifactId: string) {
    store.update((s) => { const next = { ...s }; delete next[artifactId]; return next; });
  },

  clearAll() {
    store.set({});
  },

  /** Count of artifacts that have been reviewed. */
  reviewedCount(): number {
    return Object.values(store.get()).filter((r) => r.reviewed).length;
  },

  /** Count of artifacts that have been promoted to intel. */
  promotedCount(): number {
    return Object.values(store.get()).filter((r) => r.promoted).length;
  },
};
