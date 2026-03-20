# Daily Workflow

> One 7-minute morning session per day. No context switching. Content accumulates.

---

## The Pattern

```bash
# 1. Check where you are (10 seconds)
cat artifacts/gen-checkpoint.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'{d[\"processedCount\"]}/{d[\"totalCards\"]} done — {d[\"totalCards\"]-d[\"processedCount\"]} remaining')
"

# 2. Run the session (~7 minutes for 200 cards at --delay=2100)
npx tsx scripts/generateContent.ts \
  --backend=groq \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json \
  --resume

# 3. Commit the shards
git add public/training_modules_shards/counter_psyops.json artifacts/gen-checkpoint.json
git commit -m "content: counter_psyops batch N — 200/720 cards improved"
git push origin main
```

---

## Token Budget Math

| Backend | Free Tier | At --delay=2100ms | Cards/Session | Sessions to 4,354 |
|---------|-----------|-------------------|---------------|-------------------|
| Groq | 14,400 req/day | ~1 req/card | 200 | 22 |
| Gemini | 1,500 req/day | ~1 req/card | 200 | 22 |

- `--delay=2100` keeps Groq well under 10 req/min (one Groq tier 3 limit)
- 200 cards × 35ms (API) = real elapsed ~7min with delay
- Two backends alternated = 400 cards/day = ~11 calendar days total

---

## Session Types

### Type A: Single-Module Grind

Run the same module every day until done. Best for focus. Worst if one module stalls.

```bash
--module=counter_psyops --batch-size=200 --resume
```

### Type B: Round-Robin

Rotate modules daily. Ensures no module falls weeks behind. Use when you have time to switch context.

```bash
# Day 1:
--module=counter_psyops --batch-size=100

# Day 2:
--module=anti_tcs_idc_cbc --batch-size=100

# Day 3:
--module=anti_psn --batch-size=100
```

Use a per-module checkpoint file: `artifacts/gen-checkpoint-counter_psyops.json`, etc.

### Type C: Dry Run Audit

No writes. Check what would change. Good for CI validation.

```bash
npx tsx scripts/generateContent.ts \
  --backend=groq \
  --module=self_sovereignty \
  --dry-run \
  --batch-size=50
```

---

## Commit Message Pattern

```
content: <module> batch <N> — <X>/<total> cards improved
content: counter_psyops batch 2 — 400/720 cards improved
content: anti_psn complete — 450/450 cards improved [closes content #3]
```

---

## Progress Tracking

After each session, update `artifacts/content-progress.md`:

| Module | Total | Done | Sessions Left | Status |
|--------|-------|------|---------------|--------|
| counter_psyops | 720 | 200 | 3 | 🔄 active |
| anti_tcs_idc_cbc | 555 | 0 | 3 | ⏳ queued |
| anti_psn | 450 | 0 | 3 | ⏳ queued |
| self_sovereignty | 469 | 0 | 3 | ⏳ queued |
| equations | 397 | 0 | 2 | ⏳ queued |
| ... | | | | |

---

## Failure Recovery

If a session crashes mid-batch, the checkpoint preserves completed IDs. Just re-run with `--resume`. No data is lost. No card is processed twice.

If Groq rate-limits unexpectedly, switch to Gemini for the remainder of the session:

```bash
npx tsx scripts/generateContent.ts \
  --backend=gemini \
  --api-key=$GEMINI_API_KEY \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json \
  --resume
```

The checkpoint is backend-agnostic — it tracks card IDs, not which API processed them.
