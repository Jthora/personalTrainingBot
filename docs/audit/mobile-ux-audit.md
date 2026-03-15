# Mobile-First UX Audit — Starcom Academy

**Date:** 2026-03-14
**Viewport:** iPhone 14 (390 × 664) · Primary breakpoint: 768px
**Scope:** All CSS module files, TSX components, fixed/sticky positioning, touch targets, hover patterns, font readability

---

## Executive Summary

| Category | HIGH | MEDIUM | LOW | Total |
|----------|------|--------|-----|-------|
| Layout & Responsive | 2 | 5 | 8 | 15 |
| Touch Targets | 14 | 12 | 6 | 32 |
| Hover-Only Patterns | 4 | 31 | 9 | 44 |
| Overflow & Scroll | 4 | 3 | 6 | 13 |
| Z-Index & Safe-Area | 8 | 4 | 0 | 12 |
| Font Size & Readability | 3 | 10 | 5 | 18 |
| **Total** | **35** | **65** | **34** | **134** |

---

## 1. Layout & Responsive Breakpoints

### HIGH

| ID | Component | File | Issue |
|----|-----------|------|-------|
| L1 | ShareCard | `ShareCard.module.css:2-3` | `--share-card-width: 1200px` × 0.6 scale = 720px, overflows 390px viewport. No breakpoint below 640px. |
| L2 | PlanSurface | `PlanSurface.module.css:3` | 7-column grid (`repeat(7, 1fr)`) forced at all sizes → ~51px/col at 390px. Day labels cramped. |

### MEDIUM

| ID | Component | File | Issue |
|----|-----------|------|-------|
| L3 | RecapModal grid | `RecapModal.module.css:100` | 2-column grid in 311px content area (90vw − 40px padding). No single-column breakpoint. |
| L4 | DebriefClosureSummary | `DebriefClosureSummary.module.css:21` | `minmax(170px, 1fr)` borderline 2-column cramping at 362px. No explicit mobile breakpoint. |
| L5 | SovereigntyPanel | `SovereigntyPanel.module.css` | 470-line file with **zero** `@media` breakpoints. Overlay, forms, tabs, sync pills all lack mobile styles. |
| L6 | DrillRunner | `DrillRunner.module.css` | 500-line file with **no** `@media (max-width)` — only has `prefers-reduced-motion`. |
| L7 | ModuleBrowser | `ModuleBrowser.module.css:11` | `minmax(260px, 1fr)` auto-fills to single column, but no mobile-specific font/padding adjustments. |

---

## 2. Touch Targets (WCAG 2.5.8: ≥ 24px AA / ≥ 44px AAA)

### HIGH — Critical Escape Buttons

| ID | Component | Selector | Computed Size | File |
|----|-----------|----------|---------------|------|
| T1 | RecapToast | `.close` | ~20 × 20px | `RecapToast.module.css:97` |
| T2 | InstallBanner | `.dismissBtn` | ~22 × 22px | `InstallBanner.module.css:42` |
| T3 | RecapModal | `.closeButton` | 32 × 32px | `RecapModal.module.css:88` |
| T4 | Header Drawer | `.drawerClose` | 32 × 32px | `Header.module.css:422` |
| T5 | SovereigntyPanel | `.closeBtn` | ~25px tall | `SovereigntyPanel.module.css:382` |
| T6 | ProfileEditor | `.closeBtn` | ~25px tall | `ProfileEditor.module.css:80` |

### HIGH — Core Interaction Elements

| ID | Component | Selector | Computed Size | File |
|----|-----------|----------|---------------|------|
| T7 | DrillRunner | `.ratingBtn` | 36 × 36px | `DrillRunner.module.css:380` |
| T8 | DrillRunner | `.expandToggle` | ~18 × 26px | `DrillRunner.module.css:192` |
| T9 | TimerDisplay | `.controlBtn` | ~20 × 30px | `TimerDisplay.module.css:47` |
| T10 | Header | `.userAvatar` | 28 × 28px | `Header.module.css:311` |
| T11 | ModuleBrowser | checkbox | 18 × 18px | `ModuleBrowser.module.css:92` |
| T12 | ExerciseRenderer | checkbox | ~13 × 13px | `ExerciseRenderer.module.css:119` |
| T13 | ExerciseRenderer | radio | ~13 × 13px native | `ExerciseRenderer.tsx:178` |
| T14 | ScoreLineChart | `.legendItem` | ~15px tall | `ScoreLineChart.module.css:49` |

### HIGH — Small Action Buttons

| ID | Component | Selector | Computed Size | File |
|----|-----------|----------|---------------|------|
| T15 | TimelineBand | `.jump` | ~20px tall | `TimelineBand.module.css:53` |
| T16 | SovereigntyPanel | `.removeBtn` | ~21px tall | `SovereigntyPanel.module.css:153` |
| T17 | ModuleBrowser | `.breadcrumbLink` | ~13px tall | `ModuleBrowser.module.css:253` |

### MEDIUM (24–36px range)

