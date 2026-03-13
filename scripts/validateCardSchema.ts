#!/usr/bin/env npx tsx
/**
 * validateCardSchema.ts — Scan all shard JSON files and report data quality violations.
 *
 * Violations detected:
 *   1. bulletpoints stored as comma-separated strings (not arrays)
 *   2. duration stored as strings (not numbers)
 *   3. missing required fields (id, title, description)
 *   4. missing difficulty field
 *   5. short descriptions (<50 chars)
 *
 * Usage:  npx tsx scripts/validateCardSchema.ts
 * Output: per-shard + per-deck violation counts, exit code 1 if any violations found
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHARDS_DIR = path.resolve(__dirname, '../public/training_modules_shards');

interface Violation {
  shard: string;
  deckKey: string;
  cardId: string;
  field: string;
  message: string;
}

interface ShardReport {
  shard: string;
  decks: number;
  cards: number;
  violations: Violation[];
}

function validateCard(
  shard: string,
  deckKey: string,
  card: Record<string, unknown>,
): Violation[] {
  const violations: Violation[] = [];
  const cardId = (card.id as string) || '(no id)';

  // Required fields
  if (!card.id) {
    violations.push({ shard, deckKey, cardId, field: 'id', message: 'Missing required field' });
  }
  if (!card.title) {
    violations.push({ shard, deckKey, cardId, field: 'title', message: 'Missing required field' });
  }
  if (!card.description) {
    violations.push({ shard, deckKey, cardId, field: 'description', message: 'Missing required field' });
  } else if (typeof card.description === 'string' && card.description.length < 50) {
    violations.push({ shard, deckKey, cardId, field: 'description', message: `Short description (${card.description.length} chars < 50)` });
  }

  // Bulletpoints should be array, not string
  if (typeof card.bulletpoints === 'string') {
    violations.push({ shard, deckKey, cardId, field: 'bulletpoints', message: 'Stored as comma-separated string, not array' });
  }

  // Duration should be number, not string
  if (typeof card.duration === 'string') {
    violations.push({ shard, deckKey, cardId, field: 'duration', message: `Stored as string "${card.duration}", not number` });
  }

  // Missing difficulty
  if (!card.difficulty) {
    violations.push({ shard, deckKey, cardId, field: 'difficulty', message: 'Missing difficulty field' });
  }

  return violations;
}

function validateShard(shardPath: string): ShardReport {
  const shardName = path.basename(shardPath, '.json');
  const data = JSON.parse(fs.readFileSync(shardPath, 'utf-8'));
  const cardDecks = data.cardDecks ?? {};

  const report: ShardReport = { shard: shardName, decks: 0, cards: 0, violations: [] };

  for (const [deckKey, deckValue] of Object.entries(cardDecks)) {
    const deck = deckValue as Record<string, unknown>;
    const cards = (deck.cards ?? []) as Record<string, unknown>[];
    report.decks++;
    report.cards += cards.length;

    for (const card of cards) {
      const cardViolations = validateCard(shardName, deckKey, card);
      report.violations.push(...cardViolations);
    }
  }

  return report;
}

function main() {
  const shardFiles = fs.readdirSync(SHARDS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(SHARDS_DIR, f))
    .sort();

  const reports: ShardReport[] = shardFiles.map(validateShard);

  let totalDecks = 0;
  let totalCards = 0;
  let totalViolations = 0;

  // Per-shard summary
  console.log('\n=== Card Schema Validation Report ===\n');

  for (const report of reports) {
    totalDecks += report.decks;
    totalCards += report.cards;
    totalViolations += report.violations.length;

    if (report.violations.length > 0) {
      console.log(`❌ ${report.shard}: ${report.violations.length} violations (${report.decks} decks, ${report.cards} cards)`);

      // Group by violation type
      const byField = new Map<string, number>();
      for (const v of report.violations) {
        byField.set(v.field, (byField.get(v.field) ?? 0) + 1);
      }
      for (const [field, count] of byField) {
        console.log(`   ${field}: ${count}`);
      }
    } else {
      console.log(`✅ ${report.shard}: clean (${report.decks} decks, ${report.cards} cards)`);
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Shards scanned:  ${reports.length}`);
  console.log(`Total decks:     ${totalDecks}`);
  console.log(`Total cards:     ${totalCards}`);
  console.log(`Total violations: ${totalViolations}`);

  // Breakdown by type
  const allViolations = reports.flatMap(r => r.violations);
  const byType = new Map<string, number>();
  for (const v of allViolations) {
    const key = `${v.field}: ${v.message.split('(')[0].trim()}`;
    byType.set(key, (byType.get(key) ?? 0) + 1);
  }
  if (byType.size > 0) {
    console.log('\nViolation breakdown:');
    for (const [type, count] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }
  }

  // Thin deck audit
  const thinDecks: { shard: string; deckKey: string; cards: number }[] = [];
  for (const report of reports) {
    const data = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `${report.shard}.json`), 'utf-8'));
    for (const [deckKey, deckValue] of Object.entries(data.cardDecks ?? {})) {
      const cards = ((deckValue as Record<string, unknown>).cards ?? []) as unknown[];
      if (cards.length < 5) {
        thinDecks.push({ shard: report.shard, deckKey, cards: cards.length });
      }
    }
  }
  console.log(`\nThin decks (<5 cards): ${thinDecks.length} of ${totalDecks}`);

  if (totalViolations > 0) {
    console.log('\n⚠️  Run scripts/normalizeCardData.ts to fix violations.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All cards pass schema validation.\n');
    process.exit(0);
  }
}

main();
