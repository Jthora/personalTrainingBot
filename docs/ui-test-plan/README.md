# UI Test Plan — Starcom Academy

## Philosophy

This test plan is organized around **user stories**, not routes or components. Each story tests a *promise the app makes to its users* — an emotional contract between the Academy and the cadet it's forming.

The app's core purpose: **Transform a civilian into a cadet through daily disciplined training across 19 domains, wrapped in an identity that makes the grind meaningful.**

Every test must be traceable back to that purpose. If a test doesn't verify a promise, it doesn't belong here.

---

## The Promises

| # | Story | Promise | Priority |
|---|-------|---------|----------|
| 0 | [Smoke Gate](stories/00-smoke-gate.md) | The app loads, routes resolve, infrastructure is alive | P0-gate |
| 1 | [First Contact](stories/01-first-contact.md) | A new person becomes an operative with a real identity in under 3 minutes | P0 |
| 2 | [Impatient Recruit](stories/02-impatient-recruit.md) | You can train before you configure — value before commitment | P0 |
| 3 | [The Daily Cycle](stories/03-daily-cycle.md) | A returning operative's morning routine works end-to-end | P0 |
| 4 | [The Mission Loop](stories/04-mission-loop.md) | The 6-step doctrine cycle is coherent, complete, and closes cleanly | P1 |
| 5 | [Knowledge Retention](stories/05-knowledge-retention.md) | What you studied comes back at the right time — SR actually works | P1 |
| 6 | [Proving Yourself](stories/06-proving-yourself.md) | XP, badges, streaks, and competency reflect real effort | P1 |
| 7 | [Data Sovereignty](stories/07-data-sovereignty.md) | Your identity is yours — backup/restore works because there's no password reset | P1 |
| 8 | [Offline Operative](stories/08-offline-operative.md) | Train anywhere — the entire console works without connectivity | P2 |
| 9 | [Graceful Failures](stories/09-graceful-failures.md) | When things break, the app fails visibly — not silently | P1 |

**Priority key:**
- **P0-gate** — Runs first. If this fails, nothing else runs.
- **P0** — Must pass before any release. These are the daily-use promises.
- **P1** — Must pass weekly. These are the loyalty/retention/resilience promises.
- **P2** — Must pass before PWA certification. Infrastructure promise.

---

## Document Structure

```
docs/ui-test-plan/
├── README.md                          ← You are here
├── progress-tracker.md                ← Implementation task tracking
├── setup/
│   ├── playwright-config.md           ← Framework setup, npm scripts, CI
│   ├── fixtures-and-seeding.md        ← Persona presets, localStorage seeding, concrete card IDs
│   ├── shared-fixtures.md             ← completeDrill(), answerQuizQuestions() helpers
│   ├── flakiness-mitigation.md        ← Known timing hazards + concrete mitigations
│   ├── coexistence-strategy.md        ← How new stories coexist with existing headless scripts
│   ├── mobile-failure-modes.md        ← 390×844 specific risks + per-story mobile checkpoints
│   └── accessibility-checkpoints.md   ← Keyboard nav, aria-live, focus management
└── stories/
    ├── 00-smoke-gate.md               ← P0-gate: App loads, SW registers, manifest reachable
    ├── 01-first-contact.md            ← P0: Civilian → Operative identity
    ├── 02-impatient-recruit.md        ← P0: Fast-path → value → identity
    ├── 03-daily-cycle.md              ← P0: Returning operative morning routine
    ├── 04-mission-loop.md             ← P1: 6-step doctrine cycle (dual CTA systems)
    ├── 05-knowledge-retention.md      ← P1: Spaced repetition & quiz flows
    ├── 06-proving-yourself.md         ← P1: Progression, badges, competency
    ├── 07-data-sovereignty.md         ← P1: Backup, restore, identity change
    ├── 08-offline-operative.md        ← P2: PWA offline resilience
    └── 09-graceful-failures.md        ← P1: Error boundaries, corrupt data, missing shards
```

---

## Relationship to Existing Tests

This plan does **not** replace the existing test infrastructure. It complements it.

| Tier | Tool | Count | What it tests |
|------|------|-------|---------------|
| **Unit/Component** | Vitest + @testing-library/react | 1,200 tests / 160 files | Individual stores, components, hooks in isolation |
| **Headless scripts** | Puppeteer + Playwright scripts | 11 scripts via `smoke:headless` | Deep-link integrity, offline SW, payload budgets, telemetry |
| **User story E2E** | Playwright Test (`@playwright/test`) | **This plan** | End-to-end promises through a real browser |

The existing `runPsiOperativeScenario.ts` is the closest ancestor to this work — it walks the mission cycle with Playwright. Story 4 ("The Mission Loop") complements it with richer assertions. See [setup/coexistence-strategy.md](setup/coexistence-strategy.md) for the full overlap map and retirement criteria.

---

## Key Design Decisions

### 1. Playwright Test, not standalone scripts

The existing headless scripts are standalone Node processes with custom checkpoint reporting. This plan uses `@playwright/test` — the proper test runner — which provides:
- `expect(locator)` assertions with auto-retry
- Trace viewer + screenshots on failure
- `webServer` config to auto-start Vite preview
- Parallel workers, retries, `--grep` filtering
- HTML reporter for CI

### 2. Mobile-first, desktop-verified

The app is a PWA designed primarily for mobile use (390×844 viewport in existing scenarios). Tests run against mobile viewport by default, with a desktop project for layout regression. See [setup/mobile-failure-modes.md](setup/mobile-failure-modes.md) for concrete mobile risks at 390px and per-story mobile checkpoints.

### 3. localStorage seeding via `page.addInitScript`

The app gates UI behind localStorage keys (`mission:guidance-overlay:v1`, `mission:intake:v1`, etc.). Tests that need to bypass gates use `addInitScript` to pre-seed values before the page loads — matching the existing pattern in `runPsiOperativeScenario.ts`.

### 4. Tests verify messaging, not just navigation

A story like "First Contact" doesn't just check that the archetype picker renders — it verifies the exact heading ("Choose Your Archetype"), the archetype descriptions, and the handler personality text. If the messaging regresses, the emotional contract is broken even though the route still works.

---

## Getting Started

See [setup/playwright-config.md](setup/playwright-config.md) for framework installation and configuration.
