# Components & States Catalog

> Key interactive components and their visual states that beta tests must cover.

## Shell Components

### AppShell (v2)
- **File:** `src/pages/AppShell/AppShell.tsx`
- **States:** Normal (4 tabs) | Active Duty (4 + 5 mission tabs)
- **Sub-components:** `BottomNav`, `CommandPalette` (Ctrl+K)

### MissionShell (v1)
- **File:** `src/pages/MissionFlow/MissionShell.tsx`
- **States:** Normal | Onboarding gate (welcome overlay)
- **Sub-components:** Tab bar (10 tabs), `MissionHeader`, step-complete indicators

### BottomNav
- **File:** `src/pages/AppShell/BottomNav.tsx`
- **States:** 4 tabs (default) | 9 tabs (Active Duty enabled)
- **Badges:** Due-card count badge on Review tab

---

## Onboarding Components

### Welcome Overlay
- **States:** Visible (first visit) | Hidden (profile exists)
- **Interactions:** "Start Training Now" (fast path) | "Choose Your Focus First" (deliberate)

### Archetype Picker
- **States:** No selection | Selected (highlighted card) | Confirming
- **Content:** 8 archetype cards in responsive grid with descriptions

### Handler Picker
- **States:** No selection | Recommended pre-selected | User override
- **Content:** 5 instructor cards with recommendation badge

### Mission Intake Panel
- **States:** Shown | Skipped
- **Content:** 3 info blocks, "Start Training" / "Skip" buttons

### PostDrillArchetypePrompt
- **States:** Visible (fast-path user, first drill done) | Hidden
- **Trigger:** After first drill completion for users who skipped onboarding

---

## Training Components

### ModuleBrowser
- **File:** `src/components/ModuleBrowser/ModuleBrowser.tsx`
- **States:** Loading | Loaded (19 modules) | Welcome banner (first-time)
- **Per-module:** Domain name, card/deck counts, domain score, sparkline, selection checkbox, "Quick Train" button
- **Grouping:** Core / Secondary / Other (based on archetype)

### DeckBrowser
- **File:** `src/components/DeckBrowser/DeckBrowser.tsx`
- **States:** Loading | Loaded | Module not available
- **Content:** Breadcrumb, "Train entire module" button, per-deck cards
- **Per-deck:** Card preview (max 5), "Train this deck" button, selection toggle, due-card SR badge, "Quiz this deck" link

### DrillRunner
- **File:** `src/components/DrillRunner/DrillRunner.tsx` (643 lines)
- **States:**

| State | Visual | User Actions |
|---|---|---|
| No active drill | Empty state, "Start drill" CTA | Launch from kit/module/deck |
| Drill in progress | Step list with checkboxes, card content, running timer, discipline accent color | Toggle steps, expand/collapse cards |
| Engagement warning | Warning dialog | "Yes, continue" or "Go back and review" |
| Reflection form | 3 text fields + 1-5 rating | Fill text, select rating, "Record drill" |
| Completion feedback | XP toast, per-card quality badges | "Retry N weak cards" if any ≤2 |
| Post-drill archetype | Archetype picker (fast-path only) | Select archetype |
| Rest interval | 60s countdown, "Skip rest", hydration hint | Wait or skip |
| Sync required | Fallback for missing metadata | Continue with cached steps |

### ExerciseRenderer
- **States:** Varies by exercise type — interactive card content within drill steps

---

## Quiz Components

### QuizSurface
- **File:** `src/pages/MissionFlow/QuizSurface.tsx`
- **States:** Loading | Questions available | Empty ("Not enough card data") | Results
- **Question types:**
  - Multiple choice (select one answer)
  - True/false (binary select)
  - Fill-in-blank (text input)
  - Term match (pair matching)
- **Results screen:** Score, breakdown by type, time taken, "Retry wrong answers"

### ReviewDashboard
- **File:** `src/pages/AppShell/ReviewDashboard.tsx`
- **States:** No cards tracked | Cards due | All caught up
- **Content:** Due count, total tracked, health bars (Mature/Learning/New), 7-day forecast bar chart, per-module due breakdown, "Start Review" button

---

## Mission Phase Components

### BriefSurface
- **Sub-components:** `TodayLauncher`, `WeeklySummary`, `ReadinessPanel`, `MissionKitPanel`, `TimelineBand`, `MissionStepHandoff`
- **States:** Loaded with data | Empty (no mission data)

### TriageSurface
- **Sub-components:** `TriageBoard`
- **States:** Columns view / Feed view | Cozy density / Compact density | No items
- **Actions per item:** Acknowledge, Escalate, Defer, Resolve

### CaseSurface
- **Sub-components:** `ArtifactList`
- **States:** Artifacts available | No artifacts
- **Actions:** Mark reviewed, Promote

### SignalSurface
- **Sub-components:** `Signals` (form + list)
- **States:** Signals present | No signals
- **Signal lifecycle:** Open → Acknowledged → Resolved
- **Form fields:** Title, description, role

### ChecklistSurface
- **Contains:** `DrillRunner` (see above)

### DebriefSurface
- **Sub-components:** `DebriefClosureSummary`, `AAR`
- **States:** AARs present | No AARs
- **AAR fields:** Title, context, actions, outcomes, lessons, follow-ups, role

---

## Progression Components

### StatsSurface
- **Sub-components:** Quick stats, XP bar, `CompetencyChart` (radar), `ScoreLineChart` (trends), `ActivityHeatmap`, `BadgeGallery`, `ChallengeBoard`, `OperativeIdentityCard`, `ProfileEditor`, `SovereigntyPanel` (flagged)
- **States:** Fresh (few data points) | Active (growing data) | Veteran (full data)

### ProfileSurface (v2)
- **Content:** Cadet dossier, Active Duty toggle, Export Data button
- **Editing:** `ProfileEditor` — callsign text input, "Change archetype" button
- **States:** Profile set | No profile configured

### RecapModal / RecapToast
- **Trigger:** After milestone events (level up, badge unlock)
- **States:** Visible (animation) | Suppressed (quietMode on)

---

## Infrastructure Components

### NetworkStatusIndicator
- **States:** "Ready" (green pill) | "Offline, using cached intel" (red pill)
- **Position:** Fixed bottom-left

### ErrorBoundary
- **Levels:** Root ("System Fault Detected" + Reload) | Route ("Surface Error" + Retry/Reload)
- **Dev mode:** Shows error message text

### SurfaceLoader
- **Purpose:** Suspense fallback for lazy-loaded route components
- **Content:** Spinner with ARIA attributes

### LoadingMessage
- **Purpose:** App boot loading screen
- **Content:** Progress percentage (0-100%)

---

## Component Count Summary

| Category | Components | States |
|---|---|---|
| Shell / Navigation | 3 | 5 |
| Onboarding | 5 | 8 |
| Training | 4 | 12 |
| Quiz / Review | 2 | 7 |
| Mission Phases | 6 | 14 |
| Progression | 3 | 6 |
| Infrastructure | 4 | 6 |
| **Total** | **27** | **58** |
