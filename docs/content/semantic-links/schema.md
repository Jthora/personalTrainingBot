# Schema Changes for Semantic Links

> One new optional field on `Card`. Nothing else changes.

---

## Card Type Change

**Current** (`src/types/training.ts` or equivalent):

```typescript
export interface Card {
  id: string;
  term: string;
  definition: string;
  bulletPoints: string[];
  exercises: string[];
  // ... other fields
}
```

**After**:

```typescript
export interface Card {
  id: string;
  term: string;
  definition: string;
  bulletPoints: string[];
  exercises: string[];
  relatedCards?: string[];  // ← NEW: card IDs ordered by similarity (highest first)
  // ... other fields
}
```

The field is optional (`?`) so:
- Existing cards without it are valid
- Cards processed by `computeSemanticLinks.ts` have it
- No migration script needed — just run `computeSemanticLinks.ts` and commit

---

## Shard Format

The field appears inside the card object inside each shard JSON:

```json
{
  "moduleId": "counter_psyops",
  "decks": [
    {
      "deckId": "cpops-bite-model",
      "cards": [
        {
          "id": "cpops-bite-001",
          "term": "BITE Model",
          "definition": "Behavior, Information, Thought, and Emotional control — the four domains exploited by coercive organizations.",
          "bulletPoints": ["..."],
          "exercises": ["..."],
          "relatedCards": [
            "atcs-thought-reform-001",
            "psiops-thought-stopping-003",
            "cpops-loaded-language-007",
            "antispsn-darvo-002",
            "intel-source-eval-004"
          ]
        }
      ]
    }
  ]
}
```

---

## Build Output

`computeSemanticLinks.ts` reads all shards, computes links, and writes updated shards in-place. It does not create separate files. The workflow is:

```bash
# Compute and write to shards directly
npx tsx scripts/computeSemanticLinks.ts

# Audit what changed
git diff --stat public/training_modules_shards/

# Commit
git add public/training_modules_shards/
git commit -m "content: add semantic cross-links to all 4,354 cards"
```

---

## Constraints

- `relatedCards` array is always sorted by similarity score descending
- Maximum 5 entries per card (enforced by build script `TOP_K = 5`)
- All IDs in `relatedCards` must exist in the corpus (build script validates this)
- A card never lists itself as related
- A card may list cards from any module (cross-module links are expected and encouraged)
