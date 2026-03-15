# Effectiveness Overhaul — Progress Tracker

> Baseline: **4.8 / 10** → Current: **7.95 / 10** → Target: **7.0+** ✅
> Estimated timeline: **4–8 months**
> Total items: 297 tasks across 5 stages + 122-task Starcom Academy refit

---

## Stage 1 — Drill Enforcement _(Weeks 1–3)_

### Phase 1.1 — Design Decisions

#### Step 1.1.1 — Resolve Open Questions

- [x] `001` Decide checkbox unlock strategy (recommended: panel-opened)
- [x] `002` Decide minimum engagement time formula (recommended: `steps × 15s`)
- [x] `003` Decide mastery confirmation model (recommended: self-reported at SR ≥ 2)
- [x] `004` Decide mid-drill interruption policy (recommended: pause on route leave)
- [x] `005` Decide legacy data handling (recommended: ignore legacy, new rules forward-only)
- [x] `006` Decide SR quality signal source (recommended: hybrid — completion time + self-assessment)

### Phase 1.2 — Core Implementation

#### Step 1.2.1 — Default Drill Expansion

- [x] `007` Change `useState(false)` → `useState(true)` in DrillRunner.tsx L59 so exercises start expanded
- [x] `008` Remove manual expand/collapse toggle from drill step headers
- [x] `009` Add unit tests for default-expanded state

#### Step 1.2.2 — Gate Checkbox Behind Engagement

- [x] `010` Add `hasBeenOpened` ref tracking per exercise panel in DrillRunner.tsx L64-65
- [x] `011` Disable checkbox until `hasBeenOpened` is true
- [x] `012` Track per-panel scroll/visibility via IntersectionObserver or focus event
- [x] `013` Add unit tests for gated checkbox behavior
- [x] `014` Add E2E test: checkbox disabled until exercise panel viewed

#### Step 1.2.3 — Required Self-Assessment

- [x] `015` Add self-assessment prompt component (1–5 confidence scale)
- [x] `016` Inject self-assessment between drill completion and SR update
- [x] `017` Wire self-assessment result into `computeCardQuality` signal
- [x] `018` Store self-assessment in telemetry payload
- [x] `019` Add unit tests for self-assessment flow
- [x] `020` Add E2E test: self-assessment prompt appears after drill

#### Step 1.2.4 — Minimum Engagement Warning

- [x] `021` Compute expected engagement time as `steps × 15s`
- [x] `022` Track actual elapsed time per drill session in DrillRunner.tsx
- [x] `023` Show warning toast when user completes drill in < expected time
- [x] `024` Wire engagement time into telemetry event payload
- [x] `025` Add unit test: warning triggers when time < threshold
- [x] `026` Add E2E test: speed-run a drill, verify warning appears

#### Step 1.2.5 — ExerciseRenderer Completion Signals

- [x] `027` Add `onAllCompleted` callback prop to ExerciseRenderer (L255-258)
- [x] `028` Implement per-exercise completion tracking in ExerciseRenderer state
- [x] `029` Fire `onAllCompleted` only when all exercises in a step are interacted with
- [x] `030` Consume `onAllCompleted` in DrillRunner to gate step progression
- [x] `031` Add unit tests for ExerciseRenderer completion signal
- [x] `032` Add E2E test: step cannot advance until exercises completed

#### Step 1.2.6 — Per-Card SR Quality Signal

- [x] `033` Build `computeCardQuality()` function using engagement time + self-assessment + exercise completion
- [x] `034` Replace binary pass/fail SR update with quality-weighted interval calculation
- [x] `035` Update SR store to accept quality parameter
- [x] `036` Ensure backward compatibility with existing SR data
- [x] `037` Add unit tests for `computeCardQuality()` edge cases
- [x] `038` Add unit tests for quality-weighted SR interval calculation

#### Step 1.2.7 — Quiz Explanation Field

- [x] `039` Add optional `explanation` field to Quiz answer schema in schema-changes
- [x] `040` Auto-derive explanations from card `bulletpoints[0]` for existing quizzes
- [x] `041` Render explanation in QuizSurface after answer submission (correct + incorrect)
- [x] `042` Style explanation display (green border correct, amber border incorrect)
- [x] `043` Add unit tests for explanation auto-derivation
- [x] `044` Add unit tests for explanation rendering
- [x] `045` Add E2E test: answer quiz question, verify explanation shown

### Phase 1.3 — Test Impact

#### Step 1.3.1 — Modify Existing Tests

