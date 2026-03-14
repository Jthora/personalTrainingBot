/**
 * QuizSessionStore — persists completed quiz sessions for review and analytics.
 *
 * Stores full question + answer data per session, enabling:
 *   - Quiz history review
 *   - "Retry wrong questions" flow
 *   - Per-card accuracy/timing analytics
 *   - Quiz session comparison over time
 *
 * Stored in localStorage as a capped rolling array (most-recent-first, 50 max).
 */

import { createStore } from './createStore';
import type { QuizQuestion, QuizAnswer, QuizSession } from '../types/Quiz';

const MAX_SESSIONS = 50;

const store = createStore<QuizSession[]>({
  key: 'ptb:quiz-sessions:v1',
  defaultValue: [],
  validate: (raw) => (Array.isArray(raw) ? (raw as QuizSession[]) : null),
  maxEntries: MAX_SESSIONS,
});

// Stateless listener bridge
type StatelessListener = () => void;
const statelessListeners = new Set<StatelessListener>();
let version = 0;

store.subscribe(() => {
  version += 1;
  statelessListeners.forEach((fn) => fn());
});

const QuizSessionStore = {
  /** Return all sessions, most-recent-first. */
  list(): QuizSession[] {
    return store.get();
  },

  /** Total number of recorded sessions. */
  count(): number {
    return store.get().length;
  },

  /** Get a specific session by ID. */
  get(sessionId: string): QuizSession | null {
    return store.get().find((s) => s.id === sessionId) ?? null;
  },

  /** Get sessions for a specific source (deck/module). */
  listBySource(sourceId: string): QuizSession[] {
    return store.get().filter((s) => s.sourceId === sourceId);
  },

  /**
   * Record a completed quiz session.
   * @returns The full session object with generated ID.
   */
  record(params: {
    questions: QuizQuestion[];
    answers: QuizAnswer[];
    sourceId: string;
    sourceType: 'deck' | 'module' | 'review';
    startedAt: string;
  }): QuizSession {
    const session: QuizSession = {
      id: `qs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      questions: params.questions,
      answers: params.answers,
      startedAt: params.startedAt,
      completedAt: new Date().toISOString(),
      sourceId: params.sourceId,
      sourceType: params.sourceType,
    };

    store.update((prev) => [session, ...prev]);
    return session;
  },

  /**
   * Get wrong questions from a session (for retry flow).
   */
  getWrongQuestions(sessionId: string): QuizQuestion[] {
    const session = QuizSessionStore.get(sessionId);
    if (!session) return [];

    const wrongCardIds = new Set(
      session.answers.filter((a) => !a.correct).map((a) => a.questionId),
    );

    return session.questions.filter((q) => wrongCardIds.has(q.id));
  },

  /**
   * Per-card accuracy across all sessions.
   */
  cardAccuracy(): Map<string, { attempts: number; correct: number; pct: number }> {
    const map = new Map<string, { attempts: number; correct: number; pct: number }>();
    for (const session of store.get()) {
      for (const answer of session.answers) {
        const entry = map.get(answer.cardId) ?? { attempts: 0, correct: 0, pct: 0 };
        entry.attempts++;
        if (answer.correct) entry.correct++;
        entry.pct = Math.round((entry.correct / entry.attempts) * 100);
        map.set(answer.cardId, entry);
      }
    }
    return map;
  },

  /**
   * Per-card average timing across all sessions.
   */
  cardTiming(): Map<string, { avgMs: number; count: number }> {
    const map = new Map<string, { total: number; count: number }>();
    for (const session of store.get()) {
      for (const answer of session.answers) {
        const entry = map.get(answer.cardId) ?? { total: 0, count: 0 };
        entry.total += answer.timeTakenMs;
        entry.count++;
        map.set(answer.cardId, entry);
      }
    }
    const result = new Map<string, { avgMs: number; count: number }>();
    for (const [cardId, data] of map) {
      result.set(cardId, {
        avgMs: Math.round(data.total / data.count),
        count: data.count,
      });
    }
    return result;
  },

  /** Subscribe to state changes. Returns unsubscribe fn. */
  subscribe(fn: StatelessListener): () => void {
    statelessListeners.add(fn);
    return () => statelessListeners.delete(fn);
  },

  /** Current version counter (for React useSyncExternalStore). */
  version(): number {
    return version;
  },

  /** Clear all sessions. */
  clear(): void {
    store.reset();
  },
};

export default QuizSessionStore;
