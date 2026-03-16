# Scenario 06: Edge Gremlin

> Persona: Various seeds — intentionally adversarial. Break things on purpose.

## Purpose

Simulates an aggressive, impatient, or confused user who does everything wrong. Tests error boundaries, edge states, recovery paths, and resilience under unexpected conditions. If the app survives this, it survives real users.

## Preconditions

- Multiple persona seeds used across different sub-tests
- Mobile viewport: 390×844
- Console error collection especially critical here

## Steps

### State Destruction

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Refresh mid-drill** | Seed `day-two-cadet`. Start drill, toggle 2 steps, `page.reload()` | Drill state either recovers (steps still toggled) or resets cleanly. No crash, no blank screen. |
| 2 | **Clear localStorage mid-session** | Navigate to `/train`, execute `localStorage.clear()`, then navigate to `/profile` | App detects missing state. Either redirects to onboarding or shows empty profile gracefully. No uncaught exception. |
| 3 | **Corrupt localStorage** | Set `ptb:user-progress` to `"{invalid json"`, reload | App handles parse failure. Resets to defaults or shows error boundary. Does not infinite-loop. |

### Navigation Abuse

| # | Step | Action | Assertions |
|---|---|---|---|
| 4 | **Invalid route** | Navigate to `/nonexistent/path/here` | Catch-all redirect fires. Lands on valid route. No blank screen. |
| 5 | **Deep link with bad params** | Navigate to `/mission/brief?op=op-doesnt-exist&case=fake&signal=fake` | Page loads. Shows "context mismatch" or "unavailable" message. Not a crash. |
| 6 | **Card share with bad slug** | Navigate to `/share/nonexistent-slug-12345` | CardSharePage renders with graceful "not found" or empty state. |
| 7 | **Card redirect with bad slug** | Navigate to `/c/nonexistent-slug` | Redirect logic handles gracefully. Not a 404 crash. |
| 8 | **Legacy routes** | Navigate to each: `/home`, `/home/plan`, `/home/cards`, `/home/progress`, `/home/handler`, `/home/settings`, `/schedules`, `/drills`, `/training`, `/training/run`, `/settings` | Every single one resolves to a valid v2 route. No blank screens. |
| 9 | **Back button stress** | Navigate: `/train` → `/review` → `/progress` → `/profile` → `/train` → back × 4 | Each back press returns to previous screen in order. No loop. No blank state. |

### Input Edge Cases

| # | Step | Action | Assertions |
|---|---|---|---|
| 10 | **Emoji callsign** | Edit callsign to "🚀Commander🔥💀" | Saves and displays correctly. No encoding corruption. |
| 11 | **Very long callsign** | Edit callsign to 200-character string | Either truncated at save or displayed with text overflow handling. No layout break. |
| 12 | **Empty callsign** | Clear callsign, attempt save | Either prevented (save disabled) or handled gracefully. |
| 13 | **Double-tap drill step** | Start drill, rapidly toggle same step twice within 100ms | Step state is consistent (toggled once, not double-counted). |
| 14 | **Rapid tab switching** | Click each BottomNav tab in rapid succession (<200ms gaps) | Final tab renders correctly. No stale content from intermediate tabs. |

### Network & Offline

| # | Step | Action | Assertions |
|---|---|---|---|
| 15 | **Go offline** | `page.context().setOffline(true)` | NetworkStatusIndicator changes to "Offline, using cached intel" (red pill). |
| 16 | **Complete drill offline** | Start and complete a drill while offline | Drill records to localStorage. XP updates. No network error shown. |
| 17 | **Come back online** | `page.context().setOffline(false)` | NetworkStatusIndicator changes back to "Ready" (green). Telemetry queue flushes if applicable. |

### Error Recovery

| # | Step | Action | Assertions |
|---|---|---|---|
| 18 | **Trigger error boundary** | `page.evaluate(() => { throw new Error('Beta test trigger'); })` in component context | Root error boundary renders "System Fault Detected" with Reload button. |
| 19 | **Recover from error boundary** | Click "Reload" button on error screen | App reloads. Lands on valid state. Previous user data preserved. |

## Accessibility Audit Points

- After step 4 (error redirect state) — fallback screen
- After step 15 (offline state) — offline indicator
- After step 18 (error boundary) — error recovery UI

## Expected Screenshots

19 screenshots — every edge state captured for visual verification.

## Key Risks

- `localStorage.clear()` causing unrecoverable state (infinite redirect loop)
- Corrupted JSON causing parse failures that crash React rendering
- Legacy routes not covered by redirect mapping
- Back button creating navigation loops
- Emoji in callsign causing encoding issues in localStorage or Gun.js
- Rapid interactions causing race conditions in store updates
- Offline drill completion losing data
- Error boundary not catching thrown errors (rendering blank screen instead)
