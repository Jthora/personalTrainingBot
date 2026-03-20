# Starcom Academy — Master Progress Tracker

> Single source of truth for all active work streams.
>
> **Last updated**: 2026-03-19
> **Branch**: `main` @ `3d272c9` (9 commits ahead of origin) + uncommitted Batch 8
> **Unit tests**: 1,435/1,435 passing | **Beta tests**: 21/21 passing | **Build**: clean (5.18s)

---

## Quick Status

| Stream | Status | Progress | Detail |
|--------|--------|----------|--------|
| Beta Test Suite | **DONE** | 269/269 | Committed `d877bc3` |
| Bug Fixes (from beta) | **DONE** | 4/4 | Committed `72e08ec` |
| UI Deep Clean — Audit | **DONE** | 4/4 docs | `docs/ui-deep-clean/audit/` |
| UI Deep Clean — Planning | **DONE** | 21/21 docs | `docs/ui-deep-clean/` |
| UI Deep Clean — Phase 1 | **DONE** | 28/35 | Domain migration (7 conditional on repo rename) |
| UI Deep Clean — Phase 2 | **DONE** | 93/93 | CSS token cleanup |
| UI Deep Clean — Phase 3 | **In progress** | 33/39 | Loading & first impression |
| UI Deep Clean — Phase 4 | Not started | 0/46 | Shell unification (unblocked by P3-020–034) |
| UI Deep Clean — Phase 5 | **DONE** | 23/23 | Dead code purge |
| UI Deep Clean — Phase 6 | **DONE** | 30/30 | Component polish |

---

## Completed Work

### Beta Test Suite `d877bc3`

- [x] Infrastructure — directory structure, Playwright config, global setup/teardown
- [x] Shared fixtures — `betaStep()`, `betaAudit()`, `betaExpect()`, 8 personas
- [x] npm scripts — `test:beta`, phase-specific scripts, CI workflow
- [x] Scenario 01: Fresh Cadet (15 steps — onboarding, first drill, fast-path)
- [x] Scenario 02: Returning Operative (12 steps — drill flow, rest, completion)
- [x] Scenario 03: Mission Commander (16 steps — Active Duty toggle, triage, signals, AAR)
- [x] Scenario 04: Knowledge Seeker (11 steps — quiz flow, SR review, deck browser)
- [x] Scenario 05: Profile & Sovereign (12 steps — profile, callsign, data export, QR)
- [x] Scenario 06: Edge Gremlin (16 steps — 404s, double-nav, offline, resize, back/fwd)
- [x] Scenario 07: Navigation Atlas (17 steps — all 17 routes, deep links, redirects)
- [x] Scenario 08: Module Explorer (12 steps — shard loading, content, toggle persistence)

> **Full task breakdown**: [docs/beta-testing/progress-tracker.md](beta-testing/progress-tracker.md) (269 tasks)

### Bug Fixes from Beta `72e08ec`

- [x] `BF01` ReviewDashboard `?mode=review` — navigate with query param preserved
- [x] `BF02` Nested-interactive a11y — removed `role="button"`/`tabIndex` from ModuleBrowser tile
- [x] `BF03` NetworkStatusIndicator pointer-events — added `pointer-events: none`
- [x] `BF04` Horizontal overflow at 390px — added `flex-wrap`, `overflow-x: hidden`, badge truncation

### UI Deep Clean — Audit & Documentation (21 files)

