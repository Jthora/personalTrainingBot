# Story 8: The Offline Operative

> *The Archangel Knights Training Console is built for operatives who may not always have connectivity. An outpost with no signal. A subway tunnel. A compromised network. The app promises: if you loaded it once, you can train forever — offline. That promise is backed by a custom service worker, precached training content, and client-side state that never phones home.*

## The Promise

After one online visit, the app works completely offline. All 19 training modules are cached. Drills run. Quizzes work. Progress is recorded to localStorage. When connectivity returns, nothing breaks — the app doesn't try to sync, doesn't lose state, doesn't show errors.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| First online visit | App loads normally | Normal — nothing special |
| Go offline | Indicator changes to "Offline, using cached intel" | Informed — app acknowledged the change |
| Use app offline | Drills, quizzes, navigation all work | Confident — the promise is real |
| Return online | Indicator changes back to "Ready" | Seamless — no disruption, no sync conflict |

## Preconditions

- **Persona:** `returning-operative` (full profile, some drill history)
- **Browser:** Must support service workers (Chromium — Playwright default)
- **Warm cache:** The SW must be registered and all precache URLs fetched at least once
- **Starting URL:** `/mission/brief` (after warm-up phase)

## Service Worker Architecture

### Cache Structure

| Cache Name | Strategy | Contents |
|------------|----------|----------|
| `ptb-sw-precache-v5` | Install-time | `/`, `/index.html`, manifest, 19 shards |
| `ptb-sw-runtime-v5` | Fetch-time | Static assets, media, revalidated content |

### Caching Strategies by Request Type

| Request Type | Strategy |
|--------------|----------|
| Navigation (`request.mode === 'navigate'`) | Stale-while-revalidate (serve cached `/index.html`) |
| Training manifests/shards | Cache-first + background revalidation |
| Static assets (`.js`, `.css`, `.woff2`, `.svg`) | Cache-first |
| Media assets (`.png`, `.jpg`, `.webp`) | Stale-while-revalidate + LRU (max 40) |

### Precached URLs (21 total)

```
/
/index.html
/training_modules_manifest.json
/training_modules_shards/agencies.json
/training_modules_shards/anti_psn.json
/training_modules_shards/anti_tcs_idc_cbc.json
/training_modules_shards/combat.json
/training_modules_shards/counter_biochem.json
/training_modules_shards/counter_psyops.json
/training_modules_shards/cybersecurity.json
/training_modules_shards/dance.json
/training_modules_shards/equations.json
/training_modules_shards/espionage.json
/training_modules_shards/fitness.json
/training_modules_shards/intelligence.json
/training_modules_shards/investigation.json
/training_modules_shards/martial_arts.json
/training_modules_shards/psiops.json
/training_modules_shards/self_sovereignty.json
/training_modules_shards/space_force.json
/training_modules_shards/war_strategy.json
/training_modules_shards/web_three.json
```

## Test Checkpoints

### Phase A: Warm-Up (Online)

### 8.1 — Service worker registers and activates

```
Navigate to / (online)
WAIT: service worker registered and active
VERIFY: navigator.serviceWorker.controller is not null
VERIFY: SW state is 'activated'
```

### 8.2 — Warm-fetch critical precache URLs

```
WHILE ONLINE:
  Fetch /training_modules_manifest.json (trigger cache population)
  Navigate to /mission/brief → /mission/triage → /mission/training
  (This ensures the SPA shell and training content are cached)
```

### 8.3 — Verify cache inventory via CACHE_DIAG

```
SEND message to SW: { type: 'CACHE_DIAG' }
RECEIVE: cache inventory
EXPECT: precache has /index.html
EXPECT: precache or runtime has /training_modules_manifest.json
EXPECT: at least 1 training shard in cache
```

**Why this matters:** Before testing offline, we need to confirm the caches are populated. Testing offline with empty caches proves nothing.

### Phase B: Go Offline

### 8.4 — Network indicator shows offline status

```
EXECUTE: page.context().setOffline(true)
WAIT: network status indicator updates
EXPECT visible: element with role="status" containing "Offline"
EXPECT text: "Offline, using cached intel" (or partial match)
```

**Why this matters:** The operative must know they're offline. Silent degradation is disorienting.

### 8.5 — All 6 core mission routes render offline

```
FOR EACH route in [brief, triage, case, signal, checklist, debrief]:
  Navigate to /mission/{route}?op=op-test&case=case-test&signal=signal-test
  EXPECT: page renders (no network error, no blank screen)
  EXPECT: #root has child elements
  EXPECT: no uncaught console errors
```

### 8.6 — Supplementary routes render offline

```
FOR EACH route in [stats, plan, training]:
  Navigate to /mission/{route}
  EXPECT: page renders (no blank screen)
  EXPECT: no uncaught errors
```

