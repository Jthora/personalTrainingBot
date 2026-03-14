#!/usr/bin/env npx tsx
/**
 * remediateContent.ts — Automatically fix common low-quality content issues.
 *
 * Applies the following fixes (non-destructive — only fills gaps):
 *   1. Backfill missing summaryText using deriveSummaryText()
 *   2. Replace templated self-check exercises with card-specific checklists
 *   3. Add missing expectedOutcome to exercises using card description
 *   4. Ensure at least 2 exercise types per card (add recall if only self-check)
 *
 * Usage:   npx tsx scripts/remediateContent.ts [--dry-run] [--module=<id>]
 * Output:  Modified shard files + artifacts/remediation-report.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Card, Exercise } from '../src/types/Card';
import { deriveSummaryText, detectTemplateExercises } from '../src/utils/contentValidation';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARD_DIR = path.resolve(__dirname, '../public/training_modules_shards');
const OUTPUT_PATH = path.resolve(__dirname, '../artifacts/remediation-report.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const moduleFilter = args.find((a) => a.startsWith('--module='))?.split('=')[1];

interface RemediationStats {
  summaryTextAdded: number;
  templatesReplaced: number;
  outcomesAdded: number;
  diversityFixed: number;
}

interface RemediationReport {
  generatedAt: string;
  dryRun: boolean;
  modulesProcessed: number;
  cardsProcessed: number;
  stats: RemediationStats;
  perModule: Array<{ moduleId: string; moduleTitle: string; stats: RemediationStats }>;
}

// ─── Template Replacement ────────────────────────────────────────

/**
 * Replace a templated self-check exercise with one derived from card content.
 * Uses keyTerms and learningObjectives to generate meaningful checklists.
 */
function deriveChecklistFromCard(card: Card): Exercise {
  const items: string[] = [];

  // Use learning objectives as checklist items
  for (const obj of card.learningObjectives ?? []) {
    items.push(`I can ${obj.toLowerCase().replace(/^(identify|explain|apply|analyze|evaluate|create|describe|compare)\s+/i, '')}`);
  }

  // Fill remaining from keyTerms
  for (const term of card.keyTerms ?? []) {
    if (items.length >= 5) break;
    items.push(`I understand the concept of "${term}"`);
  }

  // Fall back to bulletpoints
  if (items.length < 2) {
    for (const bp of card.bulletpoints ?? []) {
      if (items.length >= 4) break;
      const short = bp.length > 60 ? bp.slice(0, 57) + '…' : bp;
      items.push(`I understand: ${short}`);
    }
  }

  // Ensure minimum 2 items
  if (items.length < 2) {
    items.push(`I have reviewed the material on "${card.title}"`);
    items.push(`I can explain the main concepts covered in this card`);
  }

  return {
    type: 'self-check',
    prompt: `Review: ${card.title} — can you demonstrate these competencies?`,
    hints: items.slice(0, 5),
    expectedOutcome: `You should be able to discuss ${card.title.toLowerCase()} with confidence, covering ${(card.keyTerms ?? []).slice(0, 3).join(', ') || 'the key concepts'}.`,
  };
}

/**
 * Generate a recall exercise from card content.
 */
function deriveRecallFromCard(card: Card): Exercise {
  const keyTerm = card.keyTerms?.[0] ?? card.title;
  const firstBp = card.bulletpoints?.[0] ?? card.description.split('.')[0];

  return {
    type: 'recall',
    prompt: `Regarding ${keyTerm}: what are the critical details an operative must know?`,
    expectedOutcome: firstBp.length >= 50
      ? firstBp
      : `${firstBp}. ${card.description.split('.').slice(0, 2).join('. ')}.`,
  };
}

// ─── Card Remediation ────────────────────────────────────────────

