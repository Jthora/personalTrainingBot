/**
 * contentValidation.ts — Validation utilities for training card content quality.
 *
 * Provides functions to detect low-quality content:
 *   - Key term fragments (2-word or too-short terms)
 *   - Missing or weak summary text
 *   - Template exercise detection
 */

import type { Card, Exercise } from '../types/Card';

// ─── Key Term Validation ─────────────────────────────────────────

/** Common generic terms that don't add learning value. */
const GENERIC_TERMS = new Set([
  'overview', 'basics', 'introduction', 'fundamentals', 'concepts',
  'techniques', 'methods', 'tools', 'principles', 'strategies',
  'best practices', 'key points', 'summary', 'analysis', 'review',
]);

export interface KeyTermIssue {
  term: string;
  reason: 'too-short' | 'fragment' | 'generic' | 'duplicate';
}

/**
 * Validate key terms on a card. Returns issues found.
 *
 * Rules:
 *   - Terms with ≤ 2 words AND ≤ 8 chars are "fragments"
 *   - Terms matching GENERIC_TERMS are "generic"
 *   - Terms < 3 chars are "too-short"
 *   - Duplicate terms (case-insensitive) are "duplicate"
 */
export function validateKeyTerms(terms: string[]): KeyTermIssue[] {
  const issues: KeyTermIssue[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    const normalized = term.trim().toLowerCase();

    if (normalized.length < 3) {
      issues.push({ term, reason: 'too-short' });
      continue;
    }

    if (seen.has(normalized)) {
      issues.push({ term, reason: 'duplicate' });
      continue;
    }
    seen.add(normalized);

    const wordCount = normalized.split(/\s+/).length;
    if (wordCount <= 2 && normalized.length <= 8) {
      issues.push({ term, reason: 'fragment' });
      continue;
    }

    if (GENERIC_TERMS.has(normalized)) {
      issues.push({ term, reason: 'generic' });
    }
  }

  return issues;
}

// ─── Summary Text Derivation ─────────────────────────────────────

/**
 * Auto-derive a summary text from card fields when summaryText is missing.
 *
 * Strategy: description + first bulletpoint, truncated to 280 chars.
 * Returns null if insufficient source material.
 */
export function deriveSummaryText(card: Pick<Card, 'description' | 'bulletpoints' | 'summaryText'>): string | null {
  if (card.summaryText && card.summaryText.length >= 50) return card.summaryText;

  const desc = card.description?.trim();
  if (!desc || desc.length < 10) return null;

  const firstBp = card.bulletpoints?.[0]?.trim();
  const raw = firstBp
    ? `${desc} ${firstBp}`
    : desc;

  // Trim to 280 chars at a sentence or word boundary
  if (raw.length <= 280) return raw;
  const truncated = raw.slice(0, 280);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > 140) return truncated.slice(0, lastPeriod + 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 100 ? truncated.slice(0, lastSpace) + '…' : truncated + '…';
}

// ─── Template Detection ──────────────────────────────────────────

/** Known exercise template patterns that indicate placeholder content. */
const TEMPLATE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'recall_template', pattern: /^(list|name|identify|state)\s+(the\s+)?(key|main|primary|core)\s+(points?|concepts?|principles?|elements?|factors?)/i },
  { name: 'apply_template', pattern: /^apply\s+(the\s+)?(key|main|core|primary)\s+(concepts?|principles?|techniques?)\s+(to|in)/i },
  { name: 'analyze_template', pattern: /^(analyze|examine|evaluate)\s+(the\s+)?(key|main|core)\s+(aspects?|factors?|elements?|components?)/i },
  { name: 'selfcheck_template', pattern: /^(check|verify|confirm)\s+(your\s+)?understanding\s+of/i },
  { name: 'bloom_understand', pattern: /^(explain|describe|summarize)\s+(the\s+)?(concept|importance|significance)\s+of/i },
  { name: 'bloom_apply', pattern: /^(demonstrate|show|illustrate)\s+how\s+(to\s+)?(apply|use|implement)/i },
  { name: 'bloom_evaluate', pattern: /^(evaluate|assess|judge)\s+(the\s+)?(effectiveness|quality|impact)\s+of/i },
  { name: 'vague_outcome', pattern: /^(good|thorough|clear|solid|deep)\s+understanding\s+of/i },
];

export interface TemplateMatch {
  exerciseIndex: number;
  exerciseType: Exercise['type'];
  field: 'prompt' | 'expectedOutcome';
  patternName: string;
  text: string;
}

/**
 * Detect templated/placeholder exercises on a card.
 * Returns matches for prompts and expectedOutcomes that match known template patterns.
 */
export function detectTemplateExercises(exercises: Exercise[]): TemplateMatch[] {
  const matches: TemplateMatch[] = [];

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];

    for (const { name, pattern } of TEMPLATE_PATTERNS) {
      if (pattern.test(ex.prompt)) {
        matches.push({
          exerciseIndex: i,
          exerciseType: ex.type,
          field: 'prompt',
          patternName: name,
          text: ex.prompt.slice(0, 80),
        });
      }
      if (ex.expectedOutcome && pattern.test(ex.expectedOutcome)) {
        matches.push({
          exerciseIndex: i,
          exerciseType: ex.type,
          field: 'expectedOutcome',
          patternName: name,
          text: ex.expectedOutcome.slice(0, 80),
        });
      }
    }
  }

  return matches;
}

