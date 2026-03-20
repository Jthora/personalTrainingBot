# Semantic Cross-Linking

> "Related Cards" — surface connections cadets didn't know to look for.
> Computed at build time. Stored in shards. Works offline.

---

## What This Is

Every flashcard in the system covers one concept. But concepts cross boundaries: a card about gaslighting in `anti_psn` is directly relevant to loaded language in `counter_psyops`. A card about OPSEC in `self_sovereignty` connects to HUMINT exposure in `intelligence`. A card about thought-stopping in `anti_tcs_idc_cbc` mirrors one in `psiops`.

Semantic cross-linking makes these connections explicit. When a cadet reviews a card, they can tap "Related Cards" to jump directly to the 3–5 most conceptually similar cards across the entire library — without search, without navigation, without being online.

---

## Architecture Overview

```
Build Time                                Production (Offline)
─────────────────────────────────────────────────────────────────
                                          
  Training Shards                         Deployed Shards
  (4,354 cards)                           (each card has
       │                                   relatedCards: string[])
       ▼                                            │
  computeSemanticLinks.ts                           ▼
  (TF-IDF + cosine similarity)            <RelatedCards cardId={id} />
       │                                  Shows up to 5 cards
       ▼                                  No network. No search.
  Updated Shards                          Instant.
  (relatedCards field added)
       │
       ▼
  git commit → Vercel deploy
```

---

## Non-Goals

- **Not a search feature.** Cadets cannot query arbitrary text. These are precomputed links.
- **Not AI-powered at runtime.** All computation happens on the developer's machine at build time.
- **Not dynamic.** Links do not change as the cadet reviews cards. They are fixed at deploy time.
- **Not a recommendation algorithm.** There is no learning loop, no user profile, no feedback.

---

## Related Documents

- [Algorithm specification](./algorithm.md) — TF-IDF, cosine similarity, stopword filtering
- [Schema changes](./schema.md) — `relatedCards: string[]` field in Card type
- [Component specification](./component-spec.md) — `<RelatedCards />` UI component
- [Build script specification](./build-script.md) — `computeSemanticLinks.ts` implementation
