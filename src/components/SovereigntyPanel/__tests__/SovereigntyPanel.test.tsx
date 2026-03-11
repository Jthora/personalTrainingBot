import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SovereigntyPanel from '../SovereigntyPanel';
import type { GunIdentity } from '../../../services/gunIdentity';
import type { SyncEntry } from '../../../services/syncStatusStore';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCreate         = vi.hoisted(() => vi.fn());
const mockExportIdentity = vi.hoisted(() => vi.fn().mockResolvedValue('{"keypair":{}}'));
const mockImportIdentity = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockLogout         = vi.hoisted(() => vi.fn());
const mockUpdateAlias    = vi.hoisted(() => vi.fn());

const mockIdentityState = vi.hoisted(() => ({
  identity: null as GunIdentity | null,
  loading: false,
  error: null as string | null,
  publicKey: null as string | null,
  hasStoredIdentity: false,
}));

vi.mock('../../../hooks/useGunIdentity', () => ({
  useGunIdentity: () => ({
    ...mockIdentityState,
    create: mockCreate,
    exportIdentity: mockExportIdentity,
    importIdentity: mockImportIdentity,
    logout: mockLogout,
    updateAlias: mockUpdateAlias,
  }),
}));

const mockGetSyncEntry = vi.hoisted(() =>
  vi.fn((_ns: string): SyncEntry => ({
    status: 'idle',
    lastSyncedAt: null,
    errorMessage: null,
  })),
);

vi.mock('../../../hooks/useSyncStatus', () => ({
  useSyncStatus: () => ({
    state: {},
    get: mockGetSyncEntry,
    active: [],
  }),
}));

