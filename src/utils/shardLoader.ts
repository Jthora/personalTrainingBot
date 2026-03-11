/**
 * Shared Shard Loader — Single source of truth for training module fetching.
 *
 * Consolidates the manifest loading and shard caching logic previously
 * duplicated across modulePaths.ts, subModulePaths.ts, and cardDeckPaths/common.ts.
 *
 * When the `ipfsContent` feature flag is enabled and a manifest entry
 * includes an `ipfsCid`, the shard is fetched via IPFS gateways with an
 * automatic fallback to the standard HTTP URL.
 */
import type {
  CardDeckFile,
  TrainingModuleFile,
  TrainingSubModuleFile,
} from '../types/TrainingDataFiles';
import { fetchFromIpfs } from '../services/ipfsFetcher';
import { isFeatureEnabled } from '../config/featureFlags';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ManifestEntry = {
  id: string;
  shard: string;
  /** Optional IPFS Content Identifier for decentralised retrieval. */
  ipfsCid?: string;
  hash?: string;
  size?: number;
  version?: string;
  subModuleCount?: number;
  cardDeckCount?: number;
};

export type Manifest = {
  generatedAt?: string;
  version?: string;
  modules: ManifestEntry[];
};

export type Shard = {
  module: TrainingModuleFile;
  subModules: Record<string, TrainingSubModuleFile>;
  cardDecks: Record<string, CardDeckFile>;
};

// ─── Manifest ─────────────────────────────────────────────────────────────────

const MANIFEST_URL = '/training_modules_manifest.json';

let manifestPromise: Promise<Manifest> | null = null;

/** Load the training modules manifest. Cached after the first call. */
export const loadManifest = async (): Promise<Manifest> => {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL).then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
      return res.json() as Promise<Manifest>;
    });
  }
  return manifestPromise;
};

// ─── Shard ────────────────────────────────────────────────────────────────────

const versionedCacheKey = (entry: ManifestEntry): string =>
  `${entry.id}@${entry.hash ?? entry.version ?? entry.size ?? 'v0'}`;

const shardCache = new Map<string, Promise<Shard>>();

/**
 * Load a training data shard by module id.
 * Uses the IPFS gateway when `ipfsContent` is enabled and a CID exists,
 * otherwise falls back to the standard HTTP shard URL.
 * Results are cached per shard version so each unique shard is only
 * fetched once per page lifecycle.
 */
export const loadShard = async (id: string): Promise<Shard> => {
  const manifest = await loadManifest();
  const entry = manifest.modules.find((m) => m.id === id);
  if (!entry) throw new Error(`Shard not found for module: ${id}`);

  const cacheKey = versionedCacheKey(entry);
  if (!shardCache.has(cacheKey)) {
    const fetchShard: Promise<Shard> =
      isFeatureEnabled('ipfsContent') && entry.ipfsCid
        ? fetchFromIpfs(entry.ipfsCid, entry.shard).then((res) => res.json())
        : fetch(entry.shard).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to load shard ${id}: ${res.status}`);
            }
            return res.json() as Promise<Shard>;
          });

    shardCache.set(cacheKey, fetchShard);
  }

  return shardCache.get(cacheKey)!;
};

/** Reset all caches — intended for use in tests only. */
export const _resetShardLoader = (): void => {
  manifestPromise = null;
  shardCache.clear();
};
