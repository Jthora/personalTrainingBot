# Test Framework Architecture

> Shared fixtures, assertion harness, and persona definitions for the beta test suite.

## File Structure

```
e2e/beta/
├── fixtures/
│   ├── betaAssertions.ts      ← Universal per-step assertion harness
│   └── betaPersonas.ts        ← 8 persona seed profiles
└── scenarios/
    ├── 01-fresh-cadet.spec.ts
    ├── 02-returning-operative.spec.ts
    ├── 03-mission-commander.spec.ts
    ├── 04-knowledge-seeker.spec.ts
    ├── 05-profile-sovereign.spec.ts
    ├── 06-edge-gremlin.spec.ts
    ├── 07-navigation-atlas.spec.ts
    └── 08-module-explorer.spec.ts
```

---

## Shared Assertion Harness (`betaAssertions.ts`)

Every interaction in the beta suite is wrapped in a `betaStep()` function that automatically performs post-condition checks and captures evidence.

### `betaStep(page, name, fn)`

Runs the provided function, then automatically:

1. **Screenshot capture** → `artifacts/beta-screenshots/{scenario}/{step-number}-{name}.png`
2. **Console error assertion** — Checks collected `console.error` events for the step. Fails on any uncaught exception or React error boundary trigger.
3. **Overflow check** — Asserts `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow on any viewport).
4. **Element visibility** — If the step declares expected elements, asserts they are visible and within the viewport.

```typescript
// Usage pattern
await betaStep(page, 'archetype-picker-visible', async () => {
  await page.click('[data-testid="choose-focus"]');
  await expect(page.locator('.archetype-grid')).toBeVisible();
});
```

### `betaAudit(page)`

Full axe-core WCAG AA + best-practices scan. Called at **major checkpoints** (not every step — too slow).

- Tags: `wcag2a`, `wcag2aa`, `best-practice`
- Disables: `color-contrast` (military dark theme causes false positives on intentional low-contrast decorative elements)
- Output: Violations logged to test report; critical violations fail the test

```typescript
// Called 2-4 times per scenario at key screens
await betaAudit(page); // Fails on critical a11y violations
```

### `betaExpect(page, selector)`

Extended visibility assertion: element is visible, not occluded by another element, and its bounding box is within the viewport.

```typescript
await betaExpect(page, '[data-testid="bottom-nav"]');
```

### Console Error Collection

Each scenario installs a `page.on('console')` listener at setup that collects all `error`-level messages into an array. The array is checked at each `betaStep()` and cleared after assertion.

Filtered out (known non-errors):
- `Failed to load resource` for optional assets (e.g., analytics)
- React strict-mode double-render warnings
- Service worker registration info messages

---

## Persona Seed Profiles (`betaPersonas.ts`)

Each persona is a function that seeds `localStorage` with a specific user state before the test begins. Built on top of the existing `e2e/fixtures/seed.ts` infrastructure.

| Persona | localStorage State | Scenario Used In |
|---|---|---|
| `tabula-rasa` | **Empty** — no keys set at all | 01-fresh-cadet |
| `fast-tracker` | `mission:fast-path:v1 = "active"`, no archetype, no profile | 01-fresh-cadet (alt path) |
| `day-two-cadet` | Archetype: `cybercom`, Handler: `thora`, callsign: "Operative-7", enrolledAt: yesterday, 1 drill in history, level 1, streak 1, XP 40 | 02-returning, 07-navigation, 08-explorer |
| `active-commander` | Full profile, Active Duty enabled, 15 drills in history, level 4, XP 2100, 7-day streak, 3 signals (1 open, 1 ack, 1 resolved), 2 AARs, triage preferences set, mission step checkpoints | 03-mission |
| `quiz-grinder` | Archetype: `intelligence`, 50+ CardProgress entries across 5 modules with SR intervals, 8 quiz sessions recorded, level 3, XP 1600, ReviewDashboard should show due cards | 04-knowledge |
| `veteran-operative` | Archetype: `groundforce`, level 8, XP 4200, 100+ drills, 30-day streak, all badge unlocks triggered, 5+ challenges completed, daily/weekly goals configured, rich drill history | 05-profile |
| `settings-tweaker` | quietMode: true, animationsEnabled: false, soundsEnabled: false, triage density: compact, triage view: feed, theme: dark | 06-edge (partial) |
| `empty-cache` | Full profile set, but `ptb:training-modules-cache` cleared, `ptb:manifest` cleared | 06-edge (partial) |

### Seed Function Signature

```typescript
export async function seedPersona(
  page: Page,
  persona: PersonaName,
  baseUrl: string
): Promise<void> {
  // Navigate to base URL to establish origin
  await page.goto(baseUrl);
  // Set localStorage keys for persona
  await page.evaluate((data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }, personaData[persona]);
  // Reload to pick up seeded state
  await page.reload();
}
```

---

## Screenshot Gallery

All screenshots are captured to:

```
artifacts/beta-screenshots/
├── 01-fresh-cadet/
│   ├── 01-welcome-overlay.png
│   ├── 02-archetype-picker.png
│   ├── 03-archetype-selected.png
│   └── ...
├── 02-returning-operative/
│   └── ...
└── 08-module-explorer/
    └── ...
```

- **Naming:** `{step-number}-{kebab-name}.png`
- **Viewport:** iPhone 14 (390×844) — matches existing mobile E2E config
- **Cleanup:** Gallery is cleared before each full suite run

---

## Integration with Existing E2E Infrastructure

The beta suite reuses:
- `e2e/fixtures/app.ts` → `waitForReactMount()`
- `e2e/fixtures/a11y.ts` → axe-core scanning (wrapped by `betaAudit`)
- `e2e/fixtures/mobile.ts` → tap target + overflow helpers
- `e2e/fixtures/routes.ts` → v1/v2 route mapping
- `e2e/fixtures/seed.ts` → Base persona data (extended by `betaPersonas.ts`)
- `e2e/fixtures/drill-helpers.ts` → `completeDrill()` helper for drill completion steps

The beta suite does **not** replace existing E2E tests. It is an additional layer focused on comprehensive user journey simulation rather than isolated feature verification.
