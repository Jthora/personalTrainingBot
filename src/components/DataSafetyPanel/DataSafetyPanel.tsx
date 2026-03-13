/**
 * DataSafetyPanel — Export/import training data UI.
 *
 * Placed on the Debrief surface. Allows users to download all training data
 * as JSON or import a previous export to restore progress.
 */

import React, { useCallback, useRef, useState } from 'react';
import { downloadExport, readImportFile, importPayload } from '../../utils/dataExporter';
import { backupNow } from '../../utils/backupManager';
import styles from './DataSafetyPanel.module.css';

type Status = { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

const DataSafetyPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [importing, setImporting] = useState(false);

  const handleExport = useCallback(() => {
    try {
      downloadExport();
      void backupNow(); // also refresh IDB backup
      setStatus({ kind: 'success', message: 'Export downloaded.' });
    } catch {
      setStatus({ kind: 'error', message: 'Export failed.' });
    }
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatus({ kind: 'idle' });

    try {
      const payload = await readImportFile(file);
      const result = importPayload(payload, { force: true });

      if (result.success) {
        setStatus({
          kind: 'success',
          message: `Restored ${result.restoredKeys.length} store(s). Reload to apply.`,
        });
        void backupNow();
      } else {
        setStatus({
          kind: 'error',
          message: result.errors.join(' '),
        });
      }
    } catch (err) {
      setStatus({ kind: 'error', message: String(err) });
    } finally {
      setImporting(false);
      // Reset file input so re-selecting same file triggers change event
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={styles.panel} data-testid="data-safety-panel">
      <h3 className={styles.heading}>Training Data</h3>
      <p className={styles.description}>
        Export your progress as a JSON file you can keep safe. Import a previous export to restore your data on a new device or after clearing your browser.
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.exportBtn} onClick={handleExport}>
          Export Data
        </button>
        <button
          type="button"
          className={styles.importBtn}
          onClick={handleImportClick}
          disabled={importing}
        >
          {importing ? 'Importing…' : 'Import Data'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-label="Import training data file"
        />
      </div>

      {status.kind !== 'idle' && (
        <p
          className={status.kind === 'success' ? styles.success : styles.error}
          role="status"
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

export default DataSafetyPanel;
