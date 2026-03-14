#!/usr/bin/env npx tsx
/**
 * quizQualityReport.ts — Quiz generation quality analysis across all training modules.
 *
 * Measures quiz generation yield, question type distribution, and quality
 * metrics per module and deck. Optionally consumes quiz session data
 * (from --sessions=<path>) to derive accuracy, timing, and retry metrics.
 *
 * Usage:
 *   npx tsx scripts/quizQualityReport.ts
 *   npx tsx scripts/quizQualityReport.ts --sessions=artifacts/quiz-sessions.json
 *   npx tsx scripts/quizQualityReport.ts --module=cybersecurity
 *
 * Output:  artifacts/quiz-quality-report.json
 *
 * Tasks covered: 109-113
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Card } from '../src/types/Card';
import type { QuizQuestion, QuizSession, QuizAnswer } from '../src/types/Quiz';
import {
  generateMCFromExercise,
  generateMCFromScenario,
  generateTrueFalse,
  generateFillBlank,
  generateTermMatch,
  _resetCounter,
} from '../src/utils/quizGenerator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

interface GeneratorYield {
  attempted: number;
  generated: number;
  yieldRate: number;
}

interface TypeDistribution {
  'multiple-choice': number;
  'true-false': number;
  'fill-blank': number;
  'term-match': number;
}

interface TFBias {
  trueCount: number;
  falseCount: number;
  total: number;
  truePct: number;
}

interface DeckQuizReport {
  deckId: string;
  deckTitle: string;
  cardCount: number;
  totalQuestions: number;
  questionsPerCard: number;
  generators: {
    mcExercise: GeneratorYield;
    mcScenario: GeneratorYield;
    trueFalse: GeneratorYield;
    fillBlank: GeneratorYield;
    termMatch: GeneratorYield;
  };
  typeDistribution: TypeDistribution;
  tfBias: TFBias;
}

interface AccuracyMetric {
  cardId: string;
  attempts: number;
  correct: number;
  accuracyPct: number;
}

interface TimingMetric {
  cardId: string;
  attempts: number;
  avgMs: number;
  medianMs: number;
  p90Ms: number;
}

interface DeckRetryMetric {
  deckId: string;
  sessionsAttempted: number;
  retries: number;
  retryRate: number;
}

interface SRIntervalBucket {
  range: string;
  count: number;
}

interface ModuleQuizReport {
  moduleId: string;
  moduleTitle: string;
  totalCards: number;
  totalQuestions: number;
  questionsPerCard: number;
  generators: {
    mcExercise: GeneratorYield;
    mcScenario: GeneratorYield;
    trueFalse: GeneratorYield;
    fillBlank: GeneratorYield;
    termMatch: GeneratorYield;
  };
  typeDistribution: TypeDistribution;
  tfBias: TFBias;
  deckReports: DeckQuizReport[];
  /** Task 110 — per-card accuracy (populated when --sessions provided). */
  accuracy?: AccuracyMetric[];
  /** Task 111 — per-card timing (populated when --sessions provided). */
  timing?: TimingMetric[];
  /** Task 112 — per-deck retry rate (populated when --sessions provided). */
  retryRate?: DeckRetryMetric[];
  /** Task 113 — SR interval distribution (populated when --sessions provided). */
  srIntervals?: SRIntervalBucket[];
}

interface QuizQualityReport {
  generatedAt: string;
  totalModules: number;
  totalDecks: number;
  totalCards: number;
  totalQuestions: number;
  questionsPerCard: number;
  generators: {
    mcExercise: GeneratorYield;
    mcScenario: GeneratorYield;
    trueFalse: GeneratorYield;
    fillBlank: GeneratorYield;
    termMatch: GeneratorYield;
  };
  typeDistribution: TypeDistribution;
  tfBias: TFBias;
  qualityThresholds: {
    minQuestionsPerCard: number;
    maxTfBiasPct: number;
    minTypeCount: number;
  };
  passesThresholds: boolean;
  modules: ModuleQuizReport[];
  /** Decks producing zero quiz questions. */
  zeroYieldDecks: Array<{ moduleId: string; deckId: string; deckTitle: string; cardCount: number }>;
  /** Session-derived metrics summary (populated when --sessions provided). */
  sessionMetrics?: {
    totalSessions: number;
    totalAnswers: number;
    overallAccuracyPct: number;
    avgTimeMsPerQuestion: number;
    overallRetryRate: number;
  };
}

