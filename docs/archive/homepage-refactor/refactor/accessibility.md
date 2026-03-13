# Accessibility

## Tabs
- Use role="tablist" on the container; tabs use role="tab" with aria-selected and aria-controls.
- Manage focus on tab change; do not auto-focus into content unless user intent.
- Provide keyboard navigation (Left/Right or Up/Down) and Enter/Space activation.

## Skip links and main
- Keep skip-to-main at top; main region per section with consistent id.
- Single primary scroll container per view; avoid nested scroll areas when possible.

## Cards and KaTeX
- Ensure math has accessible text; use KaTeX render options to include MathML where possible.
- Timers: announce remaining time politely; avoid rapid ARIA updates.

## Buttons and CTAs
- Clear labels; avoid emoji-only buttons for critical actions.
- Maintain focus outline and visible focus order across tabs and content.

## Errors
- For unknown cardSlug, show inline status message with focusable alert role.
