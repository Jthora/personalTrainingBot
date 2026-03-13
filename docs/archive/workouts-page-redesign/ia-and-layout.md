# Information Architecture and Layout

## Page Hierarchy & Landmarks
- Top-level layout: main landmark for content, complementary landmark for sidebar, header for page controls.
- Landmarks: `header` (page title/actions), `nav` (filters/selection in sidebar), `main` (list + details), optional `section` for preview.
- Heading structure: h1 page title, h2 for sidebar filters, h2 for list area, h3 for detail sections.

## Content Grouping
- Sidebar (complementary): filters, sorts, quick selectors, saved sets (if any), helper text.
- Main list region: workout collection (list/cards/table), pagination/virtualization controls if applicable.
- Detail/preview: contextual panel showing selected workout details; inline within main region or anchored to right.
- Actions row: global actions (e.g., add to schedule), per-item quick actions, bulk actions (if in scope).

## Navigation Pathways & Entry Points
- From global nav (Workouts tab) → default view with recommended/default sort.
- Deep link with query params for selected workout/filter/sort → hydrate state and scroll to item.
- From Schedules/Training linking back to a specific workout → ensure selected item is in view.

## Layout Variants (by breakpoint)
- Desktop (≥1200px):
	- Two/three-column layout: sidebar (min 280–320px), main list, optional fixed-width detail pane.
	- Generous spacing, persistent sidebar, detail pane can be sticky to viewport height.
- Tablet (≥900px and <1200px):
	- Sidebar collapsible/drawer; main list primary; detail pane overlays or slides in.
	- Controls condensed; toolbars may wrap.
- Small tablet/large phone (≥720px and <900px):
	- Sidebar as top sheet/accordion; list full-width; detail as modal/sheet.
	- Reduce columns; increase vertical stacking.
- Mobile (<720px):
	- Stack vertically: filters in collapsible sheet; list full-width; detail as bottom sheet or new view.
	- Priority on tap targets and scroll-friendly sections.

## Grid & Spacing
- Base grid: 4/8px spacing scale; align with design tokens.
- Gutters: desktop 24–32px; tablet 16–24px; mobile 12–16px.
- Section spacing: consistent padding around sidebar and main regions.
- Max content width for readability when applicable; lists may be full-bleed within container.

## Key Regions & Behaviors
- Sidebar
	- Sticky on desktop to maintain visibility during scroll.
	- Contains filter groups with clear labels and counts; applied filters summarized near top.
	- Collapse/expand groups; maintain state across navigation within page.
- Main List
	- Supports keyboard navigation; virtualized if large datasets.
	- Shows applied filters and sort; includes result count and clear-all action.
	- Empty/loading/error states inline.
- Detail/Preview
	- Anchored to right on desktop; sheet/modal on smaller viewports.
	- Close/escape returns focus; supports scroll for long content with internal anchors.

## Wireframes & References
- Low-fi wireframes for each breakpoint (desktop/tablet/mobile) to be linked.
- Identify variants: with/without selection, with long titles, with many filters applied.
- Include skeleton/loading representations and empty/error states in wireframes.

## Breakpoints & Adaptivity Rules
- Sidebar behavior:
	- Desktop: persistent.
	- Tablet: toggle/drawer; remember open state.
	- Mobile: sheet/accordion; auto-close after apply (optional setting).
- Detail behavior:
	- Desktop: inline pane with its own scroll; height fills viewport minus header.
	- Mobile: bottom sheet or separate route; back/close returns to list position.
- Toolbars:
	- Wrap on smaller widths; secondary actions move to overflow menu if needed.
- Typography and density adjust with breakpoint to maintain readability.

## Overflow & Scrolling
- Page scrolls vertically; avoid double scroll where possible.
- Sidebar may scroll independently if content exceeds viewport; ensure focus trapping avoided.
- Detail pane scroll independent; restore scroll position on close/open where sensible.
- Maintain scroll position of list when opening/closing detail or filters.

## Safe Areas & Chrome Interaction
- Respect header height: top padding equals header + gap for page content.
- Consider mobile safe areas (notches/home indicators) for sheets and bottom actions.
- Ensure floating action buttons (if any) do not obscure content or scrollbars.

## Responsive Assets & Media
- Use responsive images/thumbnails; avoid large media in list rows; lazy-load preview assets.
- Preserve aspect ratios; provide fallbacks when media missing.

## Alignment & Rhythm
- Align list items and filter controls to a vertical rhythm consistent with other pages.
- Use consistent border radii and shadows per theming guide.

## Interaction Notes (Layout-Specific)
- Keyboard: Tab order respects visual order; sidebar to main to detail; skip-link to main content.
- Focus outlines visible across breakpoints; ensure drawers/sheets trap focus appropriately.
- Back/forward navigation restores layout state where possible.

## Print & Export (If Needed)
- Minimal/no special handling; out of scope unless required.

## Open Questions
- Do we need a persistent footer action bar on mobile for add-to-schedule?
- Should detail pane be resizable on desktop?
- Do filters auto-apply or require explicit apply on mobile/tablet?