// ─── Card Scoring Rubric ─────────────────────────────────────────

export interface CardValidationResult {
  cardId: string;
  score: number;  // 0-10
  issues: string[];
  warnings: string[];
}

/**
 * Score a card's content quality on a 0-10 rubric.
 *
 * Deductions:
 *   - description < 2 sentences → −2
 *   - bulletpoints < 4 → −1
 *   - any bulletpoint < 15 words → −0.5 each (max −2)
 *   - bulletpoint is substring of title → −1
 *   - exercises < 2 → −1
 *   - templated exercise detected → −1 each (max −3)
 *   - expectedOutcome < 50 chars → −0.5 each (max −2)
 *   - < 2 exercise types → −1
 *   - keyTerms < 3 → −1
 *   - key term is fragment → −0.5 each (max −1)
 *   - learningObjectives < 3 → −1
 *   - learningObjective doesn't start with action verb → −0.5 each (max −1)
 *   - summaryText missing or < 140 chars → −1
 *   - < 5 cards in containing deck → context-only warning
 */
export function scoreCard(card: Card): CardValidationResult {
  let score = 10;
  const issues: string[] = [];
  const warnings: string[] = [];

  // Description depth
  const sentences = card.description.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  if (sentences.length < 2) {
    score -= 2;
    issues.push(`Description has ${sentences.length} sentence(s), need ≥ 2`);
  }

  // Bulletpoints count
  const bps = card.bulletpoints ?? [];
  if (bps.length < 4) {
    score -= 1;
    issues.push(`${bps.length} bulletpoint(s), need ≥ 4`);
  }

  // Bulletpoint depth
  let shortBpCount = 0;
  for (const bp of bps) {
    if (bp.split(/\s+/).length < 15) {
      shortBpCount++;
      if (shortBpCount <= 4) warnings.push(`Short bulletpoint (< 15 words): "${bp.slice(0, 60)}…"`);
    }
    // Title substring check
    if (card.title && bp.toLowerCase().trim() === card.title.toLowerCase().trim()) {
      score -= 1;
      issues.push(`Bulletpoint is identical to card title`);
    }
  }
  score -= Math.min(2, shortBpCount * 0.5);

  // Exercises
  const exercises = card.exercises ?? [];
  if (exercises.length < 2) {
    score -= 1;
    issues.push(`${exercises.length} exercise(s), need ≥ 2`);
  }

  // Template detection
  const templates = detectTemplateExercises(exercises);
  if (templates.length > 0) {
    const deduction = Math.min(3, templates.length);
    score -= deduction;
    for (const t of templates) {
      issues.push(`Templated ${t.field} in exercise[${t.exerciseIndex}]: ${t.patternName}`);
    }
  }

  // Expected outcome depth
  let shortOutcomeCount = 0;
  for (const ex of exercises) {
    if (ex.expectedOutcome && ex.expectedOutcome.length < 50) {
      shortOutcomeCount++;
    }
  }
  score -= Math.min(2, shortOutcomeCount * 0.5);
  if (shortOutcomeCount > 0) {
    warnings.push(`${shortOutcomeCount} exercise(s) with expectedOutcome < 50 chars`);
  }

  // Exercise type diversity
  const types = new Set(exercises.map((ex) => ex.type));
  if (types.size < 2 && exercises.length >= 2) {
    score -= 1;
    issues.push(`Only ${types.size} exercise type(s), need ≥ 2 for diversity`);
  }

  // Key terms
  const keyTerms = card.keyTerms ?? [];
  if (keyTerms.length < 3) {
    score -= 1;
    issues.push(`${keyTerms.length} key term(s), need ≥ 3`);
  }
  const termIssues = validateKeyTerms(keyTerms);
  const fragmentCount = termIssues.filter((t) => t.reason === 'fragment' || t.reason === 'generic').length;
  score -= Math.min(1, fragmentCount * 0.5);

  // Learning objectives
  const objectives = card.learningObjectives ?? [];
  if (objectives.length < 3) {
    score -= 1;
    issues.push(`${objectives.length} learning objective(s), need ≥ 3`);
  }
  // Action verb check
  const ACTION_VERBS = /^(identify|explain|apply|analyze|evaluate|create|describe|compare|contrast|demonstrate|design|implement|assess|list|define|classify|interpret|predict|justify|construct|develop|formulate|synthesize|calculate|solve)/i;
  let nonActionCount = 0;
  for (const obj of objectives) {
    if (!ACTION_VERBS.test(obj.trim())) {
      nonActionCount++;
    }
  }
  score -= Math.min(1, nonActionCount * 0.5);
  if (nonActionCount > 0) {
    warnings.push(`${nonActionCount} objective(s) don't start with a measurable action verb`);
  }

  // Summary text
  if (!card.summaryText || card.summaryText.length < 140) {
    score -= 1;
    issues.push(`summaryText ${card.summaryText ? `is ${card.summaryText.length} chars` : 'is missing'}, need 140-280 chars`);
  } else if (card.summaryText.length > 280) {
    warnings.push(`summaryText is ${card.summaryText.length} chars, recommended ≤ 280`);
  }

  return {
    cardId: card.id,
    score: Math.max(0, Math.round(score * 10) / 10),
    issues,
    warnings,
  };
}
