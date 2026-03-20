# Build-Time Content Pipeline

> AI generation is developer tooling, not a user feature.
> The field handbook is printed once. The reader just reads it.

---

## Mental Model

```
Developer workspace          →   Committed shards   →   Deployed PWA   →   Cadet device
  (runs AI pipeline once)         (in git history)       (SW precache)      (fully offline)
```

`generateContent.ts` is a **maintenance script** in the same category as a database seed or a code generator. It runs in the developer's terminal against free-tier AI APIs, writes improved content to `generated-cards/` for review, and when approved, applies it back to the shard JSON files via `--apply`. The result is committed. Cadets receive better doctrine without any runtime dependency.

This is how every static documentation system in existence works. The Earth Alliance field handbook is not a chatbot.

---

## Current State

`scripts/generateContent.ts` exists and supports:

- `--module=<id>` — process one module at a time
- `--dry-run` — preview without writing
- `--apply` — write improved cards back to shards
- `--backend=groq` — use Groq free API (14,400 req/day, Llama 3.3 70B)
- `--backend=gemini` — use Gemini Flash 2.0 (1,500 req/day)
- `--api-key=<key>` or `GROQ_API_KEY` / `GEMINI_API_KEY` env vars
- `--delay=<ms>` — rate-limit throttle (default 1200ms)

**Gap**: No checkpoint/resume system. If generation fails at card 300 of 720, the session is lost. No batch-size limit. No daily-progress tracking.

→ See [`checkpoint-resume.md`](checkpoint-resume.md)

---

## The Free-Tier Math

| Backend | Daily limit | Per-session target | Days to complete |
|---------|------------|-------------------|-----------------|
| Groq | 14,400 req/day | 200 cards | ~22 days |
| Gemini Flash 2.0 | 1,500 req/day | 200 cards | ~22 days |
| Both alternating | ~1,700 req/day | 400 cards | ~11 days |

At `--delay=2100` (Groq: 30 req/min hard limit → 28 safe) and 200 cards per session:
- Session duration: ~7 minutes
- Daily commitment: one 7-minute terminal run

→ See [`daily-workflow.md`](daily-workflow.md)

---

## Module Priority

Process high-debt modules first: counter_psyops (720), anti_tcs_idc_cbc (555), anti_psn (450), self_sovereignty (469), then the remaining 14 modules.

→ See [`module-priority.md`](module-priority.md)

---

## The Phrase-Bank Fallback

When AI calls fail (rate limit, network error, missing key), `generateContent.ts` falls back to the phrase-bank doctrine engine — human-authored domain-specific fragments assembled deterministically. The fallback produces content that passes `detectTemplateExercises`. This ensures every session makes progress regardless of API availability.

→ See [`../phrase-banks/README.md`](../phrase-banks/README.md)
