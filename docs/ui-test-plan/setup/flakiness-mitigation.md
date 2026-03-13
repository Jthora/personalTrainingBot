# Flakiness Mitigation

> *A flaky test is worse than no test — it teaches the team to ignore failures. Every known timing hazard in this app is documented here with a concrete mitigation strategy.*

## Known Timing Hazards

### 1. Celebration animations (XPTicker, BadgeToast, LevelUpModal)

**The problem:** After drill completion, `CelebrationLayer` renders animated overlays:
- `XPTicker` — 2,000ms count-up animation, calls `onDone` on completion
- `BadgeToast` — 3,000ms auto-dismiss timer
- `LevelUpModal` — user-dismissed (no auto-timeout)

Tests that assert on these elements can fail if they check too early (not rendered yet) or too late (auto-dismissed).

**Mitigation:**

```ts
// WAIT for celebration to appear, then assert content
await expect(page.getByTestId('xp-ticker')).toBeVisible({ timeout: 5_000 });

// For badge toast — capture it before auto-dismiss
const badge = page.getByTestId('badge-toast');
await expect(badge).toBeVisible({ timeout: 5_000 });
await expect(badge).toContainText('Warm Streak');

// For multiple badges in one session — badges may queue
// Wait for first, then check for second after dismissal
await expect(badge).toBeHidden({ timeout: 5_000 });
await expect(badge).toBeVisible({ timeout: 5_000 }); // next badge in queue
```

**Alternative — disable animations in test mode:**

```ts
// In e2e/fixtures/test-fixtures.ts, add a global init script:
await page.addInitScript(() => {
  (window as any).__E2E_NO_ANIMATIONS = true;
});

// Then in CelebrationLayer, check for this flag:
// const skipAnimation = (window as any).__E2E_NO_ANIMATIONS;
// if (skipAnimation) { autoDismissMs = 0; durationMs = 0; }
```

**Recommendation:** Prefer explicit waits over disabling animations. The animations ARE the product — testing them is part of the promise. Only disable if flakiness persists after 3 CI runs.

---

### 2. Debounced IndexedDB backup (backupManager)

**The problem:** `backupManager.scheduleBackup()` debounces writes to IndexedDB by 5,000ms. Story 07 checkpoint 7.3 needs to verify IndexedDB contains the backup — but if checked immediately after a store write, the debounce hasn't fired.

**Mitigation:**

```ts
// Option A: Force-flush the backup before asserting
await page.evaluate(() => {
  // backupManager exposes backupNow() which bypasses the debounce
  return (window as any).__backupManager?.backupNow?.();
});

// Option B: Wait for the debounce to settle
await page.waitForTimeout(6_000); // 5s debounce + 1s buffer

// Option C: Trigger an export (which calls backupNow under the hood)
await page.getByRole('button', { name: /Export Data/i }).click();
```

**Recommendation:** Option A if `backupNow` is exposed on `window` in dev mode. Option C otherwise (the export button forces a flush as a side effect). Avoid Option B — hardcoded timeouts are inherently flaky.

---

### 3. Service worker activation race (Story 08)

**The problem:** After navigating to `/`, the SW registers asynchronously. Going offline before activation completes means the precache isn't populated — tests fail not because offline is broken, but because the warm-up didn't finish.

**Mitigation:**

```ts
// Wait for SW to be fully activated before proceeding
await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  // If SW is installing/waiting, wait for it to activate
  const sw = reg.active ?? reg.installing ?? reg.waiting;
  if (sw && sw.state !== 'activated') {
    await new Promise<void>((resolve) => {
      sw.addEventListener('statechange', () => {
        if (sw.state === 'activated') resolve();
      });
    });
  }
});

// Then verify precache is populated via CACHE_DIAG
const inventory = await page.evaluate(() => new Promise((resolve) => {
  const mc = new MessageChannel();
  mc.port1.onmessage = (e) => resolve(e.data);
  navigator.serviceWorker.controller!.postMessage(
    { type: 'CACHE_DIAG' }, [mc.port2]
  );
}));
expect(inventory.precache).toContain('/index.html');
```

**Recommendation:** Always use the `CACHE_DIAG` verification as a precondition before going offline. Never assume the cache is ready based on timing alone.

---

### 4. Quiz question generation randomness

**The problem:** `quizGenerator.ts` shuffles cards and picks question types semi-randomly. A test that expects "at least 2 different question types" might get unlucky with a small card set and only generate one type.

