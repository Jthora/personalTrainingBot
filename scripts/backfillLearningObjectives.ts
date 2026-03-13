#!/usr/bin/env npx tsx
/**
 * backfillLearningObjectives.ts — Generates learningObjectives for every card
 * that currently lacks them, deriving objectives from the card's existing content.
 *
 * Usage:
 *   npx tsx scripts/backfillLearningObjectives.ts [--dry-run]
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARDS_DIR = path.resolve(__dirname, '..', 'public', 'training_modules_shards');

const dryRun = process.argv.includes('--dry-run');

interface CardRaw {
  id: string;
  title: string;
  description?: string;
  bulletpoints?: string[];
  learningObjectives?: string[];
  [key: string]: unknown;
}

interface DeckRaw {
  id: string;
  name: string;
  cards: CardRaw[];
  [key: string]: unknown;
}

interface ShardRaw {
  module: string;
  subModules: string[];
  cardDecks: Record<string, DeckRaw>;
}

/**
 * Derive 2–3 learning objectives from the card's title, description, and bullets.
 * Pattern: "Understand X", "Apply X", "Evaluate X"
 */
function deriveLearningObjectives(card: CardRaw): string[] {
  const objectives: string[] = [];
  const title = card.title;
  const bps = card.bulletpoints ?? [];

  // Always: understand the core topic
  objectives.push(`Understand the core principles of ${title.toLowerCase()}`);

  // If we have bulletpoints, derive a practical objective from the first one
  if (bps.length > 0) {
    const firstBp = bps[0].replace(/^[-•]\s*/, '').trim();
    if (firstBp.length > 10) {
      objectives.push(`Apply knowledge of ${firstBp.toLowerCase()}`);
    }
  }

  // Evaluation objective derived from description or title
  const desc = card.description ?? '';
  if (desc.length > 30) {
    const descSnippet = desc.split(/[.!?]/)[0].trim().toLowerCase();
    objectives.push(`Evaluate the significance of ${descSnippet}`);
  } else {
    objectives.push(`Assess readiness in ${title.toLowerCase()}`);
  }

  return objectives;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith('.json')).sort();

let totalCardsProcessed = 0;
let filesModified = 0;

for (const file of files) {
  const filePath = path.join(SHARDS_DIR, file);
  const raw: ShardRaw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let modified = false;

  for (const [, deck] of Object.entries(raw.cardDecks)) {
    for (const card of deck.cards) {
      if (card.learningObjectives && card.learningObjectives.length > 0) continue;

      card.learningObjectives = deriveLearningObjectives(card);
      totalCardsProcessed++;
      modified = true;
    }
  }

  if (modified) {
    filesModified++;
    if (!dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(raw, null, 2) + '\n');
    }
  }
}

console.log(dryRun ? '[DRY RUN]' : '[APPLIED]');
console.log(`  Cards processed:    ${totalCardsProcessed}`);
console.log(`  Files modified:     ${filesModified}`);
