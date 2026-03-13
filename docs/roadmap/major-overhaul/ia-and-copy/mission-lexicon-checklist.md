# Mission Lexicon Checklist

Use this checklist for every PR that changes user-visible copy (headings, buttons, empty states, hints, status messages, ARIA labels).

## Required Voice
- Operational, calm, precise, actionable.
- Mission-first framing over fitness/task-tracker framing.
- Short directives that tell the user what to do next.

## Required Terminology
Use these preferred terms when relevant:
- Mission / operation
- Case
- Signal
- Artifact
- Debrief
- Mission plan
- Drill / drill run
- Readiness
- Triage
- Lane

## Avoid Terminology (unless strictly technical/internal)
Avoid these terms in user-visible copy on active routes:
- Workout / workouts
- Schedule / scheduled (prefer mission plan phrasing)
- Fitness / gym jargon
- Web3 / blockchain / token / wallet (unless explicitly surfaced as technical integration)

## Review Checklist
- [ ] No residual fitness/Web3 wording appears in new or modified user-facing strings.
- [ ] Buttons and CTAs use mission-oriented action verbs (for example: review, assign, triage, debrief).
- [ ] Empty/error/loading states explain next steps in operational language.
- [ ] ARIA labels match the same mission vocabulary as visible UI labels.
- [ ] Route/page headings align with the mission IA naming map.

## Scope Guardrails
- This checklist governs user-visible language only.
- Internal identifiers, legacy type names, storage keys, and migration adapters may retain legacy naming when refactors are out of scope.
- If a legacy term must remain visible for compatibility, document the reason in the PR notes and add a follow-up task in the overhaul tracker.
