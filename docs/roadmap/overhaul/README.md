# Overhaul Plan — Starcom Academy

## The WHY Behind This Overhaul

Starcom Academy exists to manifest the Earth Alliance — a sovereign intelligence network where cadets train body and mind through gamified mission-driven experiences. The app is the front door to an ecosystem spanning Starcom, Navcom, Tactical Intel Dashboard, and Mecha Jono.

**The codebase doesn't yet match that ambition.**

The mission flow works. The 19 training modules load. Cadets can run drills and earn XP. But underneath, the engine still spoke the language of a generic "Personal Training Bot" with "coaches" and "workouts." Features that would make the ecosystem real — sovereign identity, celebrations, the stats surface, the division system — are written but flagged off in production. The store layer is 500+ lines of copy-pasted boilerplate. The main bundle ships 684KB to cadets, including libraries for features they can't access.

This overhaul closes the gap between what the app says it is and what the code actually does.

---

## Phase Overview

| Phase | Name | Risk | Effort | Impact |
|-------|------|------|--------|--------|
| **0** | [Terminology Purge](phase-0-terminology/) | Low | 2–3 days | Cognitive alignment |
| **1** | [Store Factory](phase-1-store-factory/) | Low | 2 days | ~500 LOC removed, pattern testability |
| **2** | [Feature Flag Graduation](phase-2-feature-flags/) | Medium | 1 day | 10 features ship to operatives |
| **3** | [Test Coverage](phase-3-test-coverage/) | Low | 3–4 days | Safety net for future phases |
| **4** | [Bundle Optimisation](phase-4-bundle/) | Medium | 2 days | Faster load, smaller precache |
| **5** | [Ecosystem Wiring](phase-5-ecosystem/) | High | 3–5 days | Cross-app identity, real ecosystem |
| **6** | [Schedule Store Consolidation](phase-6-schedule-store/) | Medium | 1–2 days | Eliminate split-brain state |

**Total estimated effort:** 14–19 days

---

## Dependency Graph

```
Phase 0 ─── Terminology Purge
   │
   ├──► Phase 1 ─── Store Factory
   │       │
   │       └──► Phase 6 ─── Schedule Store Consolidation
   │
   ├──► Phase 2 ─── Feature Flag Graduation
   │       │
   │       └──► Phase 5 ─── Ecosystem Wiring (depends on p2pIdentity shipping)
   │
   ├──► Phase 3 ─── Test Coverage (can run parallel with 1/2)
   │
   └──► Phase 4 ─── Bundle Optimisation (benefits from flag cleanup in Phase 2)
```

**Phase 0 is prerequisite for everything.** It's pure mechanical renaming — no logic changes, no new features. Every subsequent phase benefits from a codebase that speaks the mission language.

Phases 1, 2, and 3 can be worked in parallel after Phase 0 completes.

Phase 4 benefits from Phase 2 (dead flags removed = cleaner tree-shaking).

Phase 5 depends on Phase 2 (p2pIdentity must be graduated to staging first).

Phase 6 depends on Phase 1 (store factory pattern should be established before consolidating the most complex store).

---

## Execution Protocol

For each phase:

1. **Read the phase README** — understand scope, deliverables, and verification gates
2. **Follow the execution checklists** — each phase has step-by-step task files
3. **Run verification after every file change** — `npx tsc --noEmit` + `npm test`
4. **Commit atomically** — one logical unit of change per commit
5. **Never change logic and names in the same commit** — rename commits must be pure renames

---

## Verification Gates

Every phase has a "done" definition:

| Phase | Gate |
|-------|------|
| 0 | `grep -rn 'workout\|Workout\|coach\|Coach' src/ \| grep -v __tests__ \| grep -v node_modules \| grep -v .json` returns zero non-data results |
| 1 | All migrated stores pass existing tests. `createStore` has its own test file. Total store LOC reduced by ≥400 |
| 2 | Production flag count ≤ 12. All graduated features accessible at production URL |
| 3 | Test coverage for all High-priority untested components. Store test count ≥ 18 |
| 4 | Main bundle < 500KB uncompressed. QR vendor lazy-loaded. Gun.js not in main chunk when p2pIdentity is off |
| 5 | Operative identity exportable/importable cross-app. Ecosystem nav in Header. p2pIdentity on in staging |
| 6 | `src/store/missionSchedule/` directory removed. `MissionScheduleStore` is single module < 300 lines |

---

## File Index

```
docs/overhaul/
├── README.md                              ← You are here
├── phase-0-terminology/
│   ├── README.md                          ← Phase overview and approach
│   ├── workout-to-drill-renames.md        ← Every workout→drill rename
│   ├── coach-to-handler-renames.md        ← Every coach→handler rename
│   └── verification.md                    ← Verification script and criteria
├── phase-1-store-factory/
│   ├── README.md                          ← Factory design rationale
│   ├── factory-spec.md                    ← createStore<T>() API specification
│   └── migration-checklist.md             ← Per-store migration steps
├── phase-2-feature-flags/
│   ├── README.md                          ← Graduation strategy
│   ├── flag-inventory.md                  ← Every flag with verdict
│   └── graduation-checklist.md            ← Step-by-step execution
├── phase-3-test-coverage/
│   ├── README.md                          ← Coverage strategy and priorities
│   ├── store-tests.md                     ← Per-store test plans (10 stores, ~65 tests)
│   ├── component-tests.md                 ← Per-component + page test plans (~115 tests)
│   └── utility-tests.md                   ← Critical utility test plans (~49 tests)
├── phase-4-bundle/
│   ├── README.md                          ← Optimisation strategy
│   ├── current-analysis.md                ← Bundle size inventory
│   └── optimisation-targets.md            ← Specific lazy-load and split targets
├── phase-5-ecosystem/
│   ├── README.md                          ← Ecosystem wiring strategy
│   ├── identity-shipping.md               ← p2pIdentity graduation plan
│   ├── ecosystem-navigation.md            ← Cross-app navigation design
│   └── telemetry-bridge.md                ← Cross-app event bridge
└── phase-6-schedule-store/
    ├── README.md                          ← Consolidation rationale
    ├── current-state.md                   ← Split-brain analysis
    └── target-architecture.md             ← Unified store design
```
