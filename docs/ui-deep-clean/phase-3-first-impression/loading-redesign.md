# Loading Redesign

> Redesign `LoadingMessage` from generic spinner to branded mission briefing.

---

## Current Implementation

### LoadingMessage.tsx (42 lines)

```tsx
// Renders: title, spinner, "App Loading..." text, progress bar (top: determinate, bottom: indeterminate)
// Uses kebab-case CSS: styles['loading-container'], styles['loading-bar-top'], etc.
// Takes prop: progress: number (0-100)
```

### LoadingMessage.module.css (116 lines)

- Full viewport height, centered flexbox
- `background: var(--surface-base, #040709)` — correct token
- `border-left-color: var(--handler-accent, #5A7FFF)` — legacy alias (Phase 2 fix)
- Hardcoded `#ffffff` for progress bar fill + shimmer
- Hardcoded `#ffe1b3` for warning text
- `prefers-reduced-motion` media query exists but could be more complete

---

## Proposed Changes

### 1. Content Redesign

| Current | Proposed |
|---------|----------|
| "Starcom Academy" title | Keep — branded correctly |
| "App Loading..." | "Initializing systems..." → "Loading training data..." → "Ready" |
| Generic spinner | Keep spinner but use `--accent` token |
| Static progress bar | Add stage labels under progress bar |

### 2. Stage Labels

The `progress` prop already receives callbacks from `InitialDataLoader.initialize()`:

| Progress Range | Label |
|---------------|-------|
| 0-10% | "Initializing systems..." |
| 10-40% | "Restoring cached data..." |
| 40-70% | "Loading training modules..." |
| 70-95% | "Preparing interface..." |
| 95-100% | "Systems online" |

Implementation: Map `progress` to label string in the component.

### 3. CSS Migration

| Current | Fix |
|---------|-----|
| `styles['loading-container']` | `styles.loadingContainer` |
| `styles['loading-bar-top']` | `styles.loadingBarTop` |
| `styles['loading-bar-bottom']` | `styles.loadingBarBottom` |
| `styles['loading-bar-progress']` | `styles.loadingBarProgress` |
| `styles['warning-box']` | `styles.warningBox` |
| `styles['warning-title']` | `styles.warningTitle` |
| `styles['warning-list']` | `styles.warningList` |
| `--handler-accent` | `--accent` |
| `#ffffff` (L74, L80) | `var(--text-primary)` or keep as literal (intentional white for shimmer) |
| `#ffe1b3` (L91) | `var(--color-gold)` |

### 4. Accessibility

- Add `role="progressbar"` with `aria-valuenow={progress}` `aria-valuemin="0"` `aria-valuemax="100"`
- Add `aria-label="Loading application"` to container
- Announce stage label to screen readers via `aria-live="polite"` region

### 5. Reduced Motion

Current `prefers-reduced-motion` disables spinner animation and shimmer. Extend to:
- Disable all CSS transitions
- Keep progress bar width changes (functional, not decorative)
- Keep stage label text updates (informational)

---

## File Changes

| File | Action |
|------|--------|
| `src/components/LoadingMessage/LoadingMessage.tsx` | Rewrite with stage labels, camelCase refs, a11y |
| `src/components/LoadingMessage/LoadingMessage.module.css` | Rename classes, fix tokens, enhance motion query |
| `src/components/LoadingMessage/LoadingMessage.test.tsx` | Update to match new class names + test stage labels |
