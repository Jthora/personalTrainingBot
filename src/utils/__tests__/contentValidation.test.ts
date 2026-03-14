import { describe, it, expect } from 'vitest';
import {
  validateKeyTerms,
  deriveSummaryText,
  detectTemplateExercises,
  scoreCard,
} from '../contentValidation';
import type { Card, Exercise } from '../../types/Card';

// ─── validateKeyTerms ────────────────────────────────────────────

describe('validateKeyTerms', () => {
  it('returns no issues for good terms', () => {
    const issues = validateKeyTerms(['quantum entanglement', 'neural network', 'blockchain consensus']);
    expect(issues).toEqual([]);
  });

  it('detects too-short terms (< 3 chars)', () => {
    const issues = validateKeyTerms(['AI', 'quantum mechanics']);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({ term: 'AI', reason: 'too-short' });
  });

  it('detects fragment terms (≤ 2 words AND ≤ 8 chars)', () => {
    const issues = validateKeyTerms(['hash', 'RSA 2048 bit encryption']);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({ term: 'hash', reason: 'fragment' });
  });

  it('detects generic terms', () => {
    // Use terms that are > 8 chars or > 2 words to avoid fragment check triggering first
    const issues = validateKeyTerms(['fundamentals', 'best practices', 'introduction']);
    expect(issues).toHaveLength(3);
    expect(issues.every((i) => i.reason === 'generic')).toBe(true);
  });

  it('detects duplicate terms (case-insensitive)', () => {
    const issues = validateKeyTerms(['Neural Network', 'neural network']);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({ term: 'neural network', reason: 'duplicate' });
  });

  it('returns empty array for empty input', () => {
    expect(validateKeyTerms([])).toEqual([]);
  });

  it('too-short takes priority over fragment', () => {
    const issues = validateKeyTerms(['ab']);
    expect(issues[0].reason).toBe('too-short');
  });

  it('does not flag long single words as fragments', () => {
    // 10 chars, 1 word → fragment check: wordCount=1 ≤ 2 BUT length=10 > 8 → not a fragment
    expect(validateKeyTerms(['encryption'])).toEqual([]);
  });
});

// ─── deriveSummaryText ───────────────────────────────────────────

describe('deriveSummaryText', () => {
  it('returns existing summaryText when ≥ 50 chars', () => {
    const card = {
      summaryText: 'This is a sufficiently long summary text that exceeds fifty characters easily.',
      description: 'Short desc.',
      bulletpoints: [],
    };
    expect(deriveSummaryText(card)).toBe(card.summaryText);
  });

  it('derives from description when summaryText is missing', () => {
    const card = {
      description: 'Quantum entanglement allows two particles to share a correlated state regardless of distance.',
      bulletpoints: [],
    };
    const result = deriveSummaryText(card);
    expect(result).toBe(card.description);
  });

  it('combines description and first bulletpoint', () => {
    const card = {
      description: 'Quantum entanglement is a key phenomenon in quantum physics.',
      bulletpoints: ['It enables quantum teleportation and secure communication.'],
    };
    const result = deriveSummaryText(card);
    expect(result).toContain('Quantum entanglement');
    expect(result).toContain('quantum teleportation');
  });

  it('returns null when description is too short', () => {
    expect(deriveSummaryText({ description: 'Short.', bulletpoints: [] })).toBeNull();
  });

  it('returns null when description is missing', () => {
    expect(deriveSummaryText({ description: '', bulletpoints: ['Something'] })).toBeNull();
  });

  it('truncates at sentence boundary when over 280 chars', () => {
    const long = 'A'.repeat(100) + '. ' + 'B'.repeat(100) + '. ' + 'C'.repeat(200) + '.';
    const card = { description: long, bulletpoints: [] };
    const result = deriveSummaryText(card);
    expect(result!.length).toBeLessThanOrEqual(281);
  });

  it('prefers existing summaryText over derivation', () => {
    const card = {
      summaryText: 'A good summary text that is definitely longer than fifty characters required.',
      description: 'Some description.',
      bulletpoints: ['Some point.'],
    };
    expect(deriveSummaryText(card)).toBe(card.summaryText);
  });

  it('re-derives when existing summaryText is too short', () => {
    const card = {
      summaryText: 'Too short.',
      description: 'Quantum entanglement allows two particles to share a correlated state regardless of distance.',
      bulletpoints: [],
    };
    const result = deriveSummaryText(card);
    expect(result).not.toBe('Too short.');
    expect(result).toContain('Quantum entanglement');
  });
});

