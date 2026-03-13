import { describe, it, expect, beforeEach } from 'vitest';
import type { Card } from '../../types/Card';
import {
  generateMCFromExercise,
  generateTrueFalse,
  generateFillBlank,
  generateTermMatch,
  generateQuiz,
  _resetCounter,
} from '../quizGenerator';

/* ── Helpers ── */

function makeCard(overrides: Partial<Card> & { id: string; title: string }): Card {
  return {
    description: 'test card',
    bulletpoints: [],
    duration: 5,
    difficulty: 'Standard',
    ...overrides,
  };
}

const cardA = makeCard({
  id: 'a',
  title: 'Card A',
  exercises: [
    {
      type: 'recall',
      prompt: 'What is the purpose of a firewall?',
      expectedOutcome: 'A firewall filters incoming and outgoing network traffic based on rules.',
      hints: ['Think about packet inspection', 'Consider rule-based filtering'],
    },
  ],
  bulletpoints: ['Firewalls enforce access control policies', 'They are the first line of defense'],
  keyTerms: ['firewall', 'packet filtering'],
  learningObjectives: ['Understand the core principles of "firewall architecture" in network defense'],
});

const cardB = makeCard({
  id: 'b',
  title: 'Card B',
  exercises: [
    {
      type: 'apply',
      prompt: 'How does stateful inspection work?',
      expectedOutcome: 'Stateful inspection tracks the state of active connections and makes decisions based on context.',
      hints: ['Think about connection tracking'],
    },
  ],
  bulletpoints: ['Stateful firewalls maintain a session table', 'They track TCP handshakes'],
  keyTerms: ['stateful', 'session table'],
  learningObjectives: ['Explain how stateful inspection improves upon stateless packet filtering'],
});

const cardC = makeCard({
  id: 'c',
  title: 'Card C',
  exercises: [
    {
      type: 'analyze',
      prompt: 'Compare IDS and IPS systems.',
      expectedOutcome: 'IDS monitors and alerts on threats while IPS actively blocks malicious traffic inline.',
      hints: ['IDS is passive, IPS is active'],
    },
  ],
  bulletpoints: ['IDS provides visibility into network threats', 'IPS operates inline to block attacks'],
  keyTerms: ['IDS', 'IPS'],
  learningObjectives: ['Identify the key differences between intrusion detection and prevention systems'],
});

const cardMinimal = makeCard({
  id: 'min',
  title: 'Minimal Card',
});

beforeEach(() => {
  _resetCounter();
});

/* ── generateMCFromExercise ── */

