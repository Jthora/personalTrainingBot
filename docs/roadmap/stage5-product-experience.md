# Stage 5 — Product Experience Overhaul

> **Governing principle:** The app exists to help a real human actually learn 19 disciplines. Every change must close the gap between "technically functional" and "daily habit."
> **Depends on:** All of Stages 1–4 (content, domain tracking, wiring, training browser)
> **Estimated effort:** 4–6 weeks across 6 phases

---

## Context: Where We Are

Stages 1–4 built a complete engine: 4,354 enriched cards, 19-domain progress tracking, a training browser, offline PWA, gamification loop. The codebase is healthy (1,044 tests, clean TypeScript).

But an honest audit of the **user experience** reveals the engine is powering a C-grade product:

| Area | Current Grade | Target Grade | Key Gap |
|---|---|---|---|
| Content depth | A- | A | — (already strong) |
| Offline/PWA | A | A | — (already strong) |
| Engineering quality | A | A | — (already strong) |
| Core drill loop | C+ | **B+** | Passive learning → active retrieval |
| Retention mechanics | D | **B+** | No spaced repetition → SM-2 scheduling |
| First-run experience | D | **B** | Jargon-heavy onboarding → value-first flow |
| Data safety | D | **B** | localStorage-only → IndexedDB + export/import |

---

## Phase 5.1 — Quick Wins (~1–2 days)

> Three changes that immediately improve the experience with minimal risk. Combined, these fix the "user can't find the value" problem.

### Step 5.1.1 — Promote Training tab

**Problem:** Training is tab 9 of 9. The entire value proposition is hidden behind 6 mission-frame tabs (Brief, Triage, Case, Signal, Checklist, Debrief) + Stats + Plan.

**Fix:** Move Training to position #2 (after Brief). Brief provides orientation; Training provides value.

- [ ] 5.1.1.1 — In `MissionShell.tsx`, move Training tab from position 9 to position 2
- [ ] 5.1.1.2 — Update any hardcoded tab index references (if any)
- [ ] 5.1.1.3 — Test: tab order renders correctly, Training accessible via keyboard/mobile

**Files:** `src/pages/MissionFlow/MissionShell.tsx`

### Step 5.1.2 — "Start Today's Training" CTA

**Problem:** Every session requires the user to navigate Training → pick module → pick deck → launch drill. No one-tap entry.

**Fix:** Add a prominent CTA on BriefSurface that generates a kit (if needed) and launches the first drill.

- [ ] 5.1.2.1 — Add "Start Today's Training" button component to BriefSurface
- [ ] 5.1.2.2 — On tap: call `MissionKitStore.getPrimaryKit()` → take first incomplete drill → `DrillRunStore.start()` → navigate to `/mission/checklist`
- [ ] 5.1.2.3 — Show kit summary below button (e.g., "4 drills across Cybersecurity, Fitness, OSINT")
- [ ] 5.1.2.4 — Handle edge case: all drills complete → show "Session complete! Regenerate?" prompt
- [ ] 5.1.2.5 — Component test: CTA renders, launches first drill on click
- [ ] 5.1.2.6 — Component test: completed kit shows regenerate prompt

**Files:** `src/pages/MissionFlow/BriefSurface.tsx` (extend), new `src/components/TodayLauncher/TodayLauncher.tsx`

### Step 5.1.3 — XP award visibility

**Problem:** Drill completion says "XP awarded" but never shows how much or why. No dopamine trigger.

**Fix:** Show explicit "+N XP" in the completion recap with a brief animation.

- [ ] 5.1.3.1 — Calculate XP from drill metrics (step count × difficulty multiplier, or existing formula)
- [ ] 5.1.3.2 — Display XP amount in drill completion panel with count-up animation
- [ ] 5.1.3.3 — Show level progress bar delta ("Level 3 → 42% → 48%")
- [ ] 5.1.3.4 — Component test: XP value displays after completion

**Files:** `src/components/DrillRunner/DrillRunner.tsx`, `src/store/UserProgressStore.ts`

---

## Phase 5.2 — Spaced Repetition Engine (~8–10 days)

> The single highest-impact feature. Without SR, the app is an encyclopedia. With it, the app becomes a trainer that knows what you're about to forget.

### Step 5.2.1 — CardProgressStore

**What exists:** Stable card IDs on all 4,354 cards. `DrillHistoryStore` already records timestamps + self-assessment (1–5). `createStore` factory handles persistence.

**What's needed:** Per-card tracking of review intervals and scheduling.

