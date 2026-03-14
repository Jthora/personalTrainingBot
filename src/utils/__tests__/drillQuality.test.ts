import { describe, it, expect } from 'vitest';
import { computeCardQuality, type StepInteractionData } from '../drillQuality';

describe('computeCardQuality', () => {
  // ─── No content / no interaction → passthrough ──────────────────────────

  it('returns baseAssessment unchanged when hasContent is false', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 3 };
    expect(computeCardQuality(4, interaction, false)).toBe(4);
  });

  it('returns baseAssessment unchanged when interaction is undefined', () => {
    expect(computeCardQuality(5, undefined, true)).toBe(5);
  });

  it('returns baseAssessment unchanged when both hasContent false and interaction undefined', () => {
    expect(computeCardQuality(3, undefined, false)).toBe(3);
  });

  // ─── No penalties ──────────────────────────────────────────────────────

  it('returns baseAssessment when expanded and all exercises attempted', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 3, exercisesTotal: 3 };
    expect(computeCardQuality(4, interaction, true)).toBe(4);
  });

  it('returns baseAssessment when expanded and card has no exercises', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 0, exercisesTotal: 0 };
    expect(computeCardQuality(5, interaction, true)).toBe(5);
  });

  it('returns baseAssessment when expanded and some exercises attempted', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 1, exercisesTotal: 3 };
    expect(computeCardQuality(4, interaction, true)).toBe(4);
  });

  // ─── Expansion penalty ─────────────────────────────────────────────────

  it('applies -1 penalty when card was never expanded', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 0 };
    expect(computeCardQuality(4, interaction, true)).toBe(3);
  });

  it('applies -1 expansion penalty even when exercises were attempted', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 2, exercisesTotal: 2 };
    expect(computeCardQuality(5, interaction, true)).toBe(4);
  });

  // ─── Exercise penalty ──────────────────────────────────────────────────

  it('applies -1 penalty when exercises exist but none attempted', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 0, exercisesTotal: 3 };
    expect(computeCardQuality(4, interaction, true)).toBe(3);
  });

  it('no exercise penalty when at least one exercise attempted', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 1, exercisesTotal: 3 };
    expect(computeCardQuality(4, interaction, true)).toBe(4);
  });

  it('no exercise penalty when exercisesTotal is 0', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 0, exercisesTotal: 0 };
    expect(computeCardQuality(3, interaction, true)).toBe(3);
  });

  // ─── Both penalties stacked ────────────────────────────────────────────

  it('stacks both penalties: never expanded + exercises ignored = -2', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 2 };
    expect(computeCardQuality(5, interaction, true)).toBe(3);
  });

  it('stacks penalties from base 3: 3 - 2 = 1', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 4 };
    expect(computeCardQuality(3, interaction, true)).toBe(1);
  });

  // ─── Clamping ──────────────────────────────────────────────────────────

  it('clamps to minimum 1 even with dual penalties on low base', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 1 };
    expect(computeCardQuality(1, interaction, true)).toBe(1);
  });

  it('clamps to minimum 1: base 2 with dual penalties', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 5 };
    expect(computeCardQuality(2, interaction, true)).toBe(1);
  });

  it('clamps to maximum 5', () => {
    // Even though no penalties, base 5 stays at 5
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 10, exercisesTotal: 10 };
    expect(computeCardQuality(5, interaction, true)).toBe(5);
  });

  // ─── Boundary values ──────────────────────────────────────────────────

  it('handles base assessment of exactly 1 with no penalties', () => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 1, exercisesTotal: 1 };
    expect(computeCardQuality(1, interaction, true)).toBe(1);
  });

  it('handles base assessment of exactly 5 with expansion penalty', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 1, exercisesTotal: 1 };
    expect(computeCardQuality(5, interaction, true)).toBe(4);
  });

  it('handles base assessment of exactly 2 with expansion penalty → 1', () => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 1, exercisesTotal: 1 };
    expect(computeCardQuality(2, interaction, true)).toBe(1);
  });

  // ─── All 5 base values with full engagement ────────────────────────────

  it.each([1, 2, 3, 4, 5])('full engagement returns base %i unchanged', (base) => {
    const interaction: StepInteractionData = { expanded: true, exercisesAttempted: 2, exercisesTotal: 2 };
    expect(computeCardQuality(base, interaction, true)).toBe(base);
  });

  // ─── All 5 base values with both penalties ─────────────────────────────

  it.each([
    [1, 1], // 1 - 2 → clamped to 1
    [2, 1], // 2 - 2 → clamped to 1
    [3, 1], // 3 - 2 = 1
    [4, 2], // 4 - 2 = 2
    [5, 3], // 5 - 2 = 3
  ])('dual penalties on base %i → %i', (base, expected) => {
    const interaction: StepInteractionData = { expanded: false, exercisesAttempted: 0, exercisesTotal: 3 };
    expect(computeCardQuality(base, interaction, true)).toBe(expected);
  });
});
