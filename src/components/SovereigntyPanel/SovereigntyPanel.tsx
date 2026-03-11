/**
 * SovereigntyPanel — The operative's data sovereignty interface.
 *
 * Makes the decentralized architecture visible and comprehensible to the user.
 *
 * Section 1 — Operative Keypair:
 *   Shows whether a cryptographic identity has been initialized. If not,
 *   presents the initiation moment with a clear statement of what the keypair
 *   is and why it matters. If initialized, shows identity info and allows
 *   export, import, and removal.
 *
 * Section 2 — Data Custody:
 *   Shows live P2P sync status for each store namespace, driven by
 *   syncStatusStore. Without an identity the data is local only; with an
 *   identity it shows real-time sync state across the P2P mesh.
 *
 * This component is intentionally co-located with ProfileEditor in StatsSurface
 * and gated behind the p2pIdentity feature flag.
 */
import React, { useState, useCallback } from 'react';
import styles from './SovereigntyPanel.module.css';
import { useGunIdentity } from '../../hooks/useGunIdentity';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import type { SyncStatus } from '../../services/syncStatusStore';
import QRCodeDisplay from '../QRCodeDisplay/QRCodeDisplay';
import QRCodeScanner from '../QRCodeScanner/QRCodeScanner';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYNC_NAMESPACES: Array<{ id: string; label: string }> = [
  { id: 'progress', label: 'Progress' },
  { id: 'drillRun', label: 'Drill History' },
  { id: 'aar', label: 'After Action Reports' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Truncate a public key to a readable fingerprint: first8·last8 */
const fingerprint = (pub: string): string => {
  if (pub.length <= 20) return pub;
  return `${pub.slice(0, 8)}·····${pub.slice(-8)}`;
};

/** Human-readable relative time for lastSyncedAt timestamps */
const relativeTime = (ts: number | null): string => {
  if (ts === null) return 'never';
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(ts).toLocaleDateString();
};

/** Status label and CSS data-attribute value for a sync entry */
const syncStatusLabel = (status: SyncStatus, lastSyncedAt: number | null): string => {
  switch (status) {
    case 'syncing':  return 'Syncing…';
    case 'synced':   return `Synced ${relativeTime(lastSyncedAt)}`;
    case 'error':    return 'Sync error';
    case 'idle':
    default:         return 'Local only';
  }
};

/** Trigger a browser file download of a JSON string */
const downloadJson = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type OverlayMode = 'export' | 'import' | null;

// ─── Main Component ───────────────────────────────────────────────────────────

const SovereigntyPanel: React.FC = () => {
  const {
    identity,
    loading,
    error,
    publicKey,
    create,
    exportIdentity,
    importIdentity,
    logout,
  } = useGunIdentity();

  const { get: getSyncEntry } = useSyncStatus();

  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);

  // Export overlay state
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportWorking, setExportWorking] = useState(false);
  const [exportTab, setExportTab] = useState<'download' | 'qr'>('download');
  const [qrJson, setQrJson] = useState<string | null>(null);
  const [qrWorking, setQrWorking] = useState(false);

  // Import overlay state
  const [importText, setImportText] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importWorking, setImportWorking] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importTab, setImportTab] = useState<'paste' | 'scan'>('paste');

  // ── Handlers ──────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    const profile = OperativeProfileStore.get();
    const alias = profile?.callsign?.trim() || 'Operative';
    await create(alias);
  }, [create]);

  const handleExport = useCallback(async () => {
    setExportError(null);
    setExportWorking(true);
    try {
      const json = await exportIdentity(exportPassphrase || undefined);
      const alias = identity?.alias ?? 'operative';
      downloadJson(json, `ptb-keypair-${alias}.json`);
      setOverlayMode(null);
      setExportPassphrase('');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportWorking(false);
    }
  }, [exportIdentity, exportPassphrase, identity]);

  const handleImport = useCallback(async () => {
    if (!importText.trim()) return;
    setImportWorking(true);
    setImportError(null);
    try {
      await importIdentity(importText.trim(), importPassphrase || undefined);
      setOverlayMode(null);
      setImportText('');
      setImportPassphrase('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImportWorking(false);
    }
  }, [importIdentity, importText, importPassphrase]);

  const handleGenerateQr = useCallback(async () => {
    setExportError(null);
    setQrWorking(true);
    try {
      const json = await exportIdentity(exportPassphrase || undefined);
      setQrJson(json);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setQrWorking(false);
    }
  }, [exportIdentity, exportPassphrase]);

  const handleQrScan = useCallback(async (decoded: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(decoded);
      if (!parsed?.keypair?.pub) {
        setImportError('QR code not recognized as a keypair');
        return;
      }
    } catch {
      setImportError('QR code not recognized as a keypair');
      return;
    }
    setImportWorking(true);
    try {
      await importIdentity(decoded, importPassphrase || undefined);
      setOverlayMode(null);
      setImportText('');
      setImportPassphrase('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
      // Switch back to paste tab so user can see/edit the JSON
      setImportTab('paste');
      setImportText(decoded);
    } finally {
      setImportWorking(false);
    }
  }, [importIdentity, importPassphrase]);

  const handleRemove = useCallback(() => {
    if (window.confirm(
      'Remove operative keypair from this device?\n\n' +
      'Your training data will remain locally. ' +
      'Export your key first if you want to restore P2P sync on another device.'
    )) {
      logout();
    }
  }, [logout]);

  const closeOverlay = useCallback(() => {
    setOverlayMode(null);
    setExportPassphrase('');
    setExportError(null);
    setExportTab('download');
    setQrJson(null);
    setImportText('');
    setImportPassphrase('');
    setImportError(null);
    setImportTab('paste');
  }, []);

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.panel} data-testid="sovereignty-panel">

        {/* ── Section heading ── */}
        <span className={styles.heading}>Data Sovereignty</span>

        {/* ── Keypair section ── */}
        {!identity ? (
          <div className={styles.uninitializedBlock} data-testid="sovereignty-no-identity">
            <p className={styles.uninitializedTitle}>Operative keypair not initialized</p>
            <p className={styles.uninitializedDesc}>
              A cryptographic keypair is the foundation of your data sovereignty.
              No server holds it. No authority can revoke it. Your key is your identity.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleGenerate}
              disabled={loading}
              data-testid="sovereignty-generate-keypair-btn"
            >
              {loading ? 'Generating…' : '⬡ Initialize Sovereign Identity'}
            </button>
            {error && (
              <p className={styles.errorText} role="alert" data-testid="sovereignty-error">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className={styles.identityBlock} data-testid="sovereignty-identity">
            <div className={styles.identityMeta}>
              <div>
                <span className={styles.metaLabel}>Alias</span>
                <span
                  className={styles.metaValue}
                  data-testid="sovereignty-alias"
                >
                  {identity.alias}
                </span>
              </div>
              <div>
                <span className={styles.metaLabel}>Key fingerprint</span>
                <span
                  className={styles.metaFingerprint}
                  title={publicKey ?? ''}
                  data-testid="sovereignty-fingerprint"
                >
                  {publicKey ? fingerprint(publicKey) : '—'}
                </span>
              </div>
              <div>
                <span className={styles.metaLabel}>Created</span>
                <span className={styles.metaValue}>
                  {new Date(identity.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className={styles.identityActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => setOverlayMode('export')}
                data-testid="sovereignty-export-btn"
              >
                ↑ Export Key
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => setOverlayMode('import')}
                data-testid="sovereignty-import-trigger-btn"
              >
                ↓ Import Key
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemove}
                data-testid="sovereignty-remove-btn"
              >
                Remove from device
              </button>
            </div>

            {error && (
              <p className={styles.errorText} role="alert" data-testid="sovereignty-error">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Data custody section ── */}
        <div className={styles.custodyBlock} data-testid="sovereignty-data-custody">
          <span className={styles.custodyLabel}>Data Custody</span>

          {!identity ? (
            <p className={styles.custodyDesc}>
              Training data is stored locally on this device only.
            </p>
          ) : (
            <p className={styles.custodyDesc}>
              Training data syncs across devices via a P2P mesh. No server intermediary.
            </p>
          )}

          <div className={styles.syncPills}>
            {SYNC_NAMESPACES.map(({ id, label }) => {
              const entry = getSyncEntry(id);
              return (
                <div
                  key={id}
                  className={styles.syncPill}
                  data-status={entry.status}
                  data-testid={`sovereignty-sync-${id}`}
                >
                  <span className={styles.syncPillName}>{label}</span>
                  <span className={styles.syncPillStatus}>
                    {syncStatusLabel(entry.status, entry.lastSyncedAt)}
                  </span>
                  {entry.status === 'error' && entry.errorMessage && (
                    <span
                      className={styles.syncPillError}
                      title={entry.errorMessage}
                    >
                      {entry.errorMessage}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Export overlay ── */}
      {overlayMode === 'export' && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-label="Export operative keypair"
          data-testid="sovereignty-export-overlay"
        >
          <div className={styles.overlayHeader}>
            <h3 className={styles.overlayTitle}>Export Operative Keypair</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeOverlay}
              data-testid="sovereignty-overlay-close"
            >
              Cancel
            </button>
          </div>

          {/* Tab row */}
          <div className={styles.tabRow} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={exportTab === 'download'}
              className={exportTab === 'download' ? styles.tabActive : styles.tab}
              onClick={() => setExportTab('download')}
              data-testid="sovereignty-export-tab-download"
            >
              ↓ Download
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={exportTab === 'qr'}
              className={exportTab === 'qr' ? styles.tabActive : styles.tab}
              onClick={() => { setExportTab('qr'); setQrJson(null); }}
              data-testid="sovereignty-export-tab-qr"
            >
              ⬡ QR Code
            </button>
          </div>

          {/* Download tab */}
          {exportTab === 'download' && (
            <>
              <p className={styles.overlayDesc}>
                Your keypair will be exported as a JSON file. Store it somewhere safe —
                this is how you restore your identity on another device.
              </p>
              <p className={styles.overlayDesc}>
                An optional passphrase encrypts the private key inside the export.
                Leave blank to export in plaintext (only do this on trusted hardware).
              </p>

              <label className={styles.fieldLabel} htmlFor="export-passphrase">
                Passphrase (optional)
              </label>
              <input
                id="export-passphrase"
                type="password"
                className={styles.textInput}
                placeholder="Leave blank for unencrypted export"
                value={exportPassphrase}
                onChange={(e) => setExportPassphrase(e.target.value)}
                data-testid="sovereignty-passphrase-input"
              />

              {exportError && (
                <p className={styles.errorText} role="alert">
                  {exportError}
                </p>
              )}

              <div className={styles.overlayActions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleExport}
                  disabled={exportWorking}
                  data-testid="sovereignty-download-btn"
                >
                  {exportWorking ? 'Exporting…' : '↓ Download keypair.json'}
                </button>
              </div>
            </>
          )}

          {/* QR Code tab */}
          {exportTab === 'qr' && (
            <>
              <p className={styles.overlayDesc}>
                Display this QR code and scan it with your other device to transfer your keypair.
              </p>

              <label className={styles.fieldLabel} htmlFor="export-passphrase-qr">
                Passphrase (optional)
              </label>
              <input
                id="export-passphrase-qr"
                type="password"
                className={styles.textInput}
                placeholder="Leave blank for unencrypted QR"
                value={exportPassphrase}
                onChange={(e) => { setExportPassphrase(e.target.value); setQrJson(null); }}
                data-testid="sovereignty-passphrase-input-qr"
              />

              {exportError && (
                <p className={styles.errorText} role="alert">
                  {exportError}
                </p>
              )}

              {!qrJson ? (
                <div className={styles.overlayActions}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleGenerateQr}
                    disabled={qrWorking}
                    data-testid="sovereignty-generate-qr-btn"
                  >
                    {qrWorking ? 'Generating…' : '⬡ Generate QR Code'}
                  </button>
                </div>
              ) : (
                <>
                  <p className={styles.warningText}>
                    ⚠ Your private key is visible. Cover this screen when not scanning.
                  </p>
                  <div className={styles.qrWrapper}>
                    <QRCodeDisplay
                      value={qrJson}
                      size={240}
                      label="Operative keypair QR code"
                    />
                  </div>
                  <div className={styles.overlayActions}>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => setQrJson(null)}
                      data-testid="sovereignty-regenerate-qr-btn"
                    >
                      ↺ Regenerate
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Import overlay ── */}
      {overlayMode === 'import' && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-label="Import operative keypair"
          data-testid="sovereignty-import-overlay"
        >
          <div className={styles.overlayHeader}>
            <h3 className={styles.overlayTitle}>Import Operative Keypair</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeOverlay}
              data-testid="sovereignty-overlay-close"
            >
              Cancel
            </button>
          </div>

          {identity && (
            <p className={styles.warningText}>
              ⚠ This will replace your current identity on this device.
              Export your existing key first if you want to keep it.
            </p>
          )}

          {/* Tab row */}
          <div className={styles.tabRow} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={importTab === 'paste'}
              className={importTab === 'paste' ? styles.tabActive : styles.tab}
              onClick={() => setImportTab('paste')}
              data-testid="sovereignty-import-tab-paste"
            >
              ✎ Paste JSON
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={importTab === 'scan'}
              className={importTab === 'scan' ? styles.tabActive : styles.tab}
              onClick={() => setImportTab('scan')}
              data-testid="sovereignty-import-tab-scan"
            >
              ◎ Scan QR
            </button>
          </div>

          {importError && (
            <p className={styles.errorText} role="alert" data-testid="sovereignty-import-error">
              {importError}
            </p>
          )}

          {/* Paste tab */}
          {importTab === 'paste' && (
            <>
              <p className={styles.overlayDesc}>
                Paste the contents of your exported keypair JSON file below.
              </p>

              <label className={styles.fieldLabel} htmlFor="import-text">
                Keypair JSON
              </label>
              <textarea
                id="import-text"
                className={styles.textarea}
                placeholder='{"keypair":{"pub":"..."},"alias":"..."}'
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                data-testid="sovereignty-import-text"
              />

              <label className={styles.fieldLabel} htmlFor="import-passphrase">
                Passphrase (if encrypted)
              </label>
              <input
                id="import-passphrase"
                type="password"
                className={styles.textInput}
                placeholder="Leave blank if export was unencrypted"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                data-testid="sovereignty-import-passphrase"
              />

              <div className={styles.overlayActions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleImport}
                  disabled={importWorking || !importText.trim()}
                  data-testid="sovereignty-confirm-import-btn"
                >
                  {importWorking ? 'Importing…' : '⬡ Import Identity'}
                </button>
              </div>
            </>
          )}

          {/* Scan QR tab */}
          {importTab === 'scan' && (
            <div className={styles.scanBlock}>
              <p className={styles.overlayDesc}>
                Point your camera at a keypair QR code generated by another device.
              </p>
              <QRCodeScanner
                onScan={handleQrScan}
                onError={(msg) => setImportError(msg)}
              />
              {importWorking && (
                <p className={styles.scanStatus} data-testid="sovereignty-scan-working">
                  Importing…
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SovereigntyPanel;