// ─── Constants ───────────────────────────────────────────────────

const SHARD_DIR = path.resolve(__dirname, '../public/training_modules_shards');
const OUTPUT_PATH = path.resolve(__dirname, '../artifacts/quiz-quality-report.json');

/** Quality thresholds for pass/fail. */
const THRESHOLDS = {
  minQuestionsPerCard: 1.5,
  maxTfBiasPct: 70,
  minTypeCount: 3,
};

/** SR interval distribution buckets (days). */
const SR_BUCKETS: Array<{ range: string; min: number; max: number }> = [
  { range: '0-1', min: 0, max: 1 },
  { range: '2-3', min: 2, max: 3 },
  { range: '4-7', min: 4, max: 7 },
  { range: '8-14', min: 8, max: 14 },
  { range: '15-30', min: 15, max: 30 },
  { range: '31-60', min: 31, max: 60 },
  { range: '61-90', min: 61, max: 90 },
  { range: '91-180', min: 91, max: 180 },
  { range: '180+', min: 181, max: Infinity },
];

// ─── Shard Loader ────────────────────────────────────────────────

function loadModules(filterModuleId?: string): ModuleData[] {
  const files = fs.readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json'));
  const modules: ModuleData[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(SHARD_DIR, file), 'utf-8');
      const data = JSON.parse(raw);

      const mod = data.module;
      const cardDecks = data.cardDecks;
      if (!mod?.id || !cardDecks) continue;

      if (filterModuleId && mod.id !== filterModuleId) continue;

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

// ─── Quiz Generation Analysis ────────────────────────────────────

function emptyYield(): GeneratorYield {
  return { attempted: 0, generated: 0, yieldRate: 0 };
}

function emptyDistribution(): TypeDistribution {
  return { 'multiple-choice': 0, 'true-false': 0, 'fill-blank': 0, 'term-match': 0 };
}

function emptyTFBias(): TFBias {
  return { trueCount: 0, falseCount: 0, total: 0, truePct: 50 };
}

function mergeYield(a: GeneratorYield, b: GeneratorYield): GeneratorYield {
  const attempted = a.attempted + b.attempted;
  const generated = a.generated + b.generated;
  return { attempted, generated, yieldRate: attempted > 0 ? Math.round((generated / attempted) * 1000) / 10 : 0 };
}

function mergeDistribution(a: TypeDistribution, b: TypeDistribution): TypeDistribution {
  return {
    'multiple-choice': a['multiple-choice'] + b['multiple-choice'],
    'true-false': a['true-false'] + b['true-false'],
    'fill-blank': a['fill-blank'] + b['fill-blank'],
    'term-match': a['term-match'] + b['term-match'],
  };
}

function mergeTFBias(a: TFBias, b: TFBias): TFBias {
  const trueCount = a.trueCount + b.trueCount;
  const falseCount = a.falseCount + b.falseCount;
  const total = trueCount + falseCount;
  return { trueCount, falseCount, total, truePct: total > 0 ? Math.round((trueCount / total) * 1000) / 10 : 50 };
}

function analyzeDeck(cards: Card[], deckId: string, deckTitle: string): DeckQuizReport {
  // Reset question counter for each deck analysis to get clean results
  _resetCounter();

  const generators = {
    mcExercise: emptyYield(),
    mcScenario: emptyYield(),
    trueFalse: emptyYield(),
    fillBlank: emptyYield(),
    termMatch: emptyYield(),
  };
  const dist = emptyDistribution();
  const tfBias = emptyTFBias();
  const allQuestions: QuizQuestion[] = [];

  // MC from exercises
  for (const card of cards) {
    generators.mcExercise.attempted++;
    const q = generateMCFromExercise(card, cards);
    if (q) {
      generators.mcExercise.generated++;
      dist['multiple-choice']++;
      allQuestions.push(q);
    }
  }

  // MC from scenarios
  for (const card of cards) {
    generators.mcScenario.attempted++;
    const q = generateMCFromScenario(card);
    if (q) {
      generators.mcScenario.generated++;
      dist['multiple-choice']++;
      allQuestions.push(q);
    }
  }

  // True/false
  for (const card of cards) {
    generators.trueFalse.attempted++;
    const q = generateTrueFalse(card, cards);
    if (q) {
      generators.trueFalse.generated++;
      dist['true-false']++;
      allQuestions.push(q);

      // Track T/F bias
      if (q.correctIndex === 0) tfBias.trueCount++;
      else tfBias.falseCount++;
    }
  }
  tfBias.total = tfBias.trueCount + tfBias.falseCount;
  tfBias.truePct = tfBias.total > 0 ? Math.round((tfBias.trueCount / tfBias.total) * 1000) / 10 : 50;

  // Fill-blank
  for (const card of cards) {
    generators.fillBlank.attempted++;
    const q = generateFillBlank(card);
    if (q) {
      generators.fillBlank.generated++;
      dist['fill-blank']++;
      allQuestions.push(q);
    }
  }

  // Term-match (batch — 1 attempt per deck)
  generators.termMatch.attempted = 1;
  const tm = generateTermMatch(cards);
  if (tm) {
    generators.termMatch.generated = 1;
    dist['term-match']++;
    allQuestions.push(tm);
  }

  // Compute yield rates
  for (const gen of Object.values(generators)) {
    gen.yieldRate = gen.attempted > 0
      ? Math.round((gen.generated / gen.attempted) * 1000) / 10
      : 0;
  }

  return {
    deckId,
    deckTitle,
    cardCount: cards.length,
    totalQuestions: allQuestions.length,
    questionsPerCard: cards.length > 0
      ? Math.round((allQuestions.length / cards.length) * 100) / 100
      : 0,
    generators,
    typeDistribution: dist,
    tfBias,
  };
}

function analyzeModule(mod: ModuleData): ModuleQuizReport {
  const deckReports: DeckQuizReport[] = [];

  for (const deck of mod.decks) {
    deckReports.push(analyzeDeck(deck.cards, deck.id, deck.title));
  }

  // Aggregate across decks
  let generators = {
    mcExercise: emptyYield(),
    mcScenario: emptyYield(),
    trueFalse: emptyYield(),
    fillBlank: emptyYield(),
    termMatch: emptyYield(),
  };
  let dist = emptyDistribution();
  let tfBias = emptyTFBias();
  let totalCards = 0;
  let totalQuestions = 0;

  for (const dr of deckReports) {
    generators.mcExercise = mergeYield(generators.mcExercise, dr.generators.mcExercise);
    generators.mcScenario = mergeYield(generators.mcScenario, dr.generators.mcScenario);
    generators.trueFalse = mergeYield(generators.trueFalse, dr.generators.trueFalse);
    generators.fillBlank = mergeYield(generators.fillBlank, dr.generators.fillBlank);
    generators.termMatch = mergeYield(generators.termMatch, dr.generators.termMatch);
    dist = mergeDistribution(dist, dr.typeDistribution);
    tfBias = mergeTFBias(tfBias, dr.tfBias);
    totalCards += dr.cardCount;
    totalQuestions += dr.totalQuestions;
  }

  return {
    moduleId: mod.id,
    moduleTitle: mod.title,
    totalCards,
    totalQuestions,
    questionsPerCard: totalCards > 0 ? Math.round((totalQuestions / totalCards) * 100) / 100 : 0,
    generators,
    typeDistribution: dist,
    tfBias,
    deckReports,
  };
}

// ─── Session-Derived Metrics (Tasks 110-113) ─────────────────────

function loadSessions(sessionsPath: string): QuizSession[] {
  try {
    const raw = fs.readFileSync(sessionsPath, 'utf-8');
    return JSON.parse(raw) as QuizSession[];
  } catch (err) {
    console.error(`  ⚠ Failed to load sessions from ${sessionsPath}:`, (err as Error).message);
    return [];
  }
}

/**
 * Task 110 — Derive per-card accuracy rate from quiz answers.
 */
function deriveAccuracy(sessions: QuizSession[]): Map<string, AccuracyMetric> {
  const cardMap = new Map<string, { attempts: number; correct: number }>();

  for (const session of sessions) {
    for (const answer of session.answers) {
      const entry = cardMap.get(answer.cardId) ?? { attempts: 0, correct: 0 };
      entry.attempts++;
      if (answer.correct) entry.correct++;
      cardMap.set(answer.cardId, entry);
    }
  }

  const result = new Map<string, AccuracyMetric>();
  for (const [cardId, data] of cardMap) {
    result.set(cardId, {
      cardId,
      attempts: data.attempts,
      correct: data.correct,
      accuracyPct: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 1000) / 10 : 0,
    });
  }
  return result;
}

