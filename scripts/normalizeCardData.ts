#!/usr/bin/env npx tsx
/**
 * normalizeCardData.ts — Fix data quality violations in shard JSON files in-place.
 *
 * Fixes applied:
 *   1. Convert comma-separated bulletpoint strings → proper arrays
 *   2. Convert string durations → numbers (parseFloat)
 *   3. Backfill missing difficulty with "Unknown"
 *
 * Usage:  npx tsx scripts/normalizeCardData.ts [--dry-run]
 *         --dry-run  Report what would change without writing files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHARDS_DIR = path.resolve(__dirname, '../public/training_modules_shards');
const DRY_RUN = process.argv.includes('--dry-run');

interface FixCount {
  bulletpoints: number;
  duration: number;
  difficulty: number;
}

function normalizeShard(shardPath: string): FixCount {
  const raw = fs.readFileSync(shardPath, 'utf-8');
  const data = JSON.parse(raw);
  const cardDecks = data.cardDecks ?? {};
  const fixes: FixCount = { bulletpoints: 0, duration: 0, difficulty: 0 };

  for (const deckValue of Object.values(cardDecks)) {
    const deck = deckValue as Record<string, unknown>;
    const cards = (deck.cards ?? []) as Record<string, unknown>[];

    for (const card of cards) {
      // Fix 1: bulletpoints string → array
      if (typeof card.bulletpoints === 'string') {
        const str = card.bulletpoints as string;
        card.bulletpoints = str.split(',').map((s: string) => s.trim()).filter(Boolean);
        fixes.bulletpoints++;
      }

      // Fix 2: duration string → number
      if (typeof card.duration === 'string') {
        const parsed = parseFloat(card.duration as string);
        card.duration = isNaN(parsed) ? 0 : parsed;
        fixes.duration++;
      }

      // Fix 3: missing difficulty → "Unknown"
      if (!card.difficulty) {
        card.difficulty = 'Unknown';
        fixes.difficulty++;
      }
    }
  }

  const totalFixes = fixes.bulletpoints + fixes.duration + fixes.difficulty;
  if (totalFixes > 0 && !DRY_RUN) {
    fs.writeFileSync(shardPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  return fixes;
}

function main() {
  const shardFiles = fs.readdirSync(SHARDS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(SHARDS_DIR, f))
    .sort();

  console.log(`\n=== Card Data Normalization ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  let totalBP = 0;
  let totalDur = 0;
  let totalDiff = 0;
  let filesChanged = 0;

  for (const shardPath of shardFiles) {
    const shardName = path.basename(shardPath, '.json');
    const fixes = normalizeShard(shardPath);
    const total = fixes.bulletpoints + fixes.duration + fixes.difficulty;

    totalBP += fixes.bulletpoints;
    totalDur += fixes.duration;
    totalDiff += fixes.difficulty;

    if (total > 0) {
      filesChanged++;
      const parts: string[] = [];
      if (fixes.bulletpoints) parts.push(`${fixes.bulletpoints} bulletpoints`);
      if (fixes.duration) parts.push(`${fixes.duration} durations`);
      if (fixes.difficulty) parts.push(`${fixes.difficulty} difficulties`);
      console.log(`  ${DRY_RUN ? '🔍' : '✅'} ${shardName}: fixed ${parts.join(', ')}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Files ${DRY_RUN ? 'would be ' : ''}modified: ${filesChanged}`);
  console.log(`Bulletpoints converted:     ${totalBP}`);
  console.log(`Durations converted:        ${totalDur}`);
  console.log(`Difficulties backfilled:    ${totalDiff}`);
  console.log(`Total fixes:                ${totalBP + totalDur + totalDiff}`);

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply fixes.\n');
  } else {
    console.log('\n✅ All fixes applied. Run validateCardSchema.ts to verify.\n');
  }
}

main();
