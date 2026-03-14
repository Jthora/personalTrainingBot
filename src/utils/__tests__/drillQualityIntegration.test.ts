/**
 * Integration test: drill enforcement → SR quality → interval scheduling.
 *
 * Tests the full pipeline: computeCardQuality produces quality signals
 * that feed into computeNextReview, resulting in different SR intervals
 * for cards depending on user engagement.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { computeCardQuality, type StepInteractionData } from '../../utils/drillQuality';
import { computeNextReview, type SRCardState } from '../../utils/srScheduler';
import CardProgressStore from '../../store/CardProgressStore';

beforeEach(() => {
  window.localStorage.clear();
});

describe('drill → SR quality → interval integration', () => {
  // ─── Full flow: computeCardQuality → computeNextReview ──────────────

  it('fully engaged card gets longer interval than disengaged card', () => {
    const baseSelf = 4; // user says "good"

    // Card A: fully engaged — expanded, all exercises done
    const engagedInteraction: StepInteractionData = {
      expanded: true,
      exercisesAttempted: 3,
      exercisesTotal: 3,
    };
    const qualityA = computeCardQuality(baseSelf, engagedInteraction, true);
    const reviewA = computeNextReview(null, qualityA);

    // Card B: disengaged — never expanded, exercises ignored
    const disengagedInteraction: StepInteractionData = {
      expanded: false,
      exercisesAttempted: 0,
      exercisesTotal: 3,
    };
    const qualityB = computeCardQuality(baseSelf, disengagedInteraction, true);
    const reviewB = computeNextReview(null, qualityB);

    // Quality A should be higher
    expect(qualityA).toBe(4);
    expect(qualityB).toBe(2); // 4 - 1 (expand) - 1 (exercise) = 2

    // After first review, Card A progresses; Card B lapses
    expect(reviewA.interval).toBe(1); // new card, quality 4 → 1 day
    expect(reviewA.repetitions).toBe(1);
    expect(reviewB.interval).toBe(1); // quality 2 → lapse → 1 day
    expect(reviewB.repetitions).toBe(0); // lapse resets
    expect(reviewB.lapses).toBe(1);

    // After second review with same engagement pattern:
    const reviewA2 = computeNextReview(reviewA, qualityA);
    const reviewB2 = computeNextReview(reviewB, qualityB);

    expect(reviewA2.interval).toBe(3); // good progression
    expect(reviewB2.interval).toBe(1); // still lapsing
    expect(reviewB2.lapses).toBe(2);
  });

  it('partial engagement produces intermediate quality and intervals', () => {
    const baseSelf = 4;

    // Card A: expanded but no exercises done
    const partialA: StepInteractionData = {
      expanded: true,
      exercisesAttempted: 0,
      exercisesTotal: 2,
    };
    const qualityA = computeCardQuality(baseSelf, partialA, true);
    expect(qualityA).toBe(3); // 4 - 1 (exercise) = 3

    // Card B: not expanded but exercises done (edge case)
    const partialB: StepInteractionData = {
      expanded: false,
      exercisesAttempted: 2,
      exercisesTotal: 2,
    };
    const qualityB = computeCardQuality(baseSelf, partialB, true);
    expect(qualityB).toBe(3); // 4 - 1 (expand) = 3

    // Both get hard review (quality 3 → SM-2 grade 2)
    const reviewA = computeNextReview(null, qualityA);
    const reviewB = computeNextReview(null, qualityB);
    expect(reviewA.interval).toBe(reviewB.interval); // same quality → same interval
  });

  it('card without content passes baseAssessment directly to SR', () => {
    const baseSelf = 4;
    const quality = computeCardQuality(baseSelf, undefined, false);
    expect(quality).toBe(4); // unchanged
    const review = computeNextReview(null, quality);
    expect(review.interval).toBe(1);
    expect(review.repetitions).toBe(1);
  });

  // ─── CardProgressStore integration ──────────────────────────────────

  it('CardProgressStore records per-card quality correctly', () => {
    // Simulate recording two cards from the same drill with different quality
    const engaged: StepInteractionData = {
      expanded: true,
      exercisesAttempted: 2,
      exercisesTotal: 2,
    };
    const disengaged: StepInteractionData = {
      expanded: false,
      exercisesAttempted: 0,
      exercisesTotal: 2,
    };

    const q1 = computeCardQuality(4, engaged, true);   // 4
    const q2 = computeCardQuality(4, disengaged, true); // 2

    const entry1 = CardProgressStore.recordReview('card-A', 'mod-x', q1);
    const entry2 = CardProgressStore.recordReview('card-B', 'mod-x', q2);

    // Card A progresses normally
    expect(entry1.repetitions).toBe(1);
    expect(entry1.interval).toBe(1);
    expect(entry1.lapses).toBe(0);

    // Card B lapses (quality 2 → SM-2 grade 1 → lapse)
    expect(entry2.repetitions).toBe(0);
    expect(entry2.interval).toBe(1);
    expect(entry2.lapses).toBe(1);
  });

  it('repeated engaged reviews build up interval; disengaged stays stuck', () => {
    const engaged: StepInteractionData = {
      expanded: true,
      exercisesAttempted: 3,
      exercisesTotal: 3,
    };
    const disengaged: StepInteractionData = {
      expanded: false,
      exercisesAttempted: 0,
      exercisesTotal: 3,
    };

    // Simulate 4 drill sessions for both cards
    for (let i = 0; i < 4; i++) {
      const qA = computeCardQuality(4, engaged, true);
      const qB = computeCardQuality(4, disengaged, true);
      CardProgressStore.recordReview('card-engaged', 'mod-x', qA);
      CardProgressStore.recordReview('card-disengaged', 'mod-x', qB);
    }

    const progressA = CardProgressStore.getCardProgress('card-engaged')!;
    const progressB = CardProgressStore.getCardProgress('card-disengaged')!;

    // Engaged card should have growing intervals
    expect(progressA.repetitions).toBeGreaterThan(1);
    expect(progressA.interval).toBeGreaterThan(1);
    expect(progressA.lapses).toBe(0);

    // Disengaged card keeps lapsing
    expect(progressB.lapses).toBe(4);
    expect(progressB.repetitions).toBe(0);
    expect(progressB.interval).toBe(1);
  });

  it('self-assessment 1 always produces lapse regardless of engagement', () => {
    const engaged: StepInteractionData = {
      expanded: true,
      exercisesAttempted: 5,
      exercisesTotal: 5,
    };
    // User rates self as 1 (total reset) even with full engagement
    const quality = computeCardQuality(1, engaged, true);
    expect(quality).toBe(1);

    const review = computeNextReview(null, quality);
    expect(review.lapses).toBe(1);
    expect(review.repetitions).toBe(0);
    expect(review.interval).toBe(1);
  });

  it('self-assessment 5 can be penalized down to 3 with poor engagement', () => {
    const disengaged: StepInteractionData = {
      expanded: false,
      exercisesAttempted: 0,
      exercisesTotal: 4,
    };
    const quality = computeCardQuality(5, disengaged, true);
    expect(quality).toBe(3); // 5 - 2 = 3

    // Quality 3 → SM-2 "hard" path (keeps interval, drops ease)
    const review = computeNextReview(null, quality);
    expect(review.interval).toBe(1); // new card hard → interval 1
    expect(review.easeFactor).toBeLessThan(2.5); // dropped from default
  });
});
