# Refined Approach: Three Priorities

> **Status:** Active — established March 2026  
> **Supersedes:** Initial three-intervention proposal (see [Rationale](#why-the-initial-approach-was-wrong) below)  
> **Governing principle:** The app exists to help a user actually learn 19 disciplines. Every change must serve that goal.

---

## Context: The Core Problem

The Archangel Knights Training Console was built **systems-first, content-last**. The infrastructure is real — gamification loop, schedule generation, offline story, mission-flow surfaces, P2P identity — but the actual training experience is hollow.

**Seven interconnected symptoms:**

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **Content fidelity gap** | 69% of decks have 2–3 cards; quality ranges 10× across modules |
| 2 | **Drill experience void** | DrillRunner renders checkboxes + stopwatch with no card content |
| 3 | **Competency measurement illusion** | Scores derived from drill metadata, not real user actions |
| 4 | **Readiness pre-seeded** | Fresh user sees ~59 readiness from fixture data |
| 5 | **Semantic costume** | Adapter maps "Barbell Squat" to intelligence artifact |
| 6 | **Write-only telemetry** | 96 event types, zero consumers |
| 7 | **Ungated mission flow** | SOP exists as prose, no enforcement |

All seven trace to a single root cause: the systems outran the content, and the frame (mission/intelligence metaphor) was invested in more heavily than what goes inside it.

---

## Why the Initial Approach Was Wrong

The first proposed interventions confused the *metaphor* with the *activity*:

| Original Intervention | Why It Failed |
|----------------------|---------------|
| **1. DrillRunner navigates mission surfaces** | Navigation through Triage → Signal → Artifact surfaces is a meta-exercise about the *interface*, not training in any of the 19 disciplines. |
| **2. Bridge telemetry → competency model** | The four competency dimensions (triage_execution, signal_analysis, artifact_traceability, decision_quality) measure engagement with the *mission frame*, not domain knowledge in Cryptography or OSINT. |
| **3. Card schema + exercise enrichment** | Correct, but was treated as lowest priority when it should be the foundation. |

**The correction:** Put the *user learning experience* at the center. Everything else serves that.

---

## The Three Priorities

### Priority 1: DrillRunner Shows Card Content + Self-Assessment

**Goal:** When an operative runs a drill, they see the actual training material and can record how well they understood it.

**Current state** ([DrillRunner.tsx](../architecture/components.md)):
- Renders a flat `<ul>` of `DrillStep` checkboxes with labels
- Stopwatch (pausable)
- Completion banner with XP notification
- No card content, no notes field, no difficulty/comprehension feedback

**Target state:**
- Each step expands to show the card's `description`, `bulletpoints`, and `summaryText`
- A free-text notes field persists per drill run
- A 1–5 self-assessment rating captured at drill completion
- History view shows notes and ratings for review

**Extension seams (low risk, additive):**

```
DrillStep (current):   { id: string; label: string; done: boolean }
DrillStep (extended):  { id: string; label: string; done: boolean;
                         cardId?: string;           // links step to card content
                         routePath?: string }        // deep link to card source

DrillHistoryEntry (current):   { id, drillId, title, elapsedSec, stepCount, completedAt }
DrillHistoryEntry (extended):  { id, drillId, title, elapsedSec, stepCount, completedAt,
                                 notes?: string;              // free-text reflection
                                 selfAssessment?: number;     // 1-5 rating
                                 domainId?: string }          // which training module
```

**Why this is safe:**
- Both types use optional fields → zero migration needed
- `DrillRunStore.start()` accepts `steps: { id: string; label: string }[]` — callers can add `cardId` without breaking
- `DrillHistoryStore.record()` accepts `Omit<DrillHistoryEntry, 'id'>` — new optional fields pass through
- `DrillRunner` checkbox rendering is a single `<ul>` → can be progressively enhanced

**Affected files:**
- `src/store/DrillRunStore.ts` — extend `DrillStep` type
- `src/store/DrillHistoryStore.ts` — extend `DrillHistoryEntry` interface
- `src/components/DrillRunner/DrillRunner.tsx` — card content display, notes input, self-assessment UI
- `src/utils/CardDataLoader.ts` — may need card lookup by ID during drill render

**Effort:** ~2–3 days. The UI work is the bulk; the store changes are trivial.

---

### Priority 2: Per-Domain Progress Tracking

**Goal:** Replace the meta-competency model (triage/signal/artifact/decision) with progress tracking that reflects actual domain knowledge across the 19 training disciplines.

**Current state** ([competencyModel.ts](../architecture/api.md)):
- Four dimensions: `triage_execution`, `signal_analysis`, `artifact_traceability`, `decision_quality`
- Scores derived from `inferActionsFromDrill()` — a proxy calculation from drill metadata
- Does NOT consume real user actions from `TriageActionStore` or `ArtifactActionStore`
- Blended into readiness: `avg * 0.7 + competency.weightedScore * 0.3`

**Target state:**
- Progress model based on the 19 training modules (Cryptography, OSINT, Physical Conditioning, etc.)
- Domain score = f(drills completed, self-assessment ratings, card coverage, recency)
- Readiness score becomes a composite of domain progress across the user's active training plan
- Stats surface shows per-domain progress charts

**The swap point:**

In `src/utils/readiness/model.ts`, `computeReadiness()` calls:
```ts
const competency = deriveCompetencySnapshot(kit, archetypeWeights);
```
This is a single function call. Replacing `deriveCompetencySnapshot` with a new `deriveDomainProgress()` function is a clean swap — the return shape just needs to satisfy the blending formula downstream.

**New data consumed:**
- `DrillHistoryStore` — which drills completed, how often, self-assessment scores (from Priority 1)
- Training module manifest — which modules exist, which drill maps to which module
- User's active schedule — which modules are currently assigned

**Why the meta-competency model is wrong for this app:**
The four dimensions (triage, signal, artifact, decision) describe engagement with the *mission surfaces*, not learning in any domain. A user who completes 50 Cryptography drills and 0 Physical Conditioning drills would show balanced competency scores because the model doesn't distinguish domains. This is misleading.

**Affected files:**
- `src/utils/readiness/competencyModel.ts` — replace or wrap with domain-aware model
- `src/utils/readiness/model.ts` — swap `deriveCompetencySnapshot` call
- `src/pages/MissionFlow/StatsSurface.tsx` — render per-domain progress
- New: `src/utils/readiness/domainProgress.ts` — new domain progress calculation

**Effort:** ~3–5 days. The model logic is straightforward; the UI for domain progress visualization is the larger portion.

---

### Priority 3: Card Schema Normalization + Exercise Enrichment

**Goal:** Fix the content quality floor so every card delivers actual training value, not just a title and a bullet list.

**Current state** ([Card.ts](../architecture/data-structures.md)):
```ts
type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];    // often comma-separated strings on disk, normalized at load
    duration: number;          // often strings on disk ("10"), coerced at load
    difficulty: "Beginner" | "Light" | "Standard" | ... | "Unknown";
    summaryText?: string;      // 140-280 char shareable blurb. Sparse coverage.
    classification?: string;
};
```

**Problems at the data level:**
- 69% of decks have only 2–3 cards
- `bulletpoints` on disk are frequently a single comma-separated string, not an array
- `duration` on disk is frequently a string, not a number
- No support for exercises, quizzes, markdown content, images, or structured learning activities
- Quality ranges from "keyword soup" (Reiki Healing) to "structured curriculum" (OSINT)

**Target card schema (backward-compatible extension):**
```ts
type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number;
    difficulty: Difficulty;
    summaryText?: string;
    classification?: string;
    // New fields (all optional → no migration)
    content?: string;              // Markdown body for rich content
    exercises?: Exercise[];         // Structured practice activities
    keyTerms?: string[];           // Vocabulary / glossary terms
    references?: string[];         // Further reading links
    prerequisites?: string[];      // Card IDs that should come first
    learningObjectives?: string[]; // What the user should know after
};

type Exercise = {
    type: 'recall' | 'apply' | 'analyze' | 'self-check';
    prompt: string;
    hints?: string[];
    expectedOutcome?: string;
};
```

**Content enrichment strategy:**

The original content generation scripts were deleted, but the shard pipeline (`public/training_modules_shards/`) and `CardDataLoader.ts` normalization layer still work. The approach:

1. **Schema normalization pass** — Fix all on-disk JSON: bulletpoints to arrays, duration to numbers, validate required fields
2. **Exercise generation per domain** — Each of the 19 modules needs domain-appropriate exercises (physical conditioning ≠ cryptography ≠ leadership)
3. **Minimum card count** — Ensure every deck has ≥ 5 cards with substantive content
4. **Quality floor** — Every card must have: ≥3 real bulletpoints, a description >50 chars, at least one exercise

**Affected files:**
- `src/types/Card.ts` — extend type
- `public/training_modules_shards/*.json` — content files (663 decks across shards)
- `src/utils/CardDataLoader.ts` — extend normalization for new fields
- `src/components/DrillRunner/DrillRunner.tsx` — render exercises (depends on Priority 1)
- Scripts: new validation/generation tooling needed

**Effort:** ~2–4 weeks. The schema extension is trivial; the actual content work is the bottleneck. This is where the "systems-first, content-last" debt lives, and paying it down is real labor.

---

## Priority Ordering Rationale

```
Priority 1 → Priority 2 → Priority 3
  (days)       (days)       (weeks)
```

**Priority 1 first** because it's the cheapest change with the most visible impact. Right now, running a drill means checking boxes. After Priority 1, it means reading content and reflecting on it. This transforms the core loop from "did you do it?" to "what did you learn?"

**Priority 2 second** because it consumes the self-assessment data from Priority 1 and provides the feedback loop that makes training *feel* like progress. It also requires Priority 1's `domainId` field on history entries.

**Priority 3 last** because it's the most labor-intensive and benefits from the infrastructure built by Priorities 1 and 2 (exercise rendering, domain tracking). It's also partially parallelizable — content authoring can begin as soon as the schema is extended, even while Priority 2 is underway.

---

## Success Criteria

| Priority | Done When |
|----------|-----------|
| 1 | A user can run a drill, read card content inline, take notes, and rate their understanding. History shows past notes and ratings. |
| 2 | Stats surface shows per-domain progress. Readiness score reflects actual domain coverage, not meta-competency proxies. A user who trains only Cryptography sees their Crypto score rise while other domains stay flat. |
| 3 | Every card deck has ≥5 cards. Every card has substantive content and at least one exercise. Schema validates clean on disk (no string-as-array, no string-as-number). |

---

## What This Does NOT Address (Intentionally)

These are real problems acknowledged but **explicitly deferred**:

- **Semantic costume problem** — The adapter mapping "Barbell Squat" to intelligence artifacts is wrong, but fixing the frame is less urgent than fixing the content inside it.
- **Write-only telemetry** — 96 event types with zero consumers. Valuable data is being collected; consumers can be built once the domain model stabilizes.
- **Ungated mission flow** — SOP enforcement would improve structure but doesn't help if the content behind the gates is thin.
- **P2P sovereignty** — Feature-flagged off in production. Real but not user-facing yet.

These become relevant after the three priorities ship and the core training loop actually teaches something.
