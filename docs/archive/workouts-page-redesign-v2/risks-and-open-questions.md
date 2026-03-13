# Risks and Open Questions

## Risks
- UX churn: moving controls into a toolbar/sheet may surprise returning users without in-app guidance.
- Mobile complexity: sheet focus trapping and scroll locking can regress accessibility if rushed.
- Visual drift: aligning with Schedules requires token consistency; mismatched tokens could reintroduce inconsistency.
- Redundant difficulty controls: must remove duplicates to avoid split states.

## Open questions
- Should the detail view become a slide-over on mobile, or remain inline with "reopen" affordance?
- Do we support multi-select/batch add in this wave? (Impacts toolbar actions.)
- Should filters/sort persist across sessions via URL or localStorage? (Currently store-driven.)
- Is there a need for schedule-awareness like “today’s plan” vs “later” badges?
- Should Schedules deep-link apply filters automatically (e.g., based on schedule gaps)?

## Decisions
- 2026-01-12 — Mobile detail uses slide-over sheet (max-width 960px) with backdrop, body scroll lock, and focus return to selected list item. Rationale: keeps list visible, mirrors Filters sheet UX, and avoids vertical jumpiness from inline accordion. Owner: Eng (Jono) with Design alignment per Components Plan.
