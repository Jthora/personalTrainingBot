# Drill Enforcement

> **Dimension: Drill Execution · Current: 3/10 · Target: 7/10**

## Problem Statement

DrillRunner is the core training loop — the place where users are supposed to actually
learn material. Today, it rewards completion regardless of engagement:

| Symptom | Evidence |
|---------|----------|
| Content collapsed by default | `useState(false)` at `StepItem` in [DrillRunner.tsx](../../../src/components/DrillRunner/DrillRunner.tsx#L59) |
| Checkboxes bypass content | `onToggle` calls `DrillRunStore.toggleStep()` with no expansion guard |
| No minimum engagement time | All steps checked → `useEffect` fires `handleComplete()` immediately |
| Self-assessment is optional | Label says `"Self-assessment (optional)"` · "Skip & record" always available |
| Exercises are reveal-only | `ExerciseRenderer` shows prompts and reveals answers — no text input, no validation |
| SR treats all cards equally | All cards in a drill receive the same `selfAssessment ?? 3` rating |

**Result:** A user can "complete" an 8-step drill in under 10 seconds by tapping
checkboxes. The system awards 35 + 8×5 = 75 XP, increments drill count, records
an SR review at quality 3 for every card, and shows "+75 XP" — **identical to a
user who spent 30 minutes deeply engaging with the material.**

## What "Fixed" Looks Like

After enforcement:

1. Card content is **expanded by default** — the user sees description, bulletpoints,
   exercises, and key terms without extra taps
2. A step's checkbox is **gated behind expansion** — cannot be checked until the card
   content panel has been opened at least once
3. **Self-assessment is required** — the "Record drill" button is disabled until a 1-5
   rating is selected; the "Skip & record" fallback is removed
4. A **minimum engagement threshold** adds friction for impossibly fast completions
   (all steps checked in < N×15 seconds triggers a "Did you review these?" prompt)
5. Per-card SR quality uses **individual card interaction signals** (expanded, exercise
   attempted, time spent) rather than a single drill-wide rating

## Effort Estimate

| Component | Work | Days |
|-----------|------|------|
| StepItem default expansion + gate | Flip boolean, add `opened` tracking, predicate on checkbox | 1 |
| Required self-assessment | Remove "optional", disable button, remove "Skip & record" | 0.5 |
| Minimum engagement threshold | Timer check before completion effect | 1 |
| Per-card interaction tracking | New state in StepItem, pipe to SR recording | 1-2 |
| ExerciseRenderer completion signal | Expose `onComplete` per exercise type | 1 |
| Unit test rewrites (16 DrillRunner + 18 ExerciseRenderer) | Update mocks, add expansion setup | 3-5 |
| E2E test updates (~5 tests across 3 spec files) | Update selectors, add expansion steps | 1-2 |
| **Total** | | **8-12 days** |

## Documents

| Document | Purpose |
|----------|---------|
| [implementation-plan.md](implementation-plan.md) | Component-by-component code changes with line references |
| [design-decisions.md](design-decisions.md) | UX questions that need answers before coding |
| [test-impact.md](test-impact.md) | Which tests break and rewrite strategy |