| ID | Component | Selector | Size | File |
|----|-----------|----------|------|------|
| T18 | RestInterval | `.skipBtn` | ~24px | `RestInterval.module.css:28` |
| T19 | ExerciseRenderer | `.revealBtn` / `.hintBtn` | ~24px | `ExerciseRenderer.module.css:56` |
| T20 | ModuleBrowser | `.trainBtn` | ~24px | `ModuleBrowser.module.css:191` |
| T21 | ChallengePanel | `.claimButton` | ~24px | `ChallengePanel.module.css:94` |
| T22 | ChallengeBoard | `.claimButton` | ~28px | `ChallengeBoard.module.css:103` |
| T23 | UpdateNotification | `.reloadBtn` | ~23px | `UpdateNotification.module.css:23` |
| T24 | SovereigntyPanel | `.btn` | ~26px | `SovereigntyPanel.module.css:130` |
| T25 | SovereigntyPanel | `.tab` | ~26px | `SovereigntyPanel.module.css:407` |
| T26 | MissionFlow | `.completeButton` | ~29px | `MissionFlow.module.css:251` |
| T27 | Header | `.settingsLink` | 36px | `Header.module.css:175` |
| T28 | Header | `.moreButton` | 36px | `Header.module.css:243` |
| T29 | Header | `.navButton` | ~28px | `Header.module.css:207` |

---

## 3. Hover-Only Patterns

### HIGH — Unreachable Content on Touch

| ID | Component | Issue | File |
|----|-----------|-------|------|
| H1 | ActivityHeatmap | `onMouseEnter`/`onMouseLeave` tooltip with **no touch handler** — day drill counts invisible on mobile | `ActivityHeatmap.tsx:152` |
| H2 | ScoreLineChart | `onMouseEnter`/`onMouseLeave` series highlighting — **no touch equivalent** | `ScoreLineChart.tsx:177` |
| H3 | QuizRunner | `.option:hover` — primary answer selection with zero `:focus-visible` feedback | `QuizRunner.module.css:112` |
| H4 | QuizRunner | `.matchSelectable:hover` — match exercise with no focus fallback | `QuizRunner.module.css:195` |

### MEDIUM — Missing `:focus-visible` / `:active` Fallbacks

**48 total `:hover` rules across 30 CSS module files have no corresponding `:focus-visible` or `:active` fallback.** No hover rules use `@media (hover: hover)` guards (0/48). Touch devices trigger sticky hover states.

Key files with multiple unguarded hover rules:
- `QuizRunner.module.css` — 4 rules (option, matchSelectable, primaryBtn, secondaryBtn)
- `SovereigntyPanel.module.css` — 3 rules (closeBtn, tab, removeBtn)
- `ModuleBrowser.module.css` — 4 rules (tile, trainBtn, breadcrumbLink, quickTrainBtn)
- `Header.module.css` — 5 rules (settingsLink, moreButton, loginButton, userButton, menuItem)
- `DrillRunner.module.css` — 2 rules (ratingBtn, expandToggle)
- `TodayLauncher.module.css` — 3 rules (launchBtn, reviewBtn, regenerateBtn)
- `RecapModal.module.css` — 2 rules (cta, secondary)

---

## 4. Z-Index & Safe-Area Issues

### HIGH — Z-Index Stacking Bugs

| ID | Component | z-index | Issue | File |
|----|-----------|---------|-------|------|
| Z1 | RecapModal | **40** | Renders **behind** header (1000), bottomNav (1000), and all toasts/banners. Likely a bug. | `RecapModal.module.css:2` |
| Z2 | InstallBanner | 900 | Below bottomNav (1000) — CTA hidden behind nav on mobile | `InstallBanner.module.css:2` |
| Z3 | BadgeToast | 940 | Below bottomNav (1000) — toast partially/fully occluded | `BadgeToast.module.css:4` |

### HIGH — Missing Safe-Area Insets

| ID | Component | Position | Missing | File |
|----|-----------|----------|---------|------|
| Z4 | RecapToast | `bottom: 18px` fixed | `env(safe-area-inset-bottom)` — overlaps home indicator | `RecapToast.module.css:4` |
| Z5 | SovereigntyPanel | `inset: 0` fixed overlay | Both top and bottom safe-area padding — content under notch/home indicator | `SovereigntyPanel.module.css:281` |
| Z6 | ProfileEditor | `inset: 0` fixed overlay | Both top and bottom safe-area padding | `ProfileEditor.module.css:59` |
| Z7 | UpdateNotification | `top: 0` fixed | `env(safe-area-inset-top)` — overlaps notch | `UpdateNotification.module.css:2` |
| Z8 | InstallBanner | `bottom: 4rem` fixed | `env(safe-area-inset-bottom)` — ignored behind bottomNav anyway | `InstallBanner.module.css:2` |

### Z-Index Reference Table