- [ ] 5.2.1.1 — Create `src/store/CardProgressStore.ts` using `createStore` factory
- [ ] 5.2.1.2 — Define `CardProgressEntry` type:
  ```ts
  {
    cardId: string;
    moduleId: string;
    lastReviewedAt: string;   // ISO timestamp
    nextReviewAt: string;     // ISO timestamp
    interval: number;         // days until next review
    easeFactor: number;       // SM-2 ease factor (≥1.3)
    repetitions: number;      // consecutive correct reviews
    lapses: number;           // times the card was "forgotten" (rating 1-2)
  }
  ```
- [ ] 5.2.1.3 — Implement `recordReview(cardId, moduleId, quality)` — quality maps from self-assessment (1–5) to SM-2 response quality (0–5)
- [ ] 5.2.1.4 — Implement `getCardsDueForReview(moduleId?, limit?)` — returns cards where `nextReviewAt ≤ now`, sorted by most overdue first
- [ ] 5.2.1.5 — Implement `getCardProgress(cardId)` — returns current state for a single card
- [ ] 5.2.1.6 — Implement `getModuleReviewStats(moduleId)` — returns `{ due, learning, mature, total }`
- [ ] 5.2.1.7 — Cap store at 10,000 entries with LRU eviction (enough for all 4,354 cards with headroom)
- [ ] 5.2.1.8 — Unit tests: recordReview updates interval/easeFactor correctly, getCardsDueForReview returns overdue cards, LRU eviction works

**Files:** New `src/store/CardProgressStore.ts`, new `src/store/__tests__/CardProgressStore.test.ts`

### Step 5.2.2 — SM-2 scheduler

**Algorithm:** Modified SM-2 (Anki-style) mapped to our 1–5 self-assessment:

| Self-Assessment | Quality | SM-2 Meaning | Interval Effect |
|---|---|---|---|
| 1 | 0 | Complete failure | Reset to 1 day, lapse +1 |
| 2 | 1 | Serious struggle | Reset to 1 day, lapse +1 |
| 3 | 2 | Recalled with difficulty | Keep interval, ease −0.15 |
| 4 | 3 | Correct with hesitation | Interval × ease, ease −0.05 |
| 5 | 5 | Perfect recall | Interval × ease, ease +0.10 |

- [ ] 5.2.2.1 — Create `src/utils/srScheduler.ts` with `computeNextReview(entry, quality)` → returns updated `CardProgressEntry`
- [ ] 5.2.2.2 — New card schedule: 1 day → 3 days → (interval × easeFactor) increasing
- [ ] 5.2.2.3 — Minimum ease factor: 1.3 (prevents death spiral)
- [ ] 5.2.2.4 — Maximum interval cap: 180 days (ensures periodic re-exposure)
- [ ] 5.2.2.5 — Unit tests: new card progression, lapse resets, ease floor, interval cap (12+ tests)

**Files:** New `src/utils/srScheduler.ts`, new `src/utils/__tests__/srScheduler.test.ts`

### Step 5.2.3 — DrillRunner integration

**Bridge:** When a drill completes, persist per-card SR state based on the drill's self-assessment rating.

- [ ] 5.2.3.1 — In `DrillRunner.finalizeCompletion()`, after recording to `DrillHistoryStore`, iterate over completed steps with `cardId` and call `CardProgressStore.recordReview(cardId, moduleId, selfAssessment)`
- [ ] 5.2.3.2 — Handle missing self-assessment: default to quality 3 (neutral) if user skips rating
- [ ] 5.2.3.3 — Integration test: complete a drill with 3 card steps → 3 `CardProgressEntry` records created with correct intervals
- [ ] 5.2.3.4 — Integration test: repeat drill with low rating → interval resets, lapse increments

**Files:** `src/components/DrillRunner/DrillRunner.tsx` (extend `finalizeCompletion`)

### Step 5.2.4 — SR-aware drill step selection

**The payoff:** When building drill steps, prioritize cards that are due for review.

- [ ] 5.2.4.1 — In `buildDrillStepsFromModule()`, check `CardProgressStore.getCardsDueForReview(moduleId)` first
- [ ] 5.2.4.2 — Fill drill steps with due cards first, then unseen cards, then future-review cards
- [ ] 5.2.4.3 — In `buildDrillStepsFromDeck()`, same priority: due → unseen → future
- [ ] 5.2.4.4 — Unit test: due cards appear before unseen cards in step order
- [ ] 5.2.4.5 — Unit test: when no cards are due, unseen cards are selected

**Files:** `src/utils/drillStepBuilder.ts` (extend)

