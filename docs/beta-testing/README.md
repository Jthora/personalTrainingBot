# Beta Testing — Automated User Simulation Suite

> Starcom Academy automated beta testing: 8 persona-driven scenarios, ~120 steps, ~120 screenshots, zero human testers required.

## Purpose

This suite replaces manual beta testing with Playwright-driven user simulations. Each scenario walks through the app as a specific persona — from a brand-new cadet to a veteran operative to an adversarial edge-case gremlin. Every step automatically asserts zero console errors, WCAG AA accessibility, no layout overflow, and captures a timestamped screenshot for human review.

## Quick Start

```bash
# Run entire beta suite
npm run test:beta

# Run a single scenario
npx playwright test e2e/beta/scenarios/01-fresh-cadet.spec.ts

# View screenshot gallery after run
open artifacts/beta-screenshots/
```

## Suite Overview

| # | Scenario | Persona | Steps | What It Proves |
|---|---|---|---|---|
| 01 | [Fresh Cadet](scenarios/01-fresh-cadet.md) | `tabula-rasa` | ~15 | Both onboarding paths work end-to-end |
| 02 | [Returning Operative](scenarios/02-returning-operative.md) | `day-two-cadet` | ~13 | Daily training cycle — the #1 real-world session |
| 03 | [Mission Commander](scenarios/03-mission-commander.md) | `active-commander` | ~17 | Full 6-phase mission loop with Active Duty |
| 04 | [Knowledge Seeker](scenarios/04-knowledge-seeker.md) | `quiz-grinder` | ~12 | Quiz system + spaced repetition review |
| 05 | [Profile & Sovereign](scenarios/05-profile-sovereign.md) | `veteran-operative` | ~11 | Identity management, settings, data export |
| 06 | [Edge Gremlin](scenarios/06-edge-gremlin.md) | various | ~16 | Adversarial testing — break things on purpose |
| 07 | [Navigation Atlas](scenarios/07-navigation-atlas.md) | `day-two-cadet` | ~11 | Every route, every transition, every nav mechanism |
| 08 | [Module Explorer](scenarios/08-module-explorer.md) | `day-two-cadet` | ~25 | All 19 training modules browsed individually |

**Total: ~120 steps, ~120 screenshots**

## Architecture

- [Test Framework](architecture/test-framework.md) — Shared fixtures, assertion harness, persona definitions
- [Execution Plan](architecture/execution-plan.md) — How to run, phasing, CI integration, output format

## Surface Area Catalog

Complete inventory of everything in the app that needs testing:

- [Routes](surface-area/routes.md) — All 30+ routes (v2 shell, v1 mission, legacy redirects, deep links)
- [Stores](surface-area/stores.md) — All 24 state stores and what they manage
- [Components & States](surface-area/components.md) — Key interactive components and their visual states
- [Coverage Gaps](surface-area/coverage-gaps.md) — What existing E2E tests miss (and what this suite adds)

## What This Catches

- v2 shell BottomNav routing (all 4 + mission tabs)
- ReviewDashboard (SR due counts, forecast chart, module grouping)
- ProfileSurface (Active Duty toggle, Export Data, callsign editing)
- Triage preferences (cozy/compact, columns/feed)
- Weak card retry after drill completion
- Command palette (Ctrl+K)
- All legacy route redirects
- Refresh/back-button resilience on every surface
- Offline drill completion
- Error boundary recovery
- All 19 modules browsed individually
- Edge cases: emoji callsigns, long strings, invalid deep links, storage clearing
- ~120 screenshots for visual sanity scanning

## What This Cannot Catch

| Limitation | Why |
|---|---|
| Aesthetic judgment | Copilot captures screenshots — you scan them for visual correctness |
| Real iOS Safari | Playwright WebKit is unreliable; real device testing requires BrowserStack |
| Physical touch feel | Scroll momentum, haptic feedback — not simulatable |
| Real network latency | Localhost testing; network throttling possible but imprecise |
| PWA install prompt | OS-level prompt not triggerable in Playwright |

## Directory Structure

```
docs/beta-testing/
├── README.md                          ← You are here
├── architecture/
│   ├── test-framework.md              ← Fixtures, assertions, personas
│   └── execution-plan.md              ← Run instructions, phasing, CI
├── scenarios/
│   ├── 01-fresh-cadet.md
│   ├── 02-returning-operative.md
│   ├── 03-mission-commander.md
│   ├── 04-knowledge-seeker.md
│   ├── 05-profile-sovereign.md
│   ├── 06-edge-gremlin.md
│   ├── 07-navigation-atlas.md
│   └── 08-module-explorer.md
└── surface-area/
    ├── routes.md
    ├── stores.md
    ├── components.md
    └── coverage-gaps.md
```
