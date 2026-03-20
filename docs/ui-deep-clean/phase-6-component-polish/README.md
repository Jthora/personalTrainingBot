# Phase 6 — Component Polish

> Consolidate inline styles, add missing UX states, fix one-off bugs.
>
> **Tasks**: ~30 | **Risk**: Low | **Dependencies**: None (can run in parallel with other phases)
>
> **Goal**: Every component follows consistent styling patterns, has proper empty/loading/error states, and uses the design token system.

---

## Task Checklist

### Step 6.1 — Inline Style Consolidation (12 tasks)

Move inline `style={{}}` color values and layout properties to CSS modules.

**Priority: Components with hardcoded color inline styles**

- [ ] `P6-001` ReviewDashboard.tsx — Move 3 inline color styles to CSS classes:
  - L75: `style={{ color: '#4ade80' }}` → `.cardCountMature { color: var(--color-success) }`
  - L79: `style={{ color: '#fbbf24' }}` → `.cardCountLearning { color: var(--color-warning) }`
  - L83: `style={{ color: '#94a3b8' }}` → `.cardCountNew { color: var(--text-muted) }`
- [ ] `P6-002` NetworkStatusIndicator.tsx — Extract inline style objects to CSS module:
  - L38: `style={isOnline ? onlineStyles : offlineStyles}` → CSS module with `.online` / `.offline` classes
  - Create `NetworkStatusIndicator.module.css`
- [ ] `P6-003` CacheIndicator.tsx — Extract inline styles to CSS module:
  - L52: `style={visible ? styles : hiddenStyles}` → CSS module with `.visible` / `.hidden` classes
  - Create `CacheIndicator.module.css`
- [ ] `P6-004` QuizRunner.tsx — Move `disciplineStyle` inline styles (L255, L323) to CSS custom property approach
- [ ] `P6-005` ActivityHeatmap.tsx — Move 3 inline styles to CSS module
- [ ] `P6-006` ScoreLineChart.tsx — Move 2 inline styles to CSS module
- [ ] `P6-007` RecapModal.tsx — Move 3 inline styles to CSS module
- [ ] `P6-008` ModuleBrowser.tsx — Move 2 inline styles to CSS module
- [ ] `P6-009` DeckBrowser.tsx — Move 2 inline styles to CSS module
- [ ] `P6-010` QuizSurface.tsx — Move 3 inline styles to CSS module
- [ ] `P6-011` ExerciseRenderer.tsx — Move 1 inline style to CSS module
- [ ] `P6-012` Audit remaining ~10 files with 1 inline style each — batch fix

### Step 6.2 — Missing UX States (10 tasks)

**404 Page**

- [ ] `P6-013` Create a real user-facing 404 page (current `public/404.html` is just a SPA redirect script)
- [ ] `P6-014` Add 404 catch-all route in Routes.tsx: `<Route path="*" element={<NotFoundPage />} />`
- [ ] `P6-015` Design 404 page with Starcom branding + "Return to base" link

**Skeleton Loaders**

Only `MissionRouteState` has skeletons. High-traffic surfaces need them:

- [ ] `P6-016` Add skeleton state to TrainingSurface (shown while modules load)
- [ ] `P6-017` Add skeleton state to ReviewDashboard (shown while SR data loads)
- [ ] `P6-018` Add skeleton state to ProfileSurface (shown while profile loads)
- [ ] `P6-019` Create shared `src/components/Skeleton/Skeleton.module.css` with reusable skeleton classes

**Empty States**

- [ ] `P6-020` Audit all surfaces — verify each has an empty state when data is unavailable
- [ ] `P6-021` Add empty state to ProgressSurface (if stats are empty for new users)
- [ ] `P6-022` Standardize empty state styling across components (consistent icon/text/CTA pattern)

### Step 6.3 — Bug Fixes (4 tasks)

- [ ] `P6-023` Header.tsx L114 — Fix settings link: `href="/mission/debrief"` → `href="/profile"` (or use React Router `<Link>`)
- [ ] `P6-024` Header.tsx — Convert `<a>` to React Router `<Link>` to avoid full page reload
- [ ] `P6-025` Font fix: SovereigntyPanel.module.css L84,385 — Replace `'Courier New', monospace` → `var(--font-mono)`
- [ ] `P6-026` Font fix: ShareCard.module.css L180 — Remove `'Roboto Mono'` from font stack (not loaded, causes FOUT flash to system mono then back)

### Step 6.4 — CSS Naming Consistency (4 tasks)

- [ ] `P6-027` LoadingMessage.module.css — Convert kebab-case to camelCase classes (7 renames)
- [ ] `P6-028` Rename `MissionFlow.module.css` → `MissionSurfaces.module.css` + update 11 importers
- [ ] `P6-029` Audit for any other kebab-case CSS module classes (most files use camelCase)
- [ ] `P6-030` Add CSS module naming convention to contributing.md

### Step 6.5 — Verification

- [ ] `P6-V01` Visual regression: screenshot all surfaces before/after inline style migration
- [ ] `P6-V02` Test 404 route: navigate to `/nonexistent` → see 404 page
- [ ] `P6-V03` Test skeleton states: throttle network → see skeletons during load
- [ ] `P6-V04` Test Header settings link → navigates to `/profile`
- [ ] `P6-V05` `npm test` → all unit tests pass
- [ ] `P6-V06` `npm run test:beta` → all beta E2E tests pass

---

## Inline Style Inventory (39 total across 22 files)

| File | Count | Type |
|------|-------|------|
| ReviewDashboard.tsx | 4 | Object literals with hardcoded colors |
| QuizRunner.tsx | 3 | 1 literal + 2 variable (`disciplineStyle`) |
| RecapModal.tsx | 3 | Object literals |
| ActivityHeatmap.tsx | 3 | Object literals |
| QuizSurface.tsx | 3 | Object literals |
| ModuleBrowser.tsx | 2 | Object literals |
| DeckBrowser.tsx | 2 | Object literals |
| ScoreLineChart.tsx | 2 | Object literals |
| NetworkStatusIndicator.tsx | 1 | Conditional style variable |
| CacheIndicator.tsx | 1 | Conditional style variable |
| ExerciseRenderer.tsx | 1 | Style variable |
| ~11 other files | 1 each | Various |

**Note**: Some inline styles may be intentional (e.g., dynamic chart colors, canvas positioning). Evaluate case-by-case during implementation.