const { mockProfileStore } = vi.hoisted(() => ({
  mockProfileStore: {
    get: vi.fn(() => ({ callsign: 'Ghost', archetypeId: 'guardian', handlerId: 'h1', enrolledAt: '' })),
    subscribe: vi.fn(() => vi.fn()),
    getVersion: vi.fn(() => 0),
    patch: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('../../../store/OperativeProfileStore', () => ({
  default: mockProfileStore,
}));

// QRCodeDisplay stub — renders a predictable div showing the encoded value
vi.mock('../../QRCodeDisplay/QRCodeDisplay', () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="qr-code-display-mock" data-value={value} />
  ),
}));

// QRCodeScanner stub — exposes the onScan + onError callbacks via data attrs
// so tests can fire them directly
const capturedScanProps = vi.hoisted(() => ({
  onScan: null as ((v: string) => void) | null,
  onError: undefined as ((msg: string) => void) | null | undefined,
}));

vi.mock('../../QRCodeScanner/QRCodeScanner', () => ({
  default: ({ onScan, onError }: { onScan: (v: string) => void; onError?: (msg: string) => void }) => {
    capturedScanProps.onScan = onScan;
    capturedScanProps.onError = onError;
    return <div data-testid="qr-code-scanner-mock" />;
  },
}));

const mockRestartStoreSyncs = vi.hoisted(() => vi.fn());
vi.mock('../../../services/gunStoreSyncs', () => ({
  restartStoreSyncs: mockRestartStoreSyncs,
}));

const mockTrackEvent = vi.hoisted(() => vi.fn());
vi.mock('../../../utils/telemetry', () => ({
  trackEvent: mockTrackEvent,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_IDENTITY: GunIdentity = {
  alias: 'Ghost',
  keypair: {
    pub:   'AAAAAAAA1234567890BBBBBBBB',
    priv:  'priv-key',
    epub:  'epub-key',
    epriv: 'epriv-key',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockIdentityState.identity = null;
  mockIdentityState.loading = false;
  mockIdentityState.error = null;
  mockIdentityState.publicKey = null;
  mockIdentityState.hasStoredIdentity = false;
  mockGetSyncEntry.mockImplementation((_ns: string): SyncEntry => ({
    status: 'idle',
    lastSyncedAt: null,
    errorMessage: null,
  }));
});

describe('SovereigntyPanel', () => {
  describe('uninitialized state (no identity)', () => {
    it('renders the sovereignty panel root', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-panel')).toBeTruthy();
    });

    it('shows the uninitialized block', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-no-identity')).toBeTruthy();
    });

    it('does not show the initialized identity block', () => {
      render(<SovereigntyPanel />);
      expect(screen.queryByTestId('sovereignty-identity')).toBeNull();
    });

    it('renders the generate keypair button', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-generate-keypair-btn')).toBeTruthy();
    });

    it('calls create() with the profile callsign on generate', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-generate-keypair-btn'));
      expect(mockCreate).toHaveBeenCalledWith('Ghost');
    });

    it('falls back to "Operative" when no callsign in profile', () => {
      mockProfileStore.get.mockReturnValueOnce({ callsign: '', archetypeId: 'guardian', handlerId: 'h1', enrolledAt: '' });
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-generate-keypair-btn'));
      expect(mockCreate).toHaveBeenCalledWith('Operative');
    });

    it('shows loading state on the button while creating', () => {
      mockIdentityState.loading = true;
      render(<SovereigntyPanel />);
      const btn = screen.getByTestId('sovereignty-generate-keypair-btn') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(btn.textContent).toContain('Generating');
    });

    it('renders error message when identity error present', () => {
      mockIdentityState.error = 'SEA not available';
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-error')).toBeTruthy();
      expect(screen.getByText('SEA not available')).toBeTruthy();
    });

    it('shows data custody section with local-only message', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-data-custody')).toBeTruthy();
      expect(screen.getByText(/stored locally on this device/i)).toBeTruthy();
    });
  });

  describe('initialized state (identity present)', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
      mockIdentityState.hasStoredIdentity = true;
    });

    it('shows the identity block', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-identity')).toBeTruthy();
    });

    it('does not show the uninitialized block', () => {
      render(<SovereigntyPanel />);
      expect(screen.queryByTestId('sovereignty-no-identity')).toBeNull();
    });

    it('displays the alias', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-alias').textContent).toBe('Ghost');
    });

    it('displays a truncated key fingerprint', () => {
      render(<SovereigntyPanel />);
      const fp = screen.getByTestId('sovereignty-fingerprint').textContent;
      expect(fp).toContain('AAAAAAAA');
      expect(fp).toContain('BBBBBBBB');
    });

    it('renders export and import trigger buttons', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-export-btn')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-import-trigger-btn')).toBeTruthy();
    });

    it('renders remove button', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-remove-btn')).toBeTruthy();
    });

    it('shows P2P mesh custody message', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByText(/P2P mesh/i)).toBeTruthy();
    });

    it('opens export overlay when export button clicked', () => {
      render(<SovereigntyPanel />);
      expect(screen.queryByTestId('sovereignty-export-overlay')).toBeNull();
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      expect(screen.getByTestId('sovereignty-export-overlay')).toBeTruthy();
    });

    it('opens import overlay when import trigger button clicked', () => {
      render(<SovereigntyPanel />);
      expect(screen.queryByTestId('sovereignty-import-overlay')).toBeNull();
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      expect(screen.getByTestId('sovereignty-import-overlay')).toBeTruthy();
    });

    it('closes overlay when cancel button clicked', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      expect(screen.getByTestId('sovereignty-export-overlay')).toBeTruthy();
      fireEvent.click(screen.getByTestId('sovereignty-overlay-close'));
      expect(screen.queryByTestId('sovereignty-export-overlay')).toBeNull();
    });

    it('calls logout and closes when remove confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-remove-btn'));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('does not call logout when remove cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-remove-btn'));
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('import overlay', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
    });

    it('confirm import button disabled when text is empty', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      const btn = screen.getByTestId('sovereignty-confirm-import-btn') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('confirm import button enabled when text is pasted', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      const textarea = screen.getByTestId('sovereignty-import-text');
      fireEvent.change(textarea, { target: { value: '{"keypair":{}}' } });
      const btn = screen.getByTestId('sovereignty-confirm-import-btn') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('calls importIdentity with the pasted text', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.change(screen.getByTestId('sovereignty-import-text'), {
        target: { value: '{"keypair":{"pub":"x"}}' },
      });
      fireEvent.click(screen.getByTestId('sovereignty-confirm-import-btn'));
      expect(mockImportIdentity).toHaveBeenCalledWith(
        '{"keypair":{"pub":"x"}}',
        undefined,
      );
    });

    it('keeps import overlay open and shows error when importIdentity rejects', async () => {
      mockImportIdentity.mockRejectedValueOnce(new Error('Bad passphrase'));
      const { act } = await import('@testing-library/react');

      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.change(screen.getByTestId('sovereignty-import-text'), {
        target: { value: '{"keypair":{"pub":"x"}}' },
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-confirm-import-btn'));
      });

      // Overlay must remain open
      expect(screen.getByTestId('sovereignty-import-overlay')).toBeTruthy();
      // Error message must appear
      expect(screen.getByTestId('sovereignty-import-error').textContent).toBe('Bad passphrase');
    });

    it('passes passphrase to importIdentity when provided', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.change(screen.getByTestId('sovereignty-import-text'), {
        target: { value: '{"keypair":{"pub":"x"}}' },
      });
      fireEvent.change(screen.getByTestId('sovereignty-import-passphrase'), {
        target: { value: 'secret' },
      });
      fireEvent.click(screen.getByTestId('sovereignty-confirm-import-btn'));
      expect(mockImportIdentity).toHaveBeenCalledWith(
        '{"keypair":{"pub":"x"}}',
        'secret',
      );
    });
  });

  describe('sync status pills', () => {
    it('renders pills for all three store namespaces', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByTestId('sovereignty-sync-progress')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-sync-drillRun')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-sync-aar')).toBeTruthy();
    });

    it('shows correct human-readable labels', () => {
      render(<SovereigntyPanel />);
      expect(screen.getByText('Progress')).toBeTruthy();
      expect(screen.getByText('Drill History')).toBeTruthy();
      expect(screen.getByText('After Action Reports')).toBeTruthy();
    });

    it('pill data-status attribute reflects sync entry status', () => {
      mockGetSyncEntry.mockImplementation((ns: string): SyncEntry => {
        if (ns === 'progress') return { status: 'synced', lastSyncedAt: Date.now(), errorMessage: null };
        return { status: 'idle', lastSyncedAt: null, errorMessage: null };
      });
      render(<SovereigntyPanel />);
      const progressPill = screen.getByTestId('sovereignty-sync-progress');
      expect(progressPill.getAttribute('data-status')).toBe('synced');

      const drillPill = screen.getByTestId('sovereignty-sync-drillRun');
      expect(drillPill.getAttribute('data-status')).toBe('idle');
    });

    it('shows error status when sync has errored', () => {
      mockGetSyncEntry.mockImplementation((ns: string): SyncEntry => {
        if (ns === 'aar') return { status: 'error', lastSyncedAt: null, errorMessage: 'Push failed' };
        return { status: 'idle', lastSyncedAt: null, errorMessage: null };
      });
      render(<SovereigntyPanel />);
      const aarPill = screen.getByTestId('sovereignty-sync-aar');
      expect(aarPill.getAttribute('data-status')).toBe('error');
    });
  });

  describe('export QR tab', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
    });

    it('shows Download and QR Code tabs in the export overlay', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      expect(screen.getByTestId('sovereignty-export-tab-download')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-export-tab-qr')).toBeTruthy();
    });

    it('download tab is selected by default and shows download button', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      const tab = screen.getByTestId('sovereignty-export-tab-download');
      expect(tab.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByTestId('sovereignty-download-btn')).toBeTruthy();
    });

    it('switching to QR tab shows the generate QR button', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));
      expect(screen.getByTestId('sovereignty-generate-qr-btn')).toBeTruthy();
      expect(screen.queryByTestId('sovereignty-download-btn')).toBeNull();
    });

    it('clicking generate QR calls exportIdentity and shows QRCodeDisplay', async () => {
      mockExportIdentity.mockResolvedValueOnce('{"keypair":{"pub":"abc"}}');
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-display-mock')).toBeTruthy();
      });
      expect(screen.getByTestId('qr-code-display-mock').getAttribute('data-value')).toBe('{"keypair":{"pub":"abc"}}');
    });

    it('regenerate button clears the QR and shows generate button again', async () => {
      mockExportIdentity.mockResolvedValueOnce('{"keypair":{"pub":"abc"}}');
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-display-mock')).toBeTruthy();
      });
      fireEvent.click(screen.getByTestId('sovereignty-regenerate-qr-btn'));
      expect(screen.queryByTestId('qr-code-display-mock')).toBeNull();
      expect(screen.getByTestId('sovereignty-generate-qr-btn')).toBeTruthy();
    });

    it('shows error when exportIdentity rejects in QR tab', async () => {
      mockExportIdentity.mockRejectedValueOnce(new Error('SEA error'));
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      expect(screen.queryByTestId('qr-code-display-mock')).toBeNull();
    });

    it('closing and reopening export overlay resets to download tab', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));
      fireEvent.click(screen.getByTestId('sovereignty-overlay-close'));
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      expect(screen.getByTestId('sovereignty-export-tab-download').getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('import scan tab', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
      capturedScanProps.onScan = null;
      capturedScanProps.onError = undefined;
    });

    it('shows Paste JSON and Scan QR tabs in the import overlay', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      expect(screen.getByTestId('sovereignty-import-tab-paste')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-import-tab-scan')).toBeTruthy();
    });

    it('paste tab is selected by default and shows the textarea', () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      expect(screen.getByTestId('sovereignty-import-tab-paste').getAttribute('aria-selected')).toBe('true');
      expect(screen.getByTestId('sovereignty-import-text')).toBeTruthy();
    });

    it('switching to scan tab shows the QRCodeScanner and passphrase input', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => {
        expect(screen.getByTestId('qr-code-scanner-mock')).toBeTruthy();
      });
      expect(screen.getByTestId('sovereignty-scan-passphrase')).toBeTruthy();
      expect(screen.queryByTestId('sovereignty-import-text')).toBeNull();
    });

    it('successful QR scan of plain envelope calls importIdentity and closes overlay', async () => {
      mockImportIdentity.mockResolvedValueOnce(undefined);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      const envelope = '{"encrypted":false,"data":{"keypair":{"pub":"abc"},"alias":"Ops","createdAt":""}}';
      await act(async () => {
        capturedScanProps.onScan?.(envelope);
      });

      expect(mockImportIdentity).toHaveBeenCalledWith(envelope, undefined);
      expect(mockRestartStoreSyncs).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('sovereignty-import-overlay')).toBeNull();
    });

    it('successful QR scan of encrypted envelope calls importIdentity', async () => {
      mockImportIdentity.mockResolvedValueOnce(undefined);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      const envelope = '{"encrypted":true,"data":"SEA{...}"}';
      await act(async () => {
        capturedScanProps.onScan?.(envelope);
      });

      expect(mockImportIdentity).toHaveBeenCalledWith(envelope, undefined);
    });

    it('QR scan with invalid JSON shows error and keeps overlay open', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      await act(async () => {
        capturedScanProps.onScan?.('not-valid-json');
      });

      expect(screen.getByTestId('sovereignty-import-overlay')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-import-error').textContent).toBe(
        'QR code not recognized as a keypair export',
      );
      expect(mockImportIdentity).not.toHaveBeenCalled();
    });

    it('QR scan of valid JSON without envelope structure shows error', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      await act(async () => {
        capturedScanProps.onScan?.('{"alias":"Ghost"}');
      });

      expect(screen.getByTestId('sovereignty-import-error').textContent).toBe(
        'QR code not recognized as a keypair export',
      );
    });

    it('QR scan success followed by failed import switches to paste tab with JSON', async () => {
      mockImportIdentity.mockRejectedValueOnce(new Error('Wrong passphrase'));
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      const envelope = '{"encrypted":false,"data":{"keypair":{"pub":"abc"}}}';
      await act(async () => {
        capturedScanProps.onScan?.(envelope);
      });

      // Overlay stays open, paste tab shown with JSON pre-filled
      expect(screen.getByTestId('sovereignty-import-overlay')).toBeTruthy();
      expect(screen.getByTestId('sovereignty-import-tab-paste').getAttribute('aria-selected')).toBe('true');
      expect((screen.getByTestId('sovereignty-import-text') as HTMLTextAreaElement).value).toBe(envelope);
      expect(screen.getByTestId('sovereignty-import-error').textContent).toBe('Wrong passphrase');
    });

    it('QRCodeScanner onError propagates to importError', async () => {
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onError).toBeDefined());

      await act(async () => {
        capturedScanProps.onError?.('Camera access denied');
      });

      await waitFor(() => {
        expect(screen.getByTestId('sovereignty-import-error').textContent).toBe('Camera access denied');
      });
    });

    it('scan tab passphrase is passed to importIdentity on QR scan', async () => {
      mockImportIdentity.mockResolvedValueOnce(undefined);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      fireEvent.change(screen.getByTestId('sovereignty-scan-passphrase'), {
        target: { value: 'my-secret' },
      });

      const envelope = '{"encrypted":true,"data":"SEA{cipher}"}';
      await act(async () => {
        // Re-capture after state update
        capturedScanProps.onScan?.(envelope);
      });

      expect(mockImportIdentity).toHaveBeenCalledWith(envelope, 'my-secret');
    });
  });

  describe('QR size preflight', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
    });

    it('shows error when exported JSON exceeds QR byte limit', async () => {
      // Generate a string larger than 1273 bytes
      const oversized = JSON.stringify({ encrypted: true, data: 'x'.repeat(1400) });
      mockExportIdentity.mockResolvedValueOnce(oversized);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      // QR code display should NOT be shown
      expect(screen.queryByTestId('qr-code-display-mock')).toBeNull();
      // Error text should mention the byte limit
      expect(screen.getByRole('alert').textContent).toMatch(/exceeds QR capacity/);
    });

    it('generates QR code when exported JSON is within limit', async () => {
      const small = JSON.stringify({ encrypted: false, data: { keypair: { pub: 'abc' } } });
      mockExportIdentity.mockResolvedValueOnce(small);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-display-mock')).toBeTruthy();
      });
    });
  });

  describe('sync restart after import', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
    });

    it('restarts store syncs after successful paste import', async () => {
      mockImportIdentity.mockResolvedValueOnce(undefined);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.change(screen.getByTestId('sovereignty-import-text'), {
        target: { value: '{"encrypted":false,"data":{"keypair":{"pub":"x"}}}' },
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-confirm-import-btn'));
      });

      expect(mockRestartStoreSyncs).toHaveBeenCalledTimes(1);
    });

    it('does not restart syncs when paste import fails', async () => {
      mockImportIdentity.mockRejectedValueOnce(new Error('fail'));
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.change(screen.getByTestId('sovereignty-import-text'), {
        target: { value: '{"keypair":{"pub":"x"}}' },
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-confirm-import-btn'));
      });

      expect(mockRestartStoreSyncs).not.toHaveBeenCalled();
    });
  });

  describe('telemetry', () => {
    beforeEach(() => {
      mockIdentityState.identity = MOCK_IDENTITY;
      mockIdentityState.publicKey = MOCK_IDENTITY.keypair.pub;
    });

    it('fires gun_qr_export_generate on successful QR generation', async () => {
      const small = JSON.stringify({ encrypted: false, data: { keypair: { pub: 'abc' } } });
      mockExportIdentity.mockResolvedValueOnce(small);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-export-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-export-tab-qr'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('sovereignty-generate-qr-btn'));
      });

      expect(mockTrackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'p2p', action: 'gun_qr_export_generate' }),
      );
    });

    it('fires gun_qr_scan_import on successful QR scan import', async () => {
      mockImportIdentity.mockResolvedValueOnce(undefined);
      render(<SovereigntyPanel />);
      fireEvent.click(screen.getByTestId('sovereignty-import-trigger-btn'));
      fireEvent.click(screen.getByTestId('sovereignty-import-tab-scan'));
      await waitFor(() => expect(capturedScanProps.onScan).not.toBeNull());

      await act(async () => {
        capturedScanProps.onScan?.('{"encrypted":false,"data":{"keypair":{"pub":"abc"}}}');
      });

      expect(mockTrackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'p2p', action: 'gun_qr_scan_import' }),
      );
    });
  });
});
