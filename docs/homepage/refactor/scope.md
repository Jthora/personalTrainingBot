# Scope

## Problem statement
- Current home mixes planning, execution, card browsing, progress, coach, and auth in one screen, causing overload and duplicate CTAs.
- Redundant "what's next" surfaces (Today plan, Up Next, WorkoutList) and card dealing compete for attention.
- Dual scroll areas and dense sidebar reduce clarity, especially on mobile.

## Goals
- Make the app practically useful for hero-interns: reduce steps to start/resume training and clarify next action.
- Separate concerns by function (Plan, Cards, Progress, Coach, Settings/Profile) via sub-nav routes.
- Preserve deep-links (cardSlug, /c/:slug) and offline-friendly data flows.
- Reduce cognitive load: one primary CTA per page, avoid redundant panels.

## Non-goals
- No backend or data model rewrite.
- No new auth mechanism beyond existing Web3 wiring.
- No change to share slug format (/c/:slug) for external links.

## Success criteria
- Fewer clicks from landing to Start/Resume training.
- Single clear CTA on Plan; no overlapping "next" widgets across pages.
- Card share deep-links reliably focus the card within Cards.
- Maintained or improved perf (LCP/TTI) and offline behaviour.

## Current status (Stage 1 alignment)
- Scope/non-goals affirmed; no backend or data-model changes planned for the refactor.
- Success criteria locked around practical usefulness for hero-interns: fast path to training, clear next action, reliable card share focus.
- Ready for stakeholder confirmation on the above.
