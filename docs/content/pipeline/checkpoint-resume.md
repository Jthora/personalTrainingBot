# Checkpoint & Resume System

> When 720 cards stretch across 4 days of free-tier sessions, you cannot lose 3 days of work to a single crash.

---

## CLI Flag Specification

```bash
# Start fresh with a checkpoint file
npx tsx scripts/generateContent.ts \
  --backend=groq \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json

# Resume from where you left off
npx tsx scripts/generateContent.ts \
  --backend=groq \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json \
  --resume

# Apply everything that passed review
npx tsx scripts/generateContent.ts \
  --module=counter_psyops \
  --checkpoint=artifacts/gen-checkpoint.json \
  --apply
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--batch-size=N` | `number` | `Infinity` | Stop after processing N cards (regardless of how many remain) |
| `--checkpoint=<path>` | `string` | `undefined` | Path to checkpoint JSON file |
| `--resume` | `boolean` | `false` | Skip cards whose IDs appear in checkpoint as `completed` |

---

## Checkpoint File Schema

```json
{
  "version": 1,
  "createdAt": "2026-03-20T09:00:00Z",
  "updatedAt": "2026-03-20T09:07:23Z",
  "backend": "groq",
  "moduleId": "counter_psyops",
  "batchSize": 200,
  "totalCards": 720,
  "processedCount": 200,
  "completedCardIds": [
    "cpops-001", "cpops-002", "..."
  ],
  "failedCardIds": [
    { "cardId": "cpops-047", "reason": "API timeout" }
  ],
  "sessions": [
    {
      "startedAt": "2026-03-20T09:00:00Z",
      "completedAt": "2026-03-20T09:07:23Z",
      "cardsProcessed": 200,
      "aiSuccesses": 194,
      "aiFallbacks": 6,
      "backend": "groq"
    }
  ]
}
```

---

## Implementation Plan

### Changes to `scripts/generateContent.ts`

#### 1. Add `parseArgs()` flags

```typescript
let checkpointPath: string | undefined;
let resume = false;
let batchSize = Infinity;

if (arg.startsWith('--checkpoint=')) checkpointPath = arg.split('=')[1];
if (arg === '--resume') resume = true;
if (arg.startsWith('--batch-size=')) batchSize = parseInt(arg.split('=')[1] ?? '200', 10);
```

#### 2. Load checkpoint in `main()`

```typescript
interface CheckpointData {
  version: number;
  createdAt: string;
  updatedAt: string;
  backend: string;
  moduleId?: string;
  batchSize: number;
  totalCards: number;
  processedCount: number;
  completedCardIds: string[];
  failedCardIds: { cardId: string; reason: string }[];
  sessions: SessionData[];
}

function loadCheckpoint(path: string): CheckpointData | null {
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path, 'utf-8')) as CheckpointData;
}

function saveCheckpoint(path: string, data: CheckpointData): void {
  data.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(path), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
```

#### 3. Skip completed cards when `--resume`

```typescript
const skipIds = new Set<string>(
  resume && checkpoint ? checkpoint.completedCardIds : [],
);

for (const card of deck.cards) {
  if (skipIds.has(card.id)) continue;  // ← skip already-processed

  // process card...

  // Update checkpoint after each card
  if (checkpointPath && checkpoint) {
    checkpoint.completedCardIds.push(card.id);
    checkpoint.processedCount++;
    saveCheckpoint(checkpointPath, checkpoint);
  }

  // Stop when batch is full
  if (processedThisSession >= batchSize) {
    console.log(`\n  ⏸ Batch size ${batchSize} reached — stopping. Run with --resume to continue.`);
    goto sessionEnd;  // break out of all loops
  }
}
```

#### 4. Initialize checkpoint at session start

```typescript
if (checkpointPath) {
  if (!checkpoint || !resume) {
    // Start fresh
    checkpoint = {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      backend: backend === 'none' ? 'template' : backend,
      moduleId: moduleFilter,
      batchSize,
      totalCards: modules.reduce((sum, m) => sum + m.decks.reduce((s, d) => s + d.cards.length, 0), 0),
      processedCount: 0,
      completedCardIds: [],
      failedCardIds: [],
      sessions: [],
    };
  }
  checkpoint.sessions.push({
    startedAt: new Date().toISOString(),
    completedAt: '',
    cardsProcessed: 0,
    aiSuccesses: 0,
    aiFallbacks: 0,
    backend: backend === 'none' ? 'template' : backend,
  });
}
```

---

## Recovery Procedure

```bash
# Session was interrupted — see where it stopped
cat artifacts/gen-checkpoint.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'Processed: {d[\"processedCount\"]} / {d[\"totalCards\"]}')
print(f'Failed: {len(d[\"failedCardIds\"])}')
print(f'Last session ended: {d[\"sessions\"][-1][\"startedAt\"]}')
"

# Resume
npx tsx scripts/generateContent.ts \
  --backend=groq \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json \
  --resume
```

---

## Test Coverage

Add to `scripts/__tests__/generateContent.checkpoint.test.ts`:

- `it('skips completed card IDs when --resume is set')`
- `it('stops at batch size and writes checkpoint')`
- `it('creates fresh checkpoint when --checkpoint specified without --resume')`
- `it('records failed card IDs on API error')`
- `it('session data is appended on each run')`
