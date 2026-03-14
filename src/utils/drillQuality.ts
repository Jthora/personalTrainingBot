/**
 * drillQuality.ts — Per-card SR quality computation for drill enforcement.
 *
 * Computes a 1-5 quality rating from the user's self-assessment combined
 * with objective engagement signals (expansion, exercise interaction).
 */

/** Per-step interaction data collected during a drill session. */
export interface StepInteractionData {
  /** Whether the card content panel was expanded/viewed. */
  expanded: boolean;
  /** Number of exercises the user interacted with. */
  exercisesAttempted: number;
  /** Total number of exercises on this card. */
  exercisesTotal: number;
}

/**
 * Compute per-card SR quality from base self-assessment and interaction data.
 *
 * Adjustments:
 *   - −1 if the card content was never expanded (user skipped reading)
 *   - −1 if exercises exist but none were attempted (user ignored exercises)
 *
 * Result is clamped to [1, 5].
 *
 * @param baseAssessment  User's self-rated comprehension (1-5).
 * @param interaction     Per-step interaction tracking data (undefined if none collected).
 * @param hasContent      Whether the step has card content to interact with.
 * @returns Quality rating 1-5 for SR scheduling.
 */
export function computeCardQuality(
  baseAssessment: number,
  interaction: StepInteractionData | undefined,
  hasContent: boolean,
): number {
  if (!hasContent || !interaction) return baseAssessment;
  let quality = baseAssessment;
  // Penalty: card content was never expanded
  if (!interaction.expanded) quality -= 1;
  // Penalty: exercises exist but none were attempted
  if (interaction.exercisesTotal > 0 && interaction.exercisesAttempted === 0) quality -= 1;
  return Math.max(1, Math.min(5, quality));
}
