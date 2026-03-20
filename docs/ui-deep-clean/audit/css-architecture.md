# CSS Architecture Audit

> Design token system, legacy aliases, hardcoded colors, z-index conflicts, and breakpoint inconsistencies.
>
> **Status**: Audit complete. ~160 legacy alias refs, ~55 hardcoded hex colors, 3 z-index collision zones.

---

## Token System Overview

**One global file**: `src/styles/theme.css` — all design tokens centralized.
**60 CSS module files** across `src/`.
**No competing style systems** — CSS Modules everywhere (with 2 exceptions using inline styles).

---

## Legacy Alias Inventory

### `--handler-accent` → `--accent` (87 references across 22 files)

This is the single largest debt. "Handler" was the old in-universe term.

| File | Reference Count |
|------|----------------:|
| `Header/Header.module.css` | 14 |
| `SovereigntyPanel/SovereigntyPanel.module.css` | 9 |
| `ArchetypePicker/ArchetypePicker.module.css` | 6 |
| `HandlerPicker/HandlerPicker.module.css` | 6 |
| `AppShell/AppShell.module.css` | 5 |
| `TriageBoard/TriageBoard.module.css` | 5 |
| `LevelUpModal/LevelUpModal.module.css` | 4 |
| `ArtifactList/ArtifactList.module.css` | 3 |
| `ErrorBoundary/ErrorBoundary.module.css` | 3 |
| `ProfileSurface.module.css` | 3 |
| `ReviewDashboard.module.css` | 3 |
| `CallsignInput/CallsignInput.module.css` | 2 |
| `ChallengeBoard/ChallengeBoard.module.css` | 2 |
| `ChallengePanel/ChallengePanel.module.css` | 2 |
| `CompetencyChart/CompetencyChart.module.css` | 2 |
| `MissionIntakePanel/MissionIntakePanel.module.css` | 2 |
| `OperativeIdentityCard/OperativeIdentityCard.module.css` | 2 |
| `ProfileEditor/ProfileEditor.module.css` | 2 |
| `MissionFlow/MissionFlow.module.css` | 4 |
| `MissionStepHandoff/MissionStepHandoff.module.css` | 1 |
| `MissionActionPalette/MissionActionPalette.module.css` | 1 |
| `MissionRouteState/MissionRouteState.module.css` | 1 |
| `RestInterval/RestInterval.module.css` | 1 |
| `StatsSurface.module.css` | 1 |
| `SurfaceLoader/SurfaceLoader.module.css` | 2 |
| `LoadingMessage/LoadingMessage.module.css` | 1 |

### `--handler-accent-soft` → `--accent-soft` (9 references)

| File | Lines |
|------|-------|
| `SovereigntyPanel.module.css` | L107 |
| `HandlerPicker.module.css` | L58, L68 |
| `ArchetypePicker.module.css` | L56, L66 |
| `CallsignInput.module.css` | L39 |
| `ErrorBoundary.module.css` | L76 |
| `SurfaceLoader.module.css` | L12 |
| `TriageBoard.module.css` | L38 |

### `--handler-accent-strong` → `--accent-strong` (1 reference)

| File | Lines |
|------|-------|
| `LevelUpModal.module.css` | L72 |

### `--handler-glow` → `--accent-glow` (4 references)

| File | Lines |
|------|-------|
| `SovereigntyPanel.module.css` | L85, L108, L390, L468 |

### `--handler-border` → `--accent-border` (3 references)

| File | Lines |
|------|-------|
| `SovereigntyPanel.module.css` | L106 |
| `ErrorBoundary.module.css` | L37, L78 |

### `--panel-bg` → `--surface-card` (1 reference)

| File | Lines |
|------|-------|
| `BadgeStrip.module.css` | L6 |

### `--mission-type-*` → `--type-*` (77 references across 16 files)

| File | Reference Count |
|------|----------------:|
| `MissionFlow/MissionFlow.module.css` | 9 |
| `ArtifactList/ArtifactList.module.css` | 9 |
| `TriageBoard/TriageBoard.module.css` | 8 |
| `DebriefClosureSummary.module.css` | 5 |
| `MissionCycleSummary.module.css` | 5 |
| `TimelineBand/TimelineBand.module.css` | 5 |
| `MissionHeader/MissionHeader.module.css` | 5 |
| `AlertStream/AlertStream.module.css` | 5 |
| `MissionActionPalette.module.css` | 4 |
| `MissionIntakePanel.module.css` | 4 |
| `MissionStepHandoff.module.css` | 3 |
| `HandlerPicker.module.css` | 3 |
| `ArchetypePicker.module.css` | 3 |
| `ReviewDashboard.module.css` | 3 |
| `AppShell.module.css` | 2 |
| `ProfileSurface.module.css` | 2 |
| `MissionRouteState.module.css` | 2 |

### Dead Aliases (0 consumers — safe to delete from theme.css)

| Variable | Line in theme.css |
|----------|------------------:|
| `--primary-bg-color` | L144 |
| `--secondary-bg-color` | L145 |
| `--primary-text-color` | L146 |
| `--secondary-text-color` | L147 |
| `--border-color` | L148 |
| `--padding` | L152 |
| `--border-radius` | L153 |

---

## Hardcoded Color Hotspots

### Mismatched Fallback Values (bugs)

These files use incorrect hex fallbacks inside `var()` calls — if the variable ever fails to resolve, the wrong color appears.