- [x] `046` Update DrillRunner unit tests for default-expanded behavior (17-21 tests)
- [x] `047` Update ExerciseRenderer unit tests for completion callback
- [x] `048` Update QuizSurface unit tests for explanation rendering
- [x] `049` Update SR store unit tests for quality-weighted updates

#### Step 1.3.2 — Add New Tests

- [x] `050` Create shared `completeDrill()` E2E helper in fixtures
- [x] `051` Add E2E test suite: drill enforcement gating (checkbox, time, assessment)
- [x] `052` Add E2E test suite: quiz explanation visibility
- [x] `053` Add integration tests: drill → SR quality → interval calculation
- [x] `054` Add 10-14 new unit tests per implementation-plan spec

#### Step 1.3.3 — Clean Up Obsolete Tests

- [x] `055` Remove tests that assert checkbox is freely clickable without engagement
- [x] `056` Remove tests that assert binary SR update (replaced by quality-weighted)

### Phase 1.4 — Validation & Measurement

#### Step 1.4.1 — Score Verification

- [x] `057` Run full unit test suite — all pass
- [x] `058` Run full E2E test suite — all pass
- [x] `059` Run TypeScript compiler — zero errors
- [x] `060` Run production build — clean
- [x] `061` Re-score drill execution dimension (target: 3/10 → 7/10)
- [x] `062` Update scoring in `docs/effectiveness-overhaul/README.md`

---

## Stage 2 — Content Pipeline _(Months 1–8)_

### Phase 2.1 — Schema Changes

#### Step 2.1.1 — Quiz Explanation Field

- [x] `063` Add `explanation?: string` to quiz answer type definition
- [x] `064` Update `EXERCISE_LABELS` map — add `scenario: '🎯 Scenario'`
- [x] `065` Validate no data migration needed (additive-only change)

#### Step 2.1.2 — Scenario Exercise Type

- [x] `066` Define `ScenarioExercise` type with `prompt`, `choices[]`, `correctChoiceIndex`
- [x] `067` Add scenario exercise to `ExerciseType` union
- [x] `068` Build `generateMCFromScenario()` in quizGenerator.ts
- [x] `069` Add scenario exercise renderer component in ExerciseRenderer
- [x] `070` Add unit tests for scenario exercise type

#### Step 2.1.3 — Key Term Validation

- [x] `071` Build `validateKeyTerms()` function — detect 2-word fragments, too-short/generic terms
- [x] `072` Add unit tests for key term validation rules

#### Step 2.1.4 — Summary Text Auto-Derive

- [x] `073` Build `deriveSummaryText()` function — auto-derive from `description + bulletpoints[0]`
- [x] `074` Decide build-time vs. runtime derivation
- [x] `075` Add unit tests for summary text derivation

### Phase 2.2 — Content Validation Tooling

#### Step 2.2.1 — Build Core Validation Script

- [x] `076` Create `scripts/validateContent.ts` — reads shard JSON, scores cards 0-10
- [x] `077` Output `artifacts/content-validation-report.json`
- [x] `078` Implement validation rule: `min-sentences` (description ≥ 2 sentences)
- [x] `079` Implement validation rule: `min-count` (bulletpoints ≥ 4 items)
- [x] `080` Implement validation rule: `min-word-count` (each bulletpoint ≥ 15 words)
- [x] `081` Implement validation rule: `no-title-substring` (bulletpoint ≠ title substring)
- [x] `082` Implement validation rule: `min-count` (exercises ≥ 2)
- [x] `083` Implement validation rule: `no-recall-template`
- [x] `084` Implement validation rule: `no-apply-template`
- [x] `085` Implement validation rule: `no-analyze-template`
- [x] `086` Implement validation rule: `no-selfcheck-template`
- [x] `087` Implement validation rule: `min-outcome-length` (expectedOutcome ≥ 50 chars)
- [x] `088` Implement validation rule: `outcome-not-bulletpoints`
- [x] `089` Implement validation rule: `type-diversity` (≥ 2 exercise types)
- [x] `090` Implement validation rule: `min-count` (keyTerms ≥ 3)
- [x] `091` Implement validation rule: `no-fragments` (no 2-word bulletpoint fragments)
- [x] `092` Implement validation rule: `min-count` (learningObjectives ≥ 3)
- [x] `093` Implement validation rule: `no-bloom-template`
- [x] `094` Implement validation rule: `measurable-verb` (starts with action verb)
- [x] `095` Implement validation rule: `present` (summaryText 140-280 chars)
- [x] `096` Implement validation rule: `min-cards` (≥ 5 cards per deck)

#### Step 2.2.2 — Build Template Detection Script

