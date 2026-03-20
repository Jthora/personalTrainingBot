# Legacy Alias Migration Map

> Replace `--handler-*`, `--mission-type-*`, and `--panel-bg` with canonical tokens.

---

## Priority: `--handler-accent` → `--accent` (87 references, 22 files + 1 TS)

> **Important**: `src/data/handlerThemes.ts` dynamically sets `--handler-accent` at runtime.
> After migrating all CSS consumers, update `handlerThemes.ts` to set `--accent` directly,
> then delete the alias definitions from theme.css.

### File-by-file

| File | Lines | Count | Find | Replace |
|------|-------|-------|------|---------|
| Header/Header.module.css | (14 instances) | 14 | `--handler-accent` | `--accent` |
| SovereigntyPanel/SovereigntyPanel.module.css | L107,116,122,127,154,160,165,380,400 | 9 | `--handler-accent` | `--accent` |
| ArchetypePicker/ArchetypePicker.module.css | L56,66 (these are `--handler-accent-soft`) | — | see §2 below |
| HandlerPicker/HandlerPicker.module.css | L57,67,132,157 | 4 | `--handler-accent` | `--accent` |
| HandlerPicker/HandlerPicker.module.css | L58,68 | 2 | `--handler-accent-soft` | `--accent-soft` |
| AppShell/AppShell.module.css | (5 instances) | 5 | `--handler-accent` | `--accent` |
| TriageBoard/TriageBoard.module.css | L38 (`--handler-accent-soft`) | — | see §2 below |
| LevelUpModal/LevelUpModal.module.css | L21,47,65 | 3 | `--handler-accent` | `--accent` |
| LevelUpModal/LevelUpModal.module.css | L72 | 1 | `--handler-accent-strong` | `--accent-strong` |
| MissionFlow/MissionFlow.module.css | (4 instances) | 4 | `--handler-accent` | `--accent` |
| ArtifactList/ArtifactList.module.css | L49,64,65 | 3 | `--handler-accent` | `--accent` |
| ErrorBoundary/ErrorBoundary.module.css | L77,82 | 2 | `--handler-accent` | `--accent` |
| ErrorBoundary/ErrorBoundary.module.css | L76 | 1 | `--handler-accent-soft` | `--accent-soft` |
| ErrorBoundary/ErrorBoundary.module.css | L37,78 | 2 | `--handler-border` | `--accent-border` |
| ProfileSurface.module.css | L95,96 + 1 more | 3 | `--handler-accent` | `--accent` |
| ReviewDashboard.module.css | L39,52,176 | 3 | `--handler-accent` | `--accent` |
| CallsignInput/CallsignInput.module.css | L38 | 1 | `--handler-accent` | `--accent` |
| CallsignInput/CallsignInput.module.css | L39 | 1 | `--handler-accent-soft` | `--accent-soft` |
| ChallengeBoard/ChallengeBoard.module.css | L78,98 | 2 | `--handler-accent` | `--accent` |
| ChallengePanel/ChallengePanel.module.css | L71,119 | 2 | `--handler-accent` | `--accent` |
| CompetencyChart/CompetencyChart.module.css | L55,94 | 2 | `--handler-accent` | `--accent` |
| MissionIntakePanel/MissionIntakePanel.module.css | L4,92 | 2 | `--handler-accent` | `--accent` |
| OperativeIdentityCard/OperativeIdentityCard.module.css | L45,114 | 2 | `--handler-accent` | `--accent` |
| ProfileEditor/ProfileEditor.module.css | (2 instances) | 2 | `--handler-accent` | `--accent` |
| SurfaceLoader/SurfaceLoader.module.css | L13 | 1 | `--handler-accent` | `--accent` |
| SurfaceLoader/SurfaceLoader.module.css | L12 | 1 | `--handler-accent-soft` | `--accent-soft` |
| MissionStepHandoff/MissionStepHandoff.module.css | L65 | 1 | `--handler-accent` | `--accent` |
| MissionActionPalette/MissionActionPalette.module.css | L75 | 1 | `--handler-accent` | `--accent` |
| MissionRouteState/MissionRouteState.module.css | L43 | 1 | `--handler-accent` | `--accent` |
| RestInterval/RestInterval.module.css | L19 | 1 | `--handler-accent` | `--accent` |
| StatsSurface.module.css | L100 | 1 | `--handler-accent` | `--accent` |
| LoadingMessage/LoadingMessage.module.css | L20 | 1 | `--handler-accent` | `--accent` |