### Step 5.2.5 — Review stats in UI

- [ ] 5.2.5.1 — Add review stats to ModuleBrowser tiles: "12 due · 45 learning · 180 mature"
- [ ] 5.2.5.2 — Add "Due for review" badge on Training tab when any cards are overdue
- [ ] 5.2.5.3 — Add review forecast to DeckBrowser: per-deck due count
- [ ] 5.2.5.4 — Component test: ModuleBrowser shows correct due/learning/mature counts
- [ ] 5.2.5.5 — Component test: Training tab badge appears when cards due

**Files:** `src/components/ModuleBrowser/ModuleBrowser.tsx`, `src/pages/MissionFlow/MissionShell.tsx`, `src/components/DeckBrowser/DeckBrowser.tsx`

---

## Phase 5.3 — Quiz Mode (~6–8 days)

> Transforms passive reading into active retrieval. Uses the existing Exercise infrastructure (prompt/expectedOutcome/hints on every card).

### Step 5.3.1 — Quiz engine core

- [ ] 5.3.1.1 — Create `src/utils/quizGenerator.ts` with `generateQuizFromCard(card): QuizQuestion[]`
- [ ] 5.3.1.2 — Define `QuizQuestion` type:
  ```ts
  {
    id: string;
    cardId: string;
    type: 'multiple-choice' | 'fill-blank' | 'term-match' | 'true-false';
    prompt: string;
    options?: string[];       // for MC
    correctAnswer: string;
    hints: string[];
    source: 'exercise' | 'keyTerms' | 'bulletpoints' | 'learningObjectives';
  }
  ```
- [ ] 5.3.1.3 — Generate MC questions from `exercises[].prompt` + `expectedOutcome` (correct) + distractors from same-deck cards
- [ ] 5.3.1.4 — Generate term-match questions from `keyTerms` (match term to definition from bulletpoints)
- [ ] 5.3.1.5 — Generate fill-blank from `learningObjectives` (mask key phrase)
- [ ] 5.3.1.6 — Generate true-false from `bulletpoints` (flip one fact for false variant)
- [ ] 5.3.1.7 — Unit tests: each generator produces valid questions from sample cards (15+ tests)

**Files:** New `src/utils/quizGenerator.ts`, new `src/types/Quiz.ts`, new `src/utils/__tests__/quizGenerator.test.ts`

### Step 5.3.2 — Quiz runner component

- [ ] 5.3.2.1 — Create `src/components/QuizRunner/QuizRunner.tsx` — renders quiz questions one at a time
- [ ] 5.3.2.2 — MC mode: 4 option buttons, highlight correct/incorrect on select, next button
- [ ] 5.3.2.3 — Fill-blank mode: text input with fuzzy matching against `correctAnswer`
- [ ] 5.3.2.4 — Term-match mode: drag-or-tap matching pairs
- [ ] 5.3.2.5 — Progressive hints: "Need a hint?" button reveals hints one at a time
- [ ] 5.3.2.6 — Running score: "7/10 correct" with progress bar
- [ ] 5.3.2.7 — Create `QuizRunner.module.css`
- [ ] 5.3.2.8 — Component tests: renders questions, accepts answers, scores correctly, shows hints (10+ tests)

**Files:** New `src/components/QuizRunner/QuizRunner.tsx`, new `src/components/QuizRunner/QuizRunner.module.css`

### Step 5.3.3 — Quiz results + SR integration

- [ ] 5.3.3.1 — Quiz completion screen: score, time, per-question review (show correct answer for missed)
- [ ] 5.3.3.2 — Map quiz score to self-assessment: 90–100% → 5, 70–89% → 4, 50–69% → 3, 30–49% → 2, <30% → 1
- [ ] 5.3.3.3 — Feed per-card quiz result to `CardProgressStore.recordReview()` — correct = quality 4–5, incorrect = quality 1–2
- [ ] 5.3.3.4 — Record quiz completion to `DrillHistoryStore` with actual score (not self-rated)
- [ ] 5.3.3.5 — Integration test: quiz 10 cards → 7 correct → CardProgressStore has 7 entries with quality≥4, 3 entries with quality≤2

**Files:** QuizRunner (extend), `src/store/CardProgressStore.ts`, `src/store/DrillHistoryStore.ts`

### Step 5.3.4 — Quiz launch points