- [x] `097` Create `scripts/detectTemplates.ts`
- [x] `098` Implement 8 template patterns: `recall_template`, `apply_template`, `analyze_template`, `selfcheck_template`, `bloom_understand`, `bloom_apply`, `bloom_evaluate`, `vague_outcome`
- [x] `099` Output per-module/type template counts and total remediation estimate

#### Step 2.2.3 — Build Content Generation Pipeline

- [x] `100` Create `scripts/generateContent.ts` — AI-generates card JSON
- [x] `101` Integrate automated rubric validation (reject cards scoring < 6/10)
- [x] `102` Output to `generated-cards/{module}/{deck}.json` for human review
- [x] `103` Create per-module LLM system prompts with domain-specific context
- [x] `104` Integrate validation script with generation pipeline

#### Step 2.2.4 — Build Card Editor Tooling

- [x] `105` Build VS Code JSON schema for Card type (Option A)
- [ ] `106` Build VS Code preview panel reusing ExerciseRenderer
- [x] `107` Create card/exercise snippet templates for VS Code
- [ ] `108` _Deferred:_ Build standalone web card editor (Option B — 2-3 weeks if needed)

#### Step 2.2.5 — Build Quiz Quality Metrics

- [x] `109` Create `scripts/quizQualityReport.ts`
- [x] `110` Derive accuracy rate per card from telemetry
- [x] `111` Derive time-per-question per card from telemetry
- [x] `112` Derive retry rate per deck from telemetry
- [x] `113` Derive SR interval distribution per module from telemetry

#### Step 2.2.6 — CI Integration

- [x] `114` Create GitHub Actions workflow triggered on PR changes to `public/training_modules_shards/**`
- [x] `115` Run `validateContent.ts` in CI
- [x] `116` Fail PR if error count > 0

### Phase 2.3 — Domain Audit & Expansion Planning

#### Step 2.3.1 — Tier 1 Modules (Critical — Most Thin)

- [x] `117` Audit & plan expansion: Cybersecurity Fundamentals
- [x] `118` Audit & plan expansion: Investigative Techniques
- [x] `119` Audit & plan expansion: Digital Forensics
- [x] `120` Audit & plan expansion: Financial Crimes Investigation
- [x] `121` Audit & plan expansion: Criminal Psychology

#### Step 2.3.2 — Tier 2 Modules (Medium Priority)

- [x] `122` Audit & plan expansion: Emergency Response
- [x] `123` Audit & plan expansion: Geopolitical Analysis
- [x] `124` Audit & plan expansion: Intelligence Analysis
- [x] `125` Audit & plan expansion: Legal Framework
- [x] `126` Audit & plan expansion: Physical Fitness
- [x] `127` Audit & plan expansion: Surveillance & Counter-Surveillance
- [x] `128` Audit & plan expansion: Counter-Terrorism
- [x] `129` Audit & plan expansion: Tactical Operations

#### Step 2.3.3 — Tier 3 Modules (Acceptable Depth)

- [x] `130` Audit & plan expansion: Communication Skills
- [x] `131` Audit & plan expansion: Covert Operations
- [x] `132` Audit & plan expansion: Ethical Decision Making
- [x] `133` Audit & plan expansion: Leadership & Team Dynamics
- [x] `134` Audit & plan expansion: Protective Security
- [x] `135` Audit & plan expansion: Weapons & Defensive Tactics

#### Step 2.3.4 — Restructuring Candidates

- [x] `136` Evaluate splitting large modules (30+ cards) into sub-decks
- [x] `137` Evaluate merging tiny modules (< 10 cards) into parent topics

### Phase 2.4 — Pilot Content Authoring

#### Step 2.4.1 — Pilot Module 1: Cybersecurity Fundamentals

- [x] `138` Generate initial card batch via content pipeline
- [x] `139` Human review & editing pass
- [x] `140` Validate all cards score ≥ 6/10 on rubric
- [x] `141` Replace templated exercises with domain-specific exercises
- [x] `142` Add scenario exercises where applicable
- [x] `143` Add quiz explanations to all quiz answers
- [x] `144` Deploy pilot cards and gather telemetry

#### Step 2.4.2 — Pilot Module 2: Investigative Techniques

- [x] `145` Generate initial card batch via content pipeline
- [x] `146` Human review & editing pass
- [x] `147` Validate all cards score ≥ 6/10 on rubric
- [x] `148` Replace templated exercises with domain-specific exercises
- [x] `149` Add scenario exercises where applicable
- [x] `150` Add quiz explanations to all quiz answers
- [x] `151` Deploy pilot cards and gather telemetry

#### Step 2.4.3 — Pilot Retrospective