/**
 * Task 111 — Derive time-per-question per card from quiz answers.
 */
function deriveTiming(sessions: QuizSession[]): Map<string, TimingMetric> {
  const cardTimes = new Map<string, number[]>();

  for (const session of sessions) {
    for (const answer of session.answers) {
      const times = cardTimes.get(answer.cardId) ?? [];
      times.push(answer.timeTakenMs);
      cardTimes.set(answer.cardId, times);
    }
  }

  const result = new Map<string, TimingMetric>();
  for (const [cardId, times] of cardTimes) {
    const sorted = [...times].sort((a, b) => a - b);
    const avg = Math.round(sorted.reduce((s, t) => s + t, 0) / sorted.length);
    const median = sorted[Math.floor(sorted.length / 2)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    result.set(cardId, { cardId, attempts: sorted.length, avgMs: avg, medianMs: median, p90Ms: p90 });
  }
  return result;
}

/**
 * Task 112 — Derive retry rate per deck from quiz sessions.
 * A "retry" occurs when a user starts ≥2 sessions for the same sourceId (deck).
 */
function deriveRetryRate(sessions: QuizSession[]): Map<string, DeckRetryMetric> {
  const deckSessions = new Map<string, number>();

  for (const session of sessions) {
    if (session.sourceType !== 'deck') continue;
    deckSessions.set(session.sourceId, (deckSessions.get(session.sourceId) ?? 0) + 1);
  }

  const result = new Map<string, DeckRetryMetric>();
  for (const [deckId, count] of deckSessions) {
    const retries = Math.max(0, count - 1);
    result.set(deckId, {
      deckId,
      sessionsAttempted: count,
      retries,
      retryRate: count > 0 ? Math.round((retries / count) * 1000) / 10 : 0,
    });
  }
  return result;
}

/**
 * Task 113 — Derive SR interval distribution per module.
 * Reads CardProgressEntry data from a JSON dump.
 */
interface CardProgressDump {
  cardId: string;
  moduleId: string;
  interval: number;
}

function deriveSRIntervals(
  progressPath: string,
  moduleId: string,
): SRIntervalBucket[] {
  try {
    const raw = fs.readFileSync(progressPath, 'utf-8');
    const entries = JSON.parse(raw) as CardProgressDump[];
    const moduleEntries = entries.filter((e) => e.moduleId === moduleId);

    return SR_BUCKETS.map((bucket) => ({
      range: bucket.range,
      count: moduleEntries.filter((e) => e.interval >= bucket.min && e.interval <= bucket.max).length,
    }));
  } catch {
    return SR_BUCKETS.map((bucket) => ({ range: bucket.range, count: 0 }));
  }
}

// ─── CLI & Main ──────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let moduleFilter: string | undefined;
  let sessionsPath: string | undefined;
  let progressPath: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--module=')) moduleFilter = arg.split('=')[1];
    if (arg.startsWith('--sessions=')) sessionsPath = arg.split('=')[1];
    if (arg.startsWith('--progress=')) progressPath = arg.split('=')[1];
  }

  return { moduleFilter, sessionsPath, progressPath };
}

