# Component & Page Test Plans

Test plans for all 19 untested components and key untested pages.

---

## HIGH Priority Components

### 1. AAR / AARComposer.tsx (170 lines)

**Path:** `src/components/AAR/__tests__/AARComposer.test.tsx`

**What it does:** Full after-action review composer with entry list, CRUD form, auto-save (800ms debounce), JSON export/download.

**Mocks needed:**
- `AARStore` — mock `getEntries`, `saveEntry`, `deleteEntry`, `subscribe`
- `URL.createObjectURL` / `URL.revokeObjectURL` — for JSON export
- `document.createElement('a')` — for download trigger
- Timer mocks (`vi.useFakeTimers`) — for debounce

**Test cases (~8):**
```
✅ renders entry list from store
✅ selecting entry populates form fields
✅ creating new entry clears form
✅ editing form triggers auto-save after 800ms debounce
✅ deleting entry removes from list
✅ export button creates downloadable JSON blob
✅ empty state renders "No entries" message
✅ dirty indicator shows when form has unsaved changes
```

---

### 2. Header / Header.tsx + HeaderDrawer.tsx + HeaderNav.tsx (320 lines total)

**Path:** `src/components/Header/__tests__/Header.test.tsx`

**What it does:** App-wide header with logo, navigation, stats chips (level/streak/alignment), hamburger drawer with focus trap, skip-link.

**Mocks needed:**
- `react-router-dom` — `useNavigate`, `useLocation`
- `UserProgressStore` — mock `get`, `subscribe`
- `MissionScheduleStore` — mock for alignment computation
- `window.matchMedia` — for responsive behavior

**Test cases (~10):**
```
✅ renders logo and nav items
✅ stats chips display level, streak, alignment from store
✅ hamburger button opens drawer
✅ drawer has correct ARIA attributes (role="dialog", aria-modal)
✅ Escape key closes drawer
✅ Tab key traps focus within drawer
✅ Shift+Tab wraps focus to last element
✅ clicking overlay closes drawer
✅ body scroll is locked when drawer is open
✅ skip-link navigates to #main-content
```

---

### 3. ShareCard / ShareCard.tsx (266 lines)

**Path:** `src/components/ShareCard/__tests__/ShareCard.test.tsx`

**What it does:** Rich card for sharing training content — KaTeX math rendering, module pills, breadcrumbs, description, badges, short URL.

**Mocks needed:**
- `katex` — mock `renderToString` to return sanitized HTML
- `ResizeObserver` — mock for height measurement
- `useLayoutEffect` — test height callback

**Test cases (~7):**
```
✅ renders card title and description
✅ renders module pills from meta
✅ renders breadcrumb path
✅ KaTeX expressions render (mocked)
✅ onHeightChange called after layout
✅ respects displayOptions (hide/show sections)
✅ short URL displayed when provided
```

---

### 4. Signals / SignalsPanel.tsx (148 lines)

**Path:** `src/components/Signals/__tests__/SignalsPanel.test.tsx`

**What it does:** Signal operations panel — signal list, role filter, create form, acknowledge/resolve actions, sync queue count.

**Mocks needed:**
- `SignalsStore` — mock all methods

**Test cases (~8):**
```
✅ renders existing signals from store
✅ role filter shows only matching signals
✅ create form submits new signal with title/detail/role
✅ create form validates required fields
✅ acknowledge button calls store.acknowledgeSignal
✅ resolve button calls store.resolveSignal
✅ sync queue indicator shows pending count
✅ empty state renders when no signals
```

---

### 5. Readiness / ReadinessPanel.tsx (94 lines)

**Path:** `src/components/Readiness/__tests__/ReadinessPanel.test.tsx`

**What it does:** Operational readiness dashboard — score, confidence, kit info, milestone progress, recommended next actions.

**Mocks needed:**
- `useMissionEntityCollection` hook
- `MissionKitStore`
- `AARStore`
- `computeReadiness` utility
- Telemetry tracker

**Test cases (~6):**
```
✅ renders readiness score and confidence
✅ renders kit title from MissionKitStore
✅ renders milestone tier and progress bar
✅ renders recommended next actions
✅ tracks telemetry on render
✅ handles empty/loading state
```

