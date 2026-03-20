# Content Substance Initiative

> **The field handbook must be worth reading before the mission is worth running.**

---

## The Problem in Numbers

| Metric | Count | % of Total |
|--------|-------|-----------|
| Total cards | 4,354 | — |
| Cards with template bulletpoints | 4,277 | **98%** |
| Cards with template exercises | 4,064 | **93%** |
| Modules at 100% template pollution | 12 of 19 | **63%** |

Every one of these cards renders correctly. The SR system schedules them. The quiz runner tests them. The drill engine sequences them. The machinery is real — but three-word labels in place of doctrine, and "list the key points of…" in place of missions, means the machinery trains nothing.

The Earth Alliance commissioning authority cannot issue credentials on the basis of recognizing placeholder text.

---

## The Three-Track Strategy

This initiative runs three parallel tracks, each sovereign and offline by design:

### Track 1 — Build-Time Pipeline
*The developer runs AI generation as a maintenance tool. Improved content gets committed to the repo. Cadets receive a better field handbook with every deploy. Zero runtime AI dependency.*

**Status**: `generateContent.ts` exists. Needs `--checkpoint` and `--batch-size` to operate within free-tier limits.

→ See [`pipeline/`](pipeline/README.md)

### Track 2 — Semantic Cross-Linking
*Precompute card-to-card relationships using TF-IDF at build time. Store `relatedCards[]` in the shard JSON. Render a "Related Cards" section in the app. Zero network, zero API, fully offline.*

**Purpose**: Cross-domain synthesis — connecting `OSINT` to `surveillance detection` to `social engineering` to `information laundering` — is the actual operational capability being trained. The SR system surfaces individual cards; semantic links surface the network of doctrine.

→ See [`semantic-links/`](semantic-links/README.md)

### Track 3 — Phrase-Bank Doctrine Engine
*Replace the template engine in `generateContent.ts` with a human-authored corpus of domain-specific fragments. The Earth Alliance controls its doctrine. Generation is deterministic by card ID seed — the same card always produces the same output, version-stable, no external dependency.*

**Purpose**: When AI generation is unavailable, the phrase banks produce substantive content that passes `detectTemplateExercises`. More importantly, the corpus is doctrine — it can be reviewed, improved, and maintained by domain experts.

→ See [`phrase-banks/`](phrase-banks/README.md)

---

## Track 4 — Local AI (Advanced, Optional)

If runtime AI assistance is ever warranted (card explanations, alternative scenarios), the only permissible implementation is a localhost Ollama endpoint. No cloud. No external API calls. No cadet content leaving the device.

→ See [`local-ai/`](local-ai/README.md)

---

## Module Priority Queue

Sorted by content debt (template-polluted cards × mission criticality):

| Priority | Module | Cards | Template-BP | Template-EX | Mission Role |
|----------|--------|-------|------------|-------------|-------------|
| **1** | `counter_psyops` | 720 | 100% | 100% | Primary cognitive defense doctrine |
| **2** | `anti_tcs_idc_cbc` | 555 | 100% | 100% | Cult/coercive control resistance |
| **3** | `anti_psn` | 450 | 100% | 100% | Narcissistic system defense |
| **4** | `self_sovereignty` | 469 | 95% | 100% | Foundational Earth Alliance value |
| **5** | `equations` | 397 | 88% | 100% | Quantitative reasoning baseline |
| **6** | `space_force` | 204 | 100% | 100% | Orbital operations |
| **7** | `intelligence` | 181 | 99% | 100% | Core tradecraft |
| **8** | `fitness_training` | 180 | 100% | 0% | Physical readiness (exercises already good) |
| **9** | `martial_arts` | 180 | 100% | 100% | Close combat doctrine |
| **10** | `psiops` | 146 | 99% | 100% | Influence operations |
| **11** | `cybersecurity` | 143 | 100% | 100% | Cyber tradecraft |
| **12** | `psiops` | 146 | 99% | 100% | Information operations |
| **13** | `investigation` | 90 | ~98% | ~98% | Forensic methods |
| **14** | `espionage` | 90 | ~98% | ~98% | Covert operations |
| **15** | `combat` | 90 | ~98% | ~98% | Tactical doctrine |
| **16** | `war_strategy` | 90 | ~98% | ~98% | Strategic planning |
| **17** | `counter_biochem` | 94 | ~98% | ~98% | CBRN defense |
| **18** | `web_three` | 90 | ~98% | ~98% | Decentralized systems |
| **19** | `dance` | 110 | ~80% | ~80% | Movement and expression |
| **20** | `agencies` | 75 | ~80% | ~80% | Organizational structure |

---

## What "Done" Looks Like

A card is considered substance-complete when:

1. `description` — 2–3 specific sentences about this exact topic, not the topic category
2. `bulletpoints` — 4+ items, each a self-contained fact ≥ 20 words, domain-specific, no template filler
3. `exercises` — 5 types, each with a specific prompt tied to this card's content
4. `learningObjectives` — 3+, using Bloom's action verbs, specific to this card
5. `keyTerms` — 3+, no 2-word fragments, no generic terms
6. `summaryText` — 140–280 chars, specific and quotable
7. `scoreCard()` returns ≥ 8/10 (not just ≥ 6/10 — raise the bar)

---

## What Success Means for the Earth Alliance

A trained counter-psyops operative who scores well on template-recognition has learned nothing. A cadet who can identify the BITE model indicators, explain why loaded language precedes thought-stopping, and construct a specific scenario for detecting coercive persuasion in a real briefing room — that cadet is armed.

The Earth Alliance's legitimacy as an institution rests on whether the training it provides is worth completing. The substance initiative is not a technical quality problem. It is a commissioning standards problem.

---

*Tracks: [Pipeline](pipeline/README.md) · [Semantic Links](semantic-links/README.md) · [Phrase Banks](phrase-banks/README.md) · [Local AI](local-ai/README.md)*