- [x] `152` Analyze telemetry from pilot modules (accuracy, time, retry rate)
- [x] `153` Compare pilot quiz metrics to pre-overhaul baseline
- [x] `154` Refine AI prompts and rubric based on pilot learnings
- [x] `155` Document authoring process improvements

### Phase 2.5 — Scale Content Authoring

#### Step 2.5.1 — Tier 1 Remaining Modules

- [x] `156` Author: Digital Forensics (generate → review → validate → deploy)
- [x] `157` Author: Financial Crimes Investigation
- [x] `158` Author: Criminal Psychology

#### Step 2.5.2 — Tier 2 Modules

- [x] `159` Author: Emergency Response
- [x] `160` Author: Geopolitical Analysis
- [x] `161` Author: Intelligence Analysis
- [x] `162` Author: Legal Framework
- [x] `163` Author: Physical Fitness
- [x] `164` Author: Surveillance & Counter-Surveillance
- [x] `165` Author: Counter-Terrorism
- [x] `166` Author: Tactical Operations

#### Step 2.5.3 — Tier 3 Modules

- [x] `167` Author: Communication Skills
- [x] `168` Author: Covert Operations
- [x] `169` Author: Ethical Decision Making
- [x] `170` Author: Leadership & Team Dynamics
- [x] `171` Author: Protective Security
- [x] `172` Author: Weapons & Defensive Tactics

### Phase 2.6 — Content Validation & Measurement

#### Step 2.6.1 — Final Quality Gate

- [x] `173` Run `validateContent.ts` across all 19 modules — zero errors
- [x] `174` Run `detectTemplates.ts` — zero templated exercises remaining
- [x] `175` Run `quizQualityReport.ts` — all modules meet quality thresholds
- [x] `176` Verify total card count target (~5,500-6,400 cards)

#### Step 2.6.2 — Score Verification

- [x] `177` Re-score content quality dimension (target: 2/10 → 7/10)
- [x] `178` Re-score quiz effectiveness dimension (maintain 7/10 or improve)
- [x] `179` Update scoring in `docs/effectiveness-overhaul/README.md`

---

## Stage 3 — Shell Simplification _(Weeks 3–7, parallel with Stage 2 tooling)_

### Phase 3.1 — Information Architecture Design

#### Step 3.1.1 — Tab & Surface Mapping

- [x] `180` Design Train tab surface — module browser, deck selection, drill, quiz, TodayLauncher
- [x] `181` Design Train tab sub-routes — `/train`, `/train/module/:moduleId`, `/train/deck/:deckId`, `/train/drill`, `/train/quiz`
- [x] `182` Design Review tab surface — SR due cards, review quiz, future flashcard mode
- [x] `183` Design Review tab sub-routes — `/review`, `/review/quiz`, `/review/flashcards`
- [x] `184` Design Progress tab surface — StatsSurface, charts, XP, badges, challenges
- [x] `185` Design Profile tab surface — identity, settings, data management, journal, Mission Mode toggle
- [x] `186` Design Profile sub-routes — `/profile`, `/profile/edit`, `/profile/journal`, `/profile/data`
- [x] `187` Map all 10 current surfaces to 4 new tabs (document surface disposition)

#### Step 3.1.2 — Mission Mode Design

- [x] `188` Design Mission Mode toggle — off by default, Profile → Settings, persisted localStorage
- [x] `189` Design Mission Mode secondary nav bar — Brief → Triage → Case → Signal → Debrief
- [x] `190` Decide route accessibility policy (recommended: routes always accessible, toggle controls tab visibility)

#### Step 3.1.3 — Mobile & Interaction Design

- [x] `191` Design mobile bottom nav — 4 icons (📚 Train, 🔄 Review, 📊 Progress, 👤 Profile)
- [x] `192` Update MissionActionPalette design — default mode vs Mission Mode action sets
- [x] `193` Design keyboard shortcuts — ⌘1-4 default, ⌘5-0 Mission Mode

### Phase 3.2 — AppShell Implementation

#### Step 3.2.1 — Create AppShell Component

- [x] `194` Create `src/pages/AppShell/AppShell.tsx` (~250 lines, simplified from MissionShell 654 lines)
- [x] `195` Implement `primaryTabs` array — 4 tabs with paths, labels, icons
- [x] `196` Implement `missionTabs` array — 5 mission tabs with entity icons
- [x] `197` Implement tab array `useMemo` — conditionally concat `missionTabs` when Mission Mode enabled
- [x] `198` Retain: Header, CelebrationLayer, 4-tab bar, Action Palette (⌘K), onboarding, mobile bottom nav
- [x] `199` Remove from MissionShell: stepTools, assistantCard, completedSteps, guidanceMode toggle

