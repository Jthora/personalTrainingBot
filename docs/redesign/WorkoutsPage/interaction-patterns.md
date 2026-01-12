# Interaction Patterns

## Core User Flows
- Browse and filter
	- Open filters (sidebar/drawer), select options, apply/clear, see immediate results.
	- Applied filters summarized with removable chips.
- Select and preview
	- Keyboard or pointer selection; preview opens inline pane/sheet; ESC/Close restores focus.
- Add to schedule
	- Invoke action from detail or list quick action; pick date/time/slot; confirm with feedback.
- Edit/remove scheduled workout (if exposed here)
	- Edit time/day; remove with confirm/undo.
- Error/slow recovery
	- Retry on load errors; maintain user choices; show progress on retry.

## Keyboard Patterns
- Global skip link to main content.
- Tab order: header actions → sidebar filters → list → detail actions.
- List navigation: Up/Down to move focus; Enter/Space to select; Home/End optional for jump.
- Close behaviors: ESC closes detail sheet/drawer; focus returns to originating control.
- Filter drawers/sheets: trap focus when open; close with ESC; restore focus to trigger.
- Shortcuts (if enabled): e.g., `/` focus search, `f` open filters, `s` add to schedule when selected.

## Mouse/Touch Patterns
- Click/tap list item selects; second click could open detail (if not auto).
- Long-press on mobile may open quick actions (optional); ensure discoverability.
- Tap targets minimum 44px; spacing to avoid accidental taps.
- Hover states only enhance; not required for critical info.

## Selection & Feedback
- Selected item highlighted with background and/or accent bar; SR text announces selection.
- Applied filters visible; change in list count animated subtly without layout jump.
- Busy states: disable relevant controls; show spinners inline; avoid full-page blocking.

## Control States
- Buttons: default, hover, active, focus, disabled, loading; maintain label clarity.
- List items/cards: default, hover, focus, selected, disabled (if not selectable), busy.
- Chips: default, selected/applied, hover/focus, removable with clear affordance.
- Inputs/selects: focus ring, error state, disabled state.

## Error/Undo/Confirm Patterns
- Destructive actions require confirm or provide undo (preferred); time-bound undo.
- Error banners inline near the source; live region announcement; actionable retry.
- Conflict handling (e.g., schedule conflict) gives clear choices and preserves context.

## Loading & Empty Patterns
- Skeletons for list and detail; avoid layout shift.
- Empty with guidance and CTA; keep filters visible; offer “clear filters” if no results.

## Scroll & Focus Management
- Preserve scroll position in list when opening/closing detail.
- When detail opens, ensure it’s scrolled to top and focus placed on heading.
- Return focus to originating item on close; avoid scroll jump.

## Accessibility Hooks
- ARIA roles for lists (`listbox`/`list`), items (`option`/`listitem`), detail regions (`region` with label).
- Live regions for async updates (loading complete, errors).
- Visible focus outline on all interactive elements.

## Mobile-Specific Patterns
- Filters in sheet with apply/clear footer; optional auto-apply toggle.
- Detail as bottom sheet; swipe to close optional; ensure clear close button and ESC mapping to hardware back where supported.

## Visual Feedback
- Micro-animations within reduced-motion limits for hover/selection; no excessive motion.
- Progress indicators for long actions (adding to schedule if network slow).

## Open Questions
- Should selection auto-open detail on desktop, or require explicit action?
- Do we support multi-select for batch scheduling? (likely no)
- Is inline editing of schedule metadata in scope, or redirect to Schedules?