```
1500  Header .skipLink (focus-only)
1200  MissionActionPalette, Header .drawerOverlay
1100  RecapToast, ProfileEditor
1000  Header, BottomNav                ← anchor layer
 950  LevelUpModal, UpdateNotification ← behind BottomNav!
 940  BadgeToast                       ← behind BottomNav!
 930  XPTicker
 900  InstallBanner, SovereigntyPanel  ← behind BottomNav!
 100  ActivityHeatmap tooltip
  40  RecapModal                       ← BUG: behind everything
```

---

## 5. Overflow & Scroll Issues

### HIGH — Scroll Bleed-Through

| ID | Component | Issue | File |
|----|-----------|-------|------|
| O1 | RecapModal | No `overscroll-behavior: contain` — scroll bleeds to background | `RecapModal.module.css:1` |
| O2 | MissionActionPalette | `.list` has `overflow: auto; max-height: 360px` — scroll bleeds at bounds | `MissionActionPalette.module.css:53` |
| O3 | SovereigntyPanel | `.overlay` has `overflow-y: auto` — no overscroll containment | `SovereigntyPanel.module.css:285` |
| O4 | ProfileEditor | `.overlay` has `overflow-y: auto` — no overscroll containment | `ProfileEditor.module.css:63` |

### MEDIUM

| ID | Component | Issue | File |
|----|-----------|-------|------|
| O5 | InstallBanner | `.text` has `white-space: nowrap` with no overflow guard — text pushes buttons off-screen on narrow viewports | `InstallBanner.module.css:22` |
| O6 | LoadingMessage | `font-size: 1.5em` + `white-space: nowrap` — long loading messages overflow | `LoadingMessage.module.css:42` |
| O7 | Global scrollbar | 6px wide, near-invisible thumb (`rgba(227, 236, 255, 0.12)`) — scroll affordance invisible on dark backgrounds | `theme.css:185` |

---

## 6. Font Size & Readability

### HIGH (< 10px)

| ID | Component | Selector | Size | File |
|----|-----------|----------|------|------|
| F1 | BottomNav | `.bottomNavBadge` | 0.55rem (~8.8px) | `AppShell.module.css:165` |
| F2 | BottomNav | `.bottomNavLabel` | 0.6rem (~9.6px) — **primary navigation text** | `AppShell.module.css:174` |
| F3 | BadgeGallery | `.rarity` | 9px | `BadgeGallery.module.css:83` |

### MEDIUM (10–11px)

10+ labels across `OperativeIdentityCard`, `CallsignInput`, `CompetencyChart`, `SovereigntyPanel`, `HandlerPicker`, `BadgeGallery` use 10px font sizes. The `--type-caption` design token clamps to 11px at 390px.

### Missing Global Protections

| ID | Issue | File |
|----|-------|------|
| F4 | No `text-size-adjust: 100%` on body — iOS auto-inflates fonts on landscape rotation | `theme.css` |
| F5 | No global `overflow-wrap: break-word` — long words in drill/quiz content can overflow 390px containers | `theme.css` |
| F6 | Only 3 files use `word-break` or `overflow-wrap` (SovereigntyPanel, ShareCard, ErrorBoundary) |

---

## Recommended Fix Phases

### Phase A — Critical Fixes (HIGH severity, structural bugs)

1. **Z1** RecapModal z-index: raise from 40 to 1100+
2. **Z2-Z3** InstallBanner/BadgeToast: raise above bottomNav or reposition for mobile
3. **Z4-Z8** Add safe-area insets to RecapToast, SovereigntyPanel, ProfileEditor, UpdateNotification, InstallBanner
4. **O1-O4** Add `overscroll-behavior: contain` to all modal/overlay scrollable areas
5. **L1** ShareCard: add sub-420px breakpoint with smaller scale
6. **L2** PlanSurface: scrollable row or collapsed layout at ≤480px
7. **T1-T6** Enlarge close/dismiss buttons to ≥ 44px on mobile
8. **T8** DrillRunner expand toggle: enlarge to ≥ 44px tap area
9. **H1-H2** ActivityHeatmap/ScoreLineChart: add touch handlers for tooltips
10. **F1-F2** BottomNav labels/badges: increase to ≥ 11px

### Phase B — UX Polish (MEDIUM severity)

1. **T7** DrillRunner rating buttons: enlarge from 36 to 44px
2. **T11-T13** Enlarge checkbox/radio tap areas via label padding
3. **H3-H4** QuizRunner: add `:focus-visible` to option/matchSelectable
4. **L3-L7** Add mobile breakpoints to RecapModal, DebriefClosureSummary, SovereigntyPanel, DrillRunner, ModuleBrowser
5. **O5-O6** Fix `white-space: nowrap` overflow in InstallBanner, LoadingMessage
6. **F4-F5** Add global `text-size-adjust` and `overflow-wrap` to body
7. Wrap all 48 `:hover` rules in `@media (hover: hover)` blocks

### Phase C — Polish (LOW severity)

1. Remaining small touch targets (24–36px range)
2. 10px font sizes on secondary labels
3. Line-height and scroll indicator refinements
