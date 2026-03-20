# Semantic Link Algorithm

> TF-IDF + cosine similarity. Deterministic. No model weights. No network.

---

## Input

Each card is treated as a document. The document text is the concatenation of:

```
{term} {definition} {bulletPoints.join(' ')} {exercises.join(' ')}
```

All fields are concatenated with a single space. Missing fields are skipped (not substituted with placeholder text).

---

## Algorithm Steps

### 1. Tokenize

```typescript
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}
```

Stopword list covers English function words (`the`, `and`, `is`, `in`, `to`, `a`, `of`, `for`, `with`, `that`, `this`, `are`, `was`, `but`, `not`, `you`, `your`, etc.). Full list in `scripts/lib/stopwords.ts`.

### 2. Build Term Frequency (TF) Per Card

$$TF(t, d) = \frac{\text{count of term } t \text{ in document } d}{\text{total terms in document } d}$$

```typescript
function termFrequency(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  const total = tokens.length;
  for (const [t, c] of counts) counts.set(t, c / total);
  return counts;
}
```

### 3. Build Inverse Document Frequency (IDF) Across Corpus

$$IDF(t) = \ln\left(\frac{N}{|\{d : t \in d\}|}\right)$$

Where $N$ is total number of cards (4,354) and the denominator is the number of cards containing term $t$.

### 4. Compute TF-IDF Vector Per Card

```typescript
function tfidfVector(tf: Map<string, number>, idf: Map<string, number>): Map<string, number> {
  const vec = new Map<string, number>();
  for (const [term, tfScore] of tf) {
    const idfScore = idf.get(term) ?? 0;
    if (idfScore > 0) vec.set(term, tfScore * idfScore);
  }
  return vec;
}
```

### 5. Cosine Similarity

$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \cdot \|B\|}$$

```typescript
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [term, score] of a) {
    dot += score * (b.get(term) ?? 0);
    normA += score ** 2;
  }
  for (const score of b.values()) normB += score ** 2;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 6. Select Top-K Per Card

For each card, compute similarity against all other cards. Take the top 5 by cosine similarity score, excluding the card itself and excluding cards with similarity < 0.05 (noise floor).

```typescript
const K = 5;
const NOISE_FLOOR = 0.05;
```

---

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Cards | 4,354 |
| Pairs to score | ~9.5M |
| Vocabulary size (post-filter) | ~8,000–12,000 terms |
| Runtime estimate (single-threaded) | ~30–90 seconds |
| Output size delta | ~500KB (relatedCards arrays added to shards) |

If runtime is prohibitive, use a sparse dot product approach (only compute similarity between cards sharing at least one non-trivial term). This reduces work by ~85–90% with negligible quality loss.

---

## Parameterization

All tunable values are in `scripts/computeSemanticLinks.ts` at the top of the file:

```typescript
const TOP_K = 5;            // Maximum related cards per card
const NOISE_FLOOR = 0.05;   // Minimum similarity to count as related
const MIN_TOKENS = 5;       // Cards with fewer tokens are not scored
const CROSS_MODULE_BIAS = 1.1;  // Slight bonus for cross-module links
```

`CROSS_MODULE_BIAS` slightly upweights cross-module links to prevent modules from self-linking entirely. Set to `1.0` to disable.
