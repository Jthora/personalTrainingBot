# Coverage Gaps — Existing E2E vs. Beta Suite

> What the existing 8 E2E spec files miss, and how the beta suite fills those gaps.

## Existing E2E Coverage Summary

| Spec | Focus | Tests |
|---|---|---|
| `00-smoke-gate` | App boot, routing, SW, storage | 5 |
| `01-first-contact` | Deliberate onboarding, fast path | ~8 |
| `02-impatient-recruit` | Fast-path flow, first drill, post-drill archetype | ~8 |
| `03-daily-cycle` | Returning user, daily kit, drill completion | ~8 |
| `04-mission-loop` | 6-phase mission navigation, signal CRUD | ~10 |
| `05-knowledge-retention` | Quiz question types, SR scheduling, retry | ~10 |
| `06-proving-yourself` | Stats, profile editing, badges, challenges | ~10 |
| `07-drill-enforcement` | Engagement warning, reflection quality, SR quality | 10 |
| `10-mobile-first` | Mobile-specific layout, tap targets, overflow, a11y | 21 |
| **Total** | | **~90** |

## Gaps Identified

### Uncovered Routes

| Route / Area | Existing Coverage | Beta Suite Coverage |
|---|---|---|
| `/train` (v2 shell) | ❌ Not tested via BottomNav | ✅ Scenario 02, 07, 08 |
| `/review` (ReviewDashboard) | ❌ Not tested | ✅ Scenario 04 |
| `/progress` (v2 StatsSurface) | ❌ Not tested via v2 nav | ✅ Scenario 02, 05 |
| `/profile` (v2 ProfileSurface) | ❌ Not tested | ✅ Scenario 02, 05 |
| `/mission/plan` (PlanSurface) | ❌ Not tested | ⚠️ Lightly touched in 03 |
| `/share/:slug` (CardSharePage) | ❌ Not tested | ✅ Scenario 06 |
| `/c/:slug` (card redirect) | ❌ Not tested | ✅ Scenario 06 |
| All legacy redirects | ❌ Not tested | ✅ Scenario 07 (11 routes) |

### Uncovered Features

| Feature | Existing Coverage | Beta Suite Coverage |
|---|---|---|
| Active Duty toggle | ❌ | ✅ Scenario 05 (toggle on/off, tabs appear/disappear) |
| Export Data button | ❌ | ✅ Scenario 05 (JSON file download) |
| Triage preferences (cozy/compact, columns/feed) | ❌ | ✅ Scenario 03 (toggle both) |
| Weak card retry | ❌ | ✅ Scenario 02 (after drill, retry button) |
| Command palette (Ctrl+K) | ❌ | ⚠️ Scenario 06 (basic open/close) |
| Module selection toggles | ❌ | ✅ Scenario 08 (check/uncheck, persistence) |
| Callsign editing | Partially (06) | ✅ Scenario 05 (edit, persist across reload, emoji, long string) |
| Archetype change | Partially (06) | ✅ Scenario 05 (change + verify kit weighting changes) |
| ReviewDashboard (due counts, forecast, module grouping) | ❌ | ✅ Scenario 04 |
| Quiz from module/deck scope | ❌ | ✅ Scenario 04 |
| Empty quiz state | ❌ | ✅ Scenario 04 |

### Uncovered Edge Cases

| Edge Case | Existing Coverage | Beta Suite Coverage |
|---|---|---|
| Refresh mid-drill | ❌ | ✅ Scenario 06 (reload during active drill) |
| `localStorage.clear()` mid-session | ❌ | ✅ Scenario 06 (clear + navigate) |
| Corrupted localStorage JSON | ❌ | ✅ Scenario 06 (inject malformed JSON) |
| Invalid deep link params | ❌ | ✅ Scenario 06 (fake op/case/signal IDs) |
| Non-existent card share slug | ❌ | ✅ Scenario 06 |
| Emoji in callsign | ❌ | ✅ Scenario 06 |
| 200+ character callsign | ❌ | ✅ Scenario 06 |
| Empty callsign | ❌ | ✅ Scenario 06 |
| Double-tap drill step | ❌ | ✅ Scenario 06 (rapid toggle <100ms) |
| Rapid tab switching | ❌ | ✅ Scenario 06 (<200ms between clicks) |
| Back button × 5 | ❌ | ✅ Scenario 06, 07 |
| Offline drill completion | ❌ | ✅ Scenario 06 (setOffline, complete drill, come back online) |
| Error boundary trigger + recovery | ❌ | ✅ Scenario 06 (throw error, click Reload) |

### Uncovered Navigation Patterns

| Pattern | Existing Coverage | Beta Suite Coverage |
|---|---|---|
| BottomNav all 4 tabs | ❌ (mobile-first tests BottomNav visibility only) | ✅ Scenario 07 |
| Mission tabs all 5 | Partially (04 tests handoff CTAs) | ✅ Scenario 07 |
| Browser back/forward history | ❌ | ✅ Scenario 07 (forward 6, back 3, forward 2) |
| Reload on every surface | ❌ | ✅ Scenario 07 (5 reloads) |
| URL direct entry per route | ❌ | ✅ Scenario 07 |
| 404 catch-all | ❌ | ✅ Scenario 07 |

### Uncovered Content Verification

| Area | Existing Coverage | Beta Suite Coverage |
|---|---|---|
| All 19 modules browsable | ❌ (tests reference "modules" generically) | ✅ Scenario 08 (each of 19 individually) |
| Each module has sub-modules/decks | ❌ | ✅ Scenario 08 |
| Card previews render real content | ❌ | ✅ Scenario 08 |
| Quick-train starts with module-correct cards | ❌ | ✅ Scenario 08 (3 modules spot-checked) |
| Scroll position preserved | ❌ | ✅ Scenario 08 |

---

## Coverage Delta Summary

| Metric | Existing E2E | Beta Suite | Combined |
|---|---|---|---|
| Test steps | ~90 | ~120 | ~210 |
| Routes tested | 8 of 30 | 28 of 30 | 29 of 30 |
| Stores exercised | ~12 of 24 | ~22 of 24 | ~23 of 24 |
| Component states covered | ~25 of 58 | ~50 of 58 | ~54 of 58 |
| Edge cases | 3 | 16 | 19 |
| Screenshots captured | 0 | ~120 | ~120 |
| a11y audit points | 8 | 16 | 24 |

## Still Not Covered (Even After Beta Suite)

| Area | Why |
|---|---|
| `SovereigntyPanel` (P2P identity) | Behind `p2pIdentity` feature flag, OFF in production |
| Web3 wallet connect/disconnect | Requires real wallet provider injection |
| IPFS content fetching | Behind `ipfsContent` flag, OFF in production |
| Keyboard shortcuts (Ctrl+1-9) | Playwright mobile viewport doesn't have keyboard focus model |
| PWA install prompt | OS-level prompt, not triggerable in Playwright |
| SW update notification | Requires simulating a real SW update push |
| RecapModal animations | Covered indirectly (quietMode toggle test), but animation quality can't be asserted |
| Real network latency | Tests run on localhost; network throttling possible but imprecise |
| Real iOS Safari rendering | Playwright WebKit is unreliable; real device testing requires BrowserStack/Sauce Labs |
