import type { CardDeckFile } from "../../types/TrainingDataFiles";
import { loadShard } from '../shardLoader';
export { loadShard };

export type CardDeckPathLoader = () => Promise<CardDeckFile>;
export type CardDeckPathMap = Record<string, CardDeckPathLoader>;

export const createShardLoaders = (shardId: string, ids: readonly string[]): CardDeckPathMap =>
    Object.fromEntries(
        ids.map((id) => [id, async () => (await loadShard(shardId)).cardDecks[id]])
    );
