# Phase 2 — CSS Token Cleanup

> Migrate legacy CSS variable aliases, fix hardcoded colors, tokenize z-index/breakpoints.
>
> **Tasks**: ~180 | **Risk**: Low | **Dependencies**: None (can run parallel with Phase 1)
>
> **Approach**: Mechanical find-and-replace for aliases. Manual review for hardcoded colors.

---

## Scope

- 87 `--handler-accent` → `--accent` replacements across 22 files
- 17 `--handler-accent-*`/`--handler-glow`/`--handler-border`/`--panel-bg` replacements
- 77 `--mission-type-*` → `--type-*` replacements across 16 files
- 7 dead alias definition deletions from theme.css
- ~30 mismatched fallback hex corrections
- ~55 hardcoded hex → token replacements
- z-index tokenization (12 files)
- 2 font-family fixes
- Breakpoint documentation

---

## Task Checklist

### Step 2.1 — Delete dead alias definitions from theme.css (7 tasks)

- [ ] `P2-001` Delete `--primary-bg-color: var(--surface-base)` (L144)
- [ ] `P2-002` Delete `--secondary-bg-color: var(--surface-elevated)` (L145)
- [ ] `P2-003` Delete `--primary-text-color: var(--text-primary)` (L146)
- [ ] `P2-004` Delete `--secondary-text-color: var(--accent-glow)` (L147)
- [ ] `P2-005` Delete `--border-color: var(--accent-border)` (L148)
- [ ] `P2-006` Delete `--padding: 10px` (L152)
- [ ] `P2-007` Delete `--border-radius: 5px` (L153)

### Step 2.2 — Migrate `--handler-accent` → `--accent` (22 files)

See [legacy-alias-migration.md](legacy-alias-migration.md) for complete file-by-file mapping.

- [ ] `P2-008` Header/Header.module.css (14 replacements)
- [ ] `P2-009` SovereigntyPanel/SovereigntyPanel.module.css (9 replacements)
- [ ] `P2-010` ArchetypePicker/ArchetypePicker.module.css (6 replacements)
- [ ] `P2-011` HandlerPicker/HandlerPicker.module.css (6 replacements)
- [ ] `P2-012` AppShell/AppShell.module.css (5 replacements)
- [ ] `P2-013` TriageBoard/TriageBoard.module.css (5 replacements)
- [ ] `P2-014` LevelUpModal/LevelUpModal.module.css (4 replacements)
- [ ] `P2-015` MissionFlow/MissionFlow.module.css (4 replacements)
- [ ] `P2-016` ArtifactList/ArtifactList.module.css (3 replacements)
- [ ] `P2-017` ErrorBoundary/ErrorBoundary.module.css (3 replacements)
- [ ] `P2-018` ProfileSurface.module.css (3 replacements)
- [ ] `P2-019` ReviewDashboard.module.css (3 replacements)
- [ ] `P2-020` CallsignInput/CallsignInput.module.css (2 replacements)
- [ ] `P2-021` ChallengeBoard/ChallengeBoard.module.css (2 replacements)
- [ ] `P2-022` ChallengePanel/ChallengePanel.module.css (2 replacements)
- [ ] `P2-023` CompetencyChart/CompetencyChart.module.css (2 replacements)
- [ ] `P2-024` MissionIntakePanel/MissionIntakePanel.module.css (2 replacements)
- [ ] `P2-025` OperativeIdentityCard/OperativeIdentityCard.module.css (2 replacements)
- [ ] `P2-026` ProfileEditor/ProfileEditor.module.css (2 replacements)
- [ ] `P2-027` SurfaceLoader/SurfaceLoader.module.css (2 replacements)
- [ ] `P2-028` MissionStepHandoff/MissionStepHandoff.module.css (1 replacement)
- [ ] `P2-029` MissionActionPalette/MissionActionPalette.module.css (1 replacement)
- [ ] `P2-030` MissionRouteState/MissionRouteState.module.css (1 replacement)
- [ ] `P2-031` RestInterval/RestInterval.module.css (1 replacement)
- [ ] `P2-032` StatsSurface.module.css (1 replacement)
- [ ] `P2-033` LoadingMessage/LoadingMessage.module.css (1 replacement)

### Step 2.3 — Migrate remaining handler aliases (6 tasks)

- [ ] `P2-034` Replace all `--handler-accent-soft` → `--accent-soft` (9 references in 7 files)
- [ ] `P2-035` Replace all `--handler-accent-strong` → `--accent-strong` (1 reference)
- [ ] `P2-036` Replace all `--handler-glow` → `--accent-glow` (4 references)
- [ ] `P2-037` Replace all `--handler-border` → `--accent-border` (3 references)
- [ ] `P2-038` Replace `--panel-bg` → `--surface-card` in BadgeStrip.module.css (1 reference)
- [ ] `P2-039` Delete handler/panel legacy alias definitions from theme.css (L27-31, L55)

### Step 2.4 — Migrate `--mission-type-*` → `--type-*` (16 files)

