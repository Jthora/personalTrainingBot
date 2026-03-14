# Content Pipeline — Quality Rubric

This rubric defines what a "good enough" card looks like. It's the quality gate for both
new card authoring and existing card improvement. Every card should pass all MUST criteria
before shipping; SHOULD criteria are targets for mature content.

---

## Field-by-Field Requirements

### `description` — MUST: ≥ 2 sentences, ≤ 280 characters

| Level | Example |
|-------|---------|
| **Fail** | `"Using forensic techniques to analyze log files."` (1 sentence, no context) |
| **Pass** | `"System and network logs are the primary evidence source in digital forensics. Understanding log formats and correlation techniques lets you reconstruct incident timelines."` |
| **Good** | Adds a "why it matters" hook: `"...Without log analysis skills, you'll miss the artifacts that prove an attacker was there."` |

**Validation rule:** `description.split(/[.!?]+/).filter(s => s.trim()).length >= 2`

---

### `bulletpoints` — MUST: 4-8 items, each ≥ 15 words

| Level | Example |
|-------|---------|
| **Fail** | `["Syslog analysis", "SIEM tools", "log parsing techniques"]` (3 labels, 2-3 words each) |
| **Pass** | `["Syslog (RFC 5424) uses facility/severity codes — auth.crit means a critical authentication event", ...]` (explanatory sentences) |
| **Good** | Each bulletpoint teaches one concrete fact a quiz can meaningfully test |

**Validation rules:**
- `bulletpoints.length >= 4 && bulletpoints.length <= 8`
- `bulletpoints.every(bp => bp.split(/\s+/).length >= 15)`
- No bulletpoint is a substring of the card title

---

### `exercises` — MUST: ≥ 2 exercises, ≥ 1 non-recall type, zero templated prompts

| Level | Example |
|-------|---------|
| **Fail** | `"From memory, list the key points of 'X'."` → expectedOutcome = the bulletpoints verbatim |
| **Pass** | Domain-specific prompt that requires applying knowledge, not just listing labels |
| **Good** | Scenario-based exercise with a concrete situation and a non-obvious correct answer |

**Validation rules:**
- `exercises.length >= 2`
- No exercise prompt matches `/^From memory, list the key points/i`
- No exercise prompt matches `/^Describe how you would apply the concepts from/i`
- No exercise prompt matches `/^Why is .+ important\? What happens if/i`
- No exercise prompt matches `/^Check your understanding of/i`
- `expectedOutcome` does not match bulletpoints verbatim
- `expectedOutcome.length >= 50` (no one-sentence non-answers)
- At least one exercise is not type `recall`

---

### `keyTerms` — MUST: 3-8 real terms, no sentence fragments

| Level | Example |
|-------|---------|
| **Fail** | `["Keep arms", "Move beat", "Implement controlled"]` (sentence fragments) |
| **Pass** | `["Syslog RFC 5424", "SIEM correlation", "brute force", "chain of custody"]` (real vocabulary) |
| **Good** | Terms that are independently searchable and appear in domain literature |

**Validation rules:**
- `keyTerms.length >= 3 && keyTerms.length <= 8`
- No term is a 2-word fragment of a bulletpoint (regex: term is a contiguous substring
  of exactly 2 words from a bulletpoint)
- Each term has ≥ 2 words OR is a recognized acronym/proper noun
- No term equals the card title

---

### `learningObjectives` — MUST: 3 objectives, each specific and testable

| Level | Example |
|-------|---------|
| **Fail** | `"Understand the core principles of X"` / `"Apply knowledge of [bulletpoint 1]"` / `"Evaluate the significance of [description]"` (Bloom's template with fill-in) |
| **Pass** | `"Identify common attack patterns from raw log entries"` (specific, testable action) |
| **Good** | Each objective maps to a quiz question that verifies the skill |

**Validation rules:**
- `learningObjectives.length >= 3`
- No objective matches `/^Understand the core principles of/i`
- No objective matches `/^Apply knowledge of/i`
- No objective matches `/^Evaluate the significance of/i`
- Each objective starts with a measurable verb (Identify, Explain, Compare, Demonstrate,
  Calculate, Classify, Construct, Predict, Diagnose, etc.)

---

### `summaryText` — SHOULD: 140-280 characters, standalone comprehensible

Used as quiz explanation source. Should make sense to someone who hasn't read the card.

**Validation rule:** `summaryText && summaryText.length >= 140 && summaryText.length <= 280`

---

## Deck-Level Requirements

| Criterion | Rule |
|-----------|------|
| Minimum cards per deck | ≥ 5 |
| Maximum cards per deck | ≤ 15 (for manageability) |
| Card difficulty distribution | At least 2 difficulty levels represented |
| Prerequisites defined | Cards with `difficulty > "Standard"` should have `prerequisites` |

---

## Module-Level Requirements

| Criterion | Rule |
|-----------|------|
| Minimum decks per module | ≥ 10 |
| Thin deck percentage | 0% (no deck with < 5 cards) |
| Exercise type diversity | All 4+ exercise types used across the module |
| Content review date | Each module should have a `lastReviewedAt` metadata field |

---

## Scoring a Card

For automated validation, score each card against the MUST criteria:

| Field | Points | Max |
|-------|--------|-----|
| description ≥ 2 sentences | 1 | 1 |
| bulletpoints 4-8 items, each ≥ 15 words | 2 | 2 |
| exercises ≥ 2, no templates, outcomes ≥ 50 chars | 3 | 3 |
| keyTerms 3-8 real terms | 1 | 1 |
| learningObjectives 3, specific verbs | 2 | 2 |
| summaryText present and 140-280 chars | 1 | 1 |
| **Total** | | **10** |

- **8-10:** Ship-ready
- **5-7:** Needs improvement, prioritize for next content sprint
- **0-4:** Requires full rewrite
