# Shell Simplification — Implementation Plan

## Overview

Restructure `MissionShell.tsx` (654 lines) and `Routes.tsx` from a 10-tab mission-cycle
shell to a 4-tab training-first shell with optional Mission Mode.

---

## 1. Route Configuration

**File:** `src/routes/Routes.tsx`

### New Route Tree

```tsx
<Route element={<AppShell />}>
  {/* Primary tabs */}
  <Route path="/train" element={<TrainSurface />} />
  <Route path="/train/module/:moduleId" element={<ModuleSurface />} />
  <Route path="/train/deck/:deckId" element={<DeckSurface />} />
  <Route path="/train/drill" element={<DrillSurface />} />
  <Route path="/train/quiz" element={<QuizSurface />} />

  <Route path="/review" element={<ReviewSurface />} />
  <Route path="/review/quiz" element={<ReviewQuizSurface />} />

  <Route path="/progress" element={<StatsSurface />} />

  <Route path="/profile" element={<ProfileSurface />} />
  <Route path="/profile/edit" element={<ProfileEditorSurface />} />
  <Route path="/profile/journal" element={<JournalSurface />} />
  <Route path="/profile/data" element={<DataSurface />} />

  {/* Mission Mode routes (conditionally rendered) */}
  <Route path="/mission/brief" element={<BriefSurface />} />
  <Route path="/mission/triage" element={<TriageSurface />} />
  <Route path="/mission/case" element={<CaseSurface />} />
  <Route path="/mission/signal" element={<SignalSurface />} />
  <Route path="/mission/debrief" element={<DebriefSurface />} />

  {/* Legacy redirects */}
  <Route path="/mission/training" element={<Navigate to="/train" replace />} />
  <Route path="/mission/checklist" element={<Navigate to="/train/drill" replace />} />
  <Route path="/mission/quiz" element={<Navigate to="/train/quiz" replace />} />
  <Route path="/mission/stats" element={<Navigate to="/progress" replace />} />
  <Route path="/mission/plan" element={<Navigate to="/train" replace />} />
</Route>
```

### Notes
- `AppShell` replaces `MissionShell` as the primary layout component
- All existing `/mission/*` routes get `<Navigate replace />` redirects
- Mission Mode routes remain at `/mission/*` but are only shown in the nav when enabled
- Lazy loading unchanged — surfaces remain code-split

---

## 2. AppShell Component (replaces MissionShell)

**New file:** `src/pages/AppShell/AppShell.tsx`

Simplified from 654 → ~250 lines by removing:
- stepTools (step complete/continue buttons — mission-specific)
- assistantCard (SOP prompts — mission-specific, moves to Mission Mode)
- completedSteps localStorage tracking
- guidanceMode toggle

### Retained:
- Header
- CelebrationLayer
- Tab bar (4 tabs)
- Action Palette (⌘K)
- Onboarding flow (guidance overlay → archetype → handler → training)
- Mobile bottom nav

### Tab Array

```tsx
const primaryTabs = [
  { path: '/train', label: 'Train', icon: '📚' },
  { path: '/review', label: 'Review', icon: '🔄' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const missionTabs = [
  { path: '/mission/brief', label: 'Brief', icon: missionEntityIcons.operation },
  { path: '/mission/triage', label: 'Triage', icon: missionEntityIcons.lead },
  { path: '/mission/case', label: 'Case', icon: missionEntityIcons.case },
  { path: '/mission/signal', label: 'Signal', icon: missionEntityIcons.signal },
  { path: '/mission/debrief', label: 'Debrief', icon: missionEntityIcons.debrief },
];

const tabs = useMemo(() => {
  const missionMode = localStorage.getItem('ptb:mission-mode') === 'enabled';
  return missionMode ? [...primaryTabs, ...missionTabs] : primaryTabs;
}, [/* missionMode state */]);
```

---

## 3. MissionShell Deprecation

`MissionShell.tsx` is NOT deleted immediately — it's kept for Mission Mode rendering.
When Mission Mode is active, `AppShell` renders `MissionShell` as a sub-layout for
`/mission/*` routes only.

**Phase 1:** AppShell for primary tabs, MissionShell for `/mission/*` routes (co-exist)
**Phase 2:** Extract reusable pieces from MissionShell (assistantCard, stepTools) into
standalone components, then delete MissionShell.