- [ ] 5.3.4.1 — Add "Quiz this deck" button in DeckBrowser (alongside "Train this deck")
- [ ] 5.3.4.2 — Add "Quick quiz" button in ModuleBrowser (10 questions from due + random cards)
- [ ] 5.3.4.3 — Add quiz mode to TodayLauncher: "Review" button that quizzes SR-due cards
- [ ] 5.3.4.4 — Route: `/mission/quiz` renders QuizRunner
- [ ] 5.3.4.5 — Component test: DeckBrowser quiz button generates questions and navigates

**Files:** `src/components/DeckBrowser/DeckBrowser.tsx`, `src/components/ModuleBrowser/ModuleBrowser.tsx`, `src/components/TodayLauncher/TodayLauncher.tsx`, Routes

---

## Phase 5.4 — Onboarding Streamline (~3–4 days)

> Cut the time-to-first-drill from ~3 minutes to <60 seconds. Show value before asking for configuration.

### Step 5.4.1 — "Try a drill first" fast path

**Problem:** Current onboarding gates: Guidance overlay → Archetype picker → Handler picker → Mission intake → Brief. User experiences zero training value before 4 configuration steps.

**Fix:** Offer a fast path that defers configuration.

- [ ] 5.4.1.1 — Add "Jump into training" option on the guidance overlay (alongside "Continue setup")
- [ ] 5.4.1.2 — Fast path skips archetype + handler + intake, sets temporary defaults (Generalist archetype)
- [ ] 5.4.1.3 — Fast path navigates directly to Training tab with a pre-selected "Starter" drill (10 cards from 3 popular modules)
- [ ] 5.4.1.4 — After first drill completion, prompt: "Ready to customize your training? Pick your archetype."
- [ ] 5.4.1.5 — Fast-path flag in localStorage, cleared once full onboarding completed
- [ ] 5.4.1.6 — Component test: fast path skips gates and lands on Training
- [ ] 5.4.1.7 — Component test: post-first-drill prompts archetype selection

**Files:** Onboarding components (guidance overlay, archetype picker), `src/pages/MissionFlow/TrainingSurface.tsx`

### Step 5.4.2 — Value-first orientation

- [ ] 5.4.2.1 — Replace "Guided Training Quick Start" bullet-point overlay with a 3-panel slideshow: (1) "Train 19 disciplines" with domain grid preview, (2) "Track your progress" with sample chart, (3) "Train offline anywhere" with PWA prompt
- [ ] 5.4.2.2 — Each panel has "Skip to training →" link
- [ ] 5.4.2.3 — Final panel has "Choose your focus" → archetype picker (now contextually motivated)
- [ ] 5.4.2.4 — Component test: slideshow renders 3 panels, skip link navigates to Training

**Files:** Onboarding guidance overlay component

### Step 5.4.3 — Archetype impact amplification

**Problem:** Archetype selection barely affects the experience. It changes some star markers and context hints, but doesn't meaningfully customize the curriculum.

**Fix:** Make archetype selection immediately visible in the training experience.

- [ ] 5.4.3.1 — After archetype selection, auto-select the archetype's core + secondary modules in `TrainingModuleCache`
- [ ] 5.4.3.2 — "Today's Training" kit uses archetype weighting (already implemented in missionKitGenerator — just ensure the CTA surfaces it)
- [ ] 5.4.3.3 — ModuleBrowser: archetype-core modules pinned to top with "Your focus" label
- [ ] 5.4.3.4 — Component test: archetype selection triggers module auto-selection

**Files:** Archetype picker component, `src/components/ModuleBrowser/ModuleBrowser.tsx`

---

## Phase 5.5 — Progress Visualization (~3–4 days)

> Show users they're improving. This is the habit hook — "I can see myself getting better."

### Step 5.5.1 — Score history over time

- [ ] 5.5.1.1 — Create `src/store/ProgressSnapshotStore.ts` — records daily domain score snapshots (one entry per day per active domain)
- [ ] 5.5.1.2 — Trigger snapshot on first drill completion each day (or on app open if drills were completed yesterday)
- [ ] 5.5.1.3 — Implement `getScoreHistory(moduleId, days)` — returns time-series for chart rendering
- [ ] 5.5.1.4 — Cap at 365 days of history per domain
- [ ] 5.5.1.5 — Unit tests: daily snapshots recorded, history returns correct time range

**Files:** New `src/store/ProgressSnapshotStore.ts`

### Step 5.5.2 — Progress charts

- [ ] 5.5.2.1 — Add line chart to Stats surface: per-domain score over last 30 days (SVG, no external chart library)
- [ ] 5.5.2.2 — Add sparklines to ModuleBrowser tiles: 7-day trend per domain
- [ ] 5.5.2.3 — Add weekly summary to BriefSurface: "This week: +12 pts Cybersecurity, +8 pts Fitness, started OSINT"
- [ ] 5.5.2.4 — Component tests: chart renders with mock data, sparklines appear on tiles

