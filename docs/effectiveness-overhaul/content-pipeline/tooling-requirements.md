# Content Pipeline — Tooling Requirements

## Overview

Content authoring at scale requires tooling for validation, generation, and review.
These tools should exist before bulk content work begins.

---

## 1. Content Validation Script

**Purpose:** Automated rubric enforcement. Run as CI check and as a pre-commit hook
to prevent low-quality cards from shipping.

**Location:** `scripts/validateContent.ts`

**Inputs:** Training module shard JSON files in `public/training_modules_shards/`

**Outputs:**
- Per-card score (0-10) against the quality rubric
- List of failing validation rules per card
- Module-level summary (% cards passing, % thin decks, exercise diversity)
- JSON report saved to `artifacts/content-validation-report.json`

### Validation Rules

```typescript
interface ValidationResult {
  cardId: string;
  moduleId: string;
  deckId: string;
  score: number;           // 0-10
  issues: ValidationIssue[];
}

interface ValidationIssue {
  field: string;           // 'description' | 'bulletpoints' | 'exercises' | etc.
  rule: string;            // e.g. 'min-sentences', 'no-template-prompt'
  message: string;         // Human-readable description
  severity: 'error' | 'warning';
}
```

**Rules to implement:**

| Field | Rule ID | Severity | Check |
|-------|---------|----------|-------|
| description | `min-sentences` | error | ≥ 2 sentences |
| bulletpoints | `min-count` | error | ≥ 4 items |
| bulletpoints | `min-word-count` | error | Each ≥ 15 words |
| bulletpoints | `no-title-substring` | warning | No bulletpoint is a substring of card title |
| exercises | `min-count` | error | ≥ 2 exercises |
| exercises | `no-recall-template` | error | No "From memory, list the key points" |
| exercises | `no-apply-template` | error | No "Describe how you would apply" |
| exercises | `no-analyze-template` | error | No "Why is X important? What happens" |
| exercises | `no-selfcheck-template` | error | No "Check your understanding of" |
| exercises | `min-outcome-length` | error | expectedOutcome ≥ 50 chars |
| exercises | `outcome-not-bulletpoints` | error | expectedOutcome ≠ bulletpoints verbatim |
| exercises | `type-diversity` | warning | ≥ 2 exercise types |
| keyTerms | `min-count` | error | ≥ 3 terms |
| keyTerms | `no-fragments` | warning | No 2-word bulletpoint fragments |
| learningObjectives | `min-count` | error | ≥ 3 objectives |
| learningObjectives | `no-bloom-template` | error | No "Understand the core principles of" |
| learningObjectives | `measurable-verb` | warning | Starts with action verb |
| summaryText | `present` | warning | Field exists and is 140-280 chars |
| deck | `min-cards` | error | ≥ 5 cards per deck |

**Estimated effort:** 3-5 days

---

## 2. Template Detection Script

**Purpose:** Identify all templated content across the entire corpus. Used as a
baseline measurement and to prioritize rewriting effort.

**Location:** `scripts/detectTemplates.ts`

**Outputs:**
- Count of templated exercises by type and module
- Templated learning objectives by module
- Fragment keyTerms by module
- Total remediation estimate (cards × fields to rewrite)

**Template patterns to detect:**

```typescript
const TEMPLATE_PATTERNS: Record<string, RegExp> = {
  recall_template: /^From memory, list the key points of/i,
  apply_template: /^Describe how you would apply the concepts from/i,
  analyze_template: /^Why is .+ important\? What happens if/i,
  selfcheck_template: /^Check your understanding of/i,
  bloom_understand: /^Understand the core principles of/i,
  bloom_apply: /^Apply knowledge of/i,
  bloom_evaluate: /^Evaluate the significance of/i,
  vague_outcome: /^(Full comprehension of|A practical application of|Understanding the importance)/i,
};
```

**Estimated effort:** 1 day

---

## 3. Content Generation Pipeline

**Purpose:** AI-assisted card generation with quality guardrails.

