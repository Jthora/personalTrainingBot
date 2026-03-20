# Phrase Bank Architecture

> Schema, seeded assembly, and generateContent.ts integration.

---

## Phrase Bank File Format

Each module phrase bank is a Markdown file at `docs/content/phrase-banks/modules/<module>.md`. The file contains sections, each section covering a topic cluster within the module. Structure:

```markdown
## <Topic Name>

**keywords**: comma-separated trigger words

### Facts
- Fact statement 1
- Fact statement 2
- ...

### Procedures
- Step or procedure 1
- Step or procedure 2
- ...

### Exercises
- Exercise prompt 1
- Exercise prompt 2
- ...
```

Example from `counter-psyops.md`:

```markdown
## BITE Model — Behavior Control

**keywords**: bite, behavior, control, sleep, diet, finances, relationships, time

### Facts
- Behavior control in coercive organizations includes regulation of sleep (often under 7 hours to induce compliance), diet (limiting nutrition to create physical dependence), financial autonomy (collecting member income or assets), and social contact (restricting outside relationships).
- Sleep deprivation is not incidental in high-control groups — it is a deliberate destabilization tactic that reduces critical thinking capacity.

### Procedures
- When evaluating a group for coercive behavior control, audit: scheduled sleep times mandated by the group, dietary rules enforced with shame or punishment, financial requirements (tithing, donations, surrender of assets), and rules governing contact with non-members.

### Exercises
- Review the sleep, diet, and financial policies of a group you are researching. List which policies use shame, guilt, or punishment as enforcement mechanisms.
- Interview a former member: ask specifically what would happen to them if they violated the group's rules about finances or outside relationships.
```

---

## Seeded Assembly

The assembly algorithm is deterministic and operates without network access.

```typescript
// scripts/lib/phraseBank.ts

import { createHash } from 'node:crypto';

export interface PhraseSection {
  topic: string;
  keywords: string[];
  facts: string[];
  procedures: string[];
  exercises: string[];
}

export interface PhraseBank {
  moduleId: string;
  sections: PhraseSection[];
}

export function selectPhrases(
  card: { id: string; term: string; definition?: string },
  bank: PhraseBank,
  count = 4,
): { bulletPoints: string[]; exercises: string[] } {
  // Deterministic seed from card ID
  const seed = seedFromId(card.id);
  const prng = mulberry32(seed);

  // Score sections by keyword overlap with card term + definition
  const cardText = `${card.term} ${card.definition ?? ''}`.toLowerCase();
  const scored = bank.sections.map(section => ({
    section,
    score: section.keywords.filter(kw => cardText.includes(kw)).length,
  }));

  // Sort by score descending; tie-break with prng
  scored.sort((a, b) => b.score - a.score || prng() - 0.5);

  // Collect phrases from top-scoring sections
  const bulletPoints: string[] = [];
  const exercises: string[] = [];

  for (const { section } of scored) {
    const pool = [...section.facts, ...section.procedures];
    const shuffled = seededShuffle(pool, prng);
    bulletPoints.push(...shuffled.slice(0, 2));
    exercises.push(...seededShuffle(section.exercises, prng).slice(0, 1));
    if (bulletPoints.length >= count) break;
  }

  return {
    bulletPoints: bulletPoints.slice(0, count),
    exercises: exercises.slice(0, 2),
  };
}

function seedFromId(id: string): number {
  const hash = createHash('sha256').update(id).digest('hex');
  return parseInt(hash.slice(0, 8), 16);
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], prng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
```

---

## Integration with `generateContent.ts`

Add `--phrase-bank` flag:

```bash
npx tsx scripts/generateContent.ts \
  --backend=none \
  --module=counter_psyops \
  --phrase-bank=docs/content/phrase-banks/modules/counter-psyops.md \
  --apply
```

When `--phrase-bank` is specified:

1. Parse the phrase bank Markdown file into `PhraseBank` object
2. For each card, call `selectPhrases(card, bank)` to get `bulletPoints` and `exercises`
3. If `--backend=groq|gemini`, pass the selected phrases as context to the AI prompt:

```
You are rewriting flashcard content. You MUST use only the facts and procedures provided below. Do not add new information. Do not change factual claims. Rewrite for clarity and conciseness.

Facts provided:
- [phrase 1]
- [phrase 2]
- [phrase 3]

Exercises provided:
- [exercise 1]

Output the bullet points and exercise as clean Markdown. No commentary.
```

4. If AI call fails or `--backend=none`, use the selected phrases directly as the final content

---

## Phrase Bank Parsing

The Markdown parser for phrase banks is straightforward:

```typescript
export function parsePhraseBank(moduleId: string, markdown: string): PhraseBank {
  const sections: PhraseSection[] = [];
  let current: PhraseSection | null = null;
  let currentList: string[] | null = null;

  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { topic: line.slice(3).trim(), keywords: [], facts: [], procedures: [], exercises: [] };
      currentList = null;
    } else if (line.startsWith('**keywords**:') && current) {
      current.keywords = line.replace('**keywords**:', '').split(',').map(k => k.trim().toLowerCase());
    } else if (line.startsWith('### Facts') && current) {
      currentList = current.facts;
    } else if (line.startsWith('### Procedures') && current) {
      currentList = current.procedures;
    } else if (line.startsWith('### Exercises') && current) {
      currentList = current.exercises;
    } else if (line.startsWith('- ') && currentList) {
      currentList.push(line.slice(2).trim());
    }
  }
  if (current) sections.push(current);
  return { moduleId, sections };
}
```
