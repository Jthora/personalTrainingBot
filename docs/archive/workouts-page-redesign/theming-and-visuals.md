# Theming and Visuals

## Principles
- Coach theme only (no dark/light toggle); align with brand and accessibility requirements.
- Favor clarity and contrast; avoid decorative overload; maintain hierarchy.

## Tokens (Use, Don’t Hard-Code)
- Surface/background tokens: base, raised, sunken states for sidebar, main, detail pane.
- Text tokens: primary, secondary, muted, inverse where needed.
- Accent tokens: coach accent for CTAs and highlights; use semantic variants for success/warning/error.
- Border tokens: subtle dividers for list rows, cards, panels.
- Elevation/shadow tokens: defined levels for panels, sheets, menus; avoid ad-hoc shadows.
- Radius tokens: consistent rounding for cards, buttons, inputs, sheets.
- State tokens: hover/active/selected/focus backgrounds for list items and controls.

## Typography
- Scale: map heading levels to rem sizes; consistent line heights.
- Usage:
	- H1: page title; one per page.
	- H2: section headers (sidebar groups, list header, detail sections).
	- Body: primary text for descriptions; secondary for metadata.
	- Caption/label: filter labels, chips, metadata subtext.
- Weight: prefer regular/medium; use semibold for headings/labels.
- Constraints: Minimum 14px for body; avoid text below contrast thresholds.

## Color Usage Rules
- Primary text contrast: meet 4.5:1 against surfaces; larger text may follow 3:1.
- Accent usage: CTA buttons, active chips, selection outlines; avoid overuse.
- Status colors: success, warning, error tokens; pair with icons/labels (not color-only).
- Focus: visible focus ring using accessible token; must stand out on all surfaces.
- Do/Don’t examples: avoid low-contrast gray-on-gray; avoid mixed brand accents.

## Spacing & Density
- Base spacing scale (4/8px) for padding/margins; stick to the scale.
- List rows: comfortable height with clear separation; adequate line height.
- Panels: internal padding consistent across sidebar, list header, detail.
- Touch targets: minimum 44x44px for interactive elements on touch devices.

## Iconography
- Style: consistent stroke/fill per design system; avoid mixed sets.
- Size: 16–20px in controls; 24px for empties/alerts; align to pixel grid.
- Placement: leading icons for filters/actions as needed; maintain spacing.
- States: tint icons for hover/active using tokenized colors.

## Imagery/Media
- Thumbnails: aspect ratio preserved; rounded corners per radius token.
- Lazy-load images; use placeholders/skeletons to avoid layout shift.
- Avoid heavy media in list view; reserve richer media for detail pane.

## Buttons & CTAs
- Primary CTA uses coach accent; secondary is neutral; tertiary is text-only.
- Disabled state visibly distinct; maintains contrast for label readability.
- Loading state with spinner; avoid label shift.

## Inputs & Filters
- Inputs/selects use neutral surfaces; focus ring visible; clear affordance.
- Chips/badges: applied filters shown with accent outline/fill; removable with clear icon.

## Lists & Cards
- Hover/active/selected backgrounds use state tokens; borders subtle.
- Selected state may include a side bar/indicator using accent color.
- Content hierarchy: title > metadata row > secondary text.

## Panels & Sheets
- Use elevation tokens for sheet/drawer/modal; backdrop opacity per standard token.
- Internal dividers subtle; avoid heavy borders.

## Shadows & Elevation
- Standardized levels: e.g., level 1 for cards, 2 for drawers, 3 for modals.
- Avoid stacking multiple shadows; keep consistent blur/spread per token.

## Motion
- Respect `prefers-reduced-motion`; provide motionless alternatives.
- Easing: use standard cubic-bezier for entrances/exits; durations short (150–250ms).
- Avoid large parallax or bouncy effects.

## Focus & States
- Focus ring: token-driven color, 2px outline offset or inset; visible on all backgrounds.
- Error states: red token + icon + text; success: green token; warning: amber token.

## Accessibility Checks
- Contrast testing for all text and UI components; include selected/hovered states.
- Ensure color is not sole indicator; pair with text or icon.

## Theming Application Guidance
- Implement via CSS variables or theme context; no inline colors.
- Ensure sidebar and main share cohesive palette; avoid mismatched backgrounds.

## Open Questions
- Do we need alternate density mode (compact vs comfortable)?
- Should selection highlight be border, background, or both?