---

## §2: `--handler-accent-soft` → `--accent-soft` (9 references, 7 files)

| File | Lines | Find | Replace |
|------|-------|------|---------|
| TriageBoard/TriageBoard.module.css | L38 | `--handler-accent-soft` | `--accent-soft` |
| ArchetypePicker/ArchetypePicker.module.css | L56,66 | `--handler-accent-soft` | `--accent-soft` |
| SurfaceLoader/SurfaceLoader.module.css | L12 | `--handler-accent-soft` | `--accent-soft` |
| ErrorBoundary/ErrorBoundary.module.css | L76 | `--handler-accent-soft` | `--accent-soft` |
| CallsignInput/CallsignInput.module.css | L39 | `--handler-accent-soft` | `--accent-soft` |
| HandlerPicker/HandlerPicker.module.css | L58,68 | `--handler-accent-soft` | `--accent-soft` |
| SovereigntyPanel/SovereigntyPanel.module.css | L107 | `--handler-accent-soft` | `--accent-soft` |

---

## §3: `--handler-accent-strong` → `--accent-strong` (1 reference)

| File | Lines | Find | Replace |
|------|-------|------|---------|
| LevelUpModal/LevelUpModal.module.css | L72 | `--handler-accent-strong` | `--accent-strong` |

---

## §4: `--handler-glow` → `--accent-glow` (4 references)

| File | Lines | Find | Replace |
|------|-------|------|---------|
| SovereigntyPanel/SovereigntyPanel.module.css | L85,108,390,468 | `--handler-glow` | `--accent-glow` |

---

## §5: `--handler-border` → `--accent-border` (3 references)

| File | Lines | Find | Replace |
|------|-------|------|---------|
| ErrorBoundary/ErrorBoundary.module.css | L37,78 | `--handler-border` | `--accent-border` |
| SovereigntyPanel/SovereigntyPanel.module.css | L106 | `--handler-border` | `--accent-border` |

---

## §6: `--panel-bg` → `--surface-card` (1 reference)

| File | Lines | Find | Replace |
|------|-------|------|---------|
| BadgeStrip/BadgeStrip.module.css | L6 | `--panel-bg` | `--surface-card` |

---

## §7: `--mission-type-*` → `--type-*` (77 references, 16 files)

