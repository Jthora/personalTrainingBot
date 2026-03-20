# Z-Index Token Scale

> Replace magic z-index numbers with semantic tokens in `theme.css`.

---

## Current Z-Index Landscape

| Value | File | Element | Purpose |
|-------|------|---------|---------|
| `100` | ActivityHeatmap.module.css L77 | Tooltip | Heatmap hover tooltip |
| `900` | SovereigntyPanel.module.css L307 | Panel overlay | Data sovereignty panel |
| `930` | XPTicker.module.css L7 | XP animation | XP gained ticker |
| `1` | ShareCard.module.css L44,75,134 | Decorative layers | Internal stacking — ignore |
| `1000` | AppShell.module.css L117 | Nav bar | Bottom navigation |
| `1000` | Header.module.css L8 | Header | Top navigation |
| `1050` | BadgeToast.module.css L8 | Toast | Badge notification toast |
| `1050` | UpdateNotification.module.css L6 | Banner | PWA update banner |
| `1050` | InstallBanner.module.css L6 | Banner | PWA install prompt |
| `1100` | RecapModal.module.css L9 | Modal | Recap modal overlay |
| `1100` | ProfileEditor.module.css L61 | Picker overlay | Color/handler picker |
| `1100` | LevelUpModal.module.css L6 | Modal | Level up celebration |
| `1100` | RecapToast.module.css L15 | Toast | Recap toast |
| `1200` | Header.module.css L402 | Settings dropdown | Header settings panel |
| `1200` | MissionActionPalette.module.css L9 | Action palette | Mission quick-actions |
| `1500` | Header.module.css L28 | Profile popover | Profile popup on header |

---

## Proposed Token Scale

```css
:root {
    /* ── Z-Index Scale ── */
    --z-tooltip: 100;        /* Tooltips, popovers on components */
    --z-panel: 900;          /* Side panels, sovereignty panel */
    --z-ticker: 930;         /* XP ticker overlay */
    --z-chrome: 1000;        /* Header, bottom nav, persistent UI */
    --z-banner: 1050;        /* Toast notifications, install/update banners */
    --z-modal: 1100;         /* Modals, fullscreen overlays */
    --z-dropdown: 1200;      /* Dropdowns from header, action palettes */
    --z-popover: 1500;       /* Critical popovers that must top everything */
}
```

---

## Collision Zones (Current)

### Zone 1: 1000 — Header vs Bottom Nav

Both `Header` and `AppShell` bottom nav use `z-index: 1000`. They don't visually overlap (top vs bottom), but this should be explicit:

```diff
  /* Header stays at --z-chrome */
  /* Bottom nav stays at --z-chrome */
  /* Both are chrome — same level is correct */
```

### Zone 2: 1050 — Three-way collision

`BadgeToast`, `UpdateNotification`, and `InstallBanner` all use `z-index: 1050`. If they appear simultaneously, stacking is undefined:

**Recommendation**: Keep same value (all banners), but add CSS specificity via markup order.

### Zone 3: 1100 — Four-way collision

`RecapModal`, `ProfileEditor`, `LevelUpModal`, and `RecapToast` all use `z-index: 1100`:
- Modals should share a level (they're mutually exclusive in practice)  
- `RecapToast` should be `--z-banner` (1050) — it's a toast, not a modal

### Zone 4: 1200 — Settings vs Palette

`Header settings dropdown` and `MissionActionPalette` both use `z-index: 1200`. These are on different shells and won't conflict, but tokenize for consistency.

---

## Migration Map

| File | Current | New Token | Notes |
|------|---------|-----------|-------|
| ActivityHeatmap.module.css | `z-index: 100` | `z-index: var(--z-tooltip)` | |
| SovereigntyPanel.module.css | `z-index: 900` | `z-index: var(--z-panel)` | |
| XPTicker.module.css | `z-index: 930` | `z-index: var(--z-ticker)` | |
| AppShell.module.css | `z-index: 1000` | `z-index: var(--z-chrome)` | |
| Header.module.css L8 | `z-index: 1000` | `z-index: var(--z-chrome)` | |
| BadgeToast.module.css | `z-index: 1050` | `z-index: var(--z-banner)` | |
| UpdateNotification.module.css | `z-index: 1050` | `z-index: var(--z-banner)` | |
| InstallBanner.module.css | `z-index: 1050` | `z-index: var(--z-banner)` | |
| RecapToast.module.css | `z-index: 1100` | `z-index: var(--z-banner)` | Downgrade: toast ≠ modal |
| RecapModal.module.css | `z-index: 1100` | `z-index: var(--z-modal)` | |
| ProfileEditor.module.css | `z-index: 1100` | `z-index: var(--z-modal)` | |
| LevelUpModal.module.css | `z-index: 1100` | `z-index: var(--z-modal)` | |
| Header.module.css L402 | `z-index: 1200` | `z-index: var(--z-dropdown)` | |
| MissionActionPalette.module.css | `z-index: 1200` | `z-index: var(--z-dropdown)` | |
| Header.module.css L28 | `z-index: 1500` | `z-index: var(--z-popover)` | |
| ShareCard.module.css | `z-index: 1` | Keep as-is | Internal to component |
