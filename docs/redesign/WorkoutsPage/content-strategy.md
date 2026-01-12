# Content Strategy

## Voice and Tone
- Clear, concise, and confident; encouraging without being pushy.
- Coach-aligned language: supportive, action-oriented, avoids jargon unless defined.
- Avoid filler; prioritize scannability with short sentences and bullets where helpful.
- Inclusive language; avoid gendered terms; respect varied abilities and goals.

## Terminology & Glossary
- Define workout terms: duration, intensity, difficulty, equipment, coach, category, tags, steps.
- Consistent capitalization (e.g., “Workout”, “Coach”, “Schedule”).
- Avoid ambiguous terms; prefer explicit labels (e.g., “Duration (minutes)”).

## Microcopy Patterns
- Primary CTA labels: “Add to schedule”, “Apply filters”, “Save changes”.
- Secondary actions: “Cancel”, “Clear filters”, “Close”.
- Helper text: concise guidance under inputs (e.g., “Select equipment you have available”).
- Tooltips: brief clarifications; avoid essential info in hover-only; provide focusable triggers.
- Empty state CTAs: encourage next step (e.g., “Browse recommended workouts”).

## States Messaging
- Loading: “Loading workouts…” with optional skeleton; avoid blocking language.
- Empty (no results): “No workouts match your filters” + suggestion to adjust filters.
- Empty (library): “No workouts yet” + CTA to explore or sync.
- Error: “We couldn’t load workouts” + retry; avoid blame; include support path if needed.
- Slow state: “Still loading…” + spinner; suggest checking connection.

## Instructional Content
- Short, ordered steps for workouts in detail view; avoid walls of text.
- Equipment lists: bullet format; call out optional vs required.
- Safety cues: brief, clear warnings where applicable.

## Labels & Forms
- Filters: explicit labels with units (e.g., “Duration (min)”).
- Sort controls: “Sort by” + selected option; avoid abbreviations without legend.
- Required vs optional fields clearly indicated.

## Error Prevention & Recovery
- Confirm destructive actions or offer undo; wording: “Remove from schedule?” with consequence note.
- Validation messages near the control; specific guidance (e.g., “Choose a date in the future”).
- Keep user data intact on errors; avoid clearing forms on failure.

## Accessibility & Readability
- Plain language; avoid idioms; SR-friendly labels and descriptions.
- Use lists for dense info; break long paragraphs; maintain contrast.
- Avoid emoji-only indicators; pair icons with text.

## Localization Readiness
- Externalize strings; avoid concatenation that breaks word order.
- Allow for text expansion (30–50%); flexible button widths where possible.
- Date/time/number formats via locale-aware utilities.
- Avoid embedded HTML in strings; support placeholders with names (e.g., {duration}).

## Consistency with Adjacent Pages
- Align tone and phrasing with Home/Training/Schedules (e.g., “Today’s plan”, “Preview”).
- Reuse established copy patterns for empty/loading/error where appropriate.

## Content Governance
- Source of truth: this doc + string tables.
- Review cadence with Content/UX writing before milestones.
- Change log for key copy changes near release.

## Examples (to be authored)
- Standard button labels for filters and scheduling.
- Empty/error messages library.
- Tooltip text for equipment/intensity/difficulty.

## Open Questions
- Do we need localization for coach names/descriptions?
- Are there regulatory/medical disclaimers required in detail views?