| File | Lines | Count | Pattern |
|------|-------|-------|---------|
| MissionFlow/MissionFlow.module.css | L37,58,86,93,115,139,168,202,209 | 9 | `--mission-type-body`, `--mission-type-caption`, `--mission-type-h2` |
| ArtifactList/ArtifactList.module.css | L27,70,76,82,88,102,108,133,154 | 9 | `--mission-type-caption`, `--mission-type-body` |
| TriageBoard/TriageBoard.module.css | L18,32,58,103,109,122,172,190 | 8 | `--mission-type-caption`, `--mission-type-body` |
| DebriefClosureSummary/DebriefClosureSummary.module.css | L14,42,50,74,80 | 5 | `--mission-type-h3`, `--mission-type-caption`, `--mission-type-h2`, `--mission-type-body` |
| MissionCycleSummary/MissionCycleSummary.module.css | L14,21,42,50,56 | 5 | `--mission-type-h3`, `--mission-type-caption`, `--mission-type-h2` |
| TimelineBand/TimelineBand.module.css | L10,43,49,54,78 | 5 | `--mission-type-h3`, `--mission-type-body`, `--mission-type-caption` |
| MissionHeader/MissionHeader.module.css | L36,44,53,73,86 | 5 | `--mission-type-caption`, `--mission-type-h2`, `--mission-type-body` |
| AlertStream/AlertStream.module.css | L10,26,49,55,71 | 5 | `--mission-type-h3`, `--mission-type-caption`, `--mission-type-body` |
| MissionActionPalette/MissionActionPalette.module.css | L34,43,69,82 | 4 | `--mission-type-body`, `--mission-type-caption` |
| MissionIntakePanel/MissionIntakePanel.module.css | L16,24,50,57 | 4 | `--mission-type-caption`, `--mission-type-h2`, `--mission-type-body` |
| MissionStepHandoff/MissionStepHandoff.module.css | L29,36,60 | 3 | `--mission-type-body`, `--mission-type-caption` |
| HandlerPicker/HandlerPicker.module.css | L13,21,28 | 3 | `--mission-type-caption`, `--mission-type-h2`, `--mission-type-body` |
| ArchetypePicker/ArchetypePicker.module.css | L13,21,28 | 3 | `--mission-type-caption`, `--mission-type-h2`, `--mission-type-body` |
| ReviewDashboard.module.css | L10,17,129 | 3 | `--mission-type-h2`, `--mission-type-body` |
| AppShell.module.css | L48,188 | 2 | `--mission-type-caption` |
| ProfileSurface.module.css | L10,56 | 2 | `--mission-type-h2`, `--mission-type-body` |
| MissionRouteState/MissionRouteState.module.css | L27,33 | 2 | `--mission-type-h3`, `--mission-type-body` |

**Global find/replace pattern** (sed-safe):

```
--mission-type-h1   → --type-h1
--mission-type-h2   → --type-h2
--mission-type-h3   → --type-h3
--mission-type-body  → --type-body
--mission-type-caption → --type-caption
```

---

## §8: handlerThemes.ts runtime setter migration

After all CSS consumers are migrated, update `src/data/handlerThemes.ts`:

```diff
- root.style.setProperty('--handler-accent', paletteToApply.accent);
- root.style.setProperty('--handler-accent-strong', paletteToApply.accentStrong);
- root.style.setProperty('--handler-accent-soft', paletteToApply.accentSoft);
- root.style.setProperty('--handler-glow', paletteToApply.glow);
- root.style.setProperty('--handler-border', paletteToApply.border);
+ root.style.setProperty('--accent', paletteToApply.accent);
+ root.style.setProperty('--accent-strong', paletteToApply.accentStrong);
+ root.style.setProperty('--accent-soft', paletteToApply.accentSoft);
+ root.style.setProperty('--accent-glow', paletteToApply.glow);
+ root.style.setProperty('--accent-border', paletteToApply.border);
```

Also update `Sparkline.tsx` JSDoc comment (L18):
```diff
- /** Stroke color (default var(--handler-accent)). */
+ /** Stroke color (default var(--accent)). */
```

---

## §9: Delete alias definitions from theme.css

After all consumers and runtime setters are migrated, remove from `src/styles/theme.css`:

| Lines | Definition |
|-------|-----------|
| L27 | `--handler-accent: var(--accent);` |
| L28 | `--handler-accent-strong: var(--accent-strong);` |
| L29 | `--handler-accent-soft: var(--accent-soft);` |
| L30 | `--handler-glow: var(--accent-glow);` |
| L31 | `--handler-border: var(--accent-border);` |
| L55 | `--panel-bg: var(--surface-card);` |
| L80-84 | `--mission-type-h1` through `--mission-type-caption` |
| L144-148 | Dead aliases: `--primary-bg-color`, `--secondary-bg-color`, `--primary-text-color`, `--secondary-text-color`, `--border-color` |
| L152-153 | Dead aliases: `--padding`, `--border-radius` |
