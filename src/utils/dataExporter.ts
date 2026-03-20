/**
 * dataExporter — Export / import all user training data as a single JSON file.
 *
 * Export includes:
 *   - DrillHistory, CardProgress, UserProgress, OperativeProfile
 *   - Schema version for forward-compatibility
 *   - Timestamp of export
 *
 * Import validates the schema version and merges data into stores.
 */

import { BACKUP_KEYS } from './backupManager';

export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  stores: Record<string, unknown>;
}

/* ── Export ── */

/**
 * Collect all critical store data into a typed payload.
 */
export function buildExportPayload(): ExportPayload {
  const stores: Record<string, unknown> = {};

  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        stores[key] = JSON.parse(raw);
      } catch {
        stores[key] = raw;
      }
    }
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: import.meta.env?.VITE_APP_VERSION ?? 'unknown',
    stores,
  };
}

/**
 * Download the export payload as a JSON file.
 */
export function downloadExport(filename?: string): void {
  const payload = buildExportPayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `training-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Import ── */

export interface ImportResult {
  success: boolean;
  restoredKeys: string[];
  errors: string[];
}

/**
 * Validate and import an export payload into localStorage.
 * Does **not** overwrite keys that already have data — use `force: true` to overwrite.
 */
export function importPayload(payload: unknown, options?: { force?: boolean }): ImportResult {
  const result: ImportResult = { success: false, restoredKeys: [], errors: [] };

  if (!payload || typeof payload !== 'object') {
    result.errors.push('Invalid payload: expected a JSON object.');
    return result;
  }

  const obj = payload as Record<string, unknown>;

  // Schema version check
  if (typeof obj.schemaVersion !== 'number') {
    result.errors.push('Missing or invalid schemaVersion.');
    return result;
  }
  if (obj.schemaVersion > EXPORT_SCHEMA_VERSION) {
    result.errors.push(
      `Export schema version ${obj.schemaVersion} is newer than this app supports (${EXPORT_SCHEMA_VERSION}). Update the app first.`,
    );
    return result;
  }

  const stores = obj.stores;
  if (!stores || typeof stores !== 'object') {
    result.errors.push('Missing "stores" field in export.');
    return result;
  }

  const allowedKeys = new Set<string>(BACKUP_KEYS);
  const storeMap = stores as Record<string, unknown>;

  for (const [key, value] of Object.entries(storeMap)) {
    if (!allowedKeys.has(key)) {
      result.errors.push(`Skipping unknown store key: "${key}".`);
      continue;
    }

    const existing = localStorage.getItem(key);
    const hasData = existing !== null && existing !== '[]' && existing !== 'null';

    if (hasData && !options?.force) {
      result.errors.push(`"${key}" already has data. Use force mode to overwrite.`);
      continue;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      result.restoredKeys.push(key);
    } catch (err) {
      result.errors.push(`Failed to write "${key}": ${String(err)}`);
    }
  }

  result.success = result.restoredKeys.length > 0;
  return result;
}

/**
 * Read a File input and parse the JSON export payload.
 */
export function readImportFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch (err) {
        reject(new Error(`Invalid JSON: ${String(err)}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
