import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      mockProfileStore.get.mockReturnValueOnce(null);
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
});
