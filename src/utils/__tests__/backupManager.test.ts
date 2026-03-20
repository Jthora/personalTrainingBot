import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Polyfill IndexedDB for test environment
import 'fake-indexeddb/auto';

import { backupNow, restoreIfNeeded, BACKUP_KEYS } from '../backupManager';

/**
 * Tests use fake-indexeddb (configured in vitest.setup.ts).
 * Each test clears localStorage. IndexedDB state may persist across tests
 * so we use ≥ assertions where ordering matters.
 */

beforeEach(() => {
  localStorage.clear();
  // Delete the IDB database to get a clean slate
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('ptb-user-backup');
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
});

afterEach(() => {
  localStorage.clear();
});

describe('backupManager', () => {
  describe('backupNow', () => {
    it('does not throw when localStorage is empty', async () => {
      await expect(backupNow()).resolves.toBeUndefined();
    });

    it('backs up critical stores to IndexedDB', async () => {
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'test:1' }]));
      localStorage.setItem('operative:profile:v1', JSON.stringify({ archetypeId: 'cyber_sentinel' }));

      await backupNow();

      // Verify by clearing localStorage and restoring
      localStorage.removeItem('ptb:drill-history:v1');
      localStorage.removeItem('operative:profile:v1');

      const restored = await restoreIfNeeded();
      expect(restored).toBe(2);
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('test:1');
      expect(localStorage.getItem('operative:profile:v1')).toContain('cyber_sentinel');
    });
  });

  describe('restoreIfNeeded', () => {
    it('returns 0 when no backup exists', async () => {
      const count = await restoreIfNeeded();
      expect(count).toBe(0);
    });

    it('does not overwrite existing localStorage data', async () => {
      // First, back up some data
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'old:1' }]));
      await backupNow();

      // Now set different data in localStorage
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'new:1' }]));

      const restored = await restoreIfNeeded();
      expect(restored).toBe(0);
      // Original data should be preserved
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('new:1');
    });

    it('restores from IDB when localStorage is empty (null)', async () => {
      localStorage.setItem('ptb:drill-history:v1', JSON.stringify([{ id: 'backup:1' }]));
      await backupNow();

      localStorage.removeItem('ptb:drill-history:v1');

      const restored = await restoreIfNeeded();
      expect(restored).toBe(1);
      expect(localStorage.getItem('ptb:drill-history:v1')).toContain('backup:1');
    });

    it('restores from IDB when localStorage is empty array', async () => {
      localStorage.setItem('ptb:card-progress:v1', JSON.stringify([{ cardId: 'c1' }]));
      await backupNow();

      localStorage.setItem('ptb:card-progress:v1', '[]');

      const restored = await restoreIfNeeded();
      expect(restored).toBeGreaterThanOrEqual(1);
      expect(localStorage.getItem('ptb:card-progress:v1')).toContain('c1');
    });
  });

  describe('BACKUP_KEYS', () => {
    it('includes all 4 critical store keys', () => {
      expect(BACKUP_KEYS).toHaveLength(4);
      expect(BACKUP_KEYS).toContain('ptb:drill-history:v1');
      expect(BACKUP_KEYS).toContain('ptb:card-progress:v1');
      expect(BACKUP_KEYS).toContain('userProgress:v1');
      expect(BACKUP_KEYS).toContain('operative:profile:v1');
    });
  });
});
