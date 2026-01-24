import type { TrainingModuleFile, TrainingSubModuleFile, CardDeckFile } from "../types/TrainingDataFiles";

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
const loadShard = async (id: string): Promise<Shard> => {
    const manifest = await loadManifest();
    const entry = manifest.modules.find((m) => m.id === id);
    if (!entry) throw new Error('Shard not found for module ' + id);
    const cacheKey = versionedCacheKey(entry);
    if (!shardCache.has(cacheKey)) {
        shardCache.set(cacheKey, fetch(entry.shard).then(async (res) => {
            if (!res.ok) throw new Error('Failed to load shard ' + id + ': ' + res.status);
            return res.json();
        }));
    }
    return shardCache.get(cacheKey)!;
};

export const modulePaths = {
    agencies: async () => (await loadShard("agencies")).module,
    combat: async () => (await loadShard("combat")).module,
    counter_biochem: async () => (await loadShard("counter_biochem")).module,
    counter_psyops: async () => (await loadShard("counter_psyops")).module,
    cybersecurity: async () => (await loadShard("cybersecurity")).module,
    dance: async () => (await loadShard("dance")).module,
    equations: async () => (await loadShard("equations")).module,
    espionage: async () => (await loadShard("espionage")).module,
    fitness: async () => (await loadShard("fitness")).module,
    intelligence: async () => (await loadShard("intelligence")).module,
    investigation: async () => (await loadShard("investigation")).module,
    martial_arts: async () => (await loadShard("martial_arts")).module,
    psiops: async () => (await loadShard("psiops")).module,
    war_strategy: async () => (await loadShard("war_strategy")).module,
    web_three: async () => (await loadShard("web_three")).module,
    self_sovereignty: async () => (await loadShard("self_sovereignty")).module,
    anti_psn: async () => (await loadShard("anti_psn")).module,
    anti_tcs_idc_cbc: async () => (await loadShard("anti_tcs_idc_cbc")).module,
    space_force: async () => (await loadShard("space_force")).module
} satisfies Record<string, () => Promise<TrainingModuleFile>>;