---

## 4. Telemetry Updates

### Route Path References

**File:** `src/utils/missionTelemetryContracts.ts`

Update `missionRoutePaths` to include new primary routes:

```typescript
export const appRoutePaths = [
  '/train', '/train/drill', '/train/quiz',
  '/review', '/review/quiz',
  '/progress',
  '/profile', '/profile/edit', '/profile/journal', '/profile/data',
] as const;

// Keep existing for Mission Mode
export const missionRoutePaths = [
  '/mission/brief', '/mission/triage', '/mission/case',
  '/mission/signal', '/mission/debrief',
] as const;
```

### Event References

Grep for telemetry events referencing tab paths:

```bash
grep -rn "route:" src/ | grep -v node_modules | grep -v __tests__
```

Estimated ~15-20 events reference specific route paths. Each needs:
- Path string updated OR
- Path lookup changed to use the new route constants

### tab_view Events

Current events use `action: 'tab_view'` with `route: '/mission/...'`. These need
updating to new paths. The transition payload builder (`buildMissionTransitionPayload`)
needs a new `buildAppTransitionPayload` that uses the new route paths.

---

## 5. Navigate Call Updates

Components that call `navigate()` with mission paths:

| File | Navigate Calls | Update |
|------|---------------|--------|
| MissionShell.tsx | ~10 | Replaced by AppShell |
| TodayLauncher.tsx | 2-3 | `/mission/training` → `/train`, `/mission/checklist` → `/train/drill` |
| TrainingSurface.tsx | 2-3 | Internal navigation updated |
| MissionIntakePanel.tsx | 1 | `/mission/brief` → `/train` |
| useMissionFlowContinuity.ts | 2-3 | Route path map updated |
| Various button/link components | ~20 | Search-and-replace |

**Approach:** Run `grep -rn "navigate.*mission" src/` to find all instances. Most are
string literal replacements. A few use dynamic route construction that needs the
mapping table updated.

---

## 6. Continuity Store Updates

**File:** `src/store/missionFlow/continuity.ts`

The continuity store tracks:
- Mission flow context (operationId, caseId, signalId) — **unchanged** (still used in Mission Mode)
- Checkpoint (last visited route, expires 24h) — **update paths**

Update `missionRoutePaths` const:
```typescript
// Keep for Mission Mode
const missionRoutePaths = ['/mission/brief', ...] as const;

// Add for primary nav
const appRoutePaths = ['/train', '/review', '/progress', '/profile'] as const;
```

Update `getMissionResumeTarget` to return `/train` as default instead of `/mission/brief`:
```typescript
export const getResumeTarget = (fallback = '/train'): string => { ... };
```

---

## 7. Onboarding Flow Updates

The guidance overlay currently says "Train 19 Disciplines. Track Your Growth." and
offers "Start Training Now" (fast-path to `/mission/training`).

**Update:**
- Fast-path destination: `/mission/training` → `/train`
- "Choose Your Focus First" flow: archetype → handler → lands at `/train` (not `/mission/brief`)
- Remove `MissionIntakePanel` from default flow (it's mission-specific)

---

## 8. Mobile Tab Bar

**File:** Identify current mobile nav component:

```bash
grep -rn "isMobile" src/pages/MissionFlow/MissionShell.tsx
```

The mobile layout currently shows fewer tabs with an "Actions" button for the palette.
Update to show 4 primary tab icons with optional Mission Mode expansion.

---

## 9. Keyboard Shortcuts

**Current (MissionShell L286-298):** ⌘K for palette, Escape to close.

Tab-number shortcuts (if they exist) need remapping. Currently the palette is the
primary keyboard nav mechanism — keep ⌘K, update palette actions.

---

## Implementation Order

```
Day 1:   Create AppShell.tsx (stripped MissionShell, 4 tabs)
Day 2:   Update Routes.tsx (new routes + legacy redirects)
Day 3:   Update navigate() calls across codebase
Day 4:   Update telemetry route paths
Day 5:   Update continuity store + onboarding flow
Day 6:   Mobile nav updates
Day 7-8: Mission Mode toggle in Profile
Day 9-11: E2E test updates (all 7 spec files reference routes)
Day 12:  Unit test updates for MissionShell/AppShell
Day 13:  Smoke test full flow, fix edge cases
```