#### Step 3.2.2 — Route Configuration

- [x] `200` Build new route tree in Routes.tsx — all primary routes
- [x] `201` Add Mission Mode routes — `/mission/brief` through `/mission/debrief`
- [x] `202` Add legacy redirect routes — 5+ `<Navigate replace />` redirects
- [x] `203` Implement conditional redirect logic — mission routes redirect to `/train` only when Mission Mode off

#### Step 3.2.3 — MissionShell Deprecation

- [x] `204` Phase 1: Keep MissionShell for Mission Mode `/mission/*` routes; AppShell for primary tabs
- [x] `205` Phase 2: Extract assistantCard into standalone component
- [x] `206` Phase 2: Extract stepTools into standalone component
- [ ] `207` Phase 2: Delete MissionShell.tsx

### Phase 3.3 — Navigation Updates

#### Step 3.3.1 — Telemetry Updates

- [x] `208` Update `missionTelemetryContracts.ts` — add `appRoutePaths` const
- [x] `209` Update ~15-20 telemetry events referencing route paths (grep `route:` in `src/`)
- [x] `210` Build `buildAppTransitionPayload` — new transition payload builder for default mode

#### Step 3.3.2 — Navigate Call Updates

- [x] `211` Update `navigate()` calls in MissionShell.tsx (~10 calls) — replaced by AppShell
- [x] `212` Update `navigate()` calls in TodayLauncher.tsx (2-3 calls)
- [x] `213` Update `navigate()` calls in TrainingSurface.tsx (2-3 calls)
- [x] `214` Update `navigate()` call in MissionIntakePanel.tsx
- [x] `215` Update `navigate()` calls in useMissionFlowContinuity.ts (2-3 calls)
- [x] `216` Update `navigate()` calls in ~20 button/link components (search-and-replace)

#### Step 3.3.3 — Continuity & Onboarding

- [x] `217` Update continuity store — add `appRoutePaths`, update `getMissionResumeTarget` fallback to `/train`
- [x] `218` Update onboarding flow — fast-path → `/train`, remove `MissionIntakePanel` from default flow

#### Step 3.3.4 — Mobile & Keyboard

- [x] `219` Update mobile tab bar component — 4 primary tab icons
- [x] `220` Update keyboard shortcuts — ⌘1-4 primary, ⌘5-0 Mission Mode only

### Phase 3.4 — Migration

#### Step 3.4.1 — localStorage Migration

- [x] `221` Build `migrateNavStorage()` function — runs once on first AppShell load
- [x] `222` Migrate `mission:guidance-mode:v1` → `ptb:guidance-mode:v1`
- [x] `223` Migrate `ptb:mission-flow-checkpoint` → `ptb:app-checkpoint:v1` (map old paths to new)
- [x] `224` Drop `mission:step-complete:v1` key (mission-mode only)
- [x] `225` Keep path-independent keys unchanged: `mission:intake:v1`, `mission:fast-path:v1`, `mission:guidance-overlay:v1`, `ptb:mission-flow-context`

#### Step 3.4.2 — PWA & Deployment Migration

- [x] `226` Update `manifest.webmanifest` — `start_url` → `/train`, `scope` → `/`
- [x] `227` Check `sw.js` precache paths — verify navigation fallback serves `index.html`
- [x] `228` Check `vercel.json` rewrite rules — extend for new paths if needed
- [x] `229` Add legacy `<Navigate replace />` routes in Routes.tsx (10 redirects: old → new)

#### Step 3.4.3 — Telemetry Data Continuity

- [x] `230` Decide telemetry continuity strategy (recommended: map in dashboards)
- [x] `231` Emit new route paths in telemetry events going forward
- [x] `232` Add old + new path aliases in dashboard queries
- [x] `233` Document path change date in telemetry audit report

### Phase 3.5 — Feature Flag & Rollback

#### Step 3.5.1 — Staged Rollout

- [x] `234` Implement feature flag `ptb:shell-v2` in localStorage
- [x] `235` Build `ShellLayout` gate component — renders AppShell or MissionShell based on flag
- [ ] `236` Test both shells in parallel for 2-4 weeks

#### Step 3.5.2 — Flag Removal

- [ ] `237` Confirm 2-4 weeks of stability
- [ ] `238` Remove `ptb:shell-v2` flag and `ShellLayout` gate
- [ ] `239` Always render AppShell

### Phase 3.6 — Test Updates

#### Step 3.6.1 — E2E Test Updates