// ─── detectTemplateExercises ─────────────────────────────────────

describe('detectTemplateExercises', () => {
  it('detects recall template pattern', () => {
    const exercises: Exercise[] = [
      { type: 'recall', prompt: 'List the key concepts of this topic.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches).toHaveLength(1);
    expect(matches[0].patternName).toBe('recall_template');
    expect(matches[0].field).toBe('prompt');
  });

  it('detects apply template pattern', () => {
    const exercises: Exercise[] = [
      { type: 'apply', prompt: 'Apply the key concepts to a real-world scenario.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.patternName === 'apply_template')).toBe(true);
  });

  it('detects analyze template pattern', () => {
    const exercises: Exercise[] = [
      { type: 'analyze', prompt: 'Analyze the key aspects of this topic.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.patternName === 'analyze_template')).toBe(true);
  });

  it('detects selfcheck template pattern', () => {
    const exercises: Exercise[] = [
      { type: 'self-check', prompt: 'Check your understanding of this module.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.patternName === 'selfcheck_template')).toBe(true);
  });

  it('detects bloom understand template', () => {
    const exercises: Exercise[] = [
      { type: 'recall', prompt: 'Explain the concept of quantum entanglement.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.patternName === 'bloom_understand')).toBe(true);
  });

  it('detects bloom evaluate template', () => {
    const exercises: Exercise[] = [
      { type: 'analyze', prompt: 'Evaluate the effectiveness of this approach.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.patternName === 'bloom_evaluate')).toBe(true);
  });

  it('detects vague_outcome in expectedOutcome field', () => {
    const exercises: Exercise[] = [
      { type: 'recall', prompt: 'What is X?', expectedOutcome: 'Good understanding of the topic.' },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches.some((m) => m.field === 'expectedOutcome' && m.patternName === 'vague_outcome')).toBe(true);
  });

  it('returns empty for domain-specific exercises', () => {
    const exercises: Exercise[] = [
      { type: 'recall', prompt: 'What is the OSI model and how many layers does it have?' },
      { type: 'apply', prompt: 'Configure a firewall rule to block port 22 on the DMZ subnet.' },
    ];
    expect(detectTemplateExercises(exercises)).toEqual([]);
  });

  it('handles empty exercises array', () => {
    expect(detectTemplateExercises([])).toEqual([]);
  });

  it('truncates matched text to 80 chars', () => {
    const longPrompt = 'List the key concepts ' + 'x'.repeat(200);
    const exercises: Exercise[] = [
      { type: 'recall', prompt: longPrompt },
    ];
    const matches = detectTemplateExercises(exercises);
    expect(matches[0].text.length).toBeLessThanOrEqual(80);
  });
});

// ─── scoreCard ────────────────────────────────────────────────────

describe('scoreCard', () => {
  const goodCard: Card = {
    id: 'test-good-001',
    title: 'Quantum Entanglement',
    description: 'Quantum entanglement is a quantum mechanical phenomenon where two particles become correlated. Their states are linked regardless of the distance between them.',
    bulletpoints: [
      'Entangled particles share quantum states instantly across any distance, violating classical intuition about locality.',
      'Bell\'s theorem proves that no local hidden variable theory can reproduce all quantum mechanical predictions.',
      'Quantum entanglement is the foundation of quantum key distribution protocols like BB84 and E91.',
      'Decoherence is the primary challenge in maintaining entanglement for practical quantum computing applications.',
    ],
    duration: 10,
    difficulty: 'Intermediate',
    summaryText: 'Quantum entanglement links two particles so measuring one instantly determines the other\'s state, enabling quantum cryptography and teleportation protocols.',
    exercises: [
      { type: 'recall', prompt: 'What is the key difference between entangled and classically correlated particles?', expectedOutcome: 'Entangled particles exhibit correlations that cannot be explained by any local hidden variable theory, as proven by Bell\'s theorem violations.' },
      { type: 'apply', prompt: 'Design a basic quantum key distribution protocol using entangled photon pairs for secure communication.', expectedOutcome: 'Use entangled photon pairs where Alice and Bob measure in randomly chosen bases, comparing a subset of results to detect eavesdropping.' },
      { type: 'analyze', prompt: 'Why does decoherence limit the practical distance of quantum entanglement in fiber optic channels?', expectedOutcome: 'Environmental interactions collapse the superposition state, and photon loss in fiber increases exponentially with distance.' },
    ],
    keyTerms: ['quantum entanglement', 'Bell\'s theorem', 'quantum decoherence', 'quantum key distribution'],
    learningObjectives: [
      'Explain the physical mechanism behind quantum entanglement and non-locality.',
      'Apply entanglement principles to design a quantum key distribution protocol.',
      'Evaluate the practical limitations of maintaining long-distance entanglement.',
    ],
  };

  it('gives high score to well-formed card', () => {
    const result = scoreCard(goodCard);
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.cardId).toBe('test-good-001');
  });

  it('penalizes short description', () => {
    const card = { ...goodCard, id: 'short-desc', description: 'Brief.' };
    const result = scoreCard(card);
    expect(result.score).toBeLessThan(scoreCard(goodCard).score);
    expect(result.issues.some((i) => i.includes('sentence'))).toBe(true);
  });

  it('penalizes few bulletpoints', () => {
    const card = { ...goodCard, id: 'few-bp', bulletpoints: ['One point.'] };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('bulletpoint'))).toBe(true);
  });

  it('penalizes few exercises', () => {
    const card = {
      ...goodCard,
      id: 'few-ex',
      exercises: [{ type: 'recall' as const, prompt: 'What is X?', expectedOutcome: 'Y is the answer to X.' }],
    };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('exercise'))).toBe(true);
  });

  it('penalizes templated exercises', () => {
    const card = {
      ...goodCard,
      id: 'template-ex',
      exercises: [
        { type: 'recall' as const, prompt: 'List the key concepts of entanglement.', expectedOutcome: 'Good understanding of the topic.' },
        { type: 'apply' as const, prompt: 'Apply the key techniques to a problem.', expectedOutcome: 'Thorough understanding of application.' },
      ],
    };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('Templated'))).toBe(true);
    expect(result.score).toBeLessThan(scoreCard(goodCard).score);
  });

  it('penalizes few key terms', () => {
    const card = { ...goodCard, id: 'few-kt', keyTerms: ['only one'] };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('key term'))).toBe(true);
  });

  it('penalizes few learning objectives', () => {
    const card = { ...goodCard, id: 'few-lo', learningObjectives: ['Understand X.'] };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('learning objective'))).toBe(true);
  });

  it('penalizes missing summaryText', () => {
    const card = { ...goodCard, id: 'no-summary', summaryText: undefined };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('summaryText'))).toBe(true);
  });

  it('penalizes low exercise type diversity', () => {
    const card = {
      ...goodCard,
      id: 'low-diversity',
      exercises: [
        { type: 'recall' as const, prompt: 'What is A?', expectedOutcome: 'A is the first letter of the alphabet in the latin script.' },
        { type: 'recall' as const, prompt: 'What is B?', expectedOutcome: 'B is the second letter of the alphabet in the latin script.' },
      ],
    };
    const result = scoreCard(card);
    expect(result.issues.some((i) => i.includes('exercise type'))).toBe(true);
  });

  it('clamps score to minimum 0', () => {
    const terrible: Card = {
      id: 'terrible',
      title: 'X',
      description: 'Bad.',
      bulletpoints: [],
      duration: 1,
      difficulty: 'Beginner',
    };
    const result = scoreCard(terrible);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('warns about short bulletpoints', () => {
    const card = {
      ...goodCard,
      id: 'short-bp',
      bulletpoints: ['Short one.', 'Tiny.', 'Small.', 'Brief entry.'],
    };
    const result = scoreCard(card);
    expect(result.warnings.some((w) => w.includes('Short bulletpoint'))).toBe(true);
  });

  it('warns about non-action-verb learning objectives', () => {
    const card = {
      ...goodCard,
      id: 'no-action',
      learningObjectives: [
        'Know what entanglement is.',
        'Understand quantum mechanics.',
        'Be familiar with Bell\'s theorem.',
      ],
    };
    const result = scoreCard(card);
    expect(result.warnings.some((w) => w.includes("action verb"))).toBe(true);
  });
});
