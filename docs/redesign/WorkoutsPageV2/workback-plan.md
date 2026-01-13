# Workback Plan

## Phase 0  Align
- Review this V2 plan with Design/Eng; confirm IA decisions (toolbar, sheet, badges).
- Lock in cross-page alignment choices with Schedules team.

## Phase 1  Structure
- Implement toolbar consolidation (desktop) and status slot.
- Add list status chips and action gating (Add vs Update/Remove).
- Relocate applied chips/status under toolbar; clean up duplicates.

## Phase 2  Filters & Difficulty
- Move presets near search; remove duplicates in zero-state.
- Decide single difficulty control surface; wire toolbar popover and sheet; remove redundant CTAs.
- Refine filter grouping, labels, helper text.

## Phase 3  Mobile/sheet
- Build filter/difficulty/preset sheet with focus trap and restore.
- Adjust responsive breakpoints (hide sidebar <960px); ensure toolbar pill is primary entry.
- Detail as sheet/accordion on mobile; maintain selection/focus return.

## Phase 4  Polish & Align
- Style alignment with Schedules (chips, banners, gutters, skeletons).
- Copy review for statuses, empty/error/conflict messages.
- A11y sweep (axe, keyboard, screen reader spot checks).

## Phase 5  QA & Rollout
- Regression of optimistic add/edit/remove + new gating/badge tests.
- Cross-page navigation checks.
- Prepare release notes; tag for quick rollback (no runtime flag planned).

## Owners / placeholders
- Design: TBD
- Eng: TBD
- QA: TBD
