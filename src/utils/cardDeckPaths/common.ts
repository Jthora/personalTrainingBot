import type { CardDeckFile, TrainingModuleFile, TrainingSubModuleFile } from "../../types/TrainingDataFiles";

const manifestUrl = "/training_modules_manifest.json";

type ManifestEntry = { id: string; shard: string; hash?: string; size?: number; version?: string };
type Manifest = { generatedAt?: string; version?: string; modules: ManifestEntry[] };
type Shard = { module: TrainingModuleFile; subModules: Record<string, TrainingSubModuleFile>; cardDecks: Record<string, CardDeckFile> };

let manifestPromise: Promise<Manifest> | null = null;
const loadManifest = async (): Promise<Manifest> => {
    if (!manifestPromise) {
        manifestPromise = fetch(manifestUrl).then(async (res) => {
            if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
            return res.json();
        });
    }
    return manifestPromise;
};

const versionedCacheKey = (entry: ManifestEntry) => `${entry.id}@${entry.hash ?? entry.version ?? entry.size ?? "v0"}`;
const shardCache = new Map<string, Promise<Shard>>();
export const loadShard = async (id: string): Promise<Shard> => {
    const manifest = await loadManifest();
    const entry = manifest.modules.find((m) => m.id === id);
    if (!entry) throw new Error("Shard not found for module " + id);
    const cacheKey = versionedCacheKey(entry);
    if (!shardCache.has(cacheKey)) {
        shardCache.set(cacheKey, fetch(entry.shard).then(async (res) => {
            if (!res.ok) throw new Error("Failed to load shard " + id + ": " + res.status);
            return res.json();
        }));
    }
    return shardCache.get(cacheKey)!;
};

export type CardDeckPathLoader = () => Promise<CardDeckFile>;
export type CardDeckPathMap = Record<string, CardDeckPathLoader>;

export const createShardLoaders = (shardId: string, ids: readonly string[]): CardDeckPathMap =>
    Object.fromEntries(
        ids.map((id) => [id, async () => (await loadShard(shardId)).cardDecks[id]])
    );