- [x] Master overview — [docs/ui-deep-clean/README.md](ui-deep-clean/README.md)
- [x] Branding inventory — [audit/branding-inventory.md](ui-deep-clean/audit/branding-inventory.md) (33 old-domain URLs mapped)
- [x] CSS architecture audit — [audit/css-architecture.md](ui-deep-clean/audit/css-architecture.md) (160+ legacy refs, 55+ hardcoded colors)
- [x] Component inventory — [audit/component-inventory.md](ui-deep-clean/audit/component-inventory.md) (dead code, inline styles)
- [x] UX gaps audit — [audit/ux-gaps.md](ui-deep-clean/audit/ux-gaps.md) (loading, onboarding, error states)
- [x] Phase 1 task plan — [phase-1-domain-migration/README.md](ui-deep-clean/phase-1-domain-migration/README.md) (35 tasks)
- [x] Phase 1 URL mapping — [phase-1-domain-migration/url-mapping.md](ui-deep-clean/phase-1-domain-migration/url-mapping.md)
- [x] Phase 2 task plan — [phase-2-css-tokens/README.md](ui-deep-clean/phase-2-css-tokens/README.md) (93 tasks)
- [x] Phase 2 alias migration map — [phase-2-css-tokens/legacy-alias-migration.md](ui-deep-clean/phase-2-css-tokens/legacy-alias-migration.md)
- [x] Phase 2 hardcoded colors — [phase-2-css-tokens/hardcoded-colors.md](ui-deep-clean/phase-2-css-tokens/hardcoded-colors.md)
- [x] Phase 2 z-index tokens — [phase-2-css-tokens/z-index-tokens.md](ui-deep-clean/phase-2-css-tokens/z-index-tokens.md)
- [x] Phase 3 task plan — [phase-3-first-impression/README.md](ui-deep-clean/phase-3-first-impression/README.md) (39 tasks)
- [x] Phase 3 splash screen spec — [phase-3-first-impression/splash-screen.md](ui-deep-clean/phase-3-first-impression/splash-screen.md)
- [x] Phase 3 loading redesign — [phase-3-first-impression/loading-redesign.md](ui-deep-clean/phase-3-first-impression/loading-redesign.md)
- [x] Phase 3 onboarding port — [phase-3-first-impression/onboarding-port.md](ui-deep-clean/phase-3-first-impression/onboarding-port.md)
- [x] Phase 4 task plan — [phase-4-shell-unification/README.md](ui-deep-clean/phase-4-shell-unification/README.md) (46 tasks)
- [x] Phase 4 feature flag removal — [phase-4-shell-unification/feature-flag-removal.md](ui-deep-clean/phase-4-shell-unification/feature-flag-removal.md)
- [x] Phase 5 task plan — [phase-5-dead-code/README.md](ui-deep-clean/phase-5-dead-code/README.md) (23 tasks)
- [x] Phase 5 deletion manifest — [phase-5-dead-code/deletion-manifest.md](ui-deep-clean/phase-5-dead-code/deletion-manifest.md)
- [x] Phase 6 task plan — [phase-6-component-polish/README.md](ui-deep-clean/phase-6-component-polish/README.md) (30 tasks)
- [x] Per-phase checklist tracker — [progress-tracker.md](ui-deep-clean/progress-tracker.md) (266 checkboxes)

---

## Active Work — UI Deep Clean Execution

### Execution Dependencies

```
Phase 1 (Domain Migration)     ─────────────────────────→  independent
Phase 2 (CSS Tokens)           ─────────────────────────→  independent
Phase 3 (First Impression)     ──→ Phase 4 (Shell) ──→ Phase 5 (Dead Code)
Phase 6 (Component Polish)     ─────────────────────────→  independent
```

Phases 1, 2, and 6 can run in parallel with the 3→4→5 chain.

---

### Phase 1 — Domain & URL Migration

> **Risk**: Zero | **Tasks**: 35 + 4 verification | **Plan**: [phase-1-domain-migration/README.md](ui-deep-clean/phase-1-domain-migration/README.md)

Migrate all references from `personaltrainingbot.archangel.agency` to `academy.starcom.app`.

- [ ] **Step 1.1** — index.html meta tags (10 tasks: P1-001 → P1-010)
- [ ] **Step 1.2** — manifest.webmanifest (3 tasks: P1-011 → P1-013)
- [ ] **Step 1.3** — Service worker (2 tasks: P1-014 → P1-015)
- [ ] **Step 1.4** — Source code URLs (8 tasks: P1-016 → P1-023)
- [ ] **Step 1.5** — Config files (6 tasks: P1-024 → P1-029)
- [ ] **Step 1.6** — Documentation (4 tasks: P1-030 → P1-033)
- [ ] **Step 1.7** — localStorage key audit (2 tasks: P1-034 → P1-035)
- [ ] **Verification** — grep, build, tests, Lighthouse (P1-V01 → P1-V04)

---

### Phase 2 — CSS Token Cleanup

> **Risk**: Low | **Tasks**: 93 + 4 verification | **Plan**: [phase-2-css-tokens/README.md](ui-deep-clean/phase-2-css-tokens/README.md)

Migrate legacy aliases, fix mismatched fallbacks, tokenize z-index, replace hardcoded hex.

