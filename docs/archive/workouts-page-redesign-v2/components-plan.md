# Components Plan

## Toolbar (new consolidated)
- Inputs: counts, stale/lastUpdated, selection counts, alignment status, schedule link.
- Actions: Refresh, Filters/Difficulty (sheet toggle on mobile), Preview drawer, Go to Schedules, Add selected (if multi-select later).
- States: loading, stale, submitting (disable actions accordingly).

## WorkoutResultsPanel
- List
  - Add status chips: Scheduled / On today’s plan.
  - Keep hover/focus styles; ensure keyboard roving with chip presence.
  - Align metadata ordering: title, description, badges (intensity, difficulty, equipment/themes), status chip last.
- Detail
  - Show single status area (conflict/error/success) under header; remove banners inside body.
  - Action cluster: Add/Update/Remove gated by scheduled state; Preview secondary.
  - Sections: summary, stats, equipment/themes, steps/media (if available); ensure consistent spacing.
- Empty/loading/error
  - Place in-body states under list header; reuse patterns from Schedules (icon + text + actions).

## Filters / Difficulty / Presets
- Filters card
  - Move applied chips to global bar; keep controls only.
  - Grouping: Search, Duration chips, Equipment, Themes, Difficulty sliders.
  - Helper text for Equipment/Themes (multi-select) and Duration (single-select).
- Presets
  - Move near Search as quick pills; remove duplicates from zero-state.
- Difficulty
  - Single source of truth; expose via toolbar popover and mobile sheet; sidebar hosts it on desktop if desired.

## WorkoutsSidebar
- Desktop: houses Filters, Presets, Difficulty in tighter, scrollable card stack.
- Mobile: replaced by sheet; retains same grouping order; toggle lives in toolbar.

## AlignmentWarning / PreviewDrawer
- Merge triggers into toolbar: "Plan health" segment with two buttons (Preview, Adjust difficulty).
- Keep drawer content; remove duplicate button in body.

## Cross-link to Schedules
- Toolbar link: "View schedule" when any workouts are scheduled.
- Optional inline prompt in detail when item is already scheduled: "Open schedule".

## Accessibility
- Toolbar buttons: focus ring + aria-pressed where toggled.
- Sheet: trap focus; return focus to toggle; aria-label.
- List/status: aria-live for status slot; role=alert for conflicts.
