#!/usr/bin/env npx tsx
/**
 * auditCardContent.ts — Comprehensive content quality audit across all training shards.
 *
 * Reports:
 *  - Thin decks (< 5 cards)
 *  - Thin cards (< 3 bulletpoints or description < 50 chars)
 *  - Cards missing exercises
 *  - Per-domain summary and prioritized enrichment order
 *
 * Usage:
 *   npx tsx scripts/auditCardContent.ts [--json]
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARDS_DIR = path.resolve(__dirname, '..', 'public', 'training_modules_shards');

interface CardRaw {
  id: string;
  title: string;
  description?: string;
  bulletpoints?: string[] | string;
  duration?: number | string;
  difficulty?: string;
  exercises?: unknown[];
  learningObjectives?: string[];
  keyTerms?: string[];
  [key: string]: unknown;
}

interface DeckRaw {
  id: string;
  name: string;
  description?: string;
  focus?: string;
  cards: CardRaw[];
}

interface ShardRaw {
  module: string;
  subModules: string[];
  cardDecks: Record<string, DeckRaw>;
}

// ---------------------------------------------------------------------------
// Quality rule checks
// ---------------------------------------------------------------------------

interface CardIssue {
  shardId: string;
  deckId: string;
  cardId: string;
  cardTitle: string;
  issues: string[];
}

interface DeckIssue {
  shardId: string;
  deckId: string;
  deckName: string;
  cardCount: number;
  issues: string[];
}

interface DomainSummary {
  shardId: string;
  totalDecks: number;
  totalCards: number;
  thinDecks: number;
  thinCards: number;
  cardsWithoutExercises: number;
  cardsWithoutObjectives: number;
  qualityScore: number; // 0–100
}

function auditCard(shardId: string, deckId: string, card: CardRaw): CardIssue | null {
  const issues: string[] = [];

  // Description check
  const desc = card.description ?? '';
  if (desc.length < 50) {
    issues.push(`short-description (${desc.length} chars)`);
  }

  // Bulletpoints check
  const bps = Array.isArray(card.bulletpoints) ? card.bulletpoints : [];
  if (bps.length < 3) {
    issues.push(`few-bulletpoints (${bps.length})`);
  }

  // Exercise check
  const exs = Array.isArray(card.exercises) ? card.exercises : [];
  if (exs.length === 0) {
    issues.push('no-exercises');
  }

  // Learning objectives
  const objs = Array.isArray(card.learningObjectives) ? card.learningObjectives : [];
  if (objs.length === 0) {
    issues.push('no-learning-objectives');
  }

  // Key terms (informational, not critical)
  // Duration
  if (card.duration === 0 || card.duration === undefined) {
    issues.push('no-duration');
  }

  if (issues.length === 0) return null;
  return { shardId, deckId, cardId: card.id, cardTitle: card.title, issues };
}

function auditDeck(shardId: string, deckId: string, deck: DeckRaw): DeckIssue | null {
  const issues: string[] = [];
  if (deck.cards.length < 5) {
    issues.push(`thin-deck (${deck.cards.length} cards)`);
  }
  if (issues.length === 0) return null;
  return { shardId, deckId, deckName: deck.name, cardCount: deck.cards.length, issues };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const jsonOutput = process.argv.includes('--json');

const files = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith('.json')).sort();

const allCardIssues: CardIssue[] = [];
const allDeckIssues: DeckIssue[] = [];
const domainSummaries: DomainSummary[] = [];

let totalDecks = 0;
let totalCards = 0;

for (const file of files) {
  const shardId = file.replace('.json', '');
  const raw: ShardRaw = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, file), 'utf-8'));
  const decks = Object.entries(raw.cardDecks);

  let shardDecks = 0;
  let shardCards = 0;
  let shardThinDecks = 0;
  let shardThinCards = 0;
  let shardNoExercises = 0;
  let shardNoObjectives = 0;

  for (const [deckId, deck] of decks) {
    shardDecks++;
    shardCards += deck.cards.length;

    const deckIssue = auditDeck(shardId, deckId, deck);
    if (deckIssue) {
      allDeckIssues.push(deckIssue);
      shardThinDecks++;
    }

    for (const card of deck.cards) {
      const cardIssue = auditCard(shardId, deckId, card);
      if (cardIssue) {
        allCardIssues.push(cardIssue);
        if (cardIssue.issues.some((i) => i.startsWith('few-bulletpoints') || i.startsWith('short-description'))) {
          shardThinCards++;
        }
        if (cardIssue.issues.includes('no-exercises')) {
          shardNoExercises++;
        }
        if (cardIssue.issues.includes('no-learning-objectives')) {
          shardNoObjectives++;
        }
      }
    }
  }

  totalDecks += shardDecks;
  totalCards += shardCards;

  // Quality score: proportion of cards that are NOT flagged for critical issues
  const criticalCards = allCardIssues.filter(
    (i) => i.shardId === shardId && i.issues.some((x) => x !== 'no-exercises' && x !== 'no-learning-objectives' && x !== 'no-duration')
  ).length;
  const score = shardCards > 0 ? Math.round(((shardCards - criticalCards) / shardCards) * 100) : 0;

  domainSummaries.push({
    shardId,
    totalDecks: shardDecks,
    totalCards: shardCards,
    thinDecks: shardThinDecks,
    thinCards: shardThinCards,
    cardsWithoutExercises: shardNoExercises,
    cardsWithoutObjectives: shardNoObjectives,
    qualityScore: score,
  });
}

// --- Issue type breakdown ---
const issueTypes = new Map<string, number>();
for (const ci of allCardIssues) {
  for (const issue of ci.issues) {
    const tag = issue.replace(/\s*\(.*\)/, '');
    issueTypes.set(tag, (issueTypes.get(tag) ?? 0) + 1);
  }
}

// --- Prioritization: sort domains by quality score ascending (worst first) ---
const sorted = [...domainSummaries].sort((a, b) => a.qualityScore - b.qualityScore);

if (jsonOutput) {
  const report = {
    timestamp: new Date().toISOString(),
    totals: { decks: totalDecks, cards: totalCards, thinDecks: allDeckIssues.length, cardIssues: allCardIssues.length },
    issueBreakdown: Object.fromEntries(issueTypes),
    domainSummaries: sorted,
    deckIssues: allDeckIssues,
    // Omit full card issues from JSON to keep it manageable — use --verbose for that
  };
  const outPath = path.resolve(__dirname, '..', 'artifacts', 'content-audit-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Report written to artifacts/content-audit-report.json`);
} else {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CONTENT QUALITY AUDIT REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log(`  Total domains:  ${files.length}`);
  console.log(`  Total decks:    ${totalDecks}`);
  console.log(`  Total cards:    ${totalCards}`);
  console.log(`  Thin decks:     ${allDeckIssues.length} (< 5 cards)`);
  console.log(`  Cards w/ issues: ${allCardIssues.length}`);
  console.log();

  console.log('─── Issue Breakdown ───');
  for (const [tag, count] of [...issueTypes].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${tag.padEnd(28)} ${count}`);
  }
  console.log();

  console.log('─── Domain Quality (worst → best) ───');
  console.log('  Domain                 Decks  Cards  Thin↓  NoEx  NoObj  Score');
  console.log('  ─────────────────────  ─────  ─────  ─────  ────  ─────  ─────');
  for (const d of sorted) {
    console.log(
      `  ${d.shardId.padEnd(23)} ${String(d.totalDecks).padStart(5)}  ${String(d.totalCards).padStart(5)}  ${String(d.thinDecks).padStart(5)}  ${String(d.cardsWithoutExercises).padStart(4)}  ${String(d.cardsWithoutObjectives).padStart(5)}  ${String(d.qualityScore).padStart(4)}%`
    );
  }
  console.log();
  console.log('─── Top 10 Thin Decks ───');
  const worstDecks = [...allDeckIssues].sort((a, b) => a.cardCount - b.cardCount).slice(0, 10);
  for (const d of worstDecks) {
    console.log(`  [${d.shardId}] ${d.deckName} — ${d.cardCount} cards`);
  }
  console.log();
}
