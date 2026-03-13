# Product Scorecard — March 12, 2026

> Honest assessment of where the app stands after Stages 1–4 complete + Phase 5.1 (Quick Wins) + Phase 5.2 (Spaced Repetition Engine).
> Previous audit was pre-Stage-5. This reassesses every dimension against the same criteria.

---

## Executive Summary

**Overall: B- (up from C+)**

Phases 5.1 and 5.2 moved the needle significantly on the two weakest areas — the drill loop is no longer passive-only (SR scheduling now drives what you study) and the Training tab is no longer buried. But three D-grade areas remain untouched: quiz/active-testing mode doesn't exist, onboarding still gates value behind 4 screens, and user data has zero backup protection.

---

## Scorecard

| # | Area | Previous Grade | Current Grade | Delta | Rationale |
|---|---|---|---|---|---|
| 1 | Content depth | A- | **A-** | — | 4,354 cards, 11,732 exercises, 20,740 key terms, 13,030 learning objectives across 19 modules, 663 decks. Exercise prompts are functional but templated ("From memory, list the key points of…"). No new content since last audit. |
| 2 | Offline / PWA | A | **A** | — | SW v5, full precaching of all 19 module shards + static assets. Cache-first strategy. Offline indicator, install banner, update notification. The app works offline. No change. |
| 3 | Engineering quality | A | **A** | — | 1,095 tests across 149 files (up from 1,044/142). Strict TypeScript. ESLint. `createStore` factory pattern. Clean `tsc --noEmit`. Telemetry instrumentation. Feature flag system. Solid. |
| 4 | Core drill loop | C+ | **B-** | +1.5 | **Improved.** 4 entry points now (TodayLauncher, DeckBrowser, DrillRunner fallback, MissionKit). SR-aware card selection (due → unseen → future). XP visible at completion with level progress. 4 exercise types (Recall, Apply, Analyze, Self-Check). But still fundamentally self-assessment — no quiz mode, no scored right/wrong, no active retrieval testing. The self-check exercises are reveal-based prompts, not graded challenges. |
| 5 | Retention mechanics | D | **B** | +3 | **Major improvement.** Full SM-2 implementation (`srScheduler.ts`). Per-card progress store (10K LRU). Due/learning/mature classification. SR stats visible on ModuleBrowser tiles, DeckBrowser decks, TrainingSurface summary. Card selection prioritizes due cards. Missing: no per-card review history view, no "next review" date visibility, no review forecast timeline. |
| 6 | First-run experience | D | **D+** | +0.5 | **Minimal change.** TodayLauncher reduces taps-to-first-drill by 1 (Brief → tap CTA instead of navigating to Training tab). But onboarding still gates behind 4 screens: Guidance Overlay → Archetype Picker → Handler Picker → Mission Intake. Minimum 3 clicks to reach Brief. Jargon-heavy ("Psi Operative Super Hero Cyber Investigator Training"). No progressive disclosure. No value-first orientation. |
| 7 | Data safety | D | **D** | — | **No change.** All 18 stores are localStorage-only. No IndexedDB backup of user data (IDB is used for content caching only, not user state). No export/import. Clearing browser data = total loss of all progress, drill history, card SR state, XP, badges, streaks. P2P sync exists behind feature flag but is not a backup solution. |
| 8 | Gamification | B | **B** | — | XP system (35 base + 5/step), 500 XP/level. Daily streaks with freeze logic. 10 badge rules. Rotating challenges with claim flow. CelebrationLayer (level-up modal, badge toast, XP ticker). Streak/goal visibility in Stats. Inline XP gain shown in DrillRunner completion. Adequate but not expanding — badge catalog is small, no leaderboard, no social features. |
| 9 | Progress visualization | C- | **C** | +0.5 | **Slight improvement.** CompetencyChart shows per-domain scores with trend arrows. SR stats now visible (due/learning/mature counts on tiles). But still no historical time-series — no ProgressSnapshotStore, no sparklines, no activity heatmap. The user sees "where I am" but not "how I've improved over time." The habit hook is missing. |
| 10 | Navigation / IA | C+ | **B-** | +0.5 | **Improved.** Training tab moved to position 2 (was 9). TodayLauncher provides one-tap drill start from Brief. Command palette (⌘K) with keyword search. But 9 tabs is still a lot. No mobile bottom nav — tab overflow likely on small screens. No search within training content. |

