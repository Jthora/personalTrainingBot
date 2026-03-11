import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadManifest, loadShard, _resetShardLoader } from '../shardLoader';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockIsFeatureEnabled = vi.hoisted(() => vi.fn(() => false));
vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: mockIsFeatureEnabled,
}));

const mockFetchFromIpfs = vi.hoisted(() => vi.fn());
vi.mock('../../services/ipfsFetcher', () => ({
  fetchFromIpfs: mockFetchFromIpfs,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_SHARD = {
  module: { id: 'fitness', title: 'Fitness' },
  subModules: { fitness_calisthenics: { id: 'fitness_calisthenics' } },
  cardDecks: {},
};

const MOCK_MANIFEST = {
  generatedAt: '2026-01-01T00:00:00Z',
  version: '1.0.0',
  modules: [
    {
      id: 'fitness',
      shard: '/training_modules_shards/fitness.json',
      hash: 'abc123',
      size: 1234,
    },
    {
      id: 'combat',
      shard: '/training_modules_shards/combat.json',
      ipfsCid: 'QmCombatCID',
      hash: 'def456',
      size: 5678,
    },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('shardLoader', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    _resetShardLoader();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    mockIsFeatureEnabled.mockReset().mockReturnValue(false);
    mockFetchFromIpfs.mockReset();
  });

  describe('loadManifest', () => {
    it('fetches and returns the manifest', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
      );

      const manifest = await loadManifest();
      expect(manifest.modules).toHaveLength(2);
      expect(manifest.modules[0].id).toBe('fitness');
    });

    it('caches the manifest so fetch is only called once', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
      );

      await loadManifest();
      await loadManifest();
      // fetch should only have been called once (manifest URL)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('throws if manifest fetch fails', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));
      await expect(loadManifest()).rejects.toThrow(/404/);
    });
  });

  describe('loadShard', () => {
    it('fetches a shard via HTTP when no CID', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_SHARD), { status: 200 }),
        );

      const shard = await loadShard('fitness');
      expect((shard.module as any).id).toBe('fitness');
      // should have called the shard URL (not IPFS)
      expect(fetchSpy).toHaveBeenCalledWith('/training_modules_shards/fitness.json');
    });

    it('throws if module id is not in manifest', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
      );

      await expect(loadShard('nonexistent')).rejects.toThrow(/Shard not found/i);
    });

    it('caches shard so fetch is not repeated for same version', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_SHARD), { status: 200 }),
        );

      await loadShard('fitness');
      await loadShard('fitness');
      // manifest fetch + shard fetch = 2 total (shard not re-fetched)
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('uses fetchFromIpfs when ipfsContent flag is on and entry has ipfsCid', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      mockFetchFromIpfs.mockResolvedValueOnce(
        new Response(JSON.stringify(MOCK_SHARD), { status: 200 }),
      );
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
      );

      const shard = await loadShard('combat');
      expect(mockFetchFromIpfs).toHaveBeenCalledWith(
        'QmCombatCID',
        '/training_modules_shards/combat.json',
      );
      expect(shard).toBeTruthy();
    });

    it('uses plain fetch when ipfsContent flag is on but entry has no ipfsCid', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_MANIFEST), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(MOCK_SHARD), { status: 200 }),
        );

      await loadShard('fitness');
      expect(mockFetchFromIpfs).not.toHaveBeenCalled();
    });
  });
});