**Why this matters:** The existing `checkOfflineCriticalPath.ts` only tests the 6 core routes + `/training/run`. This story extends coverage to `/mission/stats` and `/mission/plan`.

### 8.7 — DrillRunner works offline with real content

```
Navigate to /mission/training (or trigger a drill)
START a drill for a cached module
EXPECT: DrillRunner renders card content (not "Loading..." or placeholder)
EXPECT: card has title, description, bulletpoints
COMPLETE the drill (advance through all steps)
EXPECT: drill completion screen (XP, reflection)
```

**Why this matters:** If training content isn't available from cache, the drill shows empty cards or errors. The operative's offline training session is worthless.

### 8.8 — Quiz works offline

```
SEED: CardProgressStore with due cards
Navigate to /mission/quiz?mode=review
EXPECT: QuizRunner renders with questions
ANSWER: at least 2 questions
EXPECT: quiz progression works (next question, score updates)
```

### 8.9 — Progress records persist offline

```
AFTER completing drill offline:
READ localStorage: userProgress:v1
EXPECT: totalDrillsCompleted incremented
EXPECT: xp increased
READ localStorage: ptb:drill-history:v1
EXPECT: new drill entry recorded
```

**Why this matters:** Offline training must not be ephemeral. If progress doesn't record to localStorage offline, the operative loses their session when they close the tab.

### Phase C: Return Online

### 8.10 — Coming back online doesn't break state

```
EXECUTE: page.context().setOffline(false)
WAIT: network status indicator updates
EXPECT visible: element with role="status" containing "Ready"
VERIFY: localStorage data from offline session is still intact
Navigate to /mission/stats
EXPECT: stats reflect the drill completed offline (XP, drills count)
```

**Why this matters:** The transition back to online must be seamless. No sync errors, no state conflicts, no "your session expired" modals. This app has no server — there's nothing to conflict with.

### 8.11 — Background revalidation doesn't corrupt cache

```
WHILE ONLINE:
  Navigate to /mission/training (triggers manifest/shard fetches)
  VERIFY: no console errors about cache corruption
  GO OFFLINE again
  VERIFY: app still works (revalidation didn't break cached content)
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| SW doesn't activate | No caching at all — offline is impossible |
| Precache incomplete | Some shards missing — certain modules fail offline |
| Navigation not intercept by SW | Blank page offline — SPA shell not served |
| Training content not in cache | DrillRunner shows empty cards — useless drill |
| Quiz fails offline | Review mode broken without network |
| Progress doesn't save offline | Drill completed but lost — effort wasted |
| Online return triggers errors | App breaks on reconnect — worse than staying offline |
| Cache revalidation corrupts entries | Next offline session broken by a previous online update |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Network indicator | `locator('[role="status"][aria-live="polite"]')` |
| Offline text | `getByText(/Offline.*cached intel/i)` |
| Online text | `getByText(/Ready/i)` |
| Root element | `locator('#root')` |
| Drill card content | `[data-testid^="card-content-"]` |
| Quiz runner | `[data-testid="quiz-runner"]` |

## Spec File

`e2e/flows/08-offline-operative.spec.ts`

## Estimated Duration

~60–90 seconds (warm-up + offline cycle through routes + drill + return online)

## Playwright-Specific Notes

```ts
// Go offline
await context.setOffline(true);

// Go online
await context.setOffline(false);

// Check SW status
const swState = await page.evaluate(() =>
  navigator.serviceWorker.controller?.state
);

// Send CACHE_DIAG message to SW
const inventory = await page.evaluate(() => new Promise(resolve => {
  const mc = new MessageChannel();
  mc.port1.onmessage = e => resolve(e.data);
  navigator.serviceWorker.controller!.postMessage(
    { type: 'CACHE_DIAG' }, [mc.port2]
  );
}));
```

## Relationship to Existing Scripts

| Existing Script | What It Tests | What This Story Adds |
|-----------------|---------------|----------------------|
| `checkOfflineSW.ts` | SW registration + single shard cache-hit | Full route rendering + drill execution offline |
| `checkOfflineCriticalPath.ts` | 6 core routes + /training/run render offline | +3 supplementary routes, drill content verification |
| `checkOfflineRecovery.ts` | Cache corruption + recovery | Online→offline→online state integrity |
| `checkOfflineIndicator.ts` | Indicator text changes | Same (superseded) |
| `checkPrecacheSize.ts` | Budget check on 4 URLs | CACHE_DIAG full inventory check |
| `checkSwCachePaths.ts` | Cache path inspection | Same mechanism, more assertions |

This story **consolidates** the offline testing surface into a single user-perspective verification. The existing scripts run as fast CI gates (~5s each) per the [coexistence strategy](../setup/coexistence-strategy.md), while this story provides deeper coverage.
