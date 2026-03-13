/**
 * Exercise attached to a training card.
 * Each exercise prompts the operative to actively engage with the material.
 */
export type Exercise = {
    /** The interaction pattern for this exercise. */
    type: 'recall' | 'apply' | 'analyze' | 'self-check';
    /** The prompt or question shown to the operative. */
    prompt: string;
    /** Optional progressive hints revealed on request. */
    hints?: string[];
    /** The expected outcome or model answer (revealed after attempt). */
    expectedOutcome?: string;
};

export type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number; // in minutes
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate" | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    summaryText?: string; // 140-280 character shareable summary
    classification?: string; // e.g., FOUO, UNCLASS
    /** Extended markdown body content for in-depth study. */
    content?: string;
    /** Structured exercises attached to this card. */
    exercises?: Exercise[];
    /** Domain-specific vocabulary terms covered by this card. */
    keyTerms?: string[];
    /** External references and further reading. */
    references?: string[];
    /** Card IDs that should be studied before this card. */
    prerequisites?: string[];
    /** What the operative should be able to do after studying this card. */
    learningObjectives?: string[];
};