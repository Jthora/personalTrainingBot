# Execution Plan

> How to run the beta test suite, phasing strategy, output format, and CI integration.

## Running the Suite

### Full Suite

```bash
npm run test:beta
```

Runs all 8 scenarios sequentially on the mobile (iPhone 14, 390×844) Playwright project. Outputs:
- Pass/fail per step in terminal
- Screenshot gallery → `artifacts/beta-screenshots/`
- HTML report → `artifacts/beta-report/`

### Individual Scenarios

```bash
# Single scenario
npx playwright test e2e/beta/scenarios/01-fresh-cadet.spec.ts

# Multiple scenarios
npx playwright test e2e/beta/scenarios/01-fresh-cadet.spec.ts e2e/beta/scenarios/02-returning-operative.spec.ts

# Pattern match
npx playwright test e2e/beta/scenarios/ --grep "Edge Gremlin"
```

### Interactive Mode

```bash
npx playwright test e2e/beta/scenarios/ --ui
```

Opens Playwright UI with step-by-step trace viewer — useful for debugging failed steps.

### Update Screenshots

```bash
npx playwright test e2e/beta/scenarios/ --update-snapshots
```

---

## Phasing Strategy

The 8 scenarios are ordered by dependency — earlier scenarios validate prerequisites needed by later ones.

### Phase 1: Foundation (must pass first)
| Scenario | Why first |
|---|---|
| 01 Fresh Cadet | Validates app boots and onboarding works. If this fails, nothing else matters. |
| 07 Navigation Atlas | Validates every route resolves. If routes are broken, scenario-specific tests give misleading results. |

### Phase 2: Core Journeys
| Scenario | Dependency |
|---|---|
| 02 Returning Operative | Requires working training surface + drill system |
| 03 Mission Commander | Requires working mission loop + Active Duty toggle |
| 04 Knowledge Seeker | Requires working quiz system + SR scheduling |

### Phase 3: Secondary Paths
| Scenario | Dependency |
|---|---|
| 05 Profile & Sovereign | Requires profile + settings + data export |
| 08 Module Explorer | Requires all 19 modules loading from shards |

### Phase 4: Adversarial
| Scenario | Dependency |
|---|---|
| 06 Edge Gremlin | Intentionally breaks things — run last so failures here don't block the rest |

---

## Output Format

### Terminal Output

```
Beta Test Suite — Starcom Academy
══════════════════════════════════

Scenario 01: Fresh Cadet (tabula-rasa)
  ✓ welcome-overlay .......................... 340ms  📸
  ✓ archetype-picker-visible ................ 280ms  📸
  ✓ archetype-selected ...................... 150ms  📸
  ✓ handler-picker .......................... 420ms  📸
  ✓ handler-confirmed ....................... 310ms  📸
  ✓ intake-panel ............................ 190ms  📸
  ✓ brief-with-identity ..................... 560ms  📸
  ✓ first-drill-started ..................... 380ms  📸
  ✓ drill-completed ......................... 1230ms 📸
  ✓ rest-interval ........................... 210ms  📸
  ✓ return-to-brief ......................... 180ms  📸
  ✓ fast-path-landing ....................... 290ms  📸
  ✓ quick-train-drill ....................... 410ms  📸
  ✓ post-drill-archetype .................... 350ms  📸
  ✓ a11y-audit ..............................  1.2s  ♿
  15/15 passed | 14 screenshots | 1 a11y audit

══════════════════════════════════
Summary: 120/120 steps passed
         118 screenshots captured
         16 a11y audits passed
         0 console errors
         0 overflow violations
```

### Screenshot Gallery

```
artifacts/beta-screenshots/
├── 01-fresh-cadet/
│   ├── 01-welcome-overlay.png
│   ├── 02-archetype-picker-visible.png
│   └── ...
├── 02-returning-operative/
│   └── ...
└── index.html                  ← Auto-generated gallery viewer
```

The `index.html` gallery viewer displays all screenshots in a responsive grid, grouped by scenario, with step names as captions. Open in browser to scan all ~120 screenshots in under 2 minutes.

### HTML Report

Standard Playwright HTML report at `artifacts/beta-report/` with:
- Full trace for failed tests (DOM snapshots, network log, console log)
- Screenshot attachments for every step
- Timing data per step

---

## CI Integration

### GitHub Actions Workflow

```yaml
name: Beta Test Suite
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  beta-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:beta
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: beta-screenshots
          path: artifacts/beta-screenshots/
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: beta-report
          path: artifacts/beta-report/
```

### Recommended CI Integration Points

| Trigger | What runs | Purpose |
|---|---|---|
| Every push to `main` | Full suite (all 8 scenarios) | Catch regressions |
| Pull requests | Phase 1 + Phase 2 (scenarios 01, 02, 03, 04, 07) | Fast feedback on core journeys |
| Nightly scheduled | Full suite + screenshot diff against previous run | Detect visual drift |

---

## Estimated Timing

| Phase | Scenarios | Estimated Duration |
|---|---|---|
| Phase 1 | 01 + 07 | ~45 seconds |
| Phase 2 | 02 + 03 + 04 | ~90 seconds |
| Phase 3 | 05 + 08 | ~75 seconds |
| Phase 4 | 06 | ~60 seconds |
| **Total** | **All 8** | **~4.5 minutes** |

Estimates assume localhost preview server, single Chromium worker, iPhone 14 viewport. Actual times depend on machine speed and training module shard loading.

---

## Prerequisites

```bash
# Install Playwright browsers (if not already installed)
npx playwright install chromium

# Verify preview server starts
npx vite build && npx vite preview --port 4199

# Run existing E2E suite first to validate infrastructure
npm run test:e2e
```
