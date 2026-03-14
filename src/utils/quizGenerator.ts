/**
 * quizGenerator — Generates quiz questions from training card data.
 *
 * Leverages multiple card fields to create varied question types:
 *   - Multiple-choice from exercises[].prompt + expectedOutcome + distractors
 *   - True/false from bulletpoints (flip one fact)
 *   - Fill-blank from learningObjectives (mask key phrase)
 *   - Term-match from keyTerms + bulletpoints
 */

import type { Card } from '../types/Card';
import type { QuizQuestion } from '../types/Quiz';

let questionCounter = 0;
function nextId(cardId: string): string {
  return `q-${cardId}-${++questionCounter}`;
}

/** Reset counter (for testing). */
export function _resetCounter(): void {
  questionCounter = 0;
}

/* ── Helpers ── */

/** Shuffle array in-place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Extract key phrases from a text by finding capitalized or significant words. */
function extractKeyPhrase(text: string): string | null {
  // Look for quoted terms first
  const quoted = text.match(/"([^"]+)"|'([^']+)'/);
  if (quoted) return quoted[1] || quoted[2];

  // Look for the main noun phrase — take significant words after common verbs
  const afterVerb = text.match(
    /(?:understand|explain|apply|describe|evaluate|analyze|identify)\s+(?:the\s+)?(?:core\s+)?(?:principles?\s+of\s+)?(.{5,40})/i,
  );
  if (afterVerb) return afterVerb[1].replace(/[.,;:]+$/, '').trim();

  // Fallback: longest word over 5 chars
  const words = text.split(/\s+/).filter((w) => w.length > 5);
  return words.length > 0 ? words[Math.floor(words.length / 2)] : null;
}

/* ── Generators ── */

/**
 * Generate multiple-choice question from a card's exercise.
 * Uses expectedOutcome as correct answer + distractors from other cards.
 */
export function generateMCFromExercise(
  card: Card,
  distractorCards: Card[],
): QuizQuestion | null {
  const exercise = card.exercises?.find(
    (ex) => ex.expectedOutcome && ex.expectedOutcome.length > 10,
  );
  if (!exercise?.expectedOutcome) return null;

  const correct = exercise.expectedOutcome;

  // Build distractors from other cards' exercise outcomes
  const distractors = distractorCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.exercises?.find((e) => e.expectedOutcome)?.expectedOutcome)
    .filter((o): o is string => !!o && o !== correct && o.length > 10)
    .slice(0, 5);

  if (distractors.length < 2) {
    // Supplement with bulletpoints from other cards
    for (const c of distractorCards) {
      if (c.id === card.id) continue;
      for (const bp of c.bulletpoints ?? []) {
        if (bp.length > 10 && bp !== correct && !distractors.includes(bp)) {
          distractors.push(bp);
          if (distractors.length >= 3) break;
        }
      }
      if (distractors.length >= 3) break;
    }
  }

  if (distractors.length < 2) return null;

  const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)]);
  const correctIndex = options.indexOf(correct);

  return {
    id: nextId(card.id),
    cardId: card.id,
    type: 'multiple-choice',
    prompt: exercise.prompt,
    options,
    correctIndex,
    correctAnswer: correct,
    explanation: card.summaryText
      || `${card.description} Key points: ${(card.bulletpoints ?? []).slice(0, 2).join('; ')}.`,
    hints: exercise.hints ?? [],
    source: card.title,
  };
}

/**
 * Generate true/false question from a card's bulletpoints.
 * Picks one bulletpoint and either presents it as-is (true) or flips a word (false).
 */
