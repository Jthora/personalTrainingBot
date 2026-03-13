# Implementation Progress Tracker

> Track the implementation of the E2E user story test suite. Each story breaks down into setup work, spec authoring, and verification.

## Phase 0: Infrastructure Setup

| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Install `@playwright/test` as devDependency | ⬜ | `npm i -D @playwright/test` |
| 0.2 | Create `playwright.config.ts` per [setup/playwright-config.md](setup/playwright-config.md) | ⬜ | Mobile + desktop projects, webServer auto-start |
| 0.3 | Create `e2e/fixtures/seed.ts` per [setup/fixtures-and-seeding.md](setup/fixtures-and-seeding.md) | ⬜ | 6 persona presets + concrete card IDs |
| 0.4 | Create `e2e/fixtures/drill-helpers.ts` per [setup/shared-fixtures.md](setup/shared-fixtures.md) | ⬜ | `completeDrill()`, `answerQuizQuestions()` |
| 0.5 | Create `e2e/fixtures/test-fixtures.ts` | ⬜ | Extended `test` with `seedPersona` fixture |
| 0.6 | Add npm scripts: `test:e2e`, `test:e2e:mobile`, `test:e2e:headed` | ⬜ | See playwright-config.md |
| 0.7 | Verify `npx playwright test --list` discovers spec stubs | ⬜ | Smoke check setup |
| 0.8 | Review [flakiness-mitigation.md](setup/flakiness-mitigation.md) and apply global config | ⬜ | Timeouts, retries, trace-on-retry |
| 0.9 | Add to CI: `smoke:headless` THEN `test:e2e` | ⬜ | Per [coexistence-strategy.md](setup/coexistence-strategy.md) |

## Phase 1: Gate + P0 Stories

