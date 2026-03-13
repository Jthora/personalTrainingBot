#!/usr/bin/env npx tsx
/**
 * expandThinDecks.ts — Generates additional cards for decks with <5 cards,
 * bringing every deck to a minimum of 5 cards.
 *
 * Strategy per thin deck:
 *  - Analyze existing card topics, bulletpoints, and deck focus
 *  - Generate complementary cards that cover adjacent sub-topics
 *  - Each new card gets: title, description (≥50 chars), 3+ bulletpoints,
 *    duration, difficulty, exercises, learningObjectives
 *
 * Usage:
 *   npx tsx scripts/expandThinDecks.ts [--dry-run]
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARDS_DIR = path.resolve(__dirname, '..', 'public', 'training_modules_shards');
const dryRun = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Types
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
  description: string;
  bulletpoints: string[];
  duration: number;
  difficulty: string;
  summaryText?: string;
  exercises?: Exercise[];
  learningObjectives?: string[];
  keyTerms?: string[];
  [key: string]: unknown;
}

interface DeckRaw {
  id: string;
  name: string;
  description?: string;
  focus?: string[] | string;
  cards: CardRaw[];
  [key: string]: unknown;
}

interface ShardRaw {
  module: string;
  subModules: string[];
  cardDecks: Record<string, DeckRaw>;
}

// ---------------------------------------------------------------------------
// Card generation templates — topic expansion patterns
// ---------------------------------------------------------------------------

/** Given a deck's existing cards and focus, generate N complementary card stubs. */
function generateCards(
  deck: DeckRaw,
  existing: CardRaw[],
  needed: number,
  shardId: string,
): CardRaw[] {
  const deckName = deck.name;
  const focusAreas = Array.isArray(deck.focus) ? deck.focus : deck.focus ? [deck.focus] : [];
  const existingTitles = new Set(existing.map((c) => c.title.toLowerCase()));
  const existingIds = new Set(existing.map((c) => c.id));

  // Extract themes from existing cards
  const existingBullets = existing.flatMap((c) => c.bulletpoints);
  const avgDuration = Math.round(existing.reduce((s, c) => s + (c.duration || 5), 0) / existing.length);
  const difficulty = existing[0]?.difficulty ?? 'Standard';

  // Card expansion templates: different angles on the same deck topic
  const expansionAngles = [
    {
      suffix: 'fundamentals',
      titlePattern: (name: string) => `${name}: Core Fundamentals`,
      descPattern: (name: string) => `Understanding the foundational principles and essential concepts that underpin ${name.toLowerCase()}.`,
      bpPatterns: (name: string, _focuses: string[]) => [
        `Define the key terminology used in ${name.toLowerCase()}`,
        `Identify the core principles that guide effective practice`,
        `Recognize the historical context and evolution of this discipline`,
        `Understand the relationship between theory and practical application`,
      ],
    },
    {
      suffix: 'practical_application',
      titlePattern: (name: string) => `${name}: Practical Application`,
      descPattern: (name: string) => `Applying ${name.toLowerCase()} concepts in real-world scenarios and operational contexts.`,
      bpPatterns: (name: string, focuses: string[]) => [
        `Apply ${name.toLowerCase()} principles to realistic scenarios`,
        `Develop a step-by-step action plan for field deployment`,
        ...(focuses.length > 0
          ? [`Integrate ${focuses[0].toLowerCase()} techniques into practice`]
          : [`Adapt techniques to varying operational conditions`]),
        `Evaluate outcomes and refine approach based on results`,
      ],
    },
    {
      suffix: 'advanced_techniques',
      titlePattern: (name: string) => `${name}: Advanced Techniques`,
      descPattern: (name: string) => `Exploring sophisticated methods and nuanced approaches within ${name.toLowerCase()} for experienced practitioners.`,
      bpPatterns: (name: string, focuses: string[]) => [
        `Master advanced methodologies specific to ${name.toLowerCase()}`,
        `Combine multiple techniques for compound effectiveness`,
        ...(focuses.length > 1
          ? [`Synthesize ${focuses.slice(0, 2).join(' and ').toLowerCase()} approaches`]
          : [`Develop adaptive strategies for complex situations`]),
        `Evaluate edge cases and unconventional scenarios`,
      ],
    },
    {
      suffix: 'assessment_review',
      titlePattern: (name: string) => `${name}: Assessment & Review`,
      descPattern: (name: string) => `Comprehensive review and self-assessment framework for measuring proficiency in ${name.toLowerCase()}.`,
      bpPatterns: (name: string, _focuses: string[]) => [
        `Assess current skill level against established benchmarks`,
        `Identify personal strengths and areas for development`,
        `Create a structured improvement plan with measurable milestones`,
        `Review common mistakes and how to avoid them in ${name.toLowerCase()}`,
      ],
    },
    {
      suffix: 'integration_synthesis',
      titlePattern: (name: string) => `${name}: Integration & Synthesis`,
      descPattern: (name: string) => `Connecting ${name.toLowerCase()} with broader operational knowledge and cross-disciplinary skills.`,
      bpPatterns: (name: string, focuses: string[]) => [
        `Connect ${name.toLowerCase()} concepts to adjacent disciplines`,
        `Identify synergies between ${name.toLowerCase()} and complementary skill sets`,
        ...(focuses.length > 0
          ? [`Leverage ${focuses[0].toLowerCase()} as a bridge to advanced applications`]
          : [`Build cross-functional capability through integrated practice`]),
        `Develop a holistic understanding of how this domain fits the bigger picture`,
      ],
    },
  ];

  const generated: CardRaw[] = [];

  for (let i = 0; i < needed && i < expansionAngles.length; i++) {
    const angle = expansionAngles[i];
    const title = angle.titlePattern(deckName);

    // Skip if we'd duplicate an existing title
    if (existingTitles.has(title.toLowerCase())) continue;

    // Generate a unique ID
    let cardId = `${deck.id}_${angle.suffix}`;
    let counter = 0;
    while (existingIds.has(cardId)) {
      counter++;
      cardId = `${deck.id}_${angle.suffix}_${counter}`;
    }
    existingIds.add(cardId);

    const bulletpoints = angle.bpPatterns(deckName, focusAreas);
    const description = angle.descPattern(deckName);

    const card: CardRaw = {
      id: cardId,
      title,
      description,
      bulletpoints,
      duration: avgDuration,
      difficulty,
      exercises: generateExercisesForCard(title, bulletpoints, shardId),
      learningObjectives: [
        `Understand the core principles of ${title.toLowerCase()}`,
        `Apply knowledge of ${bulletpoints[0]?.toLowerCase() ?? deckName.toLowerCase()}`,
        `Assess readiness in ${title.toLowerCase()}`,
      ],
    };

    generated.push(card);
  }

  return generated;
}

