import { describe, it, expect, beforeEach } from 'vitest';
import {
  markSyncing,
  markSynced,
  markError,
  getEntry,
  getSnapshot,
  subscribe,
  _resetSyncStatusStore,
} from '../syncStatusStore';

beforeEach(() => {
  _resetSyncStatusStore();
});

describe('syncStatusStore', () => {
  describe('getEntry', () => {
    it('returns idle default for unknown namespace', () => {
      const entry = getEntry('unknown');
      expect(entry.status).toBe('idle');
      expect(entry.lastSyncedAt).toBeNull();
      expect(entry.errorMessage).toBeNull();
    });
  });

  describe('markSyncing', () => {
    it('sets status to syncing and clears errorMessage', () => {
      markSyncing('progress');
      const entry = getEntry('progress');
      expect(entry.status).toBe('syncing');
      expect(entry.errorMessage).toBeNull();
    });

    it('preserves lastSyncedAt from a previous synced state', () => {
      markSynced('progress');
      const syncedAt = getEntry('progress').lastSyncedAt;
      markSyncing('progress');
      expect(getEntry('progress').lastSyncedAt).toBe(syncedAt);
    });
  });

  describe('markSynced', () => {
    it('sets status to synced', () => {
      markSynced('drillRun');
      expect(getEntry('drillRun').status).toBe('synced');
    });

    it('sets lastSyncedAt to a recent timestamp', () => {
      const before = Date.now();
      markSynced('drillRun');
      const after = Date.now();
      const ts = getEntry('drillRun').lastSyncedAt;
      expect(ts).not.toBeNull();
      expect(ts!).toBeGreaterThanOrEqual(before);
      expect(ts!).toBeLessThanOrEqual(after);
    });

    it('clears errorMessage', () => {
      markError('aar', 'previous error');
      markSynced('aar');
      expect(getEntry('aar').errorMessage).toBeNull();
    });
  });

  describe('markError', () => {
    it('sets status to error with default message', () => {
      markError('progress');
      const entry = getEntry('progress');
      expect(entry.status).toBe('error');
      expect(entry.errorMessage).toBe('Sync failed');
    });

    it('sets status to error with custom message', () => {
      markError('progress', 'Connection refused');
      expect(getEntry('progress').errorMessage).toBe('Connection refused');
    });
  });

  describe('getSnapshot', () => {
    it('returns empty object initially', () => {
      expect(getSnapshot()).toEqual({});
    });

    it('reflects all updated namespaces', () => {
      markSynced('progress');
      markError('aar', 'oops');
      const snap = getSnapshot();
      expect(snap['progress'].status).toBe('synced');
      expect(snap['aar'].status).toBe('error');
    });

    it('returns a new object reference after each mutation', () => {
      const s1 = getSnapshot();
      markSyncing('drillRun');
      const s2 = getSnapshot();
      expect(s1).not.toBe(s2);
    });
  });

  describe('subscribe', () => {
    it('fires callback on markSyncing', () => {
      let callCount = 0;
      subscribe(() => { callCount += 1; });
      markSyncing('progress');
      expect(callCount).toBe(1);
    });

    it('fires callback on markSynced', () => {
      let callCount = 0;
      subscribe(() => { callCount += 1; });
      markSynced('aar');
      expect(callCount).toBe(1);
    });

    it('fires callback on markError', () => {
      let callCount = 0;
      subscribe(() => { callCount += 1; });
      markError('drillRun');
      expect(callCount).toBe(1);
    });

    it('returns unsubscribe function that stops further callbacks', () => {
      let callCount = 0;
      const unsub = subscribe(() => { callCount += 1; });
      markSynced('progress');
      expect(callCount).toBe(1);
      unsub();
      markSynced('progress');
      expect(callCount).toBe(1); // not incremented after unsub
    });

    it('supports multiple independent subscribers', () => {
      let a = 0;
      let b = 0;
      subscribe(() => { a += 1; });
      subscribe(() => { b += 1; });
      markSynced('progress');
      expect(a).toBe(1);
      expect(b).toBe(1);
    });
  });

  describe('_resetSyncStatusStore', () => {
    it('clears all state', () => {
      markSynced('progress');
      markError('aar');
      _resetSyncStatusStore();
      expect(getSnapshot()).toEqual({});
    });

    it('stops notifying cleared listeners', () => {
      let callCount = 0;
      subscribe(() => { callCount += 1; });
      _resetSyncStatusStore();
      markSynced('progress');
      expect(callCount).toBe(0);
    });
  });
});
