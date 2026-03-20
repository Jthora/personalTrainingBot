# UI Deep Clean — Starcom Academy Overhaul

> **Goal**: Transform the app from a multi-wave patchwork into a clean, coherent Starcom Academy experience — from first pixel to last interaction.
>
> **Scope**: Domain migration, CSS architecture cleanup, loading/first-impression redesign, shell unification, dead code removal, and component polish across ~60 components, ~60 CSS modules, and ~25 route definitions.
>
> **Phases**: 6 | **Estimated tasks**: ~350 | **Risk**: Low–Medium (phased, testable)

---

## Why This Exists

The app has been through 3+ refactoring waves:
1. **Original PTB** — Personal Training Bot with coaches/workouts
2. **MissionFlow v1** — MissionShell with 9-tab military flow
3. **AppShell v2** — Simplified 4-tab shell (now production default)
4. **Starcom Refit** — 122-task copy/branding swap (complete)

Each wave left sediment: dead components, competing shells, legacy CSS aliases, inconsistent styling, and a loading experience that shows a blank white screen. The URL still points to `personaltrainingbot.archangel.agency` instead of `academy.starcom.app`.

---

## Phase Overview

| Phase | Name | Tasks | Risk | Depends On |
|-------|------|------:|------|------------|
| **1** | [Domain & URL Migration](phase-1-domain-migration/README.md) | ~35 | Zero | — |
| **2** | [CSS Token Cleanup](phase-2-css-tokens/README.md) | ~180 | Low | — |
| **3** | [Loading & First Impression](phase-3-first-impression/README.md) | ~40 | Medium | Phase 1 |
| **4** | [Shell Unification](phase-4-shell-unification/README.md) | ~50 | Medium | Phase 3, 5 |
| **5** | [Dead Code Purge](phase-5-dead-code/README.md) | ~25 | Low | — |
| **6** | [Component Polish](phase-6-component-polish/README.md) | ~30 | Low | Phase 2, 4 |

### Dependency Graph

```
Phase 1  ──────────→  Phase 3  ──→  Phase 4  ──→  Phase 6
Phase 2  ────────────────────────────────────────→  Phase 6
Phase 5  ──────────────────────→  Phase 4
```

Phases 1, 2, and 5 can run in parallel. Phase 3 requires Phase 1. Phase 4 requires Phases 3 + 5. Phase 6 requires Phases 2 + 4.

---

## Directory Structure

```
docs/ui-deep-clean/
├── README.md                              ← you are here
├── progress-tracker.md                    ← master task list with checkboxes
├── audit/
│   ├── branding-inventory.md              ← every old-URL/old-name reference
│   ├── css-architecture.md                ← token audit, legacy aliases, colors
│   ├── component-inventory.md             ← dead code, redundancy, inline styles
│   └── ux-gaps.md                         ← loading, onboarding, error states
├── phase-1-domain-migration/
│   ├── README.md                          ← phase overview + task checklist
│   └── url-mapping.md                     ← old → new URL mapping table
├── phase-2-css-tokens/
│   ├── README.md                          ← phase overview + task checklist
│   ├── legacy-alias-migration.md          ← handler-accent, mission-type-* map
│   ├── hardcoded-colors.md                ← file-by-file color replacement map
│   └── z-index-tokens.md                  ← proposed z-index scale
├── phase-3-first-impression/
│   ├── README.md                          ← phase overview + task checklist
│   ├── splash-screen.md                   ← HTML splash design spec
│   ├── loading-redesign.md                ← LoadingMessage component redesign
│   └── onboarding-port.md                 ← MissionShell → AppShell onboarding
├── phase-4-shell-unification/
│   ├── README.md                          ← phase overview + task checklist
│   ├── shell-provider.md                  ← shared ShellProvider extraction
│   ├── mission-shell-fold.md              ← fold MissionShell into AppShell
│   └── feature-flag-removal.md            ← shellV2 flag cleanup
├── phase-5-dead-code/
│   ├── README.md                          ← phase overview + task checklist
│   └── deletion-manifest.md               ← files/components to delete
└── phase-6-component-polish/
    ├── README.md                          ← phase overview + task checklist
    ├── style-consolidation.md             ← inline → CSS module conversions
    └── missing-ux-states.md               ← 404 page, skeletons, fallbacks
```

---

## Validation Strategy

After each phase:
1. Run `npm test` — all 1,402 unit tests must pass
2. Run `npm run test:beta` — all 21 beta E2E tests must pass
3. Visual smoke test on `localhost:4199` — iPhone 14 viewport (390×844)
4. Lighthouse audit — no regression from current scores

---

## Current State

- **Git HEAD**: `72e08ec` (bug fixes from beta testing)
- **Unit tests**: 1,402 passing
- **Beta tests**: 21/21 passing (4.5m)
- **Production shell**: AppShell v2 (`shellV2` = `true` by default)
- **Domain**: Still `personaltrainingbot.archangel.agency` — needs migration to `academy.starcom.app`
