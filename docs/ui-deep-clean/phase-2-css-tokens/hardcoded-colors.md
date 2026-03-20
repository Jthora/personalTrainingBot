# Hardcoded Colors Audit

> Replace raw hex values with design tokens from `theme.css`.
> Mismatched fallbacks (wrong hex after `var(--token,`) are the highest priority.

---

## Category 1: Mismatched `--accent` Fallbacks

The canonical `--accent` is `#5A7FFF`. These files use stale fallback values:

### `#6c63ff` (old purple accent — 30+ instances)

| File | Lines | Pattern |
|------|-------|---------|
| ModuleBrowser/ModuleBrowser.module.css | L20,31,36,49,71,116,150,218,239,240,292 | `var(--accent, #6c63ff)` → `var(--accent, #5A7FFF)` |
| QuizRunner/QuizRunner.module.css | L31,113,114,124,129,161,208,209,214,219,242,312,358,445,448,457,463 | `var(--quiz-accent, var(--accent, #6c63ff))` → `var(--quiz-accent, var(--accent, #5A7FFF))` |
| DataSafetyPanel/DataSafetyPanel.module.css | L44,55,56 | `var(--accent, #6c63ff)` → `var(--accent, #5A7FFF)` |
| TodayLauncher/TodayLauncher.module.css | L43,46 | `var(--accent, #6c63ff)` → `var(--accent, #5A7FFF)` |

### `#4a6cf7` (old blue accent — 2 instances)

| File | Lines | Pattern |
|------|-------|---------|
| ExerciseRenderer/ExerciseRenderer.module.css | L54,82 | `var(--accent, #4a6cf7)` → `var(--accent, #5A7FFF)` |

### `#5b9bd5` (non-existent token — 5 instances)

| File | Lines | Pattern |
|------|-------|---------|
| PlanSurface.module.css | L25,30,35,181,184 | `var(--accent-primary, #5b9bd5)` — `--accent-primary` doesn't exist; replace with `var(--accent, #5A7FFF)` |

### `#4a4280` (non-existent token — 2 instances)

| File | Lines | Pattern |
|------|-------|---------|
| ModuleBrowser/ModuleBrowser.module.css | L54,76 | `var(--accent-muted, #4a4280)` → `var(--accent-muted, rgba(90, 127, 255, 0.45))` |

---

## Category 2: Hardcoded Colors that Should Be Tokens

### Accent-family colors (should use `--accent` or `--accent-glow`)

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#5a7fff` | StatsSurface.module.css | L100 (in gradient) | `var(--accent)` |
| `#a78bfa` | StatsSurface.module.css | L100 (gradient end) | New `--accent-secondary` or keep as literal |
| `#60a5fa` | BadgeGallery.module.css | L106 | `var(--accent-glow)` or `--color-info` |
| `#93c5fd` | SovereigntyPanel.module.css | L277 | `var(--mission-severity-low-text)` |

### Success colors (should use `--color-success`)

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#22c55e` | WeeklySummary.module.css | L25 | `var(--color-success)` |
| `#22c55e` | ChallengePanel.module.css | L78,90,112 | `var(--color-success)` |
| `#22c55e` | ChallengeBoard.module.css | L85,102,125 | `var(--color-success)` |
| `#4caf50` | CompetencyChart.module.css | L66 | `var(--color-success)` |
| `#4ade80` | ReviewDashboard.tsx (inline) | — | `var(--color-success)` via CSS class |
| `#6ee7b7` | SovereigntyPanel.module.css | L282 | `var(--color-success)` or `--mission-trust-verified` |

### Warning / gold colors (should use `--color-warning` or `--color-gold`)

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#f97316` | WeeklySummary.module.css | L30 | `var(--color-warning)` |
| `#f97316` | StatsSurface.module.css | L33 | `var(--color-warning)` |
| `#f97316` | StatsPanel.module.css | L41,42 | `var(--color-warning)` |
| `#fde68a` | SovereigntyPanel.module.css | L353 | `var(--mission-severity-medium-text)` |
| `#fde68a` | XPTicker.module.css | L18 | `var(--color-gold)` |
| `#fbbf24` | ReviewDashboard.tsx (inline) | — | `var(--color-warning)` via CSS class |
| `#ffe1b3` | LoadingMessage.module.css | L91 | `var(--color-gold)` or `var(--mission-severity-medium-text)` |