---

### 6. DebriefClosureSummary / DebriefClosureSummary.tsx (90 lines)

**Path:** `src/components/DebriefClosureSummary/__tests__/DebriefClosureSummary.test.tsx`

**What it does:** End-of-mission closure — readiness delta, strongest/weakest competency, recommended next mission.

**Mocks needed:**
- `useMissionEntityCollection`
- `readMissionFlowContext`
- `computeReadiness`

**Test cases (~5):**
```
✅ renders readiness score and delta from previous
✅ identifies strongest competency dimension
✅ identifies weakest competency dimension
✅ recommends next mission based on weaknesses
✅ handles missing previous readiness data
```

---

## MEDIUM Priority Components

### 7. ChallengePanel / ChallengePanel.tsx (72 lines)

**Path:** `src/components/ChallengePanel/__tests__/ChallengePanel.test.tsx`

**Mocks:** `UserProgressStore`

**Test cases (~5):**
```
✅ renders active challenges with progress bars
✅ progress bar width matches completion percentage
✅ claim button calls claimChallenge with correct id
✅ claimed challenge shows XP reward
✅ empty state when no active challenges
```

---

### 8. MissionKit / MissionKitPanel.tsx (79 lines)

**Path:** `src/components/MissionKit/__tests__/MissionKitPanel.test.tsx`

**Mocks:** `MissionKitStore`, `DrillRunStore`, `react-router-dom`

**Test cases (~5):**
```
✅ renders drill list from kit store
✅ toggle button flips visibility
✅ "run" button calls DrillRunStore.start and navigates
✅ hidden state collapses drill list
✅ offline indicator shows for cached drills
```

---

### 9. MissionStepHandoff / MissionStepHandoff.tsx (90 lines)

**Path:** `src/components/MissionStepHandoff/__tests__/MissionStepHandoff.test.tsx`

**Mocks:** `readMissionFlowContext`, telemetry tracker, `react-router-dom`

**Test cases (~4):**
```
✅ renders step label, why, inputs, ready criteria
✅ CTA button navigates to nextPath
✅ CTA click emits telemetry event
✅ displays continuity context from mission flow
```

---

### 10. MissionRouteState / MissionRouteState.tsx (46 lines)

**Path:** `src/components/MissionRouteState/__tests__/MissionRouteState.test.tsx`

**Test cases (~3):**
```
✅ renders loading state with spinner
✅ renders error state with message and retry action
✅ renders empty state with guide message
```

---

### 11. ErrorBoundary / ErrorBoundary.tsx (73 lines)

**Path:** `src/components/ErrorBoundary/__tests__/ErrorBoundary.test.tsx`

**Note:** Class component — use `render` with a child that throws.

**Test cases (~4):**
```
✅ renders children when no error
✅ root level shows "System Fault" on error
✅ route level shows "Surface Error" on error
✅ retry button resets error state
```

---

### 12. CacheIndicator / CacheIndicator.tsx (58 lines)

**Path:** `src/components/CacheIndicator/__tests__/CacheIndicator.test.tsx`

**Test cases (~4):**
```
✅ hidden by default
✅ shows message on ptb-cache-status custom event
✅ auto-hides after 4 seconds
✅ cleanup removes event listener on unmount
```

---

### 13. NetworkStatusIndicator / NetworkStatusIndicator.tsx (45 lines)

**Path:** `src/components/NetworkStatusIndicator/__tests__/NetworkStatusIndicator.test.tsx`

**Mocks:** `useNetworkStatus` hook

**Test cases (~2):**
```
✅ shows "Ready" when online
✅ shows "Offline, using cached intel" when offline
```

---

## LOW Priority Components

### 14. BadgeStrip / BadgeStrip.tsx (28 lines)

**Test cases (~2):**
```
✅ renders last 3 badges
✅ shows overflow count when > 3 badges
```

### 15. LoadingMessage / LoadingMessage.tsx (40 lines)

**Test cases (~2):**
```
✅ renders progress bar with correct width
✅ animated dots cycle through states
```

