#!/usr/bin/env npx tsx
/**
 * detectTemplates.ts — Detect templated/placeholder exercises across all modules.
 *
 * Scans every exercise in every card across all training module shards and reports
 * exercises that match known template patterns indicating placeholder content.
 *
 * Usage:   npx tsx scripts/detectTemplates.ts
 * Output:  stdout summary + artifacts/template-detection-report.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Card } from '../src/types/Card';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { detectTemplateExercises, type TemplateMatch } from '../src/utils/contentValidation';

interface ModuleData {
  id: string;
  title: string;
  decks: Array<{
    id: string;
    title: string;
    cards: Card[];
  }>;
}

interface ModuleTemplateReport {
  moduleId: string;
  moduleTitle: string;
  totalExercises: number;
  templatedExercises: number;
  byType: Record<string, number>;
  byPattern: Record<string, number>;
  matches: Array<TemplateMatch & { cardId: string; deckId: string }>;
}

interface TemplateDetectionReport {
  generatedAt: string;
  totalModules: number;
  totalExercises: number;
  totalTemplated: number;
  templatePct: number;
  byPattern: Record<string, number>;
  estimatedRemediationHours: number;
  modules: ModuleTemplateReport[];
}

const SHARD_DIR = path.resolve(__dirname, '../public/training_modules_shards');
const OUTPUT_PATH = path.resolve(__dirname, '../artifacts/template-detection-report.json');

// Estimate: ~20 min per exercise to write proper domain-specific content
const MINUTES_PER_EXERCISE = 20;

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

function main() {
  console.log('🔍 Template Detection — Scanning exercises…\n');

  const modules = loadModules();
  const moduleReports: ModuleTemplateReport[] = [];
  const globalByPattern: Record<string, number> = {};
  let grandTotalExercises = 0;
  let grandTotalTemplated = 0;

  for (const mod of modules) {
    const modReport: ModuleTemplateReport = {
      moduleId: mod.id,
      moduleTitle: mod.title,
      totalExercises: 0,
      templatedExercises: 0,
      byType: {},
      byPattern: {},
      matches: [],
    };

    for (const deck of mod.decks) {
      for (const card of deck.cards) {
        const exercises = card.exercises ?? [];
        modReport.totalExercises += exercises.length;

        const matches = detectTemplateExercises(exercises);
        modReport.templatedExercises += matches.length;

        for (const m of matches) {
          modReport.byType[m.exerciseType] = (modReport.byType[m.exerciseType] || 0) + 1;
          modReport.byPattern[m.patternName] = (modReport.byPattern[m.patternName] || 0) + 1;
          globalByPattern[m.patternName] = (globalByPattern[m.patternName] || 0) + 1;
          modReport.matches.push({ ...m, cardId: card.id, deckId: deck.id });
        }
      }
    }

    grandTotalExercises += modReport.totalExercises;
    grandTotalTemplated += modReport.templatedExercises;
    moduleReports.push(modReport);

    if (modReport.templatedExercises > 0) {
      console.log(
        `  ✗ ${mod.title.padEnd(40)} ${modReport.templatedExercises}/${modReport.totalExercises} templated`,
      );
    } else {
      console.log(
        `  ✓ ${mod.title.padEnd(40)} ${modReport.totalExercises} exercises, 0 templated`,
      );
    }
  }

  const templatePct = grandTotalExercises > 0
    ? Math.round((grandTotalTemplated / grandTotalExercises) * 1000) / 10
    : 0;

  const estimatedHours = Math.round((grandTotalTemplated * MINUTES_PER_EXERCISE) / 60 * 10) / 10;

  const report: TemplateDetectionReport = {
    generatedAt: new Date().toISOString(),
    totalModules: modules.length,
    totalExercises: grandTotalExercises,
    totalTemplated: grandTotalTemplated,
    templatePct,
    byPattern: globalByPattern,
    estimatedRemediationHours: estimatedHours,
    modules: moduleReports,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n─── Summary ───`);
  console.log(`  Total exercises:  ${grandTotalExercises}`);
  console.log(`  Templated:        ${grandTotalTemplated} (${templatePct}%)`);
  console.log(`  By pattern:`);
  for (const [pattern, count] of Object.entries(globalByPattern).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${pattern.padEnd(25)} ${count}`);
  }
  console.log(`  Remediation est:  ${estimatedHours} hours`);
  console.log(`\n  Report: ${OUTPUT_PATH}`);
}

main();
