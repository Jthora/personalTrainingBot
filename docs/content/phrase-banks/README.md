# Phrase Banks — Doctrine Engine

> Human-authored. Deterministic. The stochastic generator has no authority here.

---

## The Problem with Template Content

4,277 of 4,354 cards (98%) currently have template bullet points. These templates are not wrong — they are hollow. `"Learn about the BITE model"` contains zero information. A cadet who drills this card learns nothing. The card wastes time.

The goal is not to make cards sound smarter. The goal is to make every bullet point and every exercise deliver a real fact, a real procedure, or a real scenario — something a cadet can use.

---

## Why Not Just Use AI?

AI can generate plausible-sounding content. It can also:

- Hallucinate specific tactics that do not exist
- Soften doctrine language to avoid content policy flags
- Vary its output unpredictably across runs (same card, different content tomorrow)
- Fail to understand Earth Alliance doctrine framing

Phrase banks solve this by separating **what to say** (human-authored, doctrine-correct) from **how to assemble it** (deterministic, scripted). The AI becomes an assembler of pre-approved phrases rather than a freeform generator.

---

## How It Works

### 1. Phrase Bank Files

Each module has a phrase bank file at `docs/content/phrase-banks/modules/<module>.md`. These files contain the actual domain content: facts, procedures, patterns, warnings, exercises. Written by humans. Reviewed by humans. Committed to the repo.

### 2. `generateContent.ts` as Phrase Assembler

When `generateContent.ts` runs with a phrase bank, it:

1. Loads the module's phrase bank
2. Seeds a deterministic PRNG with the card's ID
3. Selects 3–5 relevant phrases for the card's topic using keyword matching
4. Formats them as bullet points
5. Selects 1–2 relevant exercises and formats them

The output is different for every card (because IDs differ) but identical on re-runs (because seeding is deterministic). No network required.

### 3. AI as Optional Polisher

If `--backend=groq|gemini` is specified, the assembled phrase selection is passed to the AI as a structured prompt: "Rewrite these bullet points as clean prose appropriate for a flashcard. Do not add new information. Do not remove information. Do not change the factual claims." The AI polishes tone, not content.

If the AI is unavailable or returns garbage, the pre-assembled phrase selection is used as-is.

---

## Architecture

See [architecture.md](./architecture.md) for the technical implementation (phrase bank schema, seeded assembly, generateContent.ts integration).

---

## Phrase Bank Index

| Module | Cards | File | Status |
|--------|-------|------|--------|
| `counter_psyops` | 720 | [counter-psyops.md](./modules/counter-psyops.md) | ✅ authored |
| `anti_tcs_idc_cbc` | 555 | [anti-tcs-idc-cbc.md](./modules/anti-tcs-idc-cbc.md) | ✅ authored |
| `anti_psn` | 450 | [anti-psn.md](./modules/anti-psn.md) | ✅ authored |
| `self_sovereignty` | 469 | [self-sovereignty.md](./modules/self-sovereignty.md) | ✅ authored |
| `intelligence` | 181 | [intelligence.md](./modules/intelligence.md) | ✅ authored |
| `cybersecurity` | 143 | [cybersecurity.md](./modules/cybersecurity.md) | ✅ authored |
| `equations` | 397 | [equations.md](./modules/equations.md) | stub |
| `space_force` | 204 | [space-force.md](./modules/space-force.md) | stub |
| `psiops` | 146 | [psiops.md](./modules/psiops.md) | stub |
| `fitness_training` | 180 | [fitness-training.md](./modules/fitness-training.md) | stub |
| `martial_arts` | 180 | [martial-arts.md](./modules/martial-arts.md) | stub |
| `counter_biochem` | 94 | [counter-biochem.md](./modules/counter-biochem.md) | stub |
| `dance` | 110 | [dance.md](./modules/dance.md) | stub |
| `investigation` | 90 | [investigation.md](./modules/investigation.md) | stub |
| `espionage` | 90 | [espionage.md](./modules/espionage.md) | stub |
| `combat` | 90 | [combat.md](./modules/combat.md) | stub |
| `war_strategy` | 90 | [war-strategy.md](./modules/war-strategy.md) | stub |
| `web_three` | 90 | [web-three.md](./modules/web-three.md) | stub |
| `agencies` | 75 | [agencies.md](./modules/agencies.md) | stub |
