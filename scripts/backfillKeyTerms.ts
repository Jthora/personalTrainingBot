#!/usr/bin/env npx tsx
/**
 * backfillKeyTerms.ts — Extracts key terms from card titles and bulletpoints
 * for cards that currently have no keyTerms.
 *
 * Strategy:
 *  - Extract noun-phrase-like terms from card title
 *  - Extract leading terms from bulletpoints (first 2-4 words or up to first verb)
 *  - Deduplicate and limit to 3-6 terms per card
 *
 * Usage:
 *   npx tsx scripts/backfillKeyTerms.ts [--dry-run]
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
  keyTerms?: string[];
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

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which',
  'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only',
  'same', 'so', 'than', 'too', 'very', 'just', 'use', 'using', 'used',
  'also', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'over', 'about', 'up', 'down', 'out',
]);

/**
 * Extract meaningful terms from text. Returns de-duped title-case terms.
 */
function extractTerms(title: string, bulletpoints: string[]): string[] {
  const terms = new Set<string>();

  // From title: split on common delimiters, take noun-like phrases
  const titleParts = title.split(/[:&,\-–—/]+/).map((s) => s.trim()).filter(Boolean);
  for (const part of titleParts) {
    const words = part.split(/\s+/).filter((w) => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2);
    if (words.length <= 3 && words.length > 0) {
      terms.add(words.join(' '));
    } else if (words.length > 3) {
      // Take first 3 significant words as a phrase
      terms.add(words.slice(0, 3).join(' '));
    }
  }

  // From bulletpoints: extract leading noun phrases (first meaningful 2-3 words)
  for (const bp of bulletpoints.slice(0, 5)) {
    const cleaned = bp.replace(/^[-•*]\s*/, '').trim();
    const words = cleaned.split(/\s+/);
    const meaningful = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2);
    if (meaningful.length >= 1) {
      terms.add(meaningful.slice(0, 2).join(' '));
    }
  }

  // Cap at 6 terms, return as array
  return [...terms].slice(0, 6);
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
      if (card.keyTerms && card.keyTerms.length > 0) continue;

      const bps = Array.isArray(card.bulletpoints) ? card.bulletpoints : [];
      card.keyTerms = extractTerms(card.title, bps);
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