### Story 00 — Smoke Gate (P0-gate)
[Full spec →](stories/00-smoke-gate.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| S0.1 | Create `e2e/flows/00-smoke-gate.spec.ts` | ⬜ | |
| S0.2 | Implement checkpoints 0.1–0.4 (SPA shell, routing, SW, localStorage) | ⬜ | |
| S0.3 | Implement checkpoints 0.5–0.7 (manifest, shard, legacy redirect) | ⬜ | |
| S0.4 | Configure as `fullyParallel` with `--retries 0` (fast gate) | ⬜ | |
| S0.5 | Green on CI | ⬜ | Must pass before any other story runs |

### Story 01 — First Contact (P0)
[Full spec →](stories/01-first-contact.md) · [Mobile addenda →](setup/mobile-failure-modes.md#story-01--first-contact)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Create `e2e/flows/01-first-contact.spec.ts` | ⬜ | |
| 1.2 | Implement checkpoints 1.1–1.3 (Welcome → Archetype → Handler) | ⬜ | |
| 1.3 | Implement checkpoints 1.4–1.5 (Intake → Brief CTA) | ⬜ | |
| 1.4 | Implement checkpoints 1.6–1.7 (localStorage verify, reload) | ⬜ | |
| 1.5 | Add mobile checkpoints (2-col grid, tap targets, scroll) | ⬜ | Per mobile-failure-modes.md |
| 1.6 | Add keyboard nav check (archetype card Tab→Enter) | ⬜ | Per accessibility-checkpoints.md |
| 1.7 | Green on CI | ⬜ | |

### Story 02 — The Impatient Recruit (P0)
[Full spec →](stories/02-impatient-recruit.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Create `e2e/flows/02-impatient-recruit.spec.ts` | ⬜ | |
| 2.2 | Implement checkpoints 2.1–2.4 (Fast-path → training) | ⬜ | |
| 2.3 | Implement checkpoints 2.5–2.8 (Drill → post-drill prompt → flag cleanup) | ⬜ | Uses `completeDrill()` shared helper |
| 2.4 | Add mobile checkpoint (fast-path drill not pushed below fold) | ⬜ | |
| 2.5 | Green on CI | ⬜ | |

### Story 03 — The Daily Cycle (P0)
[Full spec →](stories/03-daily-cycle.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Create `e2e/flows/03-daily-cycle.spec.ts` | ⬜ | |
| 3.2 | Implement checkpoints 3.1–3.4 (Kit → archetype modules → drill) | ⬜ | |
| 3.3 | Implement checkpoints 3.5–3.8 (Reflection → XP → rest → review) | ⬜ | Uses `completeDrill()` shared helper |
| 3.4 | Add mobile checkpoints (rating buttons, scroll, rest interval) | ⬜ | |
| 3.5 | Green on CI | ⬜ | |

## Phase 2: P1 Stories (Depth + Resilience)

### Story 04 — The Mission Loop (P1)
[Full spec →](stories/04-mission-loop.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Create `e2e/flows/04-mission-loop.spec.ts` | ⬜ | |
| 4.2 | Implement checkpoints 4.1–4.4 (Brief → Triage → Case → Signal via handoff CTAs) | ⬜ | Uses "Proceed to X" labels, NOT "Continue to X" |
| 4.3 | Implement checkpoints 4.5–4.7 (Signal form → Checklist → Debrief AAR) | ⬜ | |
| 4.4 | Implement checkpoints 4.8–4.9 (Cycle restart → handler card) | ⬜ | |
| 4.5 | Add mobile checkpoints (stepActions stacking, CTA visibility) | ⬜ | |
| 4.6 | Green on CI | ⬜ | |

### Story 05 — Knowledge Retention (P1)
[Full spec →](stories/05-knowledge-retention.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Create `e2e/flows/05-knowledge-retention.spec.ts` | ⬜ | |
| 5.2 | Implement checkpoints 5.1–5.3 (Drill records → due button → quiz loads) | ⬜ | Uses `completeDrill()` + concrete FITNESS_CARD_IDS |
| 5.3 | Implement checkpoints 5.4–5.6 (Question types → progression → results) | ⬜ | Uses `answerQuizQuestions()` |
| 5.4 | Implement checkpoints 5.7–5.8 (SR round-trip → due count drop) | ⬜ | Re-navigate for useMemo refresh |
| 5.5 | Implement checkpoints 5.9–5.10 (Module/deck scoped quiz at /mission/training) | ⬜ | Fixed: /mission/training, NOT /modules |
| 5.6 | Green on CI | ⬜ | |

### Story 06 — Proving Yourself (P1)
[Full spec →](stories/06-proving-yourself.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Create `e2e/flows/06-proving-yourself.spec.ts` | ⬜ | |
| 6.2 | Implement checkpoints 6.1–6.2 (XP ticker → level-up) | ⬜ | Uses `completeDrill()` with grinder persona |
| 6.3 | Implement checkpoints 6.3–6.5 (Streak badge → Field Initiate → persist) | ⬜ | Wait for celebrations per flakiness-mitigation.md |
| 6.4 | Implement checkpoints 6.6–6.9 (Stats surface → heatmap → milestone) | ⬜ | |
| 6.5 | Green on CI | ⬜ | |

### Story 07 — Data Sovereignty (P1)
[Full spec →](stories/07-data-sovereignty.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Create `e2e/flows/07-data-sovereignty.spec.ts` | ⬜ | |
| 7.2 | Implement checkpoints 7.1–7.3 (Panel → export → IDB verify) | ⬜ | Force backup flush per flakiness-mitigation.md |
| 7.3 | Implement checkpoints 7.4–7.5 (Auto-restore → manual import) | ⬜ | |
| 7.4 | Implement checkpoints 7.6–7.8 (Validation → archetype → handler change) | ⬜ | |
| 7.5 | Green on CI | ⬜ | |

### Story 09 — Graceful Failures (P1)
[Full spec →](stories/09-graceful-failures.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Create `e2e/flows/09-graceful-failures.spec.ts` | ⬜ | |
| 9.2 | Implement checkpoints 9.1–9.3 (Shard 404, corrupt JSON, quota) | ⬜ | Uses `page.route()` interception |
| 9.3 | Implement checkpoints 9.4–9.7 (Unknown route, ghost cards, timeout, legacy) | ⬜ | |
| 9.4 | Green on CI | ⬜ | |

## Phase 3: P2 Stories (Infrastructure)

### Story 08 — The Offline Operative (P2)
[Full spec →](stories/08-offline-operative.md)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Create `e2e/flows/08-offline-operative.spec.ts` | ⬜ | |
| 8.2 | Implement Phase A: warm-up (SW register → CACHE_DIAG verify) | ⬜ | Per flakiness-mitigation.md SW activation |
| 8.3 | Implement Phase B: offline (indicator → 9 routes → drill → quiz) | ⬜ | |
| 8.4 | Implement Phase C: return online (state integrity) | ⬜ | |
| 8.5 | Audit overlap with existing `check:*` scripts | ⬜ | Per coexistence-strategy.md |
| 8.6 | Green on CI | ⬜ | |

## Phase 4: Script Coexistence Audit

| # | Task | Status | Notes |
|---|------|--------|-------|
| C.1 | After 30 green CI runs per story, evaluate `checkOfflineIndicator.ts` for retirement | ⬜ | Per coexistence-strategy.md |
| C.2 | Document final overlap decisions in PRs | ⬜ | |

## Summary

| Phase | Stories | Tasks | Status |
|-------|---------|-------|--------|
| Phase 0: Infrastructure | — | 9 | ⬜ Not started |
| Phase 1: Gate + P0 | 00, 01, 02, 03 | 20 | ⬜ Not started |
| Phase 2: P1 Depth | 04, 05, 06, 07, 09 | 25 | ⬜ Not started |
| Phase 3: P2 Infra | 08 | 6 | ⬜ Not started |
| Phase 4: Coexistence | — | 2 | ⬜ Not started |
| **Total** | **10 stories** | **62 tasks** | **⬜ 0/62** |

## Implementation Order

```
Phase 0 (setup) → Story 00 (smoke gate) → Stories 01–03 (P0, parallel-safe)
                                         → Stories 04–07, 09 (P1, parallel-safe after shared helpers exist)
                                         → Story 08 (P2, requires SW warm-up infrastructure)
                                         → Phase 4 (coexistence audit, after 30 green runs)
```

Stories 01, 02, 03 can run in parallel after Story 00 passes.  
Stories 04, 05, 06, 07, 09 can run in parallel after shared fixtures are built.  
Story 08 should run last (longest, most infrastructure-dependent).

## Definition of Done

A story is **done** when:
1. All checkpoints implemented as `test()` blocks
2. Passes on mobile (390×844) and desktop (1280×720)
3. Mobile-specific checkpoints from [mobile-failure-modes.md](setup/mobile-failure-modes.md) verified
4. No flaky tests (run 3× without failure, per [flakiness-mitigation.md](setup/flakiness-mitigation.md))
5. Trace-on-failure configured (Playwright trace attached to failing runs)
6. PR reviewed and merged