export function generateTrueFalse(card: Card, allCards: Card[]): QuizQuestion | null {
  const bps = card.bulletpoints?.filter((bp) => bp.length > 8);
  if (!bps || bps.length === 0) return null;

  const bp = bps[Math.floor(Math.random() * bps.length)];
  const isTrue = Math.random() > 0.5;

  let statement = bp;
  if (!isTrue) {
    // Swap a key term with one from a different card
    const otherTerms = allCards
      .filter((c) => c.id !== card.id)
      .flatMap((c) => c.keyTerms ?? [])
      .filter((t) => t.length > 3 && !bp.toLowerCase().includes(t.toLowerCase()));

    if (otherTerms.length > 0) {
      const targetTerm = card.keyTerms?.find((t) => bp.toLowerCase().includes(t.toLowerCase()));
      if (targetTerm) {
        const replacement = otherTerms[Math.floor(Math.random() * otherTerms.length)];
        statement = bp.replace(new RegExp(targetTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), replacement);
      } else {
        // Can't make a good false statement — make it true instead
        statement = bp;
      }
    }
  }

  // If statement didn't change and we wanted false, default to isTrue
  const actualTruth = statement === bp;

  return {
    id: nextId(card.id),
    cardId: card.id,
    type: 'true-false',
    prompt: `True or false: "${statement}"`,
    options: ['True', 'False'],
    correctIndex: actualTruth ? 0 : 1,
    correctAnswer: actualTruth ? 'True' : 'False',
    explanation: `From "${card.title}": ${bp}`,
    hints: card.exercises?.[0]?.hints ?? [],
    source: card.title,
  };
}

/**
 * Generate fill-in-the-blank from learningObjectives.
 * Masks a key phrase and asks the user to fill it in.
 */
export function generateFillBlank(card: Card): QuizQuestion | null {
  const objectives = card.learningObjectives?.filter((obj) => obj.length > 20);
  if (!objectives || objectives.length === 0) return null;

  const obj = objectives[Math.floor(Math.random() * objectives.length)];
  const phrase = extractKeyPhrase(obj);
  if (!phrase || phrase.length < 3) return null;

  const blanked = obj.replace(phrase, '______');
  if (blanked === obj) return null; // phrase not found

  return {
    id: nextId(card.id),
    cardId: card.id,
    type: 'fill-blank',
    prompt: `Fill in the blank: "${blanked}"`,
    correctAnswer: phrase,
    explanation: card.summaryText || `The complete statement is: "${obj}"`,
    hints: card.exercises?.[0]?.hints ?? [],
    source: card.title,
  };
}

/**
 * Generate term-match question from keyTerms + bulletpoints.
 * Creates pairs of (term → bulletpoint containing that term).
 */
export function generateTermMatch(cards: Card[]): QuizQuestion | null {
  const pairs: [string, string][] = [];

  for (const card of cards) {
    if (!card.keyTerms || !card.bulletpoints) continue;
    for (const term of card.keyTerms) {
      const match = card.bulletpoints.find((bp) =>
        bp.toLowerCase().includes(term.toLowerCase()),
      );
      if (match) {
        pairs.push([term, match]);
      }
    }
    if (pairs.length >= 4) break;
  }

  if (pairs.length < 3) return null;

  const selected = shuffle(pairs).slice(0, 4);
  const sourceCard = cards.find((c) =>
    c.keyTerms?.includes(selected[0][0]),
  ) ?? cards[0];

  return {
    id: nextId(sourceCard.id),
    cardId: sourceCard.id,
    type: 'term-match',
    prompt: 'Match each term to its description:',
    correctAnswer: selected.map(([t, d]) => `${t}: ${d}`).join('; '),
    matchPairs: selected,
    explanation: 'Terms are matched to their descriptions from the training material.',
    hints: [],
    source: 'Multiple cards',
  };
}

/* ── Main entry point ── */

/**
 * Generate a set of quiz questions from an array of cards.
 * Tries multiple generators per card and shuffles the result.
 *
 * @param cards  Source cards for question generation.
 * @param maxQuestions  Maximum questions to return (default 10).
 */
export function generateQuiz(cards: Card[], maxQuestions = 10): QuizQuestion[] {
  if (cards.length === 0) return [];

  const questions: QuizQuestion[] = [];

  // Pass 1: MC from exercises
  for (const card of cards) {
    const mc = generateMCFromExercise(card, cards);
    if (mc) questions.push(mc);
  }

  // Pass 2: True/false from bulletpoints
  for (const card of cards) {
    const tf = generateTrueFalse(card, cards);
    if (tf) questions.push(tf);
  }

  // Pass 3: Fill-blank from learningObjectives
  for (const card of cards) {
    const fb = generateFillBlank(card);
    if (fb) questions.push(fb);
  }

  // Pass 4: Term-match (batch across cards)
  const tm = generateTermMatch(cards);
  if (tm) questions.push(tm);

  return shuffle(questions).slice(0, maxQuestions);
}
