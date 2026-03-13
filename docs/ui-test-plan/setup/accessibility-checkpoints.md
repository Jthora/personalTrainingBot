# Accessibility Checkpoints

> *The app already uses `role="status"`, `aria-live`, and `aria-label` on key components. These are promises to assistive technology users. If they're present in the markup but broken in practice, it's worse than not having them at all.*

## Existing Accessibility Surface

Components that already declare accessibility semantics:

| Component | Attribute | Value |
|-----------|-----------|-------|
| NetworkStatusIndicator | `role="status"`, `aria-live="polite"` | Status text changes on online/offline |
| BadgeGallery | `aria-label` | `"Badge gallery"` |
| CompetencyChart | `aria-label` | `"Domain progress"` |
| ChallengeBoard | `aria-label` | `"Challenges"` |
| ActivityHeatmap | `data-testid="activity-heatmap"` | (consider adding aria-label) |
| QuizRunner option buttons | `data-testid="option-N"` | (consider adding aria role) |

## Per-Story Accessibility Checkpoints

These are additive — each story should include these checks alongside the existing functional checkpoints.

### Story 01 — First Contact
- [ ] Archetype picker: each card is keyboard-focusable (`Tab` → `Enter` to select)
- [ ] Handler picker: "Recommended" badge provides accessible context (not just visual)
- [ ] Confirm/Skip buttons have visible focus indicators

### Story 03 — Daily Cycle
- [ ] DrillRunner: card content is reachable via keyboard navigation
- [ ] Self-assessment buttons have accessible labels (not just numeric "1", "2", "3")
- [ ] Timer display is announced to screen readers (or opt-out via `aria-hidden` to avoid noise)

### Story 04 — Mission Loop
- [ ] "Mark Step Complete" button has visible focus ring
- [ ] Step handoff "Why this step matters" section is in a `<section>` with heading or `aria-label`

### Story 05 — Knowledge Retention
- [ ] Quiz options: keyboard-navigable (`Tab` between options, `Enter`/`Space` to select)
- [ ] Quiz feedback (correct/incorrect) announced via `aria-live` region
- [ ] Fill-blank input has an associated `<label>` or `aria-label`

### Story 06 — Proving Yourself
- [ ] Badge toast is announced via `aria-live` (it uses `role="status"` or similar — verify)
- [ ] XP ticker: animated count should have `aria-live="polite"` or be `aria-hidden` to avoid screen reader spam
- [ ] Level-up modal: focus is trapped inside modal while visible

### Story 08 — Offline Operative
- [ ] Network status indicator: verify `aria-live="polite"` actually announces the text change (not just present in DOM — must trigger announcement)

## Implementation Pattern

```ts
// Keyboard navigation test
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Enter'); // should select the focused item

// Focus indicator check
const focused = await page.evaluate(() => {
  const el = document.activeElement;
  if (!el) return null;
  const styles = getComputedStyle(el);
  return {
    outline: styles.outline,
    boxShadow: styles.boxShadow,
    tag: el.tagName,
    testId: el.getAttribute('data-testid'),
  };
});
expect(focused?.outline).not.toBe('none');

// aria-live verification
const statusRegion = page.locator('[role="status"][aria-live="polite"]');
await expect(statusRegion).toHaveText(/Ready/i);
// ... trigger offline ...
await expect(statusRegion).toHaveText(/Offline/i);
```

## Scope Limitation

This is NOT a full WCAG 2.1 audit. It tests the accessibility semantics the app already declares — ensuring they work as intended. A comprehensive audit would require axe-core integration, which is a separate initiative.

**Recommended future addition:** `@axe-core/playwright` for automated WCAG violation scanning on each route. This is a single-line addition to the Playwright config that would catch class-wide violations (missing alt text, color contrast, etc.) without per-story checkpoints.
