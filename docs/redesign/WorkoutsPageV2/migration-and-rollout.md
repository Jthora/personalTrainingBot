# Migration and Rollout

## Sequencing
1) Implement toolbar consolidation (desktop), keep sidebar intact.
2) Move applied chips/status slot to global bar; remove duplicates from filters/detail.
3) Add list status chips and action gating (Add vs Update/Remove).
4) Introduce mobile sheet for filters/difficulty/presets; hide sidebar on <960px.
5) Align styles with Schedules (gutters, banners, chips, skeletons).

## Data/state
- No API changes expected; reuse existing hooks/stores.
- Ensure optimistic add/edit/remove tests still pass; extend tests for new gating and badges.

## QA checklist
- Desktop: list/detail split, toolbar actions, conflict banner, scheduled badges, preview toggle.
- Mobile: filter sheet open/close, focus return, add/update/remove flows, status slot readability.
- Cross-page: links to Schedules preserve or reset scroll appropriately.
- A11y: keyboard reachability of toolbar and sheet; aria-live on status; focus trap in sheet.

## Fallback
- Keep legacy layout behind a quick revert (git tag) if severe regressions; no runtime flag requested.

## Dependencies
- None beyond existing stores; ensure design tokens cover new toolbar/sheet elements.