- [ ] `P2-040` MissionFlow/MissionFlow.module.css (9 replacements)
- [ ] `P2-041` ArtifactList/ArtifactList.module.css (9 replacements)
- [ ] `P2-042` TriageBoard/TriageBoard.module.css (8 replacements)
- [ ] `P2-043` DebriefClosureSummary.module.css (5 replacements)
- [ ] `P2-044` MissionCycleSummary.module.css (5 replacements)
- [ ] `P2-045` TimelineBand/TimelineBand.module.css (5 replacements)
- [ ] `P2-046` MissionHeader/MissionHeader.module.css (5 replacements)
- [ ] `P2-047` AlertStream/AlertStream.module.css (5 replacements)
- [ ] `P2-048` MissionActionPalette.module.css (4 replacements)
- [ ] `P2-049` MissionIntakePanel.module.css (4 replacements)
- [ ] `P2-050` MissionStepHandoff.module.css (3 replacements)
- [ ] `P2-051` HandlerPicker.module.css (3 replacements)
- [ ] `P2-052` ArchetypePicker.module.css (3 replacements)
- [ ] `P2-053` ReviewDashboard.module.css (3 replacements)
- [ ] `P2-054` AppShell.module.css (2 replacements)
- [ ] `P2-055` ProfileSurface.module.css (2 replacements)
- [ ] `P2-056` MissionRouteState.module.css (2 replacements)
- [ ] `P2-057` Delete `--mission-type-*` alias definitions from theme.css

### Step 2.5 — Fix mismatched fallback hex values (~30 tasks)

See [hardcoded-colors.md](hardcoded-colors.md) for complete mapping.

- [ ] `P2-058` QuizRunner.module.css: Replace all `#6c63ff` fallbacks → `#5A7FFF` (20+ instances)
- [ ] `P2-059` DataSafetyPanel.module.css: Replace `#6c63ff` fallbacks → `#5A7FFF`
- [ ] `P2-060` TodayLauncher.module.css: Replace `#6c63ff` fallbacks → `#5A7FFF`
- [ ] `P2-061` ExerciseRenderer.module.css: Replace `#4a6cf7` fallbacks → `#5A7FFF`
- [ ] `P2-062` ModuleBrowser.module.css: Replace `#6c63ff` fallbacks → `#5A7FFF`
- [ ] `P2-063` DrillRunner.module.css: Audit and fix any mismatched fallbacks
- [ ] `P2-064` Remaining files: Audit all `var(--accent, #...)` patterns for mismatches

### Step 2.6 — Replace hardcoded hex colors with tokens (~55 tasks)

See [hardcoded-colors.md](hardcoded-colors.md) for complete per-file mapping.

- [ ] `P2-065` SovereigntyPanel.module.css (7 hardcoded colors)
- [ ] `P2-066` ChallengeBoard.module.css (5 hardcoded colors)
- [ ] `P2-067` ChallengePanel.module.css (4 hardcoded colors)
- [ ] `P2-068` BadgeStrip.module.css (4 hardcoded colors)
- [ ] `P2-069` CardSharePage.module.css (3 hardcoded colors)
- [ ] `P2-070` LoadingMessage.module.css (3 hardcoded colors)
- [ ] `P2-071` AppShell.module.css (3 hardcoded colors)
- [ ] `P2-072` WeeklySummary.module.css (2 hardcoded colors)
- [ ] `P2-073` StatsPanel.module.css (2 hardcoded colors)
- [ ] `P2-074` BadgeGallery.module.css (2 hardcoded colors)
- [ ] `P2-075` CompetencyChart.module.css (2 hardcoded colors)
- [ ] `P2-076` XPTicker.module.css (1 hardcoded color)
- [ ] `P2-077` ReviewDashboard.tsx: Move inline `#4ade80`, `#fbbf24`, `#94a3b8` to CSS classes

### Step 2.7 — Tokenize z-index values (1 definition + 12 files)

See [z-index-tokens.md](z-index-tokens.md) for the proposed scale.

- [ ] `P2-078` Add z-index tokens to theme.css
- [ ] `P2-079` Header.module.css: Replace z-index magic numbers
- [ ] `P2-080` MissionActionPalette.module.css: Replace z-index
- [ ] `P2-081` RecapToast.module.css: Replace z-index
- [ ] `P2-082` LevelUpModal.module.css: Replace z-index
- [ ] `P2-083` ProfileEditor.module.css: Replace z-index
- [ ] `P2-084` RecapModal.module.css: Replace z-index
- [ ] `P2-085` UpdateNotification.module.css: Replace z-index
- [ ] `P2-086` InstallBanner.module.css: Replace z-index
- [ ] `P2-087` BadgeToast.module.css: Replace z-index
- [ ] `P2-088` AppShell.module.css: Replace z-index
- [ ] `P2-089` XPTicker.module.css: Replace z-index
- [ ] `P2-090` SovereigntyPanel.module.css: Replace z-index

### Step 2.8 — Font & misc fixes (3 tasks)

- [ ] `P2-091` SovereigntyPanel.module.css: Replace `'Courier New', monospace` → `var(--font-mono)` (2 instances)
- [ ] `P2-092` ShareCard.module.css: Remove `'Roboto Mono'` from font stack (not loaded)
- [ ] `P2-093` Add breakpoint documentation comment block to theme.css

### Step 2.9 — Verification

- [ ] `P2-V01` Run `grep -r "handler-accent\|handler-glow\|handler-border\|panel-bg\|mission-type-" src/ --include="*.css"` → only theme.css (if aliases kept) or 0 results
- [ ] `P2-V02` Run `npm test` → 1,402 tests pass
- [ ] `P2-V03` Run `npm run test:beta` → 21/21 tests pass
- [ ] `P2-V04` Visual comparison before/after on localhost — no rendering changes