**Files:** Stats surface component, `src/components/ModuleBrowser/ModuleBrowser.tsx`, `src/pages/MissionFlow/BriefSurface.tsx`

### Step 5.5.3 — Review heatmap

- [ ] 5.5.3.1 — Add GitHub-style activity heatmap to Stats surface: color intensity = drills completed per day
- [ ] 5.5.3.2 — Show last 90 days in a grid (13 weeks × 7 days)
- [ ] 5.5.3.3 — Tooltip on hover/tap: "Mar 12: 4 drills, 32 cards reviewed"
- [ ] 5.5.3.4 — Component test: heatmap renders correct colors for sample data

**Files:** New `src/components/ActivityHeatmap/ActivityHeatmap.tsx`

---

## Phase 5.6 — Data Safety (~2–3 days)

> Protect against the #1 trust-killer: "I cleared my browser and lost everything."

### Step 5.6.1 — IndexedDB backup

**Problem:** All stores use localStorage via `createStore`. localStorage is synchronous, 5–10MB cap, cleared by "Clear browsing data."

**Fix:** Add IndexedDB as a persistent backup that survives most clear-data scenarios.

- [ ] 5.6.1.1 — Create `src/utils/backupManager.ts` — mirrors critical stores (DrillHistory, CardProgress, UserProgress, OperativeProfile) to IndexedDB
- [ ] 5.6.1.2 — Backup frequency: on every `DrillHistoryStore.record()` call (debounced 5s)
- [ ] 5.6.1.3 — On app startup: if localStorage is empty but IndexedDB has data, restore
- [ ] 5.6.1.4 — Integration test: clear localStorage → app restores from IndexedDB backup

**Files:** New `src/utils/backupManager.ts`

### Step 5.6.2 — Manual export/import

- [ ] 5.6.2.1 — Add "Export training data" button in Settings — exports all store data as JSON file download
- [ ] 5.6.2.2 — Add "Import training data" button — reads JSON, validates schema, merges into stores
- [ ] 5.6.2.3 — Include schema version in export for forward-compatibility
- [ ] 5.6.2.4 — Component test: export generates valid JSON with all store data
- [ ] 5.6.2.5 — Component test: import restores store state correctly

**Files:** Settings component (extend), new `src/utils/dataExporter.ts`

---

## Phase Summary

| Phase | Description | Effort | Score Impact |
|---|---|---|---|
| 5.1 | Quick Wins (tab reorder, CTA, XP visibility) | 1–2 days | First-run D→C+, Loop C+→B- |
| 5.2 | Spaced Repetition Engine | 8–10 days | Retention D→B+, Loop C+→B |
| 5.3 | Quiz Mode | 6–8 days | Loop B→B+, Retention B+→A- |
| 5.4 | Onboarding Streamline | 3–4 days | First-run C+→B |
| 5.5 | Progress Visualization | 3–4 days | Retention B+→A- |
| 5.6 | Data Safety | 2–3 days | Data safety D→B |
| **Total** | | **~23–31 days** | |

### Projected Score After Stage 5

| Area | Before | After | Change |
|---|---|---|---|
| Content depth | A- | A- | — |
| Offline/PWA | A | A | — |
| Engineering quality | A | A | — |
| Core drill loop | C+ | **B+** | Quiz mode + SR-aware step selection |
| Retention mechanics | D | **B+** | SM-2 spaced repetition + review stats |
| First-run experience | D | **B** | Fast-path onboarding + value-first orientation |
| Data safety | D | **B** | IndexedDB backup + export/import |

### Execution Order

```
Phase 5.1 (Quick Wins)        ──┐
                                 ├── Week 1
Phase 5.2.1–5.2.2 (SR store)  ──┘
Phase 5.2.3–5.2.5 (SR wiring) ──── Week 2
Phase 5.3.1–5.3.2 (Quiz core) ──── Week 3
Phase 5.3.3–5.3.4 (Quiz wire) ──┐
Phase 5.4 (Onboarding)        ──┼── Week 4
Phase 5.5 (Viz)                ──┘
Phase 5.6 (Data safety)       ──── Week 5
```

Each phase delivers standalone value — no phase depends on a later phase. Phase 5.1 ships first because it's the highest impact-to-effort ratio. Phase 5.2 (SR) is the single most important feature for the app's mission.