- [ ] **Step 2.1** — Delete 7 dead alias definitions (P2-001 → P2-007)
- [ ] **Step 2.2** — `--handler-accent` → `--accent` in 22 CSS files + 1 TS (P2-008 → P2-033)
- [ ] **Step 2.3** — Remaining handler aliases: `-soft`, `-strong`, `-glow`, `-border`, `panel-bg` (P2-034 → P2-039)
- [ ] **Step 2.4** — `--mission-type-*` → `--type-*` in 16 files (P2-040 → P2-057)
- [ ] **Step 2.5** — Fix mismatched fallback hex values (P2-058 → P2-064)
- [ ] **Step 2.6** — Replace hardcoded hex with tokens in ~13 files (P2-065 → P2-077)
- [ ] **Step 2.7** — Tokenize z-index in 12 files (P2-078 → P2-090)
- [ ] **Step 2.8** — Font fixes + breakpoint docs (P2-091 → P2-093)
- [ ] **Verification** — grep, unit tests, beta tests, visual comparison (P2-V01 → P2-V04)

---

### Phase 3 — Loading & First Impression

> **Risk**: Medium | **Tasks**: 39 + 6 verification | **Plan**: [phase-3-first-impression/README.md](ui-deep-clean/phase-3-first-impression/README.md)

Eliminate white flash, brand the loading screen, port onboarding to AppShell v2.

- [x] **Step 3.1** — HTML splash screen in index.html (P3-001 → P3-005) `bf59a7b`
- [x] **Step 3.2** — LoadingMessage redesign (P3-006 → P3-013) `ed993a5` + `c215528`
- [x] **Step 3.3** — Suspense fallback audit (P3-014 → P3-019) `3d272c9`
- [x] **Step 3.4** — Onboarding port: MissionShell → shared component (P3-020 → P3-034) — Batch 8
  - `useOnboardingState` hook — shared state machine for both shells
  - `OnboardingFlow` orchestrator — renders correct step (guidance/archetype/handler/intake)
  - `GuidanceOverlay` — extracted first-run welcome screen
  - MissionShell refactored: ~150 lines of inline onboarding → `<OnboardingFlow>` (654→520 LOC)
  - AppShell wired: onboarding gates added with early-return pattern
  - 30 new tests: OnboardingFlow (14), useOnboardingState (16) — localStorage compat verified
  - All 5 telemetry events preserved, all 3 localStorage keys backward-compatible
- [ ] **Step 3.5** — Boot performance budget (P3-035 → P3-039)
- [ ] **Verification** — white flash, onboarding paths, reduced motion, tests (P3-V01 → P3-V06)

---

### Phase 4 — Shell Unification

> **Risk**: Medium | **Tasks**: 46 + 9 verification | **Depends on**: Phase 3 | **Plan**: [phase-4-shell-unification/README.md](ui-deep-clean/phase-4-shell-unification/README.md)

Merge MissionShell into AppShell, remove `shellV2` flag, single shell architecture.

- [ ] **Step 4.1** — Shared ShellProvider + context (P4-001 → P4-010)
- [ ] **Step 4.2** — MissionShell decomposition: 654-line monolith → focused modules (P4-011 → P4-025)
- [ ] **Step 4.3** — Active Duty mode in AppShell (P4-026 → P4-033)
- [ ] **Step 4.4** — Route consolidation (P4-034 → P4-041)
- [ ] **Step 4.5** — Feature flag removal + dead export cleanup (P4-042 → P4-046)
- [ ] **Verification** — all routes, ⌘K, shortcuts, context, tests (P4-V01 → P4-V09)

---

### Phase 5 — Dead Code Purge

> **Risk**: Low | **Tasks**: 23 + 4 verification | **Depends on**: Phase 4 | **Plan**: [phase-5-dead-code/README.md](ui-deep-clean/phase-5-dead-code/README.md)

Remove dead components, dead exports, dead CSS, stale redirects.

- [ ] **Step 5.1** — Delete 3 dead components (P5-001 → P5-003)
- [ ] **Step 5.2** — Remove 4 dead exports from missionCutover.ts (P5-004 → P5-008)
- [ ] **Step 5.3** — Delete 7 dead CSS variable definitions (P5-009 → P5-015)
- [ ] **Step 5.4** — Remove/audit 5 dead redirects (P5-016 → P5-020)
- [ ] **Step 5.5** — Audit 3 potentially dead CSS classes (P5-021 → P5-023)
- [ ] **Verification** — tests, build, dead code grep (P5-V01 → P5-V04)

