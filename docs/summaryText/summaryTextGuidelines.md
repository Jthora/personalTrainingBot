# SummaryText Authoring Guidelines

Generated on 2025-10-02

These guidelines explain how to craft clear, reader-friendly `summaryText` entries for every training card. Follow them in combination with the catalog (`cardCatalog.md`) and progress tracker (`cardSummaryProgress.md`) so the entire collection moves toward a consistent, high-quality voice.

## 1. Purpose & scope
- **Audience:** Learners skimming summaries before diving into the full card details.
- **Goal:** Deliver a single-sentence snapshot that captures the skill, action, or decision the card teaches.
- **Coverage:** Applies to all cards under `src/data/training_modules/**/card_decks/**.json`.

## 2. Formatting constraints
- **Length:** Target 200–240 characters; never exceed 280 characters. Keeping a 15–20 character buffer helps avoid accidental overshoots as cards evolve.
- **Structure:** One sentence (or two short clauses joined by `;` or `—`). No lists, emojis, or markup.
- **Voice:** Active voice, second-person or imperative tone ("Learn", "Practice", "Master").
- **Casing:** Sentence case. Proper nouns follow normal capitalization rules.
- **No duplicates:** Each card gets its own tailored `summaryText`; avoid copying across decks even if topics overlap.

## 3. Know the source data
Every card provides enough context to craft a summary:

| Field | How to use it |
| --- | --- |
| `title` | Introduce the action or focus area. Sometimes the `title` itself can start your sentence. |
| `description` | Supplies the core outcome—translate this into learner language. |
| `bulletpoints` | Surface 1–2 distinctive tactics or steps to avoid generic phrasing. |
| `duration` & `difficulty` | Mention only if it differentiates the card (e.g., "short 5-minute drill" or "advanced fieldwork"). |
| `focus` (deck-level) | Reinforce the broader theme if a card feels ambiguous. |

Tip: For decks with many similar cards, keep a working note of which tactic you emphasized in each summary to maintain variety.

## 4. Writing workflow
1. **Skim the card:** Read the `title`, `description`, and `bulletpoints` to capture the unique hook.
2. **Define the learner outcome:** Ask, "After this card, what can someone immediately do or understand?"
3. **Compose the sentence:** Start with a strong verb, weave in the core tactic, and optionally highlight duration/difficulty.
4. **Check the character count:** Aim for 200–240 characters; trim redundant words and avoid filler.
5. **Update trackers:** Mark the deck in `cardSummaryProgress.md` with status, date, and any notes (e.g., cards that need SME review).

## 5. Content heuristics
- **Highlight specifics:** Reference concrete tactics (e.g., "Set up covert drop sites" instead of "Improve communications").
- **Show the benefit:** Clarify the "why" or end-state—how does this help the learner operate better?
- **Avoid jargon unless defined:** Prefer plain language; if a technical term is essential, pair it with a hint of context.
- **Stay time-relevant:** Use present tense and avoid phrases like "will learn"—focus on the immediate action.
- **Respect scope:** Summaries should reflect the card only; do not preview other cards in the deck.

## 6. Quality checklist before committing
- [ ] 200–240 characters (≤280 hard limit) and single-sentence structure.
- [ ] Captures the unique tactic or insight from the card.
- [ ] Clear benefit or outcome for the learner.
- [ ] Tone matches existing training copy (direct, confident, tactical).
- [ ] No placeholder text, trailing spaces, or double punctuation.
- [ ] Confirmed in `cardSummaryProgress.md` for traceability.

## 7. Examples

**Card:** `legend_building`

- **Title:** Legend Building
- **Description:** Creating and maintaining false identities for deep cover operations.
- **Bulletpoints:** Develop detailed backstories; Memorize false credentials; Practice consistent mannerisms

**Effective summary (225 chars):**
> Build a resilient cover identity by scripting deep backstories, locking in forged credentials, and rehearsing consistent mannerisms so every interaction reinforces your legend under scrutiny.

**Why it works:** Leads with the action, includes the three tactics concisely, and states the outcome (a resilient cover) while staying within the character budget.

**Ineffective summary:**
> Learn legend building.

**Problem:** Too short, lacks detail, and does not explain what makes the skill actionable.

## 8. Collaboration notes
- **SME review:** Flag cards needing subject-matter expert validation in the tracker’s Notes column.
- **Batch workflow:** Work module by module. Commit `summaryText` updates alongside tracker changes for traceability.
- **Automation helper:** Use a quick Node snippet to verify length before committing:

```bash
node -e "const s='Build a resilient cover identity...'; console.log(s.length)"
```

(Replace with your summary; the script prints the character count.)

## 9. Future enhancements
- Add linting or CI checks that reject summaries over 280 characters.
- Provide deck-level style notes (tone, mandatory phrases) once SMEs supply them.
- Consider a `summaryText` glossary to keep repeated terminology consistent across modules.