- [x] `240` Create route mapping constant in `e2e/fixtures/` — all new paths
- [x] `241` Update `00-smoke-gate.spec.ts` — URLs and selectors
- [x] `242` Update `01-first-contact.spec.ts` — onboarding flow targets
- [x] `243` Update `02-impatient-recruit.spec.ts` — drill route
- [x] `244` Update `03-daily-cycle.spec.ts` — mission route references
- [x] `245` Update `04-mission-loop.spec.ts` — mission cycle routes, Mission Mode toggle
- [x] `246` Update `05-knowledge-retention.spec.ts` — quiz route
- [x] `247` Update `06-proving-yourself.spec.ts` — stats/profile routes
- [x] `248` Update E2E seed helpers — all `page.goto('/mission/...')` calls

#### Step 3.6.2 — Unit Test Updates

- [x] `249` Update ~8 MissionShell tests for route/tab assertion changes
- [x] `250` Add AppShell unit tests — tab rendering, Mission Mode toggle, route matching

### Phase 3.7 — Validation & Measurement

#### Step 3.7.1 — Score Verification

- [x] `251` Run full unit test suite — all pass
- [x] `252` Run full E2E test suite — all pass
- [x] `253` Run TypeScript compiler — zero errors
- [x] `254` Run production build — clean
- [x] `255` Verify localStorage migration works for existing users
- [x] `256` Re-score shell/navigation dimension (target: 7/10 → 9/10)
- [x] `257` Update scoring in `docs/effectiveness-overhaul/README.md`

---

## Stage 4 — Quiz System Enhancement (Score 7→8)

> **Goal:** Improve quiz system from 7/10 to 8/10 (20% weight = +0.20 → overall 7.30→7.50)

### Phase 4.1 — Quiz Generator Improvements

#### Step 4.1.1 — Deduplication + Type Balance + SR Ordering

- [x] `258` Add per-card+type deduplication to `generateQuiz()` via `seen` Set
- [x] `259` Implement type-balanced selection (at least 1 of each available type, then round-robin)
- [x] `260` Add optional `progressMap` parameter for SR-informed card ordering (struggling cards first)
- [x] `261` Preserve SR order when progressMap provided (skip shuffle)

### Phase 4.2 — Quiz Session Persistence

#### Step 4.2.1 — QuizSessionStore

- [x] `262` Create `QuizSessionStore` with `createStore` factory (key: `ptb:quiz-sessions:v1`, 50 max)
- [x] `263` Implement `record()`, `get()`, `list()`, `listBySource()`, `getWrongQuestions()`
- [x] `264` Add `cardAccuracy()` and `cardTiming()` analytics methods
- [x] `265` Record quiz sessions from `QuizRunner` results `useEffect`

### Phase 4.3 — Results Screen Enhancements

#### Step 4.3.1 — Retry Wrong Questions

- [x] `266` Add internal `questionPool` state for retry flow
- [x] `267` Add `handleRetryWrong` callback that filters to incorrect answers and resets quiz
- [x] `268` Render "Retry N Wrong Questions" button on results screen (hidden when 100%)

#### Step 4.3.2 — Per-Question Timing Display

- [x] `269` Add time summary (total + average) to results screen
- [x] `270` Show per-question timing badge in review list items
- [x] `271` Add CSS for `timeSummary`, `reviewTime`, `resultActions`, `secondaryBtn`

### Phase 4.4 — Integration + Tests

#### Step 4.4.1 — QuizSurface SR Integration

- [x] `272` Wire `QuizSurface.tsx` to build `progressMap` from `CardProgressStore.list()`
- [x] `273` Pass `progressMap` to `generateQuiz()` for SR-informed question ordering

#### Step 4.4.2 — Test Coverage

- [x] `274` Add QuizSessionStore unit tests (11 tests: CRUD, accuracy, timing, subscribe)
- [x] `275` Add QuizRunner tests for session recording, timing display, retry flow (5 tests)
- [x] `276` Add quizGenerator tests for dedup, type balance, SR ordering (4 tests)
- [x] `277` Fix QuizSurface test mock (add `list()` to CardProgressStore mock)
- [x] `278` Verify full test suite: 1,381 tests across 171 files — all passing
- [x] `279` TypeScript compiler check — zero errors
- [x] `280` Update scoring: Quiz 7→8, overall 7.30→7.50

---

## Stage 5 — Multi-Dimension Enhancement _(Drill 7→8, SR 7→8, Reflection 6→7)_

### Phase 5.1 — Drill Execution Enhancement (7→8)

#### Step 5.1.1 — Per-Card Quality Breakdown

- [x] `281` Add `cardBreakdown` state to DrillRunner tracking per-card quality (1-5)
- [x] `282` Render per-card breakdown panel after drill completion with color-coded badges (weak/ok/strong)
- [x] `283` Add CSS for `.cardBreakdown`, `.breakdownItem`, `.breakdownBadge[data-quality]`