---

### Phase 6 — Component Polish

> **Risk**: Low | **Tasks**: 30 + 6 verification | **Plan**: [phase-6-component-polish/README.md](ui-deep-clean/phase-6-component-polish/README.md)

Consolidate inline styles, add missing UX states, fix misc bugs.

- [x] **Step 6.1** — Move 39 inline styles to CSS modules across 22 files (P6-001 → P6-012) `bf59a7b` + `ed993a5`
- [x] **Step 6.2** — Add missing UX states: 404 page, skeletons, empty states (P6-013 → P6-022) `c215528` + `3d272c9`
- [x] **Step 6.3** — Bug fixes: Header settings link, font issues (P6-023 → P6-026) `3d272c9`
- [x] **Step 6.4** — CSS naming consistency (P6-027 → P6-030) `3d272c9`
- [ ] **Verification** — visual regression, 404, skeletons, tests (P6-V01 → P6-V06)

---

## Totals

| Category | Tasks | Complete | Remaining |
|----------|-------|----------|-----------|
| Beta test suite | 269 | 269 | 0 |
| Bug fixes | 4 | 4 | 0 |
| UI deep clean audit/docs | 21 | 21 | 0 |
| Phase 1: Domain migration | 39 | 32 | 7 |
| Phase 2: CSS tokens | 97 | 97 | 0 |
| Phase 3: First impression | 45 | 33 | 12 |
| Phase 4: Shell unification | 55 | 0 | 55 |
| Phase 5: Dead code | 27 | 27 | 0 |
| Phase 6: Component polish | 36 | 36 | 0 |
| **Total** | **593** | **518** | **75** |

---

## Unpushed Commits

These 8 commits are on `main` but not yet on `origin/main`:

| Commit | Summary | Files |
|--------|---------|-------|
| `d877bc3` | Beta test suite — 21 tests, 8 scenarios, 148 screenshots | 16 files |
| `72e08ec` | Bug fixes — ReviewDashboard, ModuleBrowser a11y, NetworkStatusIndicator, overflow | 24 files |
| `e706160` | UI Deep Clean Batch 1 — CSS token migration, dead code removal, bug fixes | 48 files |
| `2480c36` | UI Deep Clean Batch 2 — Complete Phase 2, extend Phase 5 | 38 files |
| `e78e3fc` | UI Deep Clean Batch 3 — Domain migration, dead redirect cleanup, CSS naming | 16 files |
| `bf59a7b` | UI Deep Clean Batch 4 — CSS modules, splash screen, conventions | 9 files |
| `ed993a5` | UI Deep Clean Batch 5 — Loading redesign, Suspense fallback, inline styles | 7 files |
| `c215528` | UI Deep Clean Batch 6 — 404 page, SurfaceLoader a11y, reduced motion | 9 files |
| `3d272c9` | UI Deep Clean Batch 7 — Skeleton loaders, empty states, component polish | 14 files |

---

## Build & Quality Gates

| Gate | Command | Current Status |
|------|---------|---------------|
| Unit tests | `npx vitest run` | 1,435/1,435 passing |
| Beta tests | `npm run test:beta` | 21/21 passing |
| Build | `npx vite build` | Clean (5.18s) |
| Lint | `npx eslint src/` | — (run before committing) |

> **Note**: `npm run build` fails due to missing `src/utils/generateCombinedTrainingData.ts`. Use `npx vite build` directly.

---

## Document Index

| Area | Key Docs |
|------|----------|
| Beta testing | [docs/beta-testing/README.md](beta-testing/README.md), [progress-tracker](beta-testing/progress-tracker.md), [execution-plan](beta-testing/architecture/execution-plan.md) |
| UI deep clean | [docs/ui-deep-clean/README.md](ui-deep-clean/README.md), [per-phase tracker](ui-deep-clean/progress-tracker.md) |
| Architecture | [docs/architecture/overview.md](architecture/overview.md), [components](architecture/components.md) |
| Guides | [development](guides/development.md), [deployment](guides/deployment.md), [contributing](guides/contributing.md) |
| Previous refits | [Starcom refit](effectiveness-overhaul/starcom-academy-refit.md) (122 tasks, complete) |
