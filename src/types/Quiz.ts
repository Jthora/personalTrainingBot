/**
 * Quiz question types generated from training card data.
 */

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'term-match';

export interface QuizQuestion {
  /** Unique question ID. */
  id: string;
  /** Source card this question was generated from. */
  cardId: string;
  /** Question type determines rendering mode. */
  type: QuizQuestionType;
  /** The question text shown to the user. */
  prompt: string;
  /** Answer options (MC, TF, term-match pairs). */
  options?: string[];
  /** Index(es) of the correct option(s) within `options`. */
  correctIndex?: number;
  /** Exact correct answer text (fill-blank, TF). */
  correctAnswer: string;
  /** Progressive hints (from card exercises). */
  hints: string[];
  /** Human-readable source label (card title). */
  source: string;
  /** For term-match: pairs of [term, definition]. */
  matchPairs?: [string, string][];
}

export interface QuizAnswer {
  questionId: string;
  cardId: string;
  /** User's selected option index or typed answer. */
  answer: string;
  /** Whether the answer was correct. */
  correct: boolean;
  /** Time taken in ms. */
  timeTakenMs: number;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startedAt: string;
  completedAt?: string;
  /** Source context: deck ID, module ID, or 'due-review'. */
  sourceId: string;
  sourceType: 'deck' | 'module' | 'review';
}
