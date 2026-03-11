import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchFromIpfs,
  fetchWithTimeout,
  raceGateways,
  IPFS_GATEWAYS,
} from '../ipfsFetcher';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockIsFeatureEnabled = vi.hoisted(() => vi.fn(() => false));
vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: mockIsFeatureEnabled,
}));

const mockTrackEvent = vi.hoisted(() => vi.fn());
vi.mock('../../utils/telemetry', () => ({
  trackEvent: mockTrackEvent,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeOkResponse = (body: string = 'ok') =>
  new Response(body, { status: 200 });

const makeErrorResponse = (status: number) =>
  new Response('error', { status });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ipfsFetcher', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    mockIsFeatureEnabled.mockReset();
    mockTrackEvent.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWithTimeout', () => {
    it('resolves with the response on success', async () => {
      fetchSpy.mockResolvedValueOnce(makeOkResponse());
      const res = await fetchWithTimeout('https://example.com/test', 5000, 'test');
      expect(res.ok).toBe(true);
    });

    it('throws when response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce(makeErrorResponse(404));
      await expect(
        fetchWithTimeout('https://example.com/404', 5000, 'test'),
      ).rejects.toThrow('404');
    });
  });

  describe('raceGateways', () => {
    it('resolves with the first successful gateway', async () => {
      // First gateway succeeds, others may hang
      fetchSpy.mockImplementation((url: string | URL) => {
        if ((url as string).includes(IPFS_GATEWAYS[0])) {
          return Promise.resolve(makeOkResponse('data'));
        }
        // Others never resolve in this test
        return new Promise(() => {});
      });

      const res = await raceGateways('QmTestCID');
      expect(res.ok).toBe(true);
    });

    it('rejects when all gateways fail', async () => {
      fetchSpy.mockResolvedValue(makeErrorResponse(503));

      await expect(raceGateways('QmBadCID')).rejects.toThrow(/gateways failed/i);
    });
  });

  describe('fetchFromIpfs', () => {
    it('bypasses IPFS and uses fallback URL when flag is off', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      fetchSpy.mockResolvedValueOnce(makeOkResponse('fallback'));

      const res = await fetchFromIpfs('QmTestCID', 'https://example.com/shard.json');
      expect(res.ok).toBe(true);
      // Should have called the fallback URL directly
      expect(fetchSpy).toHaveBeenCalledWith('https://example.com/shard.json');
    });

    it('tries IPFS gateways when flag is on', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      fetchSpy.mockImplementation((url: string | URL) => {
        if ((url as string).includes(IPFS_GATEWAYS[0])) {
          return Promise.resolve(makeOkResponse('ipfs-data'));
        }
        return new Promise(() => {});
      });

      const res = await fetchFromIpfs('QmTestCID', 'https://example.com/shard.json');
      expect(res.ok).toBe(true);
      expect(mockTrackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'p2p', action: 'ipfs_fetch_success' }),
      );
    });

    it('falls back to HTTP when all IPFS gateways fail', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      fetchSpy.mockImplementation((url: string | URL) => {
        const urlStr = url as string;
        if (urlStr.includes('example.com')) {
          return Promise.resolve(makeOkResponse('fallback'));
        }
        // All IPFS gateways fail
        return Promise.resolve(makeErrorResponse(503));
      });

      const res = await fetchFromIpfs('QmBadCID', 'https://example.com/shard.json');
      expect(res.ok).toBe(true);
      expect(mockTrackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'p2p', action: 'ipfs_fetch_fallback' }),
      );
    });
  });
});