// ---------------------------------------------------------------------------
// Exercise generators (domain-aware, reused pattern from generateExerciseTemplates.ts)
// ---------------------------------------------------------------------------

const DOMAIN_MIX: Record<string, Array<Exercise['type']>> = {
  agencies: ['recall', 'analyze'],
  combat: ['self-check', 'apply', 'recall'],
  counter_biochem: ['recall', 'analyze'],
  counter_psyops: ['recall', 'analyze', 'self-check'],
  cybersecurity: ['recall', 'apply', 'self-check'],
  dance: ['self-check', 'apply'],
  equations: ['recall', 'apply'],
  espionage: ['recall', 'analyze'],
  fitness: ['self-check', 'apply'],
  intelligence: ['recall', 'analyze', 'self-check'],
  investigation: ['recall', 'apply', 'analyze'],
  martial_arts: ['self-check', 'apply', 'recall'],
  psiops: ['recall', 'analyze', 'self-check'],
  war_strategy: ['recall', 'analyze'],
  web_three: ['recall', 'apply'],
  anti_psn: ['recall', 'analyze', 'self-check'],
  anti_tcs_idc_cbc: ['recall', 'analyze', 'self-check'],
  self_sovereignty: ['recall', 'analyze', 'self-check'],
  space_force: ['recall', 'analyze'],
};

function generateExercisesForCard(title: string, bulletpoints: string[], shardId: string): Exercise[] {
  const mix = DOMAIN_MIX[shardId] ?? ['recall', 'self-check'];
  const exercises: Exercise[] = [];

  for (const type of mix) {
    switch (type) {
      case 'recall':
        exercises.push({
          type: 'recall',
          prompt: `From memory, list the key points of "${title}".`,
          expectedOutcome: bulletpoints.length > 0
            ? `Key points: ${bulletpoints.slice(0, 3).join('; ')}`
            : `Core concepts of ${title}.`,
        });
        break;
      case 'apply':
        exercises.push({
          type: 'apply',
          prompt: `Describe how you would apply the concepts from "${title}" in a real-world scenario.`,
          hints: [
            'Think about a specific situation where this knowledge is needed.',
            'Consider potential obstacles and how to overcome them.',
          ],
          expectedOutcome: `A practical application of ${title.toLowerCase()} concepts with concrete steps.`,
        });
        break;
      case 'analyze':
        exercises.push({
          type: 'analyze',
          prompt: `Why is ${title.toLowerCase()} important? What happens if these principles are ignored?`,
          hints: [
            'Consider the consequences of inaction.',
            'Think about how this connects to adjacent topics.',
          ],
          expectedOutcome: `Understanding the importance and interconnections of ${title.toLowerCase()}.`,
        });
        break;
      case 'self-check': {
        const items = bulletpoints.slice(0, 4).map((bp) => `I can explain: ${bp}`);
        if (items.length < 2) {
          items.push(`I understand the core concept of ${title}`);
          items.push(`I could teach this topic to someone else`);
        }
        exercises.push({
          type: 'self-check',
          prompt: `Check your understanding of "${title}":`,
          hints: items,
          expectedOutcome: `Full comprehension of ${title.toLowerCase()}.`,
        });
        break;
      }
    }
  }

  return exercises;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith('.json')).sort();

let totalDecksExpanded = 0;
let totalCardsAdded = 0;
let filesModified = 0;

for (const file of files) {
  const shardId = file.replace('.json', '');
  const filePath = path.join(SHARDS_DIR, file);
  const raw: ShardRaw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let modified = false;

  for (const [, deck] of Object.entries(raw.cardDecks)) {
    if (deck.cards.length >= 5) continue;

    const needed = 5 - deck.cards.length;
    const newCards = generateCards(deck, deck.cards, needed, shardId);

    if (newCards.length > 0) {
      deck.cards.push(...newCards);
      totalCardsAdded += newCards.length;
      totalDecksExpanded++;
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
console.log(`  Decks expanded:     ${totalDecksExpanded}`);
console.log(`  Cards added:        ${totalCardsAdded}`);
console.log(`  Files modified:     ${filesModified}`);