#### Step 5.1.2 — Retry Weak Cards

- [x] `284` Add `buildDrillStepsFromCards(cardIds, maxCards?)` to drillStepBuilder
- [x] `285` Add "Retry N weak cards" button for cards with quality ≤ 2
- [x] `286` Wire `handleRetryWeak` callback to restart drill with weak-card steps

### Phase 5.2 — Reflection/AAR Enhancement (6→7)

#### Step 5.2.1 — Structured Mini-AAR

- [x] `287` Replace single notes textarea with 3-field structured reflection form
- [x] `288` Add "What went well?", "What was challenging?", "One thing to improve" fields
- [x] `289` Wire structured fields into `finalizeCompletion` to build combined notes string

### Phase 5.3 — Spaced Repetition Enhancement (7→8)

#### Step 5.3.1 — SR Forecast & Stats

- [x] `290` Add `forecastDue(days, now?)` to CardProgressStore — bucket cards by due-day
- [x] `291` Add `getOverallStats()` to CardProgressStore — total/due/learning/mature/new/avgEase/lapses
- [x] `292` Add SR Health Stats panel to ReviewDashboard (Mature/Learning/New with color coding)
- [x] `293` Add 7-day forecast bar chart to ReviewDashboard
- [x] `294` Add CSS for `.srStats`, `.forecast`, `.forecastBars`, `.forecastCol`, `.forecastBar`

### Phase 5.4 — Test Coverage & Scoring

- [x] `295` Fix existing test regressions (DrillRunner + ReviewDashboard test ambiguities)
- [x] `296` Add 21 new tests: forecastDue (6), getOverallStats (5), buildDrillStepsFromCards (9), ReviewDashboard mock update (1)
- [x] `297` Update scoring: Drill 7→8, SR 7→8, Reflection 6→7, overall 7.50→7.95

---

## Stage 6 — Starcom Academy Refit _(1 session)_

> **Goal:** Transform "Archangel Knights Training Console" into "Starcom Academy" — Earth Alliance officer training platform. 122 tasks across 7 phases. Full plan: [starcom-academy-refit.md](starcom-academy-refit.md)

### Phase 6.1–6.4 — Identity & Terminology Refits

- [x] `R01` Phase 1 — App Identity: title, manifest, header, loading, install banner, fixtures → "Starcom Academy" (26 tasks)
- [x] `R02` Phase 2 — Operative → Cadet: identity card, sovereignty panel, badges, mission shell SOP (21 tasks)
- [x] `R03` Phase 3 — Handler → Instructor: picker, profile, recap variants (9 tasks)
- [x] `R04` Phase 4 — Archetype → Division, Mission Mode → Active Duty: picker, profile, app shell, challenges, milestones (15 tasks)

### Phase 6.5 — Data Refit