| File | Used | Should Be |
|------|------|-----------|
| `ExerciseRenderer.module.css` | `var(--accent, #4a6cf7)` | `#5A7FFF` |
| `DataSafetyPanel.module.css` | `var(--accent, #6c63ff)` | `#5A7FFF` |
| `TodayLauncher.module.css` | `var(--accent, #6c63ff)` | `#5A7FFF` |
| `QuizRunner.module.css` (20+) | `var(--accent, #6c63ff)` | `#5A7FFF` |
| Many ModuleBrowser refs | `var(--accent, #6c63ff)` | `#5A7FFF` |

### Bare Hardcoded Hex Colors (~55 instances)

| File | Count | Colors |
|------|------:|--------|
| `SovereigntyPanel.module.css` | 7 | `#fca5a5`, `#93c5fd`, `#6ee7b7`, `#fde68a` |
| `ChallengeBoard.module.css` | 5 | `#22c55e`, `#0a0f1a` |
| `ChallengePanel.module.css` | 4 | `#22c55e`, `#0a0f1a` |
| `BadgeStrip.module.css` | 4 | `#fff`, `#4ade80`, `#16a34a`, `#06280c` |
| `CardSharePage.module.css` | 3 | `#001026`, `#f4f8ff` |
| `LoadingMessage.module.css` | 3 | `#ffffff`, `#ffe1b3` |
| `AppShell.module.css` | 3 | `#0a0f1a`, `#f87171`, `#fff` |
| `WeeklySummary.module.css` | 2 | `#22c55e`, `#f97316` |
| `StatsPanel.module.css` | 2 | `#f97316` |
| `BadgeGallery.module.css` | 2 | `#60a5fa`, `#c084fc` |
| `CompetencyChart.module.css` | 2 | `#4caf50`, `#f44336` |
| `XPTicker.module.css` | 1 | `#fde68a` |

### Inline Style Hardcoded Colors (in .tsx files)

| File | Colors |
|------|--------|
| `ReviewDashboard.tsx` L75-83 | `#4ade80`, `#fbbf24`, `#94a3b8` |
| `DeckBrowser.tsx` L120 | `var(--text-secondary, #aaa)` in inline style |
| `NetworkStatusIndicator.tsx` | `#0f5132`, `#641220`, rgba values throughout |
| `CacheIndicator.tsx` | Full inline style with rgba values |

---

## z-index Map

No z-index tokens exist — all are magic numbers.

| z-index | Component | Purpose | Collision? |
|--------:|-----------|---------|:----------:|
| 1500 | Header.module.css | Mobile menu overlay | — |
| 1200 | MissionActionPalette.module.css | Action palette | ⚠️ |
| 1200 | Header.module.css | Drawer | ⚠️ |
| 1100 | RecapToast.module.css | Toast notification | ⚠️ |
| 1100 | LevelUpModal.module.css | Modal overlay | ⚠️ |
| 1100 | ProfileEditor.module.css | Picker overlay | ⚠️ |
| 1100 | RecapModal.module.css | Modal overlay | ⚠️ |
| 1050 | UpdateNotification.module.css | SW update banner | ⚠️ |
| 1050 | InstallBanner.module.css | Install prompt | ⚠️ |
| 1050 | BadgeToast.module.css | Badge toast | ⚠️ |
| 1000 | AppShell.module.css | BottomNav | — |
| 1000 | Header.module.css | Header bar | — |
| 930 | XPTicker.module.css | XP ticker | — |
| 900 | SovereigntyPanel.module.css | Panel | — |
| 100 | ActivityHeatmap.module.css | Tooltip | — |
| 1 | ShareCard.module.css (×3) | Local stacking | — |

**3 collision zones**: z-1200 (palette vs drawer), z-1100 (4 overlays), z-1050 (3 banners/toasts).

---

## Breakpoint Inventory

| Breakpoint | Count | Files |
|------------|------:|-------|
| `max-width: 480px` | 3 | DebriefClosureSummary, CompetencyChart, Header |
| `max-width: 640px` | 1 | ShareCard (non-standard) |
| `max-width: 768px` | 11 | AppShell, SovereigntyPanel, MissionStepHandoff, ShareCard, DrillRunner, MissionIntakePanel, HandlerPicker, ArchetypePicker, PlanSurface, MissionFlow, ModuleBrowser, Header |
| `max-width: 900px` | 2 | TriageBoard, ArtifactList (non-standard) |
| `max-width: 1024px` | 2 | ShareCard, Header |
| `hover: hover` | 33 | Widespread (good) |
| `prefers-reduced-motion` | 11 | Accessibility (good) |

**Standard scale**: 480px / 768px / 1024px.
**Outliers**: 640px (ShareCard), 900px (TriageBoard, ArtifactList).
**No breakpoint tokens** defined in theme.css.

---

## `!important` Usage — Clean

32 occurrences across 12 files — **all correct usage** inside `@media (prefers-reduced-motion: reduce)` blocks:
```css
animation: none !important;
transition: none !important;
```
No `!important` abuse detected.

---

## Font Stack Issues

| File | Issue |
|------|-------|
| `SovereigntyPanel.module.css` (×2) | Uses `'Courier New', monospace` instead of `var(--font-mono)` |
| `ShareCard.module.css` | References `'Roboto Mono'` — not loaded via `@font-face` |