function main() {
  const { moduleFilter, sessionsPath, progressPath } = parseArgs();

  console.log('📊 Quiz Quality Report — Analyzing quiz generation yield…\n');

  const modules = loadModules(moduleFilter);
  console.log(`  Found ${modules.length} module${modules.length !== 1 ? 's' : ''}\n`);

  // Load optional session data
  const sessions = sessionsPath ? loadSessions(sessionsPath) : [];
  if (sessionsPath) {
    console.log(`  Loaded ${sessions.length} quiz sessions from ${sessionsPath}\n`);
  }

  // Derive session metrics
  const accuracyMap = sessions.length > 0 ? deriveAccuracy(sessions) : null;
  const timingMap = sessions.length > 0 ? deriveTiming(sessions) : null;
  const retryMap = sessions.length > 0 ? deriveRetryRate(sessions) : null;

  // Analyze each module
  const moduleReports: ModuleQuizReport[] = [];
  const zeroYieldDecks: QuizQualityReport['zeroYieldDecks'] = [];

  let grandGenerators = {
    mcExercise: emptyYield(),
    mcScenario: emptyYield(),
    trueFalse: emptyYield(),
    fillBlank: emptyYield(),
    termMatch: emptyYield(),
  };
  let grandDist = emptyDistribution();
  let grandTFBias = emptyTFBias();
  let grandTotalCards = 0;
  let grandTotalQuestions = 0;
  let grandTotalDecks = 0;

  for (const mod of modules) {
    const report = analyzeModule(mod);

    // Attach session-derived metrics if available
    if (accuracyMap) {
      const moduleCardIds = mod.decks.flatMap((d) => d.cards.map((c) => c.id));
      report.accuracy = moduleCardIds
        .map((id) => accuracyMap.get(id))
        .filter((m): m is AccuracyMetric => !!m);
    }
    if (timingMap) {
      const moduleCardIds = mod.decks.flatMap((d) => d.cards.map((c) => c.id));
      report.timing = moduleCardIds
        .map((id) => timingMap.get(id))
        .filter((m): m is TimingMetric => !!m);
    }
    if (retryMap) {
      report.retryRate = mod.decks
        .map((d) => retryMap.get(d.id))
        .filter((m): m is DeckRetryMetric => !!m);
    }
    if (progressPath) {
      report.srIntervals = deriveSRIntervals(progressPath, mod.id);
    }

    moduleReports.push(report);

    // Track zero-yield decks
    for (const dr of report.deckReports) {
      if (dr.totalQuestions === 0 && dr.cardCount > 0) {
        zeroYieldDecks.push({
          moduleId: mod.id,
          deckId: dr.deckId,
          deckTitle: dr.deckTitle,
          cardCount: dr.cardCount,
        });
      }
    }

    // Aggregate
    grandGenerators.mcExercise = mergeYield(grandGenerators.mcExercise, report.generators.mcExercise);
    grandGenerators.mcScenario = mergeYield(grandGenerators.mcScenario, report.generators.mcScenario);
    grandGenerators.trueFalse = mergeYield(grandGenerators.trueFalse, report.generators.trueFalse);
    grandGenerators.fillBlank = mergeYield(grandGenerators.fillBlank, report.generators.fillBlank);
    grandGenerators.termMatch = mergeYield(grandGenerators.termMatch, report.generators.termMatch);
    grandDist = mergeDistribution(grandDist, report.typeDistribution);
    grandTFBias = mergeTFBias(grandTFBias, report.tfBias);
    grandTotalCards += report.totalCards;
    grandTotalQuestions += report.totalQuestions;
    grandTotalDecks += report.deckReports.length;

    const indicator = report.questionsPerCard >= THRESHOLDS.minQuestionsPerCard ? '✓' : '✗';
    console.log(
      `  ${indicator} ${mod.title.padEnd(40)} ${report.totalCards} cards → ${report.totalQuestions} Qs (${report.questionsPerCard}/card)`,
    );
  }

  // Count distinct types with > 0 questions
  const typeCount = Object.values(grandDist).filter((n) => n > 0).length;
  const questionsPerCard = grandTotalCards > 0
    ? Math.round((grandTotalQuestions / grandTotalCards) * 100) / 100
    : 0;

  const passesThresholds =
    questionsPerCard >= THRESHOLDS.minQuestionsPerCard &&
    grandTFBias.truePct <= THRESHOLDS.maxTfBiasPct &&
    typeCount >= THRESHOLDS.minTypeCount;

  // Build session summary
  let sessionMetrics: QuizQualityReport['sessionMetrics'];
  if (sessions.length > 0) {
    const allAnswers = sessions.flatMap((s) => s.answers);
    const totalCorrect = allAnswers.filter((a) => a.correct).length;
    const totalTime = allAnswers.reduce((s, a) => s + a.timeTakenMs, 0);

    const allRetries = retryMap ? Array.from(retryMap.values()) : [];
    const totalRetries = allRetries.reduce((s, r) => s.retries + r.retries, { retries: 0 } as any);

    sessionMetrics = {
      totalSessions: sessions.length,
      totalAnswers: allAnswers.length,
      overallAccuracyPct: allAnswers.length > 0
        ? Math.round((totalCorrect / allAnswers.length) * 1000) / 10
        : 0,
      avgTimeMsPerQuestion: allAnswers.length > 0
        ? Math.round(totalTime / allAnswers.length)
        : 0,
      overallRetryRate: allRetries.length > 0
        ? Math.round((totalRetries / allRetries.reduce((s, r) => s + r.sessionsAttempted, 0)) * 1000) / 10
        : 0,
    };
  }

  const report: QuizQualityReport = {
    generatedAt: new Date().toISOString(),
    totalModules: modules.length,
    totalDecks: grandTotalDecks,
    totalCards: grandTotalCards,
    totalQuestions: grandTotalQuestions,
    questionsPerCard,
    generators: grandGenerators,
    typeDistribution: grandDist,
    tfBias: grandTFBias,
    qualityThresholds: THRESHOLDS,
    passesThresholds,
    modules: moduleReports,
    zeroYieldDecks,
    ...(sessionMetrics ? { sessionMetrics } : {}),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n─── Summary ───`);
  console.log(`  Modules:          ${modules.length}`);
  console.log(`  Decks:            ${grandTotalDecks}`);
  console.log(`  Cards:            ${grandTotalCards}`);
  console.log(`  Quiz Questions:   ${grandTotalQuestions}`);
  console.log(`  Qs/Card:          ${questionsPerCard}`);
  console.log(`  T/F Bias:         ${grandTFBias.truePct}% true`);
  console.log(`  Type Coverage:    ${typeCount}/${Object.keys(grandDist).length} types`);
  console.log(`  Zero-Yield Decks: ${zeroYieldDecks.length}`);
  if (sessionMetrics) {
    console.log(`  Sessions:         ${sessionMetrics.totalSessions}`);
    console.log(`  Accuracy:         ${sessionMetrics.overallAccuracyPct}%`);
    console.log(`  Avg Time/Q:       ${sessionMetrics.avgTimeMsPerQuestion}ms`);
    console.log(`  Retry Rate:       ${sessionMetrics.overallRetryRate}%`);
  }
  console.log(`  Passes:           ${passesThresholds ? '✓ YES' : '✗ NO'}`);
  console.log(`\n  Report: ${OUTPUT_PATH}`);

  if (!passesThresholds) {
    console.log(`\n  ⚠ Quality thresholds not met:`);
    if (questionsPerCard < THRESHOLDS.minQuestionsPerCard) {
      console.log(`    - Questions/card ${questionsPerCard} < ${THRESHOLDS.minQuestionsPerCard}`);
    }
    if (grandTFBias.truePct > THRESHOLDS.maxTfBiasPct) {
      console.log(`    - T/F bias ${grandTFBias.truePct}% > ${THRESHOLDS.maxTfBiasPct}%`);
    }
    if (typeCount < THRESHOLDS.minTypeCount) {
      console.log(`    - Type coverage ${typeCount} < ${THRESHOLDS.minTypeCount}`);
    }
    process.exit(1);
  }
}

main();