- [x] `R05` 8 archetypes renamed + descriptions rewritten (Search & Rescue, CyberCom, Psi Corps, Intelligence Division, Engineering Corps, GroundForce, Fleet Command, Diplomatic Corps)
- [x] `R06` 5 handlers renamed + descriptions rewritten (Commander Tygan, Lt. Commander Tho'ra, Professor Van Dekar, Agent Simon, Captain Raynor)
- [x] `R07` Milestones standardised to Cadet → Ensign → Lieutenant → Commander rank structure
- [x] `R08` All test assertions updated for new names (~25 replacements across 11 test files)

### Phase 6.6 — Discipline Labels

- [x] `R09` Optional `label` field on `DisciplineVisual`, `getDisciplineLabel()` helper
- [x] `R10` Starcom labels: Fleet Ops, Psi Corps Training, Tactical Doctrine, Division Command

### Phase 6.7 — Polish

- [x] `R11` Documentation batch update: ~86 references across 22 doc files updated
- [x] `R12` SovereigntyPanel JSDoc comment cleanup
- [x] `R13` README rewrite: new archetype table, handler table, narrative framing
- [ ] `R14` Logo & icon assets (deferred — requires design work)

### Verification

- [x] `R15` All 1,402 unit tests passing after Phases 1–6
- [x] `R16` Refit plan: 122/122 tasks checked

---

## Stage 7 — Mobile-First E2E Tests

### Phase 1: Mobile Test Infrastructure

#### Step 7.1.1 — Mobile Fixtures & Story Plan

- [x] `M01` Audit existing E2E coverage (170 unit, 8 E2E specs, 10 stories)
- [x] `M02` Create mobile assertion fixtures (`e2e/fixtures/mobile.ts`): tap targets, viewport, overflow, scrollability
- [x] `M03` Create Story 10 plan doc (`docs/ui-test-plan/stories/10-mobile-first.md`)

#### Step 7.1.2 — Mobile Navigation Tests (10.1–10.4)

- [x] `M04` 10.1 — Hamburger menu visible at mobile width
- [x] `M05` 10.2 — Hamburger menu opens drawer and closes
- [x] `M06` 10.3 — BottomNav navigates between surfaces
- [x] `M07` 10.4 — No horizontal overflow on Brief surface

#### Step 7.1.3 — Mobile Onboarding Tests (10.5–10.8)

- [x] `M08` 10.5 — Welcome overlay buttons full-width and tappable
- [x] `M09` 10.6 — Archetype cards render in scrollable 2-column grid
- [x] `M10` 10.7 — Archetype confirm/skip buttons meet 44px tap target
- [x] `M11` 10.8 — Handler cards are single-column and scrollable

### Phase 2: Mobile Drill & Quiz

#### Step 7.2.1 — Mobile Drill Tests (10.9–10.11)

- [x] `M12` 10.9 — DrillRunner content scrollable, not clipped
- [x] `M13` 10.10 — Self-assessment rating buttons tappable
- [x] `M14` 10.11 — Rest interval visible after recording

#### Step 7.2.2 — Mobile Mission Loop Tests (10.12–10.13)

- [x] `M15` 10.12 — stepActions don't push content below fold
- [x] `M16` 10.13 — Step action buttons are reachable

#### Step 7.2.3 — Mobile Quiz Tests (10.14–10.15)

- [x] `M17` 10.14 — Quiz option buttons full-width and tappable
- [x] `M18` 10.15 — Next Question button reachable after answering

### Phase 3: Mobile Stats & Accessibility

#### Step 7.3.1 — Mobile Stats Tests (10.16–10.18)

- [x] `M19` 10.16 — Stats surface renders without horizontal overflow
- [x] `M20` 10.17 — Activity heatmap renders at mobile width
- [x] `M21` 10.18 — Profile editor usable at mobile width

#### Step 7.3.2 — Mobile Accessibility Audits (10.19–10.21)

- [x] `M22` 10.19 — Mobile onboarding passes axe audit
- [x] `M23` 10.20 — Mobile drill passes axe audit
- [x] `M24` 10.21 — Mobile stats passes axe audit

### Bug Fixes Discovered During Testing

- [x] `M25` Fix TrainingSurface unmounting DrillRunner on completion in v2 shell
- [x] `M26` Add `disableRules` option to `scanAccessibility` fixture

### Verification

- [x] `M27` All 21 mobile-first E2E tests passing
- [x] `M28` All 1,402 unit tests still passing
- [x] `M29` Existing E2E suites regression clean (Story 04: 11/11 pass)

---

## Summary

| Stage | Phases | Steps | Tasks | Timeline |
|-------|--------|-------|-------|----------|
| 1 — Drill Enforcement | 4 | 14 | 62 | Weeks 1–3 |
| 2 — Content Pipeline | 6 | 17 | 117 | Months 1–8 |
| 3 — Shell Simplification | 7 | 18 | 78 | Weeks 3–7 |
| 4 — Quiz Enhancement | 4 | 6 | 23 | 1 session |
| 5 — Multi-Dimension Enhancement | 3 | 5 | 17 | 1 session |
| 6 — Starcom Academy Refit | 7 | 16 | 122 | 1 session |
| 7 — Mobile-First E2E Tests | 3 | 8 | 29 | 1 session |
| **Total** | **34** | **84** | **448** | **4–8 months** |

### Completion Formula

$$\text{Progress} = \frac{\text{checked tasks}}{297} \times 100\%$$

### Milestone Checkpoints

| Milestone | Task Range | Gate |
|-----------|-----------|------|
| Drill enforcement code complete | `001`–`056` | All unit + E2E pass |
| Drill enforcement scored | `057`–`062` | Drill dimension ≥ 7/10 |
| Content tooling operational | `063`–`116` | CI blocks low-quality PRs |
| Pilot modules shipped | `138`–`155` | 2 modules score ≥ 6/10 avg |
| All content authored | `156`–`179` | Content dimension ≥ 7/10 |
| AppShell deployed | `194`–`239` | Feature flag removed |
| Shell tests green | `240`–`257` | Shell dimension ≥ 9/10 |
| Quiz enhancement complete | `258`–`280` | Quiz dimension ≥ 8/10 |
| Multi-dimension scored | `281`–`297` | Drill 8, SR 8, Reflection 7 |
