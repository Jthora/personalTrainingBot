# Responsiveness and Adaptivity

## Breakpoints (Proposed)
- XL ≥ 1440px: spacious layout; sidebar + list + detail side-by-side possible.
- LG 1200–1439px: two-column with sidebar + list; detail inline or overlay.
- MD 900–1199px: sidebar collapsible; list primary; detail overlay/sheet.
- SM 720–899px: stacked filters; list full-width; detail bottom sheet/modal.
- XS < 720px: mobile-first stacking; filters in sheet; detail in bottom sheet or dedicated view.

## Layout Adaptations
- Sidebar
	- Persistent on LG/XL; toggle/drawer on MD; sheet/accordion on SM/XS.
- Detail panel
	- Inline pane on LG/XL; overlay/sheet on MD; bottom sheet or route on SM/XS.
- Toolbars
	- Wrap secondary actions on smaller widths; overflow menu for less-used actions.
- Grids/Lists
	- List view remains single column; card variant may shift from 3→2→1 columns as width shrinks.

## Component-Level Adaptations
- Filters
	- Inline controls on desktop; grouped/accordion on tablet; sheet with apply/clear on mobile.
- Chips/Badges
	- Compress spacing on smaller widths; allow horizontal scroll for chip rows.
- Buttons
	- Full-width primary buttons on mobile where it aids reachability.
- Detail Content
	- Collapse long sections behind accordions on small screens; keep summary visible.

## Touch & Pointer
- Minimum 44x44px targets; adequate spacing for tap.
- Hover effects additive only; core info visible without hover.
- Consider swipe-to-close for sheets on mobile with clear close button.

## Media & Images
- Responsive images with `srcset`/sizes where applicable; cap height in list items.
- Maintain aspect ratio; avoid layout shift when images load (reserve space).

## Typography & Density
- Slightly larger base font on small screens for readability; adjust line lengths.
- Reduce padding on SM/XS where space is tight but keep touch targets large.

## Performance on Constrained Devices
- Prefer virtualization on mid/low devices when lists are long.
- Limit heavy shadows/blur on low-end devices; respect prefers-reduced-data if used.

## System Preferences
- Respect `prefers-reduced-motion`; adjust transitions globally.
- Respect `prefers-contrast` if available; increase contrast states accordingly.

## Scroll & Positioning
- Avoid double scrollbars; prefer single page scroll with sticky headers/filters where helpful.
- Preserve list scroll when opening detail; avoid locking body unless necessary (and then restore correctly).

## Safe Areas
- Account for notches/home indicators on mobile for bottom sheets and fixed buttons.

## Testing Matrix (Devices/Viewports)
- Test representative widths: 1440, 1280, 1024, 900, 768, 640, 390.
- Test pointer vs touch (mouse/trackpad vs mobile/touch laptop).
- RTL layout at multiple breakpoints to ensure mirroring works.

## Open Questions
- Should we offer a compact density toggle for desktop power users?
- Do we need a persistent bottom action bar on mobile for scheduling?