### Danger / red colors (should use `--color-danger`)

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#f87171` | ReviewDashboard.module.css | L108 | `var(--color-danger)` |
| `#f87171` | AppShell.module.css | L163 | `var(--color-danger)` |
| `#f44336` | CompetencyChart.module.css | L71 | `var(--color-danger)` |
| `#fca5a5` | QRCodeDisplay.module.css | L11 | `var(--mission-severity-critical-text)` |
| `#fca5a5` | QRCodeScanner.module.css | L33 | `var(--mission-severity-critical-text)` |
| `#fca5a5` | SovereigntyPanel.module.css | L186,193,206,286 | `var(--mission-severity-critical-text)` |

### Neutral / dark background colors

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#0a0f1a` | MissionFlow.module.css | L256 | `var(--surface-muted)` |
| `#0a0f1a` | MissionRouteState.module.css | L44 | `var(--surface-muted)` |
| `#0a0f1a` | ReviewDashboard.module.css | L53 | `var(--surface-muted)` |
| `#0a0f1a` | AppShell.module.css | L80 | `var(--surface-muted)` |
| `#0a0f1a` | ChallengePanel.module.css | L91 | `var(--surface-muted)` |
| `#0a0f1a` | ChallengeBoard.module.css | L103 | `var(--surface-muted)` |
| `#0a0f1a` | LevelUpModal.module.css | L66 | `var(--surface-muted)` |
| `#0b0b0f` | RecapToast.module.css | L60 | `var(--surface-base)` |
| `#0f172a` | SignalsPanel.module.css | L172 | `var(--surface-base)` |
| `#07102a` | ShareCard.module.css | L51 | `var(--surface-base)` |
| `#001026` | CardSharePage.module.css | L7 | `var(--surface-base)` |
| `#06280c` | BadgeStrip.module.css | L29 | Dark green on badge — intentional, keep |
| `#0c1020` | BadgeStrip.module.css | L6 | Now `var(--panel-bg)` fallback — will become `var(--surface-card)` |
| `#000` | QRCodeScanner.module.css | L6 | Intentional for camera overlay — keep |

### White colors

| Color | File | Lines | Intent |
|-------|------|-------|--------|
| `#fff` | Multiple (~15 files) | Various | Text-on-accent button labels. Consider `var(--surface-base)` or keep `#fff` for contrast on colored backgrounds. |
| `#ffffff` | LoadingMessage.module.css | L74,80 | Progress bar shimmer — replace with `var(--text-primary)` or keep intentional white |
| `#f4f8ff` | CardSharePage.module.css | L8,28 | Near-white for share card — keep or use `var(--text-primary)` |
| `#f7fbff` | ShareCard.module.css | L21 | Same as above |

### Info / blue (should use semantic token)

| Color | File | Lines | Suggested Token |
|-------|------|-------|----------------|
| `#60a5fa` | StatsSurface.module.css | L37 | New `--color-info` or `var(--mission-severity-low-text)` |
| `#c084fc` | BadgeGallery.module.css | L110 | New `--color-epic` or keep as literal for rare badge type |
| `#94a3b8` | ReviewDashboard.tsx (inline) | — | `var(--text-muted)` via CSS class |

---

## Category 3: PlanSurface.module.css — Non-standard Tokens

`PlanSurface.module.css` uses token names that don't match the design system:

| Used Variable | Doesn't Exist | Replace With |
|---------------|--------------|-------------|
| `--surface-secondary` | ✗ | `--surface-elevated` |
| `--surface-primary` | ✗ | `--surface-base` |
| `--surface-accent` | ✗ | `--surface-overlay` |
| `--accent-primary` | ✗ | `--accent` |
| `--border-muted` | ✗ | `--border-subtle` |
| `--border-subtle` | ✓ exists | OK |
| `--text-muted` | ✓ exists | OK |
| `--text-primary` | ✓ exists | OK |
| `--text-secondary` | ✓ exists | OK |

This file was likely written before the token system was established and uses its own naming conventions.

---

## Execution Strategy

1. **Phase A**: Fix mismatched fallbacks (Category 1) — mechanical find/replace, zero visual change
2. **Phase B**: Replace hardcoded hex with tokens (Category 2) — needs visual verification per file
3. **Phase C**: Fix PlanSurface non-standard tokens (Category 3) — standalone file, low risk
4. **Phase D**: Move ReviewDashboard.tsx inline styles to CSS classes