**Location:** `scripts/generateContent.ts`

**Workflow:**

```
1. Input: module ID + list of topics (from deck names)
         + existing cards (if expanding)
         + quality rubric (as system prompt constraint)
         + domain-specific context (e.g., "cybersecurity")
     ↓
2. LLM generates card JSON for each topic
     ↓
3. Automated rubric validation (rejects cards scoring < 6/10)
     ↓
4. Output: generated-cards/{module}/{deck}.json (for human review)
     ↓
5. Human reviewer edits in card editor or directly in JSON
     ↓
6. Final validation pass → merge into training_modules_shards/
```

**Dependencies:**
- Quality rubric (content-pipeline/quality-rubric.md)
- Validation script (#1 above)
- LLM API access (Claude API or similar)
- Per-module system prompts

**Estimated effort:** 1 week (script + prompts + integration with validation)

---

## 4. Card Authoring Tool (Optional)

**Purpose:** Web-based UI for editing card JSON with live preview. Alternatives:
editing JSON shards directly (works for developers, not for SME reviewers).

**Two approaches:**

### Option A: VS Code Extension (lighter weight)

JSON schema validation + preview panel for card rendering. Leverages existing VS Code
setup. No separate tool to maintain.

- JSON Schema for Card type → VS Code validates on save
- Snippet templates for new cards/exercises
- Preview panel shows rendered card (reuse ExerciseRenderer)

**Effort:** 3-5 days

### Option B: Standalone Web Editor (heavier, but better for non-dev reviewers)

A simple React app (can reuse existing components) with:
- Card JSON editor with syntax highlighting
- Live preview using actual DrillRunner/ExerciseRenderer components
- Rubric score displayed in real-time as you edit
- Bulk import/export
- Module browser

**Effort:** 2-3 weeks

### Recommendation: Start with Option A

Most content work in Phase 1 will be done by developers or technical reviewers who
already use VS Code. If the project scales to non-dev SME reviewers, build Option B.

---

## 5. Quiz Quality Metrics

**Purpose:** After content ships, track whether quiz questions generated from new
cards produce better learning outcomes than old ones.

**Metrics to track (via existing telemetry):**

| Metric | Meaning |
|--------|---------|
| Quiz accuracy rate per card | Low accuracy may indicate bad content or bad questions |
| Time per question per card | Very fast = too easy; very slow = confusing question |
| Quiz retry rate per deck | Users retaking quizzes = engaged; never retaking = disengaged |
| SR interval distribution per module | Short intervals = struggling; growing intervals = learning |

**Implementation:** These metrics can be derived from existing telemetry events
(`quiz_complete`, `quiz_answer`, SR review records). Need a reporting script, not
new instrumentation.

**Location:** `scripts/quizQualityReport.ts`

**Estimated effort:** 2-3 days

---

## 6. Content CI Integration

**Purpose:** Prevent regression. Run content validation on every PR that modifies
training shard files.

**GitHub Actions workflow:**

```yaml
name: Content Validation
on:
  pull_request:
    paths:
      - 'public/training_modules_shards/**'
      - 'public/training_modules_manifest.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsx scripts/validateContent.ts
      - name: Check for failures
        run: |
          ERRORS=$(jq '.totals.errors' artifacts/content-validation-report.json)
          if [ "$ERRORS" -gt 0 ]; then
            echo "Content validation failed with $ERRORS errors"
            exit 1
          fi
```

**Estimated effort:** 0.5 days (after validation script exists)

---

## Implementation Order

```
Week 1:  Template detection script (1 day) → establishes baseline
         Content validation script (3-5 days) → enforces rubric
Week 2:  Content generation pipeline (1 week) → AI-assist workflow
         VS Code card schema (from validation script)
Week 3:  Quiz quality report (2-3 days)
         CI integration (0.5 days)
         Begin pilot content generation for cybersecurity + investigation
```

**Total tooling effort: ~2-3 weeks** before content authoring at scale begins.
