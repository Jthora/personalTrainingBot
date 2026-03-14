# Content Pipeline — Authoring Strategy

## The Core Decision

How do you write 1,100+ new cards and rewrite 7,000+ exercise prompts across 19
disciplines that span cybersecurity, group theory, dance, counter-intelligence, and
biochemical threat assessment?

No single person has expertise across all 19 domains. The strategy must account for
this reality.

---

## Option A: Pure AI Generation

**Approach:** Use an LLM (Claude, GPT-4, etc.) with domain-specific system prompts and
the quality rubric as constraints. Generate cards in bulk, validate against rubric
automation, ship.

| Pros | Cons |
|------|------|
| Fastest: days, not months | The existing content IS AI-generated. Doing it again with a better prompt produces better templates, not expert content. |
| Consistent formatting | No ground-truth verification — hallucinated "facts" in cybersecurity or biochem could teach wrong information |
| Cheap | Exercises will be creative-sounding but may not test the right things |
| Scalable | Domain-specific nuance (e.g., equations needing valid LaTeX, dance needing beat counts) requires per-module tuning |

**Estimated effort:** 2-4 weeks (prompt engineering + generation + automated validation)

**Quality ceiling:** ~5/10 — better than current 2/10 but still recognizably synthetic.
Users who know the domains will notice.

---

## Option B: AI-Assisted with Expert Review

**Approach:** AI generates first drafts. A human with domain knowledge reviews, corrects
factual errors, improves exercise prompts, and validates that the content teaches what
it claims. Using the quality rubric as a checklist.

| Pros | Cons |
|------|------|
| 3-5x faster than manual authoring | Still need access to 19 domains of expertise |
| AI handles boilerplate, human handles judgment | Review fatigue: reading 1,100 AI cards is tedious |
| Factual accuracy verified | Bottlenecked by reviewer availability |
| Exercises get human-designed scenarios | Reviews may become rubber-stamps if volume is too high |

**Estimated effort:** 10-20 weeks (1 person, assuming ~15 min per card for review+edit)

**Quality ceiling:** ~6-7/10 — meaningfully better than AI-only if reviewers are engaged.

---

## Option C: Manual Expert Authoring

**Approach:** Domain experts write cards from scratch, using the schema and rubric as
guides. No AI involvement in content creation.

| Pros | Cons |
|------|------|
| Highest quality possible | Slowest: 30-60 min per card |
| Teaching is intentional, not templated | Need to find/hire 10+ subject matter experts |
| Exercises test real skills | Expensive |
| Consistent with how professional training is developed | May never reach scale for 19 domains |

**Estimated effort:** 30-60 weeks (1 person) or 6-12 weeks with 5 domain experts

**Quality ceiling:** 8-9/10 — professional training material quality.

---

## Recommendation: Option B (AI-Assisted + Review) with Pilot Validation

### Phase 1: Pilot (Weeks 1-4)

Pick **2 modules** and fully upgrade them using AI-assist + review:

**Pilot 1: cybersecurity** — chosen because:
- Core operative discipline, high user interest
- 18 thin decks to expand (manageable scope)
- 5 decks already expanded (partial baseline)
- Testable skills with clear right/wrong answers
- Cybersecurity knowledge is well-covered by AI training data

**Pilot 2: investigation** — chosen because:
- Different domain type (analytical vs. technical)
- Small: 18 decks, 36 cards
- Transferable skills (evidence handling, logical reasoning)
- Tests whether AI can produce scenario-based exercises for soft skills

### Phase 1 Deliverables
- ~108 new cards (54 per module)
- ~500 rewritten exercises
- Quality rubric validated against real output
- Time-per-card benchmarks for effort projection
- Decision: is AI-assist quality sufficient, or do we need Option C?

### Phase 2: Scale (Weeks 5-20+)

Based on pilot learnings, scale to remaining modules:

**Approach per module:**
1. AI generates first-draft cards using module-specific system prompt
2. Run automated rubric validation (reject cards scoring < 6/10)
3. Human reviewer edits surviving drafts (target: 15 min/card)
4. Run content tests (quiz generation produces valid questions from new cards)
5. Ship module, track quiz scores for quality signal

**Batching strategy:**
- Group similar domains: all physical domains together, all intelligence domains together
- Reserve high-expertise domains (equations, counter_biochem) for later when process is refined

### Phase 3: Continuous Improvement (Ongoing)

- Track quiz accuracy rates per card — low accuracy may indicate bad content, not bad students
- Implement "flag this card" feature for users to report confusing/incorrect content
- Monthly quality audits using rubric automation

---

## Exercise Authoring Guidelines

The hardest part isn't card content — it's writing exercises that test comprehension
instead of recall. Guidelines for each exercise type:

### Recall (rewrite required for all 4,064)

**Bad:** `"From memory, list the key points of [title]."`
**Good:** `"What are the four group axioms, and what property distinguishes an abelian group?"`

Rule: The answer should require understanding relationships, not parroting labels.

### Apply (rewrite required for ~1,280)

**Bad:** `"Describe how you would apply [title] concepts in a real-world scenario."`
**Good:** `"Given these server logs showing 47 failed SSH attempts, write the grep command to extract the source IPs and their frequency."`

Rule: Give a concrete scenario. The expected outcome should be a specific action, not
a meta-description of what "applying" means.

### Analyze (rewrite required for ~3,164)

**Bad:** `"Why is [title] important? What happens if these principles are ignored?"`
**Good:** `"Compare SIEM and manual log analysis: in what scenario is each approach more effective, and what does each miss?"`

Rule: Ask for comparison, evaluation, or trade-off analysis. The answer should require
weighing multiple factors.

### Self-Check (rewrite required for ~3,224)

**Bad:** `hints: ["I can explain: [bulletpoint 1]", "I can explain: [bulletpoint 2]"]`
**Good:** `hints: ["I can identify a brute force attack from auth logs", "I can explain how SIEM correlation works across log sources", "I can describe chain of custody requirements for digital evidence"]`

Rule: Each hint should be a skill claim, not a section reference.

### New Type: Scenario (to be added)

Not currently in the Exercise type union. Proposed:

```typescript
type: 'scenario'
prompt: string   // A concrete situation description
choices?: string[]  // Optional decision points
expectedOutcome: string  // What the correct response is and why
```

Scenarios are the highest-value exercise type for operational training. They present
a realistic situation and ask "what do you do?" This aligns directly with the
operative training mission.

---

## AI Prompt Template (for Phase 1 pilot)

```
You are authoring training cards for a [DOMAIN] curriculum. Each card teaches one
specific skill or concept that an operative needs in the field.

QUALITY REQUIREMENTS:
- description: 2+ sentences, explain what this is AND why it matters
- bulletpoints: 4-8 items, each ≥ 15 words, each teaches one concrete fact
- exercises: 2+ exercises, at least one non-recall, NO template prompts
  - Do NOT use "From memory, list the key points"
  - Do NOT use "Describe how you would apply the concepts"
  - Do NOT use "Why is X important?"
  - DO use concrete scenarios, specific questions, practical applications
- keyTerms: 3-8 real domain vocabulary terms (not sentence fragments)
- learningObjectives: 3 items, each starting with a measurable verb
  - Do NOT use "Understand the core principles of"
  - Do NOT use "Apply knowledge of"
  - DO use: Identify, Explain, Compare, Demonstrate, Calculate, Diagnose, etc.
- expectedOutcome: ≥ 50 characters, specific answer (not "Full comprehension of X")

CARD TOPIC: [TOPIC]
EXISTING CARD (if expanding): [EXISTING JSON]
```
