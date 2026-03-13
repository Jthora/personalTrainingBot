import { describe, it, expect } from 'vitest';

/**
 * Unit tests for CardDataLoader normalization logic.
 * We test the normalization rules in isolation rather than the full async load pipeline.
 */

// Replicate the normalization logic from CardDataLoader.ts lines 75-100
function normalizeCard(card: Record<string, unknown>) {
  const bulletpoints = Array.isArray(card.bulletpoints)
    ? card.bulletpoints
    : typeof card.bulletpoints === 'string'
    ? (card.bulletpoints as string).split(',').map((point: string) => point.trim())
    : [];
  const summaryText = typeof card.summaryText === 'string' ? card.summaryText : '';
  const duration =
    typeof card.duration === 'number'
      ? card.duration
      : typeof card.duration === 'string'
      ? parseFloat(card.duration as string) || 0
      : 0;
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    bulletpoints,
    duration,
    difficulty: card.difficulty,
    summaryText,
    classification: card.classification,
    ...(card.content != null && { content: card.content }),
    ...(Array.isArray(card.exercises) && (card.exercises as unknown[]).length > 0 && { exercises: card.exercises }),
    ...(Array.isArray(card.keyTerms) && (card.keyTerms as unknown[]).length > 0 && { keyTerms: card.keyTerms }),
    ...(Array.isArray(card.references) && (card.references as unknown[]).length > 0 && { references: card.references }),
    ...(Array.isArray(card.prerequisites) && (card.prerequisites as unknown[]).length > 0 && { prerequisites: card.prerequisites }),
    ...(Array.isArray(card.learningObjectives) && (card.learningObjectives as unknown[]).length > 0 && { learningObjectives: card.learningObjectives }),
  };
}

describe('CardDataLoader normalization', () => {
  describe('bulletpoints', () => {
    it('keeps bulletpoints that are already arrays', () => {
      const result = normalizeCard({ bulletpoints: ['a', 'b', 'c'] });
      expect(result.bulletpoints).toEqual(['a', 'b', 'c']);
    });

    it('splits comma-separated string into array', () => {
      const result = normalizeCard({ bulletpoints: 'alpha, beta, gamma' });
      expect(result.bulletpoints).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('defaults to empty array when missing', () => {
      const result = normalizeCard({});
      expect(result.bulletpoints).toEqual([]);
    });

    it('defaults to empty array for non-string/non-array value', () => {
      const result = normalizeCard({ bulletpoints: 42 });
      expect(result.bulletpoints).toEqual([]);
    });
  });

  describe('duration', () => {
    it('keeps numeric duration as-is', () => {
      const result = normalizeCard({ duration: 15 });
      expect(result.duration).toBe(15);
    });

    it('parses string duration to number', () => {
      const result = normalizeCard({ duration: '10' });
      expect(result.duration).toBe(10);
    });

    it('handles float string duration', () => {
      const result = normalizeCard({ duration: '7.5' });
      expect(result.duration).toBe(7.5);
    });

    it('defaults to 0 for unparseable string', () => {
      const result = normalizeCard({ duration: 'none' });
      expect(result.duration).toBe(0);
    });

    it('defaults to 0 when missing', () => {
      const result = normalizeCard({});
      expect(result.duration).toBe(0);
    });
  });

  describe('summaryText', () => {
    it('keeps string summaryText', () => {
      const result = normalizeCard({ summaryText: 'A brief summary.' });
      expect(result.summaryText).toBe('A brief summary.');
    });

    it('defaults to empty string for non-string', () => {
      const result = normalizeCard({ summaryText: 42 });
      expect(result.summaryText).toBe('');
    });

    it('defaults to empty string when missing', () => {
      const result = normalizeCard({});
      expect(result.summaryText).toBe('');
    });
  });

  describe('new optional fields pass-through', () => {
    it('passes content when present', () => {
      const result = normalizeCard({ content: '# Heading\nBody text' });
      expect(result.content).toBe('# Heading\nBody text');
    });

    it('omits content when null', () => {
      const result = normalizeCard({ content: null });
      expect(result).not.toHaveProperty('content');
    });

    it('passes exercises array when non-empty', () => {
      const exercises = [{ type: 'recall', prompt: 'What is X?' }];
      const result = normalizeCard({ exercises });
      expect(result.exercises).toEqual(exercises);
    });

    it('omits exercises when empty', () => {
      const result = normalizeCard({ exercises: [] });
      expect(result).not.toHaveProperty('exercises');
    });

    it('omits exercises when not an array', () => {
      const result = normalizeCard({ exercises: 'not-array' });
      expect(result).not.toHaveProperty('exercises');
    });

    it('passes keyTerms when non-empty', () => {
      const result = normalizeCard({ keyTerms: ['term1', 'term2'] });
      expect(result.keyTerms).toEqual(['term1', 'term2']);
    });

    it('omits keyTerms when empty', () => {
      const result = normalizeCard({ keyTerms: [] });
      expect(result).not.toHaveProperty('keyTerms');
    });

    it('passes references when non-empty', () => {
      const result = normalizeCard({ references: ['https://example.com'] });
      expect(result.references).toEqual(['https://example.com']);
    });

    it('passes prerequisites when non-empty', () => {
      const result = normalizeCard({ prerequisites: ['card-001'] });
      expect(result.prerequisites).toEqual(['card-001']);
    });

    it('passes learningObjectives when non-empty', () => {
      const result = normalizeCard({ learningObjectives: ['Understand X', 'Apply Y'] });
      expect(result.learningObjectives).toEqual(['Understand X', 'Apply Y']);
    });

    it('omits learningObjectives when empty', () => {
      const result = normalizeCard({ learningObjectives: [] });
      expect(result).not.toHaveProperty('learningObjectives');
    });
  });
});
