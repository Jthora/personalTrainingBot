# IA and Layout (V2)

## Page frame
- Top toolbar (shared): refresh/stale, counts, selection status, plan health (alignment warning), preview, filter/difficulty toggle (opens sheet on mobile), quick link to Schedules.
- Body grid (desktop/tablet):
  - Left/main: Results + detail stacked (list over detail) or two-column split ≥1280px.
  - Right/sidebar: Filters, presets, difficulty (desktop only). On ≤960px, replaced by sheet.
- Mobile: single column; toolbar stays; filter/difficulty/presets live in a bottom sheet; detail opens as slide-over or inline accordion.

## Key behaviors
- Applied chips bar lives under the toolbar; acts as quick-clear and status surface.
- Status/alerts live in a single slot under the chips (errors, conflicts, stale notice).
- Preview drawer is triggered from toolbar; AlignmentWarning also surfaces there (no duplicate button in body).
- Difficulty control: one canonical control; if kept in sidebar on desktop, it is also reachable in the mobile sheet. No duplicate CTAs.

## Responsive rules
- ≥1280px: two-column list/detail; sidebar fixed-height scroll; toolbar full.
- 96059px: list above detail stacked; sidebar still visible but more compact; toolbar wraps.
- <960px: sidebar hidden; filter/difficulty/presets in sheet; detail as sheet/accordion; toolbar gains prominent "Filters" pill.

## Content moves (from current)
- Move preview toggle into toolbar next to alignment warning.
- Move filter chips from inside filter card to global applied-bar under toolbar.
- Remove duplicate Quick 20 CTA from zero-state; keep presets near search.
- Add "Scheduled" badge to list rows; keep only one status banner region (under chips), not inside detail body.
