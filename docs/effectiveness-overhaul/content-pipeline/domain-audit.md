# Content Pipeline — Domain Audit

Per-module breakdown of current content state, based on `artifacts/content-audit-report.json`
and shard sampling.

## Summary Table

| Module | Decks | Cards | Thin% | Content State | Priority |
|--------|-------|-------|-------|---------------|----------|
| counter_psyops | 72 | 720 | 0% | ✅ Expanded — zero thin decks | Low (maintain) |
| equations | 41 | 397 | 0% | ✅ Expanded — includes LaTeX notation | Low (maintain) |
| self_sovereignty | 45 | 469 | 0% | ✅ Expanded | Low (maintain) |
| space_force | 21 | 204 | 0% | ✅ Expanded | Low (maintain) |
| intelligence | 19 | 181 | 0% | ✅ Expanded | Low (maintain) |
| anti_tcs_idc_cbc | 111 | 333 | **100%** | 🔴 All thin · largest module by deck count | High |
| anti_psn | 90 | 270 | **100%** | 🔴 All thin | High |
| fitness | 36 | 72 | **100%** | 🔴 All thin · physical domain | Medium |
| martial_arts | 36 | 72 | **100%** | 🔴 All thin · physical domain | Medium |
| dance | 22 | 44 | **100%** | 🔴 All thin · physical domain | Medium |
| web_three | 18 | 54 | **100%** | 🔴 All thin | High |
| espionage | 18 | 36 | **100%** | 🔴 All thin | High |
| war_strategy | 18 | 36 | **100%** | 🔴 All thin | Medium |
| combat | 18 | 36 | **100%** | 🔴 All thin | Medium |
| agencies | 15 | 30 | **100%** | 🔴 All thin | Medium |
| investigation | 18 | 36 | **100%** | 🔴 All thin | High |
| cybersecurity | 23 | 89 | **78%** | 🟡 Partially expanded (5 non-thin decks) | High |
| psiops | 24 | 92 | **75%** | 🟡 Partially expanded (6 non-thin decks) | Medium |
| counter_biochem | 18 | 60 | **94%** | 🔴 Nearly all thin (1 non-thin deck) | Medium |

---

## Tier 1 — High Priority (piloting candidates)

These modules are core to the app's identity and have the worst content ratios.

### cybersecurity (23 decks, 89 cards, 78% thin)

**Why high priority:** Core operative discipline. 5 modules are already expanded —
build on existing momentum. Cybersecurity content has clear, testable skills.

**Current content quality:** Bulletpoints are label-only ("Syslog analysis", "SIEM tools").
Exercises are templated. keyTerms are fragments.

**Expansion needs:**
- 18 thin decks × 3 new cards average = **~54 new cards**
- All 89 existing cards need exercise rewriting
- Domain expertise: network security, forensics, incident response, cryptography

### intelligence (19 decks, 181 cards, 0% thin — but needs exercise quality audit)

**Note:** Zero thin decks, but the expanded content may still use templated exercises.
Needs a quality audit against the rubric before declaring it done.

### investigation (18 decks, 36 cards, 100% thin)

**Why high priority:** Analytical skills transferable across domains.

**Expansion needs:**
- 18 thin decks × 3 new cards average = **~54 new cards**
- Domain expertise: forensic methodology, evidence handling, interview techniques

### espionage (18 decks, 36 cards, 100% thin)

**Why high priority:** Core operative identity domain.

**Expansion needs:**
- 18 thin decks × 3 new cards average = **~54 new cards**
- Domain expertise: tradecraft, HUMINT, operational security

### web_three (18 decks, 54 cards, 100% thin)

**Why high priority:** Aligns with self_sovereignty (already expanded).

**Expansion needs:**
- 18 thin decks × 2 new cards average = **~36 new cards**
- Domain expertise: blockchain, DeFi, sovereign identity, smart contracts

### anti_tcs_idc_cbc (111 decks, 333 cards, 100% thin)

**Why high priority:** Largest module by deck count. Represents significant curriculum
surface area.

**Expansion needs:**
- 111 thin decks × 3 new cards average = **~333 new cards** (!!!)
- This module alone is 30% of the entire expansion effort
- Consider restructuring: 111 decks with 2-3 cards each might be better as 30-40
  decks with 8-10 cards each

### anti_psn (90 decks, 270 cards, 100% thin)

**Why high priority:** Second-largest module by deck count.

**Expansion needs:**
- 90 thin decks × 2 new cards average = **~180 new cards**
- Similar restructuring consideration as anti_tcs_idc_cbc

---

## Tier 2 — Medium Priority

### Physical Domains (fitness, martial_arts, dance, combat)

**Shared challenge:** Physical skills don't translate well to text-card learning.
A "Side Step" card with bulletpoints about footwork requires video or at minimum
detailed movement descriptions with timing cues.

**Strategic question:** Should physical domains remain text-only cards, or should
they be restructured around:
- Movement descriptions with rep/set schemes (fitness)
- Technique breakdowns with sequence diagrams (martial_arts)
- Rhythm patterns with beat counts (dance)
- Combination sequences with decision trees (combat)

**Combined expansion needs:**
- 112 thin decks × 3 new cards = **~336 new cards**
- Quality bar is different: need movement-specific exercise types

### Other (war_strategy, agencies, psiops, counter_biochem)

Standard knowledge domains. Need the same template-to-substance conversion as Tier 1
but lower user-facing impact.

**Combined expansion needs:**
- 73 thin decks × 3 new cards = **~219 new cards**

---

## Tier 3 — Already Expanded (Maintain)

### counter_psyops (72 decks, 720 cards, 0% thin)

Largest module by card count. Zero thin decks. **Still needs quality audit** —
expanded doesn't mean the exercises are non-templated.

### equations (41 decks, 397 cards, 0% thin)

Uses LaTeX notation in bulletpoints. Quiz generation may need special handling for
math expressions. **Quality may be high** — math cards naturally have testable exercises.

### self_sovereignty, space_force, intelligence

Already expanded. Audit for exercise quality, then declare done.

---

## Expansion Budget (New Cards Needed)

| Tier | Decks to Expand | New Cards (to reach 5/deck) | New Cards (to reach 8/deck) |
|------|-----------------|----------------------------|----------------------------|
| Tier 1 (High) | 273 | ~550 | ~1,000 |
| Tier 2 Physical | 112 | ~336 | ~600 |
| Tier 2 Other | 73 | ~219 | ~400 |
| **Total** | **453** | **~1,100** | **~2,000** |

Plus **~7,000-9,000 exercise prompts** rewritten across ALL cards (including Tier 3).

---

## Restructuring Candidates

Two modules have unusually high deck counts with very few cards per deck:

| Module | Decks | Cards | Cards/Deck |
|--------|-------|-------|------------|
| anti_tcs_idc_cbc | 111 | 333 | 3.0 |
| anti_psn | 90 | 270 | 3.0 |

Both should be evaluated for **deck consolidation** before expansion. 111 decks of 3
cards each may represent 111 narrow topics that should be 30-40 broader topics with
8-10 cards each. Expanding without restructuring produces 111 decks of 5 cards — still
too granular for meaningful learning sequences.
