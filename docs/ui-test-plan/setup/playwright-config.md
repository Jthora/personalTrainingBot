# Playwright Configuration & Setup

## Prerequisites

The project already has `playwright` (v1.58.2) as a devDep. We add the test runner package:

```bash
npm i -D @playwright/test
npx playwright install chromium
```

## File Layout

```
e2e/
├── playwright.config.ts
├── fixtures/
│   └── seed.ts                 # Shared localStorage seeding utilities
└── flows/
    ├── 01-first-contact.spec.ts
    ├── 02-impatient-recruit.spec.ts
    ├── 03-daily-cycle.spec.ts
    ├── 04-mission-loop.spec.ts
    ├── 05-knowledge-retention.spec.ts
    ├── 06-proving-yourself.spec.ts
    ├── 07-data-sovereignty.spec.ts
    └── 08-offline-operative.spec.ts
```

> The `e2e/` directory lives at the project root, adjacent to `src/`. It is excluded from the Vitest config (`test.exclude`) and the TypeScript `src` project (`tsconfig.app.json`).

## Playwright Config

```ts
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45_000,

  reporter: process.env.CI
    ? [['junit', { outputFile: '../artifacts/e2e-junit.xml' }]]
    : [['html', { outputFolder: '../artifacts/e2e-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run build && npx vite preview --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### Key choices

| Setting | Value | Rationale |
|---------|-------|-----------|
| `fullyParallel` | `true` | Stories are independent — parallel execution is safe |
| `retries` | 1 local, 2 CI | Flake protection without masking real failures |
| `timeout` | 45s | The build loads 988 static data files — generous timeout for cold start |
| `webServer.command` | `npm run build && npx vite preview` | Tests run against production build, not dev server |
| `trace` | `on-first-retry` | Traces saved only when debugging a failure — keeps artifacts small |
| Default project | `mobile` (iPhone 14: 390×844) | Matches existing `runPsiOperativeScenario.ts` viewport |

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "npx playwright test --config=e2e/playwright.config.ts",
    "test:e2e:mobile": "npx playwright test --config=e2e/playwright.config.ts --project=mobile",
    "test:e2e:desktop": "npx playwright test --config=e2e/playwright.config.ts --project=desktop",
    "test:e2e:ui": "npx playwright test --config=e2e/playwright.config.ts --ui"
  }
}
```

## tsconfig for E2E

Create `e2e/tsconfig.json` to keep E2E types separate from the app:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["./**/*.ts"]
}
```

## CI Integration

The Playwright Test runner outputs JUnit XML when `CI=true`. This integrates with GitHub Actions, GitLab CI, or any CI system that consumes JUnit reports.

```yaml
# Example GitHub Actions step
- name: E2E tests
  run: npm run test:e2e
  env:
    CI: true
- name: Upload E2E report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: e2e-report
    path: artifacts/e2e-junit.xml
```

## Relationship to Existing Headless Scripts

The E2E suite **coexists** with the existing `smoke:headless` pipeline. They serve different purposes:

| Concern | Existing scripts | E2E suite |
|---------|-----------------|-----------|
| Deep-link HTTP status | `checkDeepLinks.ts` ✅ | Not covered (redundant) |
| Offline SW validation | `checkDeepLinksOffline.ts` ✅ | Story 8 covers user-facing offline |
| Payload budgets | `checkMissionRouteBudgets.ts` ✅ | Not covered (perf concern, not UX) |
| Telemetry contracts | `triggerTelemetryFlows.ts` ✅ | Not covered (observability concern) |
| Mission cycle walkthrough | `runPsiOperativeScenario.ts` ✅ | Story 4 supersedes with richer assertions |
| Onboarding identity flow | ❌ | Story 1 + Story 2 |
| Training/drill execution | ❌ | Story 3 |
| Spaced repetition round-trip | ❌ | Story 5 |
| Progression/badges | ❌ | Story 6 |
| Data export/import | ❌ | Story 7 |

Once Story 4 is complete and validated, `runPsiOperativeScenario.ts` can be retired or kept as a fast smoke check.
