/**
 * backupManager — Mirrors critical localStorage stores to IndexedDB.
 *
 * Protects against data loss from browser storage clears. On app startup,
 * if localStorage is empty but IndexedDB has data, restores automatically.
 *
 * Backed-up stores:
 *   - ptb:drill-history:v1   (DrillHistoryStore)
 *   - ptb:card-progress:v1   (CardProgressStore)
 *   - userProgress:v1        (UserProgressStore)
 *   - operative:profile:v1   (OperativeProfileStore)
 */

const DB_NAME = 'ptb-user-backup';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';

/** localStorage keys for stores we back up. */
export const BACKUP_KEYS = [
  'ptb:drill-history:v1',
  'ptb:card-progress:v1',
  'userProgress:v1',
  'operative:profile:v1',
] as const;

export type BackupKey = (typeof BACKUP_KEYS)[number];

const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

/* ── IndexedDB helpers ── */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) return reject(new Error('IndexedDB not available'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'));
  });
}

function idbPut(db: IDBDatabase, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IDB put failed'));
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as string | undefined);
    req.onerror = () => reject(req.error ?? new Error('IDB get failed'));
  });
}

function idbGetAll(db: IDBDatabase): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const map = new Map<string, string>();
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        map.set(cursor.key as string, cursor.value as string);
        cursor.continue();
      } else {
        resolve(map);
      }
    };
    req.onerror = () => reject(req.error ?? new Error('IDB cursor failed'));
  });
}

/* ── Debounce ── */

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 5000;

/* ── Public API ── */

/**
 * Write all critical stores from localStorage into IndexedDB.
 * Safe to call frequently — individual keys that haven't changed won't cause
 * unnecessary writes since we overwrite unconditionally (simple & correct).
 */
export async function backupNow(): Promise<void> {
  if (!isBrowser) return;
  try {
    const db = await openDb();
    const promises = BACKUP_KEYS.map((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        return idbPut(db, key, raw);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    db.close();
  } catch (err) {
    console.warn('[backupManager] backup failed:', err);
  }
}

/**
 * Debounced backup — coalesces multiple rapid writes into a single IDB flush.
 * Called by DrillHistoryStore after record(), and by CardProgressStore after recordReview().
 */
export function scheduleBackup(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void backupNow();
  }, DEBOUNCE_MS);
}

/**
 * If any of the critical localStorage keys are empty but IndexedDB has data,
 * restore them. Should be called **once** during app startup, before stores
 * are read for the first time.
 *
 * Returns number of keys restored (0 if nothing needed).
 */
export async function restoreIfNeeded(): Promise<number> {
  if (!isBrowser) return 0;
  try {
    const db = await openDb();
    const backups = await idbGetAll(db);
    db.close();

    let restored = 0;
    for (const key of BACKUP_KEYS) {
      const current = localStorage.getItem(key);
      const backup = backups.get(key);
      if ((current === null || current === '[]' || current === 'null') && backup) {
        localStorage.setItem(key, backup);
        restored += 1;
        console.log(`[backupManager] restored "${key}" from IndexedDB`);
      }
    }
    return restored;
  } catch (err) {
    console.warn('[backupManager] restore failed:', err);
    return 0;
  }
}

/**
 * Read all backup data from IndexedDB (for diagnostics / export).
 */
export async function readAllBackups(): Promise<Record<string, unknown>> {
  if (!isBrowser) return {};
  try {
    const db = await openDb();
    const map = await idbGetAll(db);
    db.close();
    const result: Record<string, unknown> = {};
    for (const [key, raw] of map) {
      try { result[key] = JSON.parse(raw); } catch { result[key] = raw; }
    }
    return result;
  } catch {
    return {};
  }
}
