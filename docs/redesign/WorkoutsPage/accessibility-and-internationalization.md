# Accessibility and Internationalization

## Landmarks, Roles, and Headings
- Landmarks: `header`, `nav` (sidebar filters), `main` (list + detail), `section`/`region` for detail panel with `aria-labelledby`.
- Headings: h1 page title, h2 for sidebar filter groups and list/preview sections, h3 for subsections (equipment, steps).
- Ensure unique, descriptive labels for regions (e.g., “Workout filters”, “Workout details for {name}”).

## Focus Management & Keyboard
- Skip link to main content.
- Logical tab order: header → sidebar → list → detail; avoid focus traps.
- Focus visible on all interactive elements; maintain contrast.
- Closing drawers/sheets returns focus to the trigger; detail close returns to selected item.
- Keyboard support: Up/Down to move list focus; Enter/Space to select; ESC to close detail/sheet.

## ARIA & Semantics
- Lists: use appropriate roles (`list`/`listbox`) with `listitem`/`option` as applicable; announce counts.
- Filters: form controls with labels; group related controls with `fieldset`/`legend` when appropriate.
- Detail panel: `role="region"` with label; headings for sections.
- Buttons vs links: use correct elements; avoid `div` role misuse.
- Live regions for async updates: loading completion, errors, “filters applied”, “workout selected”.

## Screen Reader Expectations
- Each list item announces title, duration, difficulty, equipment key info, selection state.
- Detail view: heading with workout name; structured sections announced; actionable controls labeled.
- Error/empty states: concise, actionable messages; announced via live region.

## Visual Requirements
- Contrast: 4.5:1 for text; 3:1 for large text/icons; include hover/selected states.
- Focus rings clearly visible on all backgrounds; respect reduced motion.
- Do not rely on color alone; include text/icons for status and selection.

## Motion & Preferences
- Respect `prefers-reduced-motion`: reduce/disable transitions; avoid parallax.
- Avoid auto-playing media; if present, provide controls and do not auto-play.

## Pointer & Touch
- Hit targets ≥44x44px; spacing to prevent accidental activation.
- Hover-only affordances mirrored with focus/click behaviors.

## Internationalization (i18n) & Localization (l10n)
- Externalize all strings; avoid concatenation; use placeholders with names.
- Layouts handle text expansion (30–50%); avoid fixed-width labels where possible.
- RTL readiness: test mirroring; ensure icons/chevrons flip when appropriate.
- Date/number formats locale-aware; avoid hard-coded formats.
- Avoid embedding brand-specific idioms; keep copy localizable.

## Error Messages & Validation
- Specific, actionable messages; place near controls; include SR-friendly text.
- Preserve user input on errors; avoid clearing forms.

## Testing Checklist (A11y/i18n)
- Axe/linters clean; keyboard traversal for all flows; SR smoke tests (NVDA/VoiceOver).
- Contrast checks on default/hover/selected/disabled states.
- Reduced motion tested; RTL smoke test; long-text overflow checked.

## Open Questions
- Do we need audio cues or haptics on mobile for key actions?
- Should we support language switching in-page or rely on global setting?