function remediateCard(card: Card): { card: Card; modified: boolean; stats: RemediationStats } {
  const stats: RemediationStats = { summaryTextAdded: 0, templatesReplaced: 0, outcomesAdded: 0, diversityFixed: 0 };
  let modified = false;

  // 1. Backfill summaryText
  if (!card.summaryText || card.summaryText.length < 50) {
    const derived = deriveSummaryText(card);
    if (derived) {
      card.summaryText = derived;
      stats.summaryTextAdded = 1;
      modified = true;
    }
  }

  // 2. Replace templated exercises
  const exercises = card.exercises ?? [];
  const templates = detectTemplateExercises(exercises);
  if (templates.length > 0) {
    const templateIndices = new Set(templates.map((t) => t.exerciseIndex));
    const newExercises: Exercise[] = [];

    for (let i = 0; i < exercises.length; i++) {
      if (templateIndices.has(i) && exercises[i].type === 'self-check') {
        newExercises.push(deriveChecklistFromCard(card));
        stats.templatesReplaced++;
        modified = true;
      } else {
        newExercises.push(exercises[i]);
      }
    }
    card.exercises = newExercises;
  }

  // 3. Add missing expectedOutcome
  for (const ex of card.exercises ?? []) {
    if (!ex.expectedOutcome || ex.expectedOutcome.length < 20) {
      const sentences = card.description.split(/[.!?]+/).filter((s) => s.trim().length > 10);
      if (sentences.length >= 1) {
        ex.expectedOutcome = sentences.slice(0, 2).join('. ').trim() + '.';
        stats.outcomesAdded++;
        modified = true;
      }
    }
  }

  // 4. Ensure exercise type diversity (≥ 2 types)
  const types = new Set((card.exercises ?? []).map((ex) => ex.type));
  if (types.size < 2 && (card.exercises ?? []).length >= 1) {
    if (!types.has('recall')) {
      card.exercises = [...(card.exercises ?? []), deriveRecallFromCard(card)];
      stats.diversityFixed = 1;
      modified = true;
    }
  }

  return { card, modified, stats };
}

// ─── Main ────────────────────────────────────────────────────────

function main() {
  console.log(`🔧 Content Remediation${dryRun ? ' (DRY RUN)' : ''}\n`);

  const files = fs.readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json'));
  const globalStats: RemediationStats = { summaryTextAdded: 0, templatesReplaced: 0, outcomesAdded: 0, diversityFixed: 0 };
  const perModule: RemediationReport['perModule'] = [];
  let totalCards = 0;
  let totalModified = 0;

  for (const file of files) {
    const filePath = path.join(SHARD_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const mod = data.module;
    const cardDecks = data.cardDecks;
    if (!mod?.id || !cardDecks) continue;
    if (moduleFilter && mod.id !== moduleFilter) continue;

    const modStats: RemediationStats = { summaryTextAdded: 0, templatesReplaced: 0, outcomesAdded: 0, diversityFixed: 0 };
    let fileModified = false;

    for (const deckKey of Object.keys(cardDecks)) {
      const deck = cardDecks[deckKey];
      if (!deck.cards) continue;

      for (let i = 0; i < deck.cards.length; i++) {
        totalCards++;
        const result = remediateCard(deck.cards[i]);
        if (result.modified) {
          deck.cards[i] = result.card;
          fileModified = true;
          totalModified++;
        }
        modStats.summaryTextAdded += result.stats.summaryTextAdded;
        modStats.templatesReplaced += result.stats.templatesReplaced;
        modStats.outcomesAdded += result.stats.outcomesAdded;
        modStats.diversityFixed += result.stats.diversityFixed;
      }
    }

    if (fileModified && !dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    }

    const changes = modStats.summaryTextAdded + modStats.templatesReplaced + modStats.outcomesAdded + modStats.diversityFixed;
    const symbol = changes > 0 ? '✓' : '·';
    console.log(`  ${symbol} ${(mod.name ?? mod.id).padEnd(40)} ${changes} fixes`);

    globalStats.summaryTextAdded += modStats.summaryTextAdded;
    globalStats.templatesReplaced += modStats.templatesReplaced;
    globalStats.outcomesAdded += modStats.outcomesAdded;
    globalStats.diversityFixed += modStats.diversityFixed;
    perModule.push({ moduleId: mod.id, moduleTitle: mod.name ?? mod.id, stats: modStats });
  }

  const report: RemediationReport = {
    generatedAt: new Date().toISOString(),
    dryRun,
    modulesProcessed: perModule.length,
    cardsProcessed: totalCards,
    stats: globalStats,
    perModule,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n─── Summary ───`);
  console.log(`  Cards processed:      ${totalCards}`);
  console.log(`  Cards modified:       ${totalModified}`);
  console.log(`  Summary texts added:  ${globalStats.summaryTextAdded}`);
  console.log(`  Templates replaced:   ${globalStats.templatesReplaced}`);
  console.log(`  Outcomes added:       ${globalStats.outcomesAdded}`);
  console.log(`  Diversity fixed:      ${globalStats.diversityFixed}`);
  console.log(`${dryRun ? '\n  ⚠ DRY RUN — no files modified. Remove --dry-run to apply.' : '\n  ✓ Changes written to shard files.'}`);
  console.log(`  Report: ${OUTPUT_PATH}`);
}

main();
