# Story 10 — Mobile-First Experience

> Priority: **P0-cross-cutting** · Persona: **any** · Viewport: **390 × 844 (iPhone 14)**

## Premise

Every user journey must work on a phone first. This story validates the mobile-specific
failure modes documented in [mobile-failure-modes.md](../setup/mobile-failure-modes.md)
with concrete, executable test checkpoints.

## Scope

This story does NOT re-test the functional flows (covered by Stories 01–09). It tests
the **physical ergonomics** of those flows at mobile viewport:

- Touch targets ≥ 44 px (Apple HIG) / ≥ 36 px for compact controls
- No horizontal overflow on any surface
- Scrollability — all content reachable without clipping
- Mobile-specific navigation (BottomNav, Hamburger drawer)
- Layout correctness (column counts, stacking order)

## Pre-conditions

| Persona | When needed |
|---------|-------------|
| `brand-new` | Onboarding tests (10.5–10.8, 10.19) |
| `returning-operative` | Drill, Mission Loop, Quiz tests (10.9–10.15, 10.20) |
| `grinder` | Stats tests (10.16–10.18, 10.21) |

Viewport is forced to 390 × 844 with `isMobile: true` and `hasTouch: true` on all tests.

## Checkpoints

### Navigation

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.1 | BottomNav visible, desktop tabBar hidden | `nav[aria-label="Primary navigation"]` visible, desktop tablist not visible |
| 10.2 | Hamburger menu opens and closes | `button[aria-label="Open menu"]` → dialog visible → close → dialog hidden |
| 10.3 | BottomNav navigates between surfaces | `/mission/stats` and `/mission/plan` load correctly at mobile width |
| 10.4 | No horizontal overflow on Brief | `scrollWidth ≤ clientWidth` |

### Onboarding (Story 01 Mobile Addenda)

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.5 | Welcome overlay buttons full-width, tappable | Both CTAs ≥ 44px tall, ≥ 60% overlay width |
| 10.6 | Archetype cards in scrollable 2-col grid | 8 cards present, first two at same Y / different X, last card reachable via scroll |
| 10.7 | Confirm/Skip buttons meet 44px tap target | `boundingBox().height ≥ 44` |
| 10.8 | Handler cards single-column, scrollable | Cards at same X / different Y, last card scrollable into view |

### Drill Experience (Story 03 Mobile Addenda)

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.9 | DrillRunner content scrollable, not clipped | No horizontal overflow, last checkbox reachable via scroll |
| 10.10 | Rating buttons tappable | Each rating button ≥ 36px, tap confirms selection, Record button ≥ 44px |
| 10.11 | Rest interval visible after recording | Rest panel appears within viewport, Skip button ≥ 44px |

### Mission Loop (Story 04 Mobile Addenda)

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.12 | stepActions don't push content below fold | Main content starts within 2× viewport height |
| 10.13 | Step action buttons are reachable | All visible buttons meet 44px min-height |

### Quiz (Story 05 Mobile Addenda)

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.14 | Quiz option buttons full-width, tappable | Options ≥ 44px tall, ≥ 50% viewport width |
| 10.15 | Next Question button reachable | After answering, next-btn scrollable into view and ≥ 44px |

### Stats (Story 06 Mobile Addenda)

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.16 | Stats surface — no horizontal overflow | Quick stats, XP bar all visible, no scrollWidth overflow |
| 10.17 | Activity heatmap renders at mobile width | Cells ≥ 4px, no horizontal overflow |
| 10.18 | Profile editor usable | Callsign input ≥ 120px wide, change-archetype button ≥ 44px |

### Accessibility

| # | Checkpoint | Assertion |
|---|-----------|-----------|
| 10.19 | Mobile onboarding — axe audit | Zero WCAG 2 AA violations on welcome overlay |
| 10.20 | Mobile drill — axe audit | Zero WCAG 2 AA violations on checklist surface |
| 10.21 | Mobile stats — axe audit | Zero WCAG 2 AA violations on stats surface |

## Mobile Fixtures

Helper functions in `e2e/fixtures/mobile.ts`:

| Helper | Purpose |
|--------|---------|
| `assertTapTarget(locator, min)` | Verify element meets minimum tap size |
| `assertNoHorizontalOverflow(page)` | Verify no horizontal scroll |
| `assertInViewport(locator, page)` | Verify element visible within viewport |
| `assertScrollable(locator)` | Verify container is scrollable |
| `assertBottomNav(page)` | Verify BottomNav renders with expected tabs |
| `assertHamburgerMenu(page)` | Verify hamburger opens/closes drawer |
| `countVisibleInViewport(locator, page)` | Count elements visible without scrolling |
| `assertClickable(locator, page)` | Verify element not obscured |

## Run Command

```bash
# Mobile-only (uses iPhone 14 viewport)
npx playwright test --config=e2e/playwright.config.ts 10-mobile-first

# Or via project
npx playwright test --config=e2e/playwright.config.ts --project=mobile 10-mobile-first
```
