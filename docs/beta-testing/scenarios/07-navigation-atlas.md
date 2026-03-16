# Scenario 07: Navigation Atlas

> Persona: `day-two-cadet` — Standard returning user. Focus is on routing, not content interaction.

## Purpose

Systematically visits every route in the application and verifies it resolves correctly. Tests the routing layer, navigation mechanisms (BottomNav, mission tabs, deep links, legacy redirects), browser history, and page reload resilience.

## Preconditions

- Seeded state: `day-two-cadet` (archetype set, basic progress)
- Mobile viewport: 390×844

## Steps

### Primary Navigation (v2 BottomNav)

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Train tab** | Click Train in BottomNav | `/train` loads. ModuleBrowser visible. Train tab active (highlighted). |
| 2 | **Review tab** | Click Review in BottomNav | `/review` loads. ReviewDashboard visible. Review tab active. |
| 3 | **Progress tab** | Click Progress in BottomNav | `/progress` loads. StatsSurface visible. Progress tab active. |
| 4 | **Profile tab** | Click Profile in BottomNav | `/profile` loads. ProfileSurface visible. Profile tab active. |

### Mission Tabs (Active Duty)

| # | Step | Action | Assertions |
|---|---|---|---|
| 5 | **Enable Active Duty** | Toggle Active Duty in Profile settings | 5 mission tabs appear in BottomNav navigation. |
| 6 | **Brief tab** | Click Brief | `/mission/brief` loads. BriefSurface visible. |
| 7 | **Triage tab** | Click Triage | `/mission/triage` loads. TriageSurface visible. |
| 8 | **Case tab** | Click Case | `/mission/case` loads. CaseSurface visible. |
| 9 | **Signal tab** | Click Signal | `/mission/signal` loads. SignalSurface visible. |
| 10 | **Debrief tab** | Click Debrief | `/mission/debrief` loads. DebriefSurface visible. |

### Legacy Route Redirects

| # | Step | Action | Assertions |
|---|---|---|---|
| 11 | **`/home`** | Navigate directly | Redirects to `/train` |
| 12 | **`/home/plan`** | Navigate directly | Redirects to `/train` |
| 13 | **`/home/cards`** | Navigate directly | Redirects to `/train` |
| 14 | **`/home/progress`** | Navigate directly | Redirects to `/progress` |
| 15 | **`/home/handler`** | Navigate directly | Redirects to `/profile` |
| 16 | **`/home/settings`** | Navigate directly | Redirects to `/profile` |
| 17 | **`/schedules`** | Navigate directly | Resolves to valid route |
| 18 | **`/drills`** | Navigate directly | Resolves to valid route |
| 19 | **`/training`** | Navigate directly | Resolves to valid route |
| 20 | **`/training/run`** | Navigate directly | Resolves to valid route |
| 21 | **`/settings`** | Navigate directly | Resolves to valid route |

### Deep Links

| # | Step | Action | Assertions |
|---|---|---|---|
| 22 | **Mission with params** | Navigate to `/mission/brief?op=test-op&case=test-case&signal=test-signal` | Page loads. Params consumed (may show mismatch message for fake IDs, but no crash). |
| 23 | **Card share** | Navigate to `/share/test-slug` | CardSharePage renders (may show empty state for non-existent slug). |
| 24 | **Card redirect** | Navigate to `/c/test-slug?source=test` | Redirect logic executes. |

### Browser History

| # | Step | Action | Assertions |
|---|---|---|---|
| 25 | **Forward navigation** | Visit: `/train` → `/review` → `/progress` → `/profile` → `/mission/brief` → `/mission/triage` | Each page renders correctly in sequence. |
| 26 | **Back × 3** | Press browser back 3 times | Returns to `/progress`, then `/review`, then `/train`. Correct content each time. |
| 27 | **Forward × 2** | Press browser forward 2 times | Returns to `/review`, then `/progress`. |

### Reload Resilience

| # | Step | Action | Assertions |
|---|---|---|---|
| 28 | **Reload on `/train`** | Navigate to `/train`, `page.reload()` | Same page renders. Module browser visible. No redirect to onboarding. |
| 29 | **Reload on `/review`** | Navigate to `/review`, `page.reload()` | ReviewDashboard visible. Data preserved. |
| 30 | **Reload on `/progress`** | `page.reload()` | StatsSurface visible. Stats preserved. |
| 31 | **Reload on `/profile`** | `page.reload()` | ProfileSurface visible. Callsign preserved. |
| 32 | **Reload on `/mission/brief`** | `page.reload()` | BriefSurface visible. |

### Error Routes

| # | Step | Action | Assertions |
|---|---|---|---|
| 33 | **404 catch-all** | Navigate to `/totally/invalid/deep/path` | Redirects to root. No blank screen. |
| 34 | **Root redirect** | Navigate to `/` | Redirects to `/train` (v2 shell default). |

## Accessibility Audit Points

- After step 4 (completed primary nav) — all 4 primary surfaces visited
- After step 10 (completed mission nav) — all 5 mission surfaces visited

## Expected Screenshots

34 screenshots — every route visited is captured.

## Key Risks

- Legacy redirects not mapped (resulting in blank screens or catch-all)
- Active Duty toggle not persisting across tab navigation
- Browser back creating loops between redirect pairs
- Reload on mission surfaces losing mission context params
- `/c/:slug` redirect causing infinite loops
- Deep link params not cleared after consumption (stale context on next visit)
