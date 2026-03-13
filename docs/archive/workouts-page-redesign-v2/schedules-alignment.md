# Schedules Alignment

## Shared patterns to align
- Chip bars: applied filters (Workouts) vs schedule facets (Schedules)  align spacing, border, typography.
- Status banners: use one slot under the toolbar/list header for both pages.
- Gutters/padding: match 1218px rhythm across pages for top-level containers.
- Preview/plan view: use same icon/button styling as Schedules preview/calendar toggles (if present).

## Cross-links
- From Workouts: toolbar "View schedule" and detail link when item is scheduled.
- From Schedules: "Add workouts" CTA deep-linking to Workouts with filters or search pre-applied.

## Shared controls
- Difficulty: single control surfaced in both pages; avoid separate UIs.
- Presets/templates: align naming (Quick 20 / Upper-Lower / Cardio) with any Schedules templates.

## Navigation behavior
- Preserve scroll/selection state when hopping between pages (optional URL params for selected workout/filter).
- Ensure keyboard focus restoration when returning from Schedules.

## Visual coherence
- Align card corners, border weights, and background tokens between list items on both pages.
- Use the same skeleton and empty-state patterns for list views.
