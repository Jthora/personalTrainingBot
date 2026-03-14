import { describe, it, expect, beforeEach } from 'vitest';
import QuizSessionStore from '../QuizSessionStore';
import type { QuizQuestion, QuizAnswer } from '../../types/Quiz';

/* ── Fixtures ── */

const question1: QuizQuestion = {
  id: 'q-1',
  cardId: 'card-a',
  type: 'multiple-choice',
  prompt: 'What is X?',
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  correctAnswer: 'A',
  hints: [],
  source: 'Card A',
};

const question2: QuizQuestion = {
  id: 'q-2',
  cardId: 'card-b',
  type: 'true-false',
  prompt: 'True or false: Y',
  options: ['True', 'False'],
  correctIndex: 0,
  correctAnswer: 'True',
  hints: [],
  source: 'Card B',
};

const answer1Correct: QuizAnswer = {
  questionId: 'q-1',
  cardId: 'card-a',
  answer: 'A',
  correct: true,
  timeTakenMs: 3000,
};

const answer2Wrong: QuizAnswer = {
  questionId: 'q-2',
  cardId: 'card-b',
  answer: 'False',
  correct: false,
  timeTakenMs: 5000,
};

beforeEach(() => {
  QuizSessionStore.clear();
});

describe('QuizSessionStore', () => {
  it('starts empty', () => {
    expect(QuizSessionStore.list()).toEqual([]);
    expect(QuizSessionStore.count()).toBe(0);
  });

  it('records a session and returns it with ID', () => {
    const session = QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    expect(session.id).toBeTruthy();
    expect(session.id).toMatch(/^qs-/);
    expect(session.completedAt).toBeTruthy();
    expect(session.questions).toEqual([question1]);
    expect(session.answers).toEqual([answer1Correct]);
    expect(session.sourceId).toBe('deck-1');
    expect(session.sourceType).toBe('deck');
  });

  it('list returns sessions most-recent-first', () => {
    QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'first',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    QuizSessionStore.record({
      questions: [question2],
      answers: [answer2Wrong],
      sourceId: 'second',
      sourceType: 'module',
      startedAt: '2025-01-02T00:00:00Z',
    });

    const list = QuizSessionStore.list();
    expect(list).toHaveLength(2);
    expect(list[0].sourceId).toBe('second'); // most recent first
    expect(list[1].sourceId).toBe('first');
  });

  it('get returns a specific session by ID', () => {
    const session = QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    expect(QuizSessionStore.get(session.id)).toEqual(session);
    expect(QuizSessionStore.get('nonexistent')).toBeNull();
  });

  it('listBySource filters sessions by sourceId', () => {
    QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    QuizSessionStore.record({
      questions: [question2],
      answers: [answer2Wrong],
      sourceId: 'deck-2',
      sourceType: 'deck',
      startedAt: '2025-01-02T00:00:00Z',
    });

    expect(QuizSessionStore.listBySource('deck-1')).toHaveLength(1);
    expect(QuizSessionStore.listBySource('deck-2')).toHaveLength(1);
    expect(QuizSessionStore.listBySource('deck-3')).toHaveLength(0);
  });

  it('getWrongQuestions returns only incorrectly answered questions', () => {
    const session = QuizSessionStore.record({
      questions: [question1, question2],
      answers: [answer1Correct, answer2Wrong],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    const wrong = QuizSessionStore.getWrongQuestions(session.id);
    expect(wrong).toHaveLength(1);
    expect(wrong[0].id).toBe('q-2');
  });

  it('getWrongQuestions returns empty for nonexistent session', () => {
    expect(QuizSessionStore.getWrongQuestions('nonexistent')).toEqual([]);
  });

  it('cardAccuracy computes per-card accuracy across sessions', () => {
    // Card A: correct in both sessions
    QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    QuizSessionStore.record({
      questions: [question1, question2],
      answers: [answer1Correct, answer2Wrong],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-02T00:00:00Z',
    });

    const accuracy = QuizSessionStore.cardAccuracy();
    expect(accuracy.get('card-a')).toEqual({ attempts: 2, correct: 2, pct: 100 });
    expect(accuracy.get('card-b')).toEqual({ attempts: 1, correct: 0, pct: 0 });
  });

  it('cardTiming computes average timing per card', () => {
    QuizSessionStore.record({
      questions: [question1],
      answers: [{ ...answer1Correct, timeTakenMs: 2000 }],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    QuizSessionStore.record({
      questions: [question1],
      answers: [{ ...answer1Correct, timeTakenMs: 4000 }],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-02T00:00:00Z',
    });

    const timing = QuizSessionStore.cardTiming();
    expect(timing.get('card-a')).toEqual({ avgMs: 3000, count: 2 });
  });

  it('clear removes all sessions', () => {
    QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    expect(QuizSessionStore.count()).toBe(1);
    QuizSessionStore.clear();
    expect(QuizSessionStore.count()).toBe(0);
    expect(QuizSessionStore.list()).toEqual([]);
  });

  it('subscribe notifies on changes', () => {
    const listener = vi.fn();
    const unsub = QuizSessionStore.subscribe(listener);

    QuizSessionStore.record({
      questions: [question1],
      answers: [answer1Correct],
      sourceId: 'deck-1',
      sourceType: 'deck',
      startedAt: '2025-01-01T00:00:00Z',
    });

    expect(listener).toHaveBeenCalled();
    unsub();
  });
});