**Mitigation:**
- Seed with 5+ cards that ALL support all 4 question types (see [concrete card IDs](#concrete-card-ids) below)
- With 5 fully-qualified cards and `maxQuestions=10`, the generator will produce diversity
- If a specific type is needed, use a deck/module with cards that have the required fields

---

### 5. `useMemo` stale closures in TodayLauncher

**The problem:** `TodayLauncher` computes `dueCount` via `useMemo(() => CardProgressStore.getCardsDueForReview().length, [])` — the empty dependency array means it captures the count AT FIRST RENDER. If card progress is seeded via `addInitScript` (before render), the count is correct. But if card progress is written during the test (e.g., completing a drill), the count won't update without a re-render trigger.

**Mitigation:**
- For Story 05 checkpoint 5.2 (due cards → review button): Seed card progress BEFORE navigation with `addInitScript`. The first render picks up the seeded data correctly.
- For Story 05 checkpoint 5.8 (due count drops after quiz): Navigate away and back (page reload or route change) to force a fresh `useMemo` evaluation.

---

### 6. localStorage write ordering in store subscriptions

**The problem:** Stores use pub/sub with synchronous localStorage writes. When `recordActivity()` fires, it writes XP, evaluates badges, and triggers subscribers — all synchronously. But `page.evaluate` reads might interleave imprecisely.

**Mitigation:**

```ts
// Batch all localStorage reads into a single evaluate call
const state = await page.evaluate(() => ({
  progress: JSON.parse(localStorage.getItem('userProgress:v1') ?? '{}'),
  profile: JSON.parse(localStorage.getItem('operative:profile:v1') ?? '{}'),
  cards: JSON.parse(localStorage.getItem('ptb:card-progress:v1') ?? '[]'),
}));
```

---

## Concrete Card IDs for Deterministic Seeds

These cards are verified to produce all 4 quiz question types:

```ts
// ── Fitness shard (guaranteed quiz-ready) ──
const FITNESS_MODULE_ID = 'fitness_training';
const FITNESS_DECK_ID   = 'olympic_lifting_basics';
const FITNESS_CARD_IDS  = [
  'snatch_technique',
  'clean_and_jerk',
  'olympic_lifting_basics_fundamentals',
  'olympic_lifting_basics_practical_application',
  'olympic_lifting_basics_advanced_techniques',
] as const;

// ── PsiOps shard (guaranteed quiz-ready) ──
const PSIOPS_MODULE_ID = 'psiops';
const PSIOPS_DECK_ID   = 'clairvoyant_perception';
const PSIOPS_CARD_IDS  = [
  'clairvoyance_1',
  'clairvoyance_2',
  'clairvoyant_perception_fundamentals',
  'clairvoyant_perception_practical_application',
  'clairvoyant_perception_advanced_techniques',
] as const;
```

Each card has: `exercises[]` with `expectedOutcome` (for MC), `bulletpoints[]` > 8 chars (for T/F), `learningObjectives[]` > 20 chars (for fill-blank), `keyTerms[]` matching bulletpoints (for term-match).

---

## Global Playwright Configuration for Stability

```ts
// playwright.config.ts — stability settings
export default defineConfig({
  timeout: 60_000,          // generous per-test timeout
  expect: {
    timeout: 10_000,        // auto-retry assertions for 10s
  },
  retries: process.env.CI ? 2 : 0,  // retry on CI, not locally
  use: {
    actionTimeout: 15_000,
    trace: 'on-first-retry',        // capture trace only on retry
    video: 'retain-on-failure',     // video for failed tests only
    screenshot: 'only-on-failure',
  },
});
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | What To Do Instead |
|-------------|-------------|-------------------|
| `page.waitForTimeout(N)` | Hardcoded waits are the #1 cause of flakiness | Use `expect(locator).toBeVisible()` with auto-retry |
| `expect(value).toBe(X)` on timing-dependent data | Value may not be updated yet | Wrap in `expect.poll()` or `toPass()` retry block |
| Testing animation completion by timing | Animation duration may change | Wait for the post-animation state (element hidden/visible) |
| Reading localStorage immediately after interaction | Store write may be async | Batch reads in a single `page.evaluate` after a UI signal |
| Asserting exact question count or type | Generator is non-deterministic | Assert ranges (`>= 2 types`, `<= 10 questions`) |