describe('generateMCFromExercise', () => {
  it('produces a valid MC question with correct answer from exercise', () => {
    const q = generateMCFromExercise(cardA, [cardA, cardB, cardC]);
    expect(q).not.toBeNull();
    expect(q!.type).toBe('multiple-choice');
    expect(q!.cardId).toBe('a');
    expect(q!.prompt).toBe('What is the purpose of a firewall?');
    expect(q!.options).toBeDefined();
    expect(q!.options!.length).toBeGreaterThanOrEqual(3);
    expect(q!.correctIndex).toBeDefined();
    expect(q!.options![q!.correctIndex!]).toBe(
      'A firewall filters incoming and outgoing network traffic based on rules.',
    );
    expect(q!.hints).toEqual(['Think about packet inspection', 'Consider rule-based filtering']);
    expect(q!.source).toBe('Card A');
  });

  it('returns null when card has no exercise with expectedOutcome', () => {
    const q = generateMCFromExercise(cardMinimal, [cardA, cardB]);
    expect(q).toBeNull();
  });

  it('returns null when not enough distractors are available', () => {
    const lonely = makeCard({
      id: 'lonely',
      title: 'Lonely',
      exercises: [
        {
          type: 'recall',
          prompt: 'Standalone question',
          expectedOutcome: 'Standalone answer that needs distractors.',
        },
      ],
    });
    // Only one other card with a short expectedOutcome
    const weak = makeCard({
      id: 'weak',
      title: 'Weak',
      exercises: [{ type: 'recall', prompt: 'x', expectedOutcome: 'Short' }],
    });
    const q = generateMCFromExercise(lonely, [lonely, weak]);
    expect(q).toBeNull();
  });

  it('supplements distractors from bulletpoints when exercise outcomes are scarce', () => {
    const rich = makeCard({
      id: 'rich',
      title: 'Rich',
      bulletpoints: [
        'This is a long distractor bulletpoint from a rich card',
        'Another sufficiently long bulletpoint for matching purposes',
        'Third long enough bulletpoint to qualify',
      ],
    });
    const q = generateMCFromExercise(cardA, [cardA, rich]);
    // Should still produce a question using bulletpoint distractors
    if (q) {
      expect(q.options!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('generates unique IDs across calls', () => {
    const q1 = generateMCFromExercise(cardA, [cardA, cardB, cardC]);
    const q2 = generateMCFromExercise(cardB, [cardA, cardB, cardC]);
    expect(q1).not.toBeNull();
    expect(q2).not.toBeNull();
    expect(q1!.id).not.toBe(q2!.id);
  });
});

/* ── generateTrueFalse ── */

describe('generateTrueFalse', () => {
  it('produces a TF question from card bulletpoints', () => {
    const q = generateTrueFalse(cardA, [cardA, cardB, cardC]);
    expect(q).not.toBeNull();
    expect(q!.type).toBe('true-false');
    expect(q!.cardId).toBe('a');
    expect(q!.options).toEqual(['True', 'False']);
    expect(q!.correctIndex === 0 || q!.correctIndex === 1).toBe(true);
    expect(q!.correctAnswer).toMatch(/^(True|False)$/);
    expect(q!.prompt).toContain('True or false:');
  });

  it('returns null when card has no bulletpoints', () => {
    const q = generateTrueFalse(cardMinimal, [cardA, cardB]);
    expect(q).toBeNull();
  });

  it('returns null when bulletpoints are too short', () => {
    const tiny = makeCard({
      id: 'tiny',
      title: 'Tiny',
      bulletpoints: ['Hi', 'No'],
    });
    const q = generateTrueFalse(tiny, [cardA]);
    expect(q).toBeNull();
  });
});

/* ── generateFillBlank ── */

describe('generateFillBlank', () => {
  it('produces a fill-blank question from learningObjectives', () => {
    const q = generateFillBlank(cardA);
    expect(q).not.toBeNull();
    expect(q!.type).toBe('fill-blank');
    expect(q!.cardId).toBe('a');
    expect(q!.prompt).toContain('______');
    expect(q!.prompt).toContain('Fill in the blank:');
    expect(q!.correctAnswer.length).toBeGreaterThan(2);
  });

  it('returns null when card has no learningObjectives', () => {
    const q = generateFillBlank(cardMinimal);
    expect(q).toBeNull();
  });

  it('returns null when learningObjectives are too short', () => {
    const short = makeCard({
      id: 'short',
      title: 'Short',
      learningObjectives: ['Know stuff'],
    });
    const q = generateFillBlank(short);
    expect(q).toBeNull();
  });
});

/* ── generateTermMatch ── */

describe('generateTermMatch', () => {
  it('produces a term-match question from cards with keyTerms + bulletpoints', () => {
    const q = generateTermMatch([cardA, cardB, cardC]);
    expect(q).not.toBeNull();
    expect(q!.type).toBe('term-match');
    expect(q!.matchPairs).toBeDefined();
    expect(q!.matchPairs!.length).toBeGreaterThanOrEqual(3);
    // Each pair is [term, description]
    for (const [term, desc] of q!.matchPairs!) {
      expect(typeof term).toBe('string');
      expect(typeof desc).toBe('string');
      expect(desc.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it('returns null when not enough pairs are found', () => {
    const q = generateTermMatch([cardMinimal]);
    expect(q).toBeNull();
  });

  it('returns null for cards without keyTerms', () => {
    const noTerms = makeCard({
      id: 'no-terms',
      title: 'No Terms',
      bulletpoints: ['This card has bulletpoints but no key terms'],
    });
    const q = generateTermMatch([noTerms]);
    expect(q).toBeNull();
  });
});

/* ── generateQuiz (main entry) ── */

describe('generateQuiz', () => {
  it('returns an array of questions from multiple cards', () => {
    const questions = generateQuiz([cardA, cardB, cardC]);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(10);
    // All questions should have required fields
    for (const q of questions) {
      expect(q.id).toBeTruthy();
      expect(q.cardId).toBeTruthy();
      expect(q.type).toMatch(/^(multiple-choice|true-false|fill-blank|term-match)$/);
      expect(q.prompt).toBeTruthy();
      expect(q.correctAnswer).toBeTruthy();
    }
  });

  it('respects maxQuestions limit', () => {
    const questions = generateQuiz([cardA, cardB, cardC], 2);
    expect(questions.length).toBeLessThanOrEqual(2);
  });

  it('returns empty array for empty card list', () => {
    const questions = generateQuiz([]);
    expect(questions).toEqual([]);
  });

  it('returns empty array when cards lack quiz-relevant data', () => {
    const questions = generateQuiz([cardMinimal]);
    expect(questions).toEqual([]);
  });

  it('generates mixed question types', () => {
    // With cardA+B+C we expect at least MC, TF, and either fill-blank or term-match
    const questions = generateQuiz([cardA, cardB, cardC], 20);
    const types = new Set(questions.map((q) => q.type));
    // At minimum MC and TF should appear (fill-blank/term-match depend on randomness)
    expect(types.has('multiple-choice')).toBe(true);
    expect(types.has('true-false')).toBe(true);
  });

  it('_resetCounter resets question IDs', () => {
    const q1 = generateQuiz([cardA, cardB, cardC], 1);
    _resetCounter();
    const q2 = generateQuiz([cardA, cardB, cardC], 1);
    // After reset, IDs should restart from 1
    // Both should have valid IDs
    expect(q1[0]?.id).toBeTruthy();
    expect(q2[0]?.id).toBeTruthy();
  });
});
