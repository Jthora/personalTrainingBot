# Component Inventory

## Existing Components (Assess/Refine)
- `WorkoutsPage`
	- Role: Shell that composes sidebar, list, detail/preview.
	- Issues: Legacy layout, fixed columns, old tokens.
	- Actions: Refactor to responsive shell; remove obsolete props; align with coach theme.
- `WorkoutsSidebar`
	- Role: Filters/sorts, quick selectors.
	- Issues: Hard-coded colors, light-mode presets, limited accessibility.
	- Actions: Themed tokens, collapsible groups, keyboard support, applied filter summary.
- `WorkoutList` / `WorkoutCard`
	- Role: Display workouts in list/card form.
	- Issues: Inconsistent spacing, hover/focus not accessible, missing loading states.
	- Actions: Standardize item layout, add skeletons, improve focus/hover/selected states.
- `WorkoutSelector`
	- Role: Handles selection logic.
	- Issues: Verify state sync with detail pane; keyboard interactions.
	- Actions: Ensure single-select, focus management, selection persistence.
- `WorkoutDetails`
	- Role: Show metadata, steps, equipment, coach info.
	- Issues: Alignment with training detail patterns; missing SR labels in places.
	- Actions: Apply headings, sections, anchor links; improve scrolling and actions.
- `AlignmentWarning`
	- Role: Warn about schedule alignment/conflicts.
	- Issues: Styling inconsistent; needs icons/semantics.
	- Actions: Use alert semantics, tokens, concise copy.
- `WorkoutsWindow`
	- Role: Container for main pane; includes actions row.
	- Issues: Sparse styling; misaligned actions; dark button overrides.
	- Actions: Redo toolbar, spacing, responsive behavior.

## Shared Components/Hooks to Reuse
- Buttons, inputs, selects, chips, badges from shared component library (check availability).
- Hooks: `useWorkoutSchedule`, `useTraining`, `useCoachTheme`, cache hooks.
- Layout primitives: page container, panel components if present.
- Modals/sheets/drawers components for mobile filters and detail.

## New Components to Add (Draft)
- `WorkoutFilterGroup`
	- Purpose: Encapsulate filter section with label, controls, collapse.
	- Props: `title`, `description?`, `controls`, `isCollapsible`, `defaultOpen`.
- `AppliedFiltersBar`
	- Purpose: Summarize active filters with removable chips and clear-all.
	- Props: `filters`, `onRemove`, `onClearAll`.
- `WorkoutResultCount`
	- Purpose: Show result count and loading state.
	- Props: `count`, `isLoading`, `hasError`.
- `WorkoutListItem`
	- Purpose: Accessible row/card with selection and quick actions.
	- Props: `workout`, `selected`, `onSelect`, `onQuickAction?`, `variant`.
- `WorkoutDetailPanel`
	- Purpose: Structured detail view with sections for summary, equipment, steps, actions.
	- Props: `workout`, `onClose`, `onAddToSchedule`, `isLoading`, `error`.
- `ScheduleActionBar`
	- Purpose: Contextual actions (add/edit/remove) with responsive layout.
	- Props: `selection`, `onAdd`, `onEdit`, `onRemove`, `isBusy`.
- `EmptyState`, `LoadingState`, `ErrorState` (reusable patterns)
	- Purpose: Consistent state handling; accepts icon, title, body, actions.
	- Props: `title`, `body`, `icon?`, `actions?`, `onRetry?`.
- `WorkoutListSkeleton`
	- Purpose: Skeleton placeholders sized to list.
	- Props: `rows`, `variant`.
- `FilterSheet` (mobile)
	- Purpose: Mobile-friendly filter drawer.
	- Props: `open`, `onClose`, `onApply`, `initialFilters`.

## Data/Props Contracts (Examples)
- `Workout` type: id, title, duration, difficulty, equipment[], coachId, category, tags[], description, steps, media?, prerequisites?, calories?, intensity?
- `FilterState`: durationRange, difficulty, equipment[], category, coachId, tags[], searchTerm.
- `SortOption`: key, direction, label.

## State & Loading Considerations per Component
- All interactive components should support: loading, disabled, error fallback where relevant.
- List items: selected, hover, focus, active, disabled (if not selectable), busy (during action).
- Filters: pending/applying state; async option loading.
- Detail: loading skeleton; stale data indicator if needed.

## Styling/Theming Notes
- Use coach tokens for background, text, accent, borders, shadows.
- Avoid hard-coded colors; rely on CSS variables/constants.
- Respect spacing scale; consistent radii/shadows from theming doc.

## Performance Considerations
- Virtualize list if >N items; memoize list rows; avoid re-render storms.
- Lazy-load detail content (steps/media) after selection.

## Testing Expectations (per component)
- Unit/component tests for rendering states, interaction (click, keyboard), accessibility attributes.
- Storybook/visual snaps for default, hover, focus, selected, loading, empty, error.
- Integration tests for selection → detail → add-to-schedule flow.

## Ownership & Maintenance
- Assign component owners; document contact; ensure coverage in codeowners if used.

## Open Questions
- Do we present list as rows, cards, or toggleable view modes?
- Do we need bulk select for multi-add? (likely out-of-scope)
- Should filters be pluggable/config-driven from backend?
