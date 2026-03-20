# Build Script: computeSemanticLinks.ts

> Reads all shards. Computes TF-IDF. Writes `relatedCards` arrays into shards in-place.

---

## Interface

```bash
# Compute and write
npx tsx scripts/computeSemanticLinks.ts

# Dry run — print stats, write nothing
npx tsx scripts/computeSemanticLinks.ts --dry-run

# Single module (for testing)
npx tsx scripts/computeSemanticLinks.ts --module=counter_psyops
```

---

## Full Implementation Plan

```typescript
// scripts/computeSemanticLinks.ts

import fs from 'node:fs';
import path from 'node:path';
import { STOPWORDS } from './lib/stopwords.ts';

// ─── Config ───────────────────────────────────────────────────────────────────

const TOP_K = 5;
const NOISE_FLOOR = 0.05;
const MIN_TOKENS = 5;
const CROSS_MODULE_BIAS = 1.1;
const SHARDS_DIR = 'public/training_modules_shards';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Card { id: string; term: string; definition?: string; bulletPoints?: string[]; exercises?: string[]; relatedCards?: string[]; }
interface Deck { deckId: string; cards: Card[]; }
interface ModuleShard { moduleId: string; decks: Deck[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cardText(card: Card): string {
  return [card.term, card.definition ?? '', ...(card.bulletPoints ?? []), ...(card.exercises ?? [])].join(' ');
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));
}

function buildTF(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  const total = tokens.length;
  for (const [t, c] of counts) counts.set(t, c / total);
  return counts;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [t, s] of a) { dot += s * (b.get(t) ?? 0); normA += s ** 2; }
  for (const s of b.values()) normB += s ** 2;
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const moduleFilter = args.find(a => a.startsWith('--module='))?.split('=')[1];

  // 1. Load all shards
  const shardFiles = fs.readdirSync(SHARDS_DIR).filter(f => f.endsWith('.json'));
  const shards: ModuleShard[] = shardFiles.map(f => JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, f), 'utf-8')) as ModuleShard);

  // 2. Flatten all cards with module tracking
  interface IndexedCard { card: Card; moduleId: string; shardIdx: number; deckIdx: number; cardIdx: number; }
  const indexed: IndexedCard[] = [];
  shards.forEach((shard, si) => shard.decks.forEach((deck, di) => deck.cards.forEach((card, ci) => {
    if (!moduleFilter || shard.moduleId === moduleFilter) indexed.push({ card, moduleId: shard.moduleId, shardIdx: si, deckIdx: di, cardIdx: ci });
  })));

  console.log(`Processing ${indexed.length} cards...`);

  // 3. Build TF per card
  const tfs = indexed.map(({ card }) => ({ tokens: tokenize(cardText(card)) })).map(({ tokens }) => buildTF(tokens));

  // 4. Build IDF across corpus
  const dfMap = new Map<string, number>();
  for (const tf of tfs) for (const term of tf.keys()) dfMap.set(term, (dfMap.get(term) ?? 0) + 1);
  const N = indexed.length;
  const idf = new Map<string, number>();
  for (const [term, df] of dfMap) idf.set(term, Math.log(N / df));

  // 5. Compute TF-IDF vectors
  const vecs: Map<string, number>[] = tfs.map(tf => {
    const vec = new Map<string, number>();
    for (const [term, tfScore] of tf) { const idfScore = idf.get(term) ?? 0; if (idfScore > 0) vec.set(term, tfScore * idfScore); }
    return vec;
  });

  // 6. Compute top-K per card
  let totalLinks = 0;
  for (let i = 0; i < indexed.length; i++) {
    const { card, moduleId: modA, shardIdx: si, deckIdx: di, cardIdx: ci } = indexed[i];
    const tokenCount = tfs[i].size;
    if (tokenCount < MIN_TOKENS) continue;

    const scores: { idx: number; score: number }[] = [];
    for (let j = 0; j < indexed.length; j++) {
      if (i === j) continue;
      let score = cosineSimilarity(vecs[i], vecs[j]);
      // Cross-module bonus
      if (indexed[j].moduleId !== modA) score *= CROSS_MODULE_BIAS;
      if (score >= NOISE_FLOOR) scores.push({ idx: j, score });
    }

    scores.sort((a, b) => b.score - a.score);
    const relatedCards = scores.slice(0, TOP_K).map(s => indexed[s.idx].card.id);

    if (!dryRun) {
      shards[si].decks[di].cards[ci].relatedCards = relatedCards;
    }
    totalLinks += relatedCards.length;

    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i + 1}/${indexed.length}\r`);
  }

  console.log(`\nComputed ${totalLinks} total links across ${indexed.length} cards.`);

  // 7. Write updated shards
  if (!dryRun) {
    shardFiles.forEach((f, idx) => {
      if (!moduleFilter || shards[idx].moduleId === moduleFilter) {
        fs.writeFileSync(path.join(SHARDS_DIR, f), JSON.stringify(shards[idx], null, 2));
      }
    });
    console.log(`Wrote ${moduleFilter ? 1 : shardFiles.length} shard file(s).`);
  } else {
    console.log('Dry run — no files written.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
```

---

## `scripts/lib/stopwords.ts`

```typescript
export const STOPWORDS = new Set([
  'the', 'and', 'is', 'in', 'to', 'a', 'of', 'for', 'with', 'that',
  'this', 'are', 'was', 'but', 'not', 'you', 'your', 'be', 'it',
  'from', 'or', 'an', 'on', 'as', 'at', 'by', 'do', 'if', 'so',
  'we', 'he', 'she', 'they', 'them', 'their', 'can', 'will', 'has',
  'have', 'had', 'may', 'use', 'one', 'all', 'also', 'when', 'how',
  'what', 'which', 'who', 'any', 'more', 'its', 'been', 'than',
  'then', 'there', 'these', 'those', 'such', 'each', 'both', 'often',
  'into', 'over', 'after', 'about', 'through', 'should', 'while',
  'used', 'make', 'see', 'way', 'know', 'get', 'like', 'time',
]);
```

---

## Running in CI

Add to package.json scripts:

```json
"scripts": {
  "semantic-links": "tsx scripts/computeSemanticLinks.ts",
  "semantic-links:dry": "tsx scripts/computeSemanticLinks.ts --dry-run"
}
```

This is a **developer-only script**. It is not part of the Vite build and does not run on Vercel.
