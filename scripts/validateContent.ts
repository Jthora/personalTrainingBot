#!/usr/bin/env npx tsx
/**
 * validateContent.ts — Content quality validation across all training module shards.
 *
 * Reads every card from public/training_modules_shards/*.json, scores each card
 * 0-10 on the content quality rubric, and outputs a comprehensive report.
 *
 * Usage:   npx tsx scripts/validateContent.ts
 * Output:  artifacts/content-validation-report.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Card } from '../src/types/Card';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  scoreCard,
  detectTemplateExercises,
  validateKeyTerms,
  deriveSummaryText,
  type CardValidationResult,
} from '../src/utils/contentValidation';

// ─── Types ───────────────────────────────────────────────────────

interface ModuleData {
  id: string;
  title: string;
  decks: Array<{
    id: string;
    title: string;
    cards: Card[];
  }>;
}

interface ModuleReport {
  moduleId: string;
  moduleTitle: string;
  totalCards: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  cardsBelow6: number;
  totalIssues: number;
  totalWarnings: number;
  totalTemplates: number;
  totalFragmentTerms: number;
  deckReports: DeckReport[];
}

interface DeckReport {
  deckId: string;
  deckTitle: string;
  cardCount: number;
  avgScore: number;
  belowMinCards: boolean;
  cards: CardValidationResult[];
}

interface ContentValidationReport {
  generatedAt: string;
  totalModules: number;
  totalDecks: number;
  totalCards: number;
  overallAvgScore: number;
  cardsBelow6: number;
  totalIssues: number;
  totalWarnings: number;
  totalTemplates: number;
  modules: ModuleReport[];
  worstCards: Array<CardValidationResult & { moduleId: string; deckId: string }>;
}

// ─── Main ────────────────────────────────────────────────────────

const SHARD_DIR = path.resolve(__dirname, '../public/training_modules_shards');
const OUTPUT_PATH = path.resolve(__dirname, '../artifacts/content-validation-report.json');

function loadModules(): ModuleData[] {
  const files = fs.readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json'));
  const modules: ModuleData[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(SHARD_DIR, file), 'utf-8');
      const data = JSON.parse(raw);

      // Shard format: { module: { id, name }, cardDecks: { deckId: { id, name, cards } } }
      const mod = data.module;
      const cardDecks = data.cardDecks;
      if (!mod?.id || !cardDecks) continue;

      const decks = Object.values(cardDecks).map((deck: any) => ({
        id: deck.id ?? '',
        title: deck.name ?? '',
        cards: (deck.cards ?? []) as Card[],
      }));

      modules.push({ id: mod.id, title: mod.name ?? mod.id, decks });
    } catch (err) {
      console.error(`  ⚠ Failed to parse ${file}:`, (err as Error).message);
    }
  }

  return modules;
}

function validateModule(mod: ModuleData): ModuleReport {
  const deckReports: DeckReport[] = [];
  let totalIssues = 0;
  let totalWarnings = 0;
  let totalTemplates = 0;
  let totalFragmentTerms = 0;
  let allScores: number[] = [];

  for (const deck of mod.decks) {
    const cardResults: CardValidationResult[] = [];

    for (const card of deck.cards) {
      const result = scoreCard(card);
      cardResults.push(result);
      allScores.push(result.score);

      // Count templates
      const templates = detectTemplateExercises(card.exercises ?? []);
      totalTemplates += templates.length;

      // Count fragment terms
      const termIssues = validateKeyTerms(card.keyTerms ?? []);
      totalFragmentTerms += termIssues.filter((t) => t.reason === 'fragment').length;

      totalIssues += result.issues.length;
      totalWarnings += result.warnings.length;
    }

    const deckAvg = cardResults.length > 0
      ? cardResults.reduce((sum, r) => sum + r.score, 0) / cardResults.length
      : 0;

    deckReports.push({
      deckId: deck.id,
      deckTitle: deck.title,
      cardCount: deck.cards.length,
      avgScore: Math.round(deckAvg * 10) / 10,
      belowMinCards: deck.cards.length < 5,
      cards: cardResults,
    });
  }

  const avg = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;

  return {
    moduleId: mod.id,
    moduleTitle: mod.title,
    totalCards: allScores.length,
    avgScore: Math.round(avg * 10) / 10,
    minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
    maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
    cardsBelow6: allScores.filter((s) => s < 6).length,
    totalIssues,
    totalWarnings,
    totalTemplates,
    totalFragmentTerms,
    deckReports,
  };
}

function main() {
  console.log('🔍 Content Validation — Scanning training modules…\n');

  const modules = loadModules();
  console.log(`  Found ${modules.length} modules\n`);

  const moduleReports: ModuleReport[] = [];
  let grandTotalCards = 0;
  let grandTotalIssues = 0;
  let grandTotalWarnings = 0;
  let grandTotalTemplates = 0;
  let grandTotalDecks = 0;
  let allScores: number[] = [];
  const worstCards: Array<CardValidationResult & { moduleId: string; deckId: string }> = [];

  for (const mod of modules) {
    const report = validateModule(mod);
    moduleReports.push(report);

    grandTotalCards += report.totalCards;
    grandTotalIssues += report.totalIssues;
    grandTotalWarnings += report.totalWarnings;
    grandTotalTemplates += report.totalTemplates;
    grandTotalDecks += report.deckReports.length;

    // Collect worst cards
    for (const deck of report.deckReports) {
      for (const card of deck.cards) {
        allScores.push(card.score);
        if (card.score < 6) {
          worstCards.push({ ...card, moduleId: mod.id, deckId: deck.deckId });
        }
      }
    }

    const indicator = report.avgScore >= 6 ? '✓' : '✗';
    console.log(
      `  ${indicator} ${mod.title.padEnd(40)} ${report.totalCards} cards, avg ${report.avgScore}/10, ${report.cardsBelow6} below 6`,
    );
  }

  const overallAvg = allScores.length > 0
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : 0;

  // Sort worst cards by score ascending
  worstCards.sort((a, b) => a.score - b.score);

  const report: ContentValidationReport = {
    generatedAt: new Date().toISOString(),
    totalModules: modules.length,
    totalDecks: grandTotalDecks,
    totalCards: grandTotalCards,
    overallAvgScore: overallAvg,
    cardsBelow6: worstCards.length,
    totalIssues: grandTotalIssues,
    totalWarnings: grandTotalWarnings,
    totalTemplates: grandTotalTemplates,
    modules: moduleReports,
    worstCards: worstCards.slice(0, 50), // Top 50 worst
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n─── Summary ───`);
  console.log(`  Modules:     ${modules.length}`);
  console.log(`  Decks:       ${grandTotalDecks}`);
  console.log(`  Cards:       ${grandTotalCards}`);
  console.log(`  Avg Score:   ${overallAvg}/10`);
  console.log(`  Below 6/10:  ${worstCards.length} cards (${Math.round(worstCards.length / grandTotalCards * 100)}%)`);
  console.log(`  Issues:      ${grandTotalIssues}`);
  console.log(`  Warnings:    ${grandTotalWarnings}`);
  console.log(`  Templates:   ${grandTotalTemplates}`);
  console.log(`\n  Report: ${OUTPUT_PATH}`);

  // Exit with error if any cards are below threshold
  if (worstCards.length > 0) {
    process.exit(1);
  }
}

main();