---

## Grade Distribution

```
A  range: Content (A-), Offline (A), Engineering (A)
B  range: Retention (B), Gamification (B), Drill Loop (B-), Navigation (B-)
C  range: Progress Viz (C)
D  range: First-run (D+), Data Safety (D)
```

**Strengths (A-tier — 3/10):** Content, offline capability, and engineering remain rock-solid. These don't need investment.

**Improved (B-tier — 4/10):** Drill loop, retention, gamification, and navigation are all functional and improving. SR engine was the biggest single upgrade.

**Weak (C-tier — 1/10):** Progress visualization shows current state but no trajectory. Users can't feel themselves improving over time.

**Critical (D-tier — 2/10):** First-run experience and data safety are the remaining blockers. A new user hits a wall of jargon before seeing any value. And any returning user is one "clear browsing data" away from losing everything.

---

## What Changed Since Last Audit

### Phase 5.1 — Quick Wins (complete)
- Training tab promoted to position 2
- TodayLauncher CTA on BriefSurface — one-tap drill start
- XP visible in DrillRunner completion with level progress
- Fixed: Training Tab drills now actually award XP (was a bug)

### Phase 5.2 — Spaced Repetition Engine (complete)
- `srScheduler.ts` — Modified SM-2: 1-5 self-assessment → quality grades, 1d→3d→growth, 1.3 ease floor, 180d cap
- `CardProgressStore.ts` — Per-card SR state, 10K LRU, `recordReview()`, `getCardsDueForReview()`, `getModuleReviewStats()`
- DrillRunner integration — every card step records SR progress at drill completion
- SR-aware card selection — `drillStepBuilder.ts` prioritizes due → unseen → future
- UI surfaces — ModuleBrowser tiles show due/learning/mature, DeckBrowser shows per-deck due count, TrainingSurface shows aggregate summary

---

## Remaining Roadmap vs Impact

| Phase | Status | Effort | Primary Impact | Grade Lift |
|---|---|---|---|---|
| 5.3 Quiz Mode | Not started | 6–8 days | Drill Loop B- → B+, Retention B → A- | High |
| 5.4 Onboarding Streamline | Not started | 3–4 days | First-run D+ → B | High |
| 5.5 Progress Visualization | Not started | 3–4 days | Viz C → B+, Retention B → A- | Medium |
| 5.6 Data Safety | Not started | 2–3 days | Data Safety D → B | High (trust) |

### Recommended Priority Order

1. **5.4 Onboarding** — Fastest path to eliminating a D. 3–4 days to move first-run from D+ to B. Without this, every new user's first impression is jargon and configuration screens.

2. **5.6 Data Safety** — The other D. 2–3 days for IndexedDB backup + export/import. Without this, power users risk losing months of SR progress to a browser clear.

3. **5.3 Quiz Mode** — Transforms the drill loop from self-rated to scored. Highest ceiling impact (B- → B+ on loop, B → A- on retention). 6–8 days.

4. **5.5 Progress Viz** — The habit hook. Time-series charts and heatmap make progress *visible*. 3–4 days.

---

## Honest Bottom Line

The app went from "technically impressive encyclopedia" to "functional spaced repetition trainer." The SR engine is the foundation everything else builds on — it decides what you study and when. That's a real product now.

But two things would make me hesitate to recommend it to someone:

1. **First five minutes are bad.** New user hits "Psi Operative Super Hero Cyber Investigator Training" and a config gauntlet before seeing a single card. If they push through, the value is there. Most won't.

2. **No safety net.** Months of carefully-built SR intervals, XP, badges, and drill history live in localStorage with zero backup. One accidental clear or browser switch and it's gone. This erodes trust and makes the app feel disposable rather than valuable.

Fix those two and the overall grade moves from B- to solid B/B+.
