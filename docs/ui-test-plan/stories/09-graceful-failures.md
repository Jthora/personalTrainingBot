# Story 9: Graceful Failures

> *The previous 8 stories test happy paths — the app working as designed. This story tests what happens when things go wrong. A missing shard, a full localStorage, a corrupt card progress entry, a route that doesn't exist. The operative should never see a blank screen or a raw stack trace.*

## The Promise

When something breaks, the app fails gracefully — with a visible error message, a recovery path, or at minimum, no data loss.

## Priority

**P1** — Not a release gate, but should be green before any production push that changes data loading or storage.

## Test Checkpoints

### 9.1 — Missing training shard shows error, not blank

```
INTERCEPT: /training_modules_shards/fitness.json → respond 404
Navigate to /mission/training
TRIGGER: load the fitness module
EXPECT: error message visible (not blank screen, not raw stack trace)
EXPECT: other modules still navigable
```

**Why this matters:** A single corrupted CDN cache or deployment race can 404 one shard. The app must not crash.

### 9.2 — Corrupt localStorage doesn't crash on load

```
SEED: localStorage 'ptb:card-progress:v1' = 'NOT_VALID_JSON'
Navigate to /mission/brief
EXPECT: app loads (React mounts)
EXPECT: TodayLauncher renders (might show 0 due cards — that's fine)
EXPECT: no uncaught exception in console
```

### 9.3 — Full localStorage quota handled

```
EVALUATE: fill localStorage to near-quota (~5MB)
TRIGGER: complete a drill (which tries to write to multiple stores)
EXPECT: drill still completes visibly (XP shown, completion screen)
EXPECT: app does not crash
NOTE: data loss is acceptable — crash is not
```

### 9.4 — Unknown route shows 404 page

```
Navigate to /mission/nonexistent
EXPECT: 404 page or redirect to /mission/brief (not blank screen)
Navigate to /does-not-exist
EXPECT: 404 page renders with recovery link (not server 404)
```

### 9.5 — Missing card ID in card progress doesn't crash quiz

```
SEED: CardProgressStore with entries referencing card IDs that don't exist in any shard
  e.g., cardId: 'ghost_card_that_does_not_exist'
Navigate to /mission/quiz?mode=review
EXPECT: quiz either:
  - Loads with 0 questions (skips unresolvable cards), OR
  - Shows "No cards available for review" message
EXPECT: no crash
```

### 9.6 — Network timeout on manifest doesn't block app

```
INTERCEPT: /training_modules_manifest.json → delay 30s (simulate timeout)
Navigate to /mission/brief
EXPECT: app shell renders
EXPECT: TodayLauncher renders (possibly with fallback content)
EXPECT: user can navigate to other routes while manifest loads
```

### 9.7 — Legacy redirect with invalid query params

```
Navigate to /training/run?invalid=true&malformed
EXPECT: redirects to /mission/training (query params stripped or passed through)
EXPECT: page renders normally
```

## Failure Modes This Catches

| Failure | Impact if untested |
|---------|-------------------|
| Shard 404 → blank screen | Operative can't train that module — but no indication why |
| Corrupt JSON → React crash | White screen of death on return visit — only fixable by clearing localStorage |
| Quota exceeded → write throws | Drill completion lost — operative did the work but it wasn't recorded |
| Unknown route → nothing | Operative stuck on blank page — no "go back" affordance |
| Ghost card IDs → crash | Quiz breaks for everyone with stale card progress entries |
| Manifest timeout → frozen | App appears broken until network recovers |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Error message | `getByRole('alert')` or `getByText(/error|failed|unavailable/i)` |
| Root element | `locator('#root')` |
| 404 page | `getByText(/not found|404/i)` |

## Spec File

`e2e/flows/09-graceful-failures.spec.ts`

## Estimated Duration

~30–40 seconds (7 focused edge-case scenarios)

## Playwright Techniques Required

```ts
// Network interception for shard 404
await page.route('**/training_modules_shards/fitness.json', (route) =>
  route.fulfill({ status: 404, body: 'Not Found' })
);

// Network delay for manifest timeout
await page.route('**/training_modules_manifest.json', async (route) => {
  await new Promise((r) => setTimeout(r, 30_000));
  route.continue();
});

// Fill localStorage to quota
await page.evaluate(() => {
  const filler = 'x'.repeat(1024 * 1024); // 1MB string
  for (let i = 0; i < 5; i++) {
    try { localStorage.setItem(`__quota_fill_${i}`, filler); } catch { break; }
  }
});

// Check for uncaught errors
const errors: string[] = [];
page.on('pageerror', (err) => errors.push(err.message));
// ... after interaction:
expect(errors).toHaveLength(0);
```
