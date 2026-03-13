#!/usr/bin/env npx tsx
/**
 * generateExerciseTemplates.ts — Generates domain-appropriate exercise stubs
 * for every card that currently has no exercises.
 *
 * Strategy:
 *  - Each domain maps to a preferred mix of exercise types
 *  - Exercises are derived from card title, description, and bulletpoints
 *  - All generated exercises are written back to the shard files
 *
 * Usage:
 *   npx tsx scripts/generateExerciseTemplates.ts [--dry-run]
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARDS_DIR = path.resolve(__dirname, '..', 'public', 'training_modules_shards');

const dryRun = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Exercise type = 'recall' | 'apply' | 'analyze' | 'self-check'
// ---------------------------------------------------------------------------

interface Exercise {
  type: 'recall' | 'apply' | 'analyze' | 'self-check';
  prompt: string;
  hints?: string[];
  expectedOutcome?: string;
}

interface CardRaw {
  id: string;
  title: string;
  description?: string;
  bulletpoints?: string[];
  exercises?: Exercise[];
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

// ---------------------------------------------------------------------------
// Domain → exercise mix mapping
// ---------------------------------------------------------------------------

type ExerciseMix = Array<'recall' | 'apply' | 'analyze' | 'self-check'>;

/** Each domain gets a weighted exercise profile based on its training nature. */
const DOMAIN_MIX: Record<string, ExerciseMix> = {
  // Knowledge-heavy domains: recall + analyze
  agencies:          ['recall', 'analyze'],
  counter_biochem:   ['recall', 'analyze'],
  counter_psyops:    ['recall', 'analyze', 'self-check'],
  cybersecurity:     ['recall', 'apply', 'self-check'],
  equations:         ['recall', 'apply'],
  espionage:         ['recall', 'analyze'],
  intelligence:      ['recall', 'analyze', 'self-check'],
  investigation:     ['recall', 'apply', 'analyze'],
  psiops:            ['recall', 'analyze', 'self-check'],
  war_strategy:      ['recall', 'analyze'],
  web_three:         ['recall', 'apply'],
  anti_psn:          ['recall', 'analyze', 'self-check'],
  anti_tcs_idc_cbc:  ['recall', 'analyze', 'self-check'],
  self_sovereignty:  ['recall', 'analyze', 'self-check'],
  space_force:       ['recall', 'analyze'],

  // Physical / kinesthetic domains: self-check + apply
  fitness:           ['self-check', 'apply'],
  combat:            ['self-check', 'apply', 'recall'],
  martial_arts:      ['self-check', 'apply', 'recall'],
  dance:             ['self-check', 'apply'],
};

const DEFAULT_MIX: ExerciseMix = ['recall', 'self-check'];

// ---------------------------------------------------------------------------
// Exercise generators by type
// ---------------------------------------------------------------------------

function makeRecall(card: CardRaw): Exercise {
  const bps = card.bulletpoints ?? [];
  const keyBullets = bps.slice(0, 3);
  return {
    type: 'recall',
    prompt: `From memory, list the key points of "${card.title}".`,
    expectedOutcome: keyBullets.length > 0
      ? `Key points: ${keyBullets.join('; ')}`
      : card.description ?? `Core concepts of ${card.title}.`,
  };
}

function makeApply(card: CardRaw): Exercise {
  return {
    type: 'apply',
    prompt: `Describe how you would apply the concepts from "${card.title}" in a real-world scenario.`,
    hints: [
      'Think about a specific situation where this knowledge is needed.',
      'Consider potential obstacles and how to overcome them.',
    ],
    expectedOutcome: `A practical application of ${card.title.toLowerCase()} concepts with concrete steps.`,
  };
}

function makeAnalyze(card: CardRaw): Exercise {
  return {
    type: 'analyze',
    prompt: `Why is ${card.title.toLowerCase()} important? What happens if these principles are ignored?`,
    hints: [
      'Consider the consequences of inaction.',
      'Think about how this connects to adjacent topics.',
    ],
    expectedOutcome: `Understanding the importance and interconnections of ${card.title.toLowerCase()}.`,
  };
}

function makeSelfCheck(card: CardRaw): Exercise {
  const bps = card.bulletpoints ?? [];
  const items = bps.slice(0, 4).map((bp) => `I can explain: ${bp}`);
  if (items.length < 2) {
    items.push(`I understand the core concept of ${card.title}`);
    items.push(`I could teach this topic to someone else`);
  }
  return {
    type: 'self-check',
    prompt: `Check your understanding of "${card.title}":`,
    hints: items,
    expectedOutcome: `Full comprehension of ${card.title.toLowerCase()}.`,
  };
}

const GENERATORS: Record<string, (card: CardRaw) => Exercise> = {
  recall: makeRecall,
  apply: makeApply,
  analyze: makeAnalyze,
  'self-check': makeSelfCheck,
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith('.json')).sort();

let totalCardsProcessed = 0;
let totalExercisesAdded = 0;
let filesModified = 0;

for (const file of files) {
  const shardId = file.replace('.json', '');
  const filePath = path.join(SHARDS_DIR, file);
  const raw: ShardRaw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const mix = DOMAIN_MIX[shardId] ?? DEFAULT_MIX;
  let modified = false;

  for (const [, deck] of Object.entries(raw.cardDecks)) {
    for (const card of deck.cards) {
      if (card.exercises && card.exercises.length > 0) continue;

      // Pick exercise types for this card — use the domain mix
      const exercises: Exercise[] = mix.map((type) => {
        const gen = GENERATORS[type];
        return gen(card);
      });

      card.exercises = exercises;
      totalExercisesAdded += exercises.length;
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
console.log(`  Exercises added:    ${totalExercisesAdded}`);
console.log(`  Files modified:     ${filesModified}`);
console.log(`  Exercise mix used per domain.`);