### 16. MissionIntakePanel / MissionIntakePanel.tsx (51 lines)

**Test cases (~2):**
```
✅ renders intro content
✅ Start/Dismiss buttons call respective callbacks
```

### 17. StatsPanel / StatsPanel.tsx (29 lines)

**Test cases (~2):**
```
✅ renders level, XP, goals, streak from store
✅ handles empty store state
```

### 18. ScheduleNavigationRefresh / ScheduleNavigationRefresh.tsx (22 lines)

**Test cases (~2):**
```
✅ triggers schedule reload on navigation
✅ throttles reload (5 min debounce)
```

### 19. SurfaceLoader / SurfaceLoader.tsx (9 lines)

**Test cases (~1):**
```
✅ renders spinner element
```

---

## Page Tests

### MissionShell.tsx (609 lines) — HIGH

**Path:** `src/pages/MissionFlow/__tests__/MissionShell.test.tsx`

**What it does:** Main mission orchestrator — renders current surface based on route, manages mission flow context, handles surface transitions, error boundaries.

**Mocks needed:**
- `react-router-dom` (MemoryRouter for route simulation)
- All stores used by child surfaces
- Mission flow context
- Feature flags

**Test cases (~8):**
```
✅ renders BriefSurface at /mission/brief
✅ renders TriageSurface at /mission/triage
✅ renders correct surface for each mission route
✅ provides MissionFlowContext to children
✅ ErrorBoundary catches surface errors
✅ redirects from /mission to /mission/brief
✅ handles unknown sub-routes
✅ surface transitions update mission flow context
```

### Other Surfaces (~1-2 tests each)

| Surface | Priority | Key test |
|---------|----------|----------|
| ChecklistSurface (71 lines) | MEDIUM | Renders checklist items from mission context |
| DebriefSurface (50 lines) | MEDIUM | Renders debrief closure summary |
| CardSharePage (101 lines) | MEDIUM | Renders ShareCard with correct data |
| BriefSurface (47 lines) | LOW | Renders mission brief content |
| CaseSurface (45 lines) | LOW | Renders case content |
| SignalSurface (45 lines) | LOW | Renders SignalsPanel |
| TriageSurface (45 lines) | LOW | Renders TriageBoard |

---

## Execution Checklist

### High Priority (do first)
- [ ] AAR/AARComposer.test.tsx (8 tests)
- [ ] Header/Header.test.tsx (10 tests)
- [ ] ShareCard/ShareCard.test.tsx (7 tests)
- [ ] Signals/SignalsPanel.test.tsx (8 tests)
- [ ] Readiness/ReadinessPanel.test.tsx (6 tests)
- [ ] DebriefClosureSummary.test.tsx (5 tests)

### Medium Priority
- [ ] ChallengePanel.test.tsx (5 tests)
- [ ] MissionKit/MissionKitPanel.test.tsx (5 tests)
- [ ] MissionStepHandoff.test.tsx (4 tests)
- [ ] MissionRouteState.test.tsx (3 tests)
- [ ] ErrorBoundary.test.tsx (4 tests)
- [ ] CacheIndicator.test.tsx (4 tests)
- [ ] NetworkStatusIndicator.test.tsx (2 tests)

### Low Priority
- [ ] BadgeStrip.test.tsx (2 tests)
- [ ] LoadingMessage.test.tsx (2 tests)
- [ ] MissionIntakePanel.test.tsx (2 tests)
- [ ] StatsPanel.test.tsx (2 tests)
- [ ] ScheduleNavigationRefresh.test.tsx (2 tests)
- [ ] SurfaceLoader.test.tsx (1 test)

### Pages
- [ ] MissionShell.test.tsx (8 tests)
- [ ] ChecklistSurface.test.tsx (2 tests)
- [ ] DebriefSurface.test.tsx (2 tests)
- [ ] CardSharePage.test.tsx (2 tests)
- [ ] BriefSurface.test.tsx (1 test)
- [ ] CaseSurface.test.tsx (1 test)
- [ ] SignalSurface.test.tsx (1 test)
- [ ] TriageSurface.test.tsx (1 test)

**Total: ~115 new component/page tests**
