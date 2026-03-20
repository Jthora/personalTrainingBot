# Component Inventory — Dead Code, Redundancy & Inline Styles

> Catalogues dead components, redundant patterns, and style inconsistencies across 61 component directories.
>
> **Status**: Audit complete.

---

## Dead Components (confirmed unused)

| Component | Path | Evidence | Size |
|-----------|------|----------|------|
| **AssistantCard** | `src/components/AssistantCard/AssistantCard.tsx` | Zero imports in any .tsx file. Extracted from MissionShell but never wired in. | 1 file |
| **StepTools** | `src/components/StepTools/StepTools.tsx` | Zero imports in any .tsx file. Extracted from MissionShell but never wired in. 122 lines. | 1 file |

Both lack CSS modules, tests, or any consumer. Safe to delete.

---

## Dead Assets

| Asset | Path | Evidence |
|-------|------|----------|
| `react.svg` | `src/assets/react.svg` | Vite scaffold leftover. Zero imports. |
| `WingCommanderLogo-288x162.gif` | `src/assets/images/` | 299 KB GIF named after the 1990s video game. Still actively used by Header but marked for replacement in roadmap docs. |

---

## Dead Functions & Gates

| Item | File | Evidence |
|------|------|----------|
| `isMissionRouteEnabled()` | `src/routes/missionCutover.ts` L59 | Always returns `true`. Used in 3 test files but never in production code for gating. |
| `toHomeFallbackPath()` | `src/routes/missionCutover.ts` | Exported but never called by any non-test file. |
| `missionHomeFallbacks` map | `src/routes/missionCutover.ts` L38-45 | `/home/*` → `/mission/*` mapping. Never used — only forward redirects are active. |

---

## Dual Shell Redundancy

The two shell systems overlap significantly:

| Feature | AppShell (v2) | MissionShell (v1) |
|---------|:---:|:---:|
| Header rendering | ✅ | ✅ |
| CelebrationLayer | ✅ | ✅ |
| MissionActionPalette | ✅ | ✅ |
| Keyboard shortcuts (⌘K, Esc) | ✅ | ✅ |
| `paletteOpen` state | ✅ | ✅ |
| Telemetry tracking | ✅ | ✅ |
| Outlet for surfaces | ✅ | ✅ |
| Onboarding flow | ❌ | ✅ |
| Guidance overlay | ❌ | ✅ |
| Operator assistant | ❌ | ✅ |

**Both shells are always mounted** — AppShell at `/train`, `/review`, `/progress`, `/profile` and MissionShell at `/mission/*`.

### Duplicate Tab Definitions

| Route | AppShell tab | MissionShell tab | Icon conflict |
|-------|:---:|:---:|:---:|
| Brief | 🏠 | 🎯 | ⚠️ Different |
| Triage | 🧭 | mission icon | ⚠️ Different |
| Training | shared surface | shared surface | — |
| Stats | shared surface | shared surface | — |

---

## Legacy Redirect Routes (11 routes)

These redirect ancient paths. Likely no inbound links remain.

| Route | Redirects To | Origin |
|-------|-------------|--------|
| `/home` | `/train` | v0 SPA |
| `/home/plan` | `/train` | v0 SPA |
| `/home/cards` | `/train` | v0 SPA |
| `/home/progress` | `/progress` | v0 SPA |
| `/home/handler` | `/profile` | v0 SPA |
| `/home/settings` | `/profile` | v0 SPA |
| `/schedules` | `/mission/triage` | v1 alias |
| `/drills` | `/mission/training` | v1 alias |
| `/training` | `/mission/training` | v1 alias |
| `/training/run` | `/mission/training` | v1 alias |
| `/settings` | `/mission/debrief` | v1 alias |

---

## Components Using 100% Inline Styles (no CSS module)

| Component | File | Inline Props |
|-----------|------|-------------|
| `CacheIndicator` | `src/components/CacheIndicator/CacheIndicator.tsx` | Full `React.CSSProperties` objects with position, colors, zIndex |
| `NetworkStatusIndicator` | `src/components/NetworkStatusIndicator/NetworkStatusIndicator.tsx` | Full `React.CSSProperties` — `baseStyles`, `onlineStyles`, `offlineStyles` |
| `Sparkline` | `src/components/Sparkline/Sparkline.tsx` | Inline SVG styling (acceptable) |
| `CelebrationLayer` | `src/components/CelebrationLayer/` | No CSS module found |
| `ScheduleNavigationRefresh` | `src/components/ScheduleNavigationRefresh/` | No CSS module found |

---

## Components Mixing Inline Colors with CSS Modules

| Component | Issue |
|-----------|-------|
| `ReviewDashboard.tsx` | Hardcoded `#4ade80`, `#fbbf24`, `#94a3b8` in `style={}` props |
| `DeckBrowser.tsx` | Inline style with `var(--text-secondary, #aaa)` string |
| `QuizSurface.tsx` | Inline `style={{ textAlign: 'center', padding: '2rem' }}` instead of class |

---

## Naming Inconsistency

| Component | Issue |
|-----------|-------|
| `LoadingMessage` | Uses kebab-case CSS class names (`styles['loading-container']`, `styles['loading-text']`) while every other component uses camelCase (`styles.pageContainer`, `styles.shell`) |

---

## Stale Comments

| File | Line | Comment |
|------|------|---------|
| `App.tsx` | L5 | `// Import the new component` — stale "newness" framing |
| `LoadingMessage.tsx` | L2 | `// Import the CSS module` — obvious, unnecessary |

---

## Side-Effect Imports

| File | Issue |
|------|-------|
| `AppShell.tsx` L22 | `import '../utils/migrateNavStorage'` — runs migration code at module scope via bare import side effect. Fragile, hard to test. |

---

## Header Settings Link Bug

| File | Line | Issue |
|------|------|-------|
| `Header.tsx` | L116 | Settings gear links to `/mission/debrief` — v1 route. In v2 shell mode, should link to `/profile`. |
