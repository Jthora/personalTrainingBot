# Effectiveness Overhaul — Progress Tracker

> Baseline: **4.8 / 10** → Target: **7.0+**
> Estimated timeline: **4–8 months**
> Total items: 257 tasks across 3 stages

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

- [ ] `100` Create `scripts/generateContent.ts` — AI-generates card JSON
- [ ] `101` Integrate automated rubric validation (reject cards scoring < 6/10)
- [ ] `102` Output to `generated-cards/{module}/{deck}.json` for human review
- [ ] `103` Create per-module LLM system prompts with domain-specific context
- [ ] `104` Integrate validation script with generation pipeline

#### Step 2.2.4 — Build Card Editor Tooling

- [x] `105` Build VS Code JSON schema for Card type (Option A)
- [ ] `106` Build VS Code preview panel reusing ExerciseRenderer
- [x] `107` Create card/exercise snippet templates for VS Code
- [ ] `108` _Deferred:_ Build standalone web card editor (Option B — 2-3 weeks if needed)

#### Step 2.2.5 — Build Quiz Quality Metrics

- [ ] `109` Create `scripts/quizQualityReport.ts`
- [ ] `110` Derive accuracy rate per card from telemetry
- [ ] `111` Derive time-per-question per card from telemetry
- [ ] `112` Derive retry rate per deck from telemetry
- [ ] `113` Derive SR interval distribution per module from telemetry

#### Step 2.2.6 — CI Integration

- [x] `114` Create GitHub Actions workflow triggered on PR changes to `public/training_modules_shards/**`
- [x] `115` Run `validateContent.ts` in CI
- [x] `116` Fail PR if error count > 0

### Phase 2.3 — Domain Audit & Expansion Planning

#### Step 2.3.1 — Tier 1 Modules (Critical — Most Thin)

- [ ] `117` Audit & plan expansion: Cybersecurity Fundamentals
- [ ] `118` Audit & plan expansion: Investigative Techniques
- [ ] `119` Audit & plan expansion: Digital Forensics
- [ ] `120` Audit & plan expansion: Financial Crimes Investigation
- [ ] `121` Audit & plan expansion: Criminal Psychology

#### Step 2.3.2 — Tier 2 Modules (Medium Priority)

- [ ] `122` Audit & plan expansion: Emergency Response
- [ ] `123` Audit & plan expansion: Geopolitical Analysis
- [ ] `124` Audit & plan expansion: Intelligence Analysis
- [ ] `125` Audit & plan expansion: Legal Framework
- [ ] `126` Audit & plan expansion: Physical Fitness
- [ ] `127` Audit & plan expansion: Surveillance & Counter-Surveillance
- [ ] `128` Audit & plan expansion: Counter-Terrorism
- [ ] `129` Audit & plan expansion: Tactical Operations

#### Step 2.3.3 — Tier 3 Modules (Acceptable Depth)

- [ ] `130` Audit & plan expansion: Communication Skills
- [ ] `131` Audit & plan expansion: Covert Operations
- [ ] `132` Audit & plan expansion: Ethical Decision Making
- [ ] `133` Audit & plan expansion: Leadership & Team Dynamics
- [ ] `134` Audit & plan expansion: Protective Security
- [ ] `135` Audit & plan expansion: Weapons & Defensive Tactics

#### Step 2.3.4 — Restructuring Candidates

- [ ] `136` Evaluate splitting large modules (30+ cards) into sub-decks
- [ ] `137` Evaluate merging tiny modules (< 10 cards) into parent topics

### Phase 2.4 — Pilot Content Authoring

#### Step 2.4.1 — Pilot Module 1: Cybersecurity Fundamentals

- [ ] `138` Generate initial card batch via content pipeline
- [ ] `139` Human review & editing pass
- [ ] `140` Validate all cards score ≥ 6/10 on rubric
- [ ] `141` Replace templated exercises with domain-specific exercises
- [ ] `142` Add scenario exercises where applicable
- [ ] `143` Add quiz explanations to all quiz answers
- [ ] `144` Deploy pilot cards and gather telemetry

#### Step 2.4.2 — Pilot Module 2: Investigative Techniques

- [ ] `145` Generate initial card batch via content pipeline
- [ ] `146` Human review & editing pass
- [ ] `147` Validate all cards score ≥ 6/10 on rubric
- [ ] `148` Replace templated exercises with domain-specific exercises
- [ ] `149` Add scenario exercises where applicable
- [ ] `150` Add quiz explanations to all quiz answers
- [ ] `151` Deploy pilot cards and gather telemetry

#### Step 2.4.3 — Pilot Retrospective

- [ ] `152` Analyze telemetry from pilot modules (accuracy, time, retry rate)
- [ ] `153` Compare pilot quiz metrics to pre-overhaul baseline
- [ ] `154` Refine AI prompts and rubric based on pilot learnings
- [ ] `155` Document authoring process improvements

### Phase 2.5 — Scale Content Authoring

#### Step 2.5.1 — Tier 1 Remaining Modules

- [ ] `156` Author: Digital Forensics (generate → review → validate → deploy)
- [ ] `157` Author: Financial Crimes Investigation
- [ ] `158` Author: Criminal Psychology

#### Step 2.5.2 — Tier 2 Modules

- [ ] `159` Author: Emergency Response
- [ ] `160` Author: Geopolitical Analysis
- [ ] `161` Author: Intelligence Analysis
- [ ] `162` Author: Legal Framework
- [ ] `163` Author: Physical Fitness
- [ ] `164` Author: Surveillance & Counter-Surveillance
- [ ] `165` Author: Counter-Terrorism
- [ ] `166` Author: Tactical Operations

#### Step 2.5.3 — Tier 3 Modules

- [ ] `167` Author: Communication Skills
- [ ] `168` Author: Covert Operations
- [ ] `169` Author: Ethical Decision Making
- [ ] `170` Author: Leadership & Team Dynamics
- [ ] `171` Author: Protective Security
- [ ] `172` Author: Weapons & Defensive Tactics

### Phase 2.6 — Content Validation & Measurement

#### Step 2.6.1 — Final Quality Gate

- [ ] `173` Run `validateContent.ts` across all 19 modules — zero errors
- [ ] `174` Run `detectTemplates.ts` — zero templated exercises remaining
- [ ] `175` Run `quizQualityReport.ts` — all modules meet quality thresholds
- [ ] `176` Verify total card count target (~5,500-6,400 cards)

#### Step 2.6.2 — Score Verification

- [ ] `177` Re-score content quality dimension (target: 2/10 → 7/10)
- [ ] `178` Re-score quiz effectiveness dimension (maintain 7/10 or improve)
- [ ] `179` Update scoring in `docs/effectiveness-overhaul/README.md`

---

## Stage 3 — Shell Simplification _(Weeks 3–7, parallel with Stage 2 tooling)_

### Phase 3.1 — Information Architecture Design

#### Step 3.1.1 — Tab & Surface Mapping

- [ ] `180` Design Train tab surface — module browser, deck selection, drill, quiz, TodayLauncher
- [ ] `181` Design Train tab sub-routes — `/train`, `/train/module/:moduleId`, `/train/deck/:deckId`, `/train/drill`, `/train/quiz`
- [ ] `182` Design Review tab surface — SR due cards, review quiz, future flashcard mode
- [ ] `183` Design Review tab sub-routes — `/review`, `/review/quiz`, `/review/flashcards`
- [ ] `184` Design Progress tab surface — StatsSurface, charts, XP, badges, challenges
- [ ] `185` Design Profile tab surface — identity, settings, data management, journal, Mission Mode toggle
- [ ] `186` Design Profile sub-routes — `/profile`, `/profile/edit`, `/profile/journal`, `/profile/data`
- [ ] `187` Map all 10 current surfaces to 4 new tabs (document surface disposition)

#### Step 3.1.2 — Mission Mode Design

- [ ] `188` Design Mission Mode toggle — off by default, Profile → Settings, persisted localStorage
- [ ] `189` Design Mission Mode secondary nav bar — Brief → Triage → Case → Signal → Debrief
- [ ] `190` Decide route accessibility policy (recommended: routes always accessible, toggle controls tab visibility)

#### Step 3.1.3 — Mobile & Interaction Design

- [ ] `191` Design mobile bottom nav — 4 icons (📚 Train, 🔄 Review, 📊 Progress, 👤 Profile)
- [ ] `192` Update MissionActionPalette design — default mode vs Mission Mode action sets
- [ ] `193` Design keyboard shortcuts — ⌘1-4 default, ⌘5-0 Mission Mode

### Phase 3.2 — AppShell Implementation

#### Step 3.2.1 — Create AppShell Component

- [ ] `194` Create `src/pages/AppShell/AppShell.tsx` (~250 lines, simplified from MissionShell 654 lines)
- [ ] `195` Implement `primaryTabs` array — 4 tabs with paths, labels, icons
- [ ] `196` Implement `missionTabs` array — 5 mission tabs with entity icons
- [ ] `197` Implement tab array `useMemo` — conditionally concat `missionTabs` when Mission Mode enabled
- [ ] `198` Retain: Header, CelebrationLayer, 4-tab bar, Action Palette (⌘K), onboarding, mobile bottom nav
- [ ] `199` Remove from MissionShell: stepTools, assistantCard, completedSteps, guidanceMode toggle

#### Step 3.2.2 — Route Configuration

- [ ] `200` Build new route tree in Routes.tsx — all primary routes
- [ ] `201` Add Mission Mode routes — `/mission/brief` through `/mission/debrief`
- [ ] `202` Add legacy redirect routes — 5+ `<Navigate replace />` redirects
- [ ] `203` Implement conditional redirect logic — mission routes redirect to `/train` only when Mission Mode off

#### Step 3.2.3 — MissionShell Deprecation

- [ ] `204` Phase 1: Keep MissionShell for Mission Mode `/mission/*` routes; AppShell for primary tabs
- [ ] `205` Phase 2: Extract assistantCard into standalone component
- [ ] `206` Phase 2: Extract stepTools into standalone component
- [ ] `207` Phase 2: Delete MissionShell.tsx

### Phase 3.3 — Navigation Updates

#### Step 3.3.1 — Telemetry Updates

- [ ] `208` Update `missionTelemetryContracts.ts` — add `appRoutePaths` const
- [ ] `209` Update ~15-20 telemetry events referencing route paths (grep `route:` in `src/`)
- [ ] `210` Build `buildAppTransitionPayload` — new transition payload builder for default mode

#### Step 3.3.2 — Navigate Call Updates

- [ ] `211` Update `navigate()` calls in MissionShell.tsx (~10 calls) — replaced by AppShell
- [ ] `212` Update `navigate()` calls in TodayLauncher.tsx (2-3 calls)
- [ ] `213` Update `navigate()` calls in TrainingSurface.tsx (2-3 calls)
- [ ] `214` Update `navigate()` call in MissionIntakePanel.tsx
- [ ] `215` Update `navigate()` calls in useMissionFlowContinuity.ts (2-3 calls)
- [ ] `216` Update `navigate()` calls in ~20 button/link components (search-and-replace)

#### Step 3.3.3 — Continuity & Onboarding

- [ ] `217` Update continuity store — add `appRoutePaths`, update `getMissionResumeTarget` fallback to `/train`
- [ ] `218` Update onboarding flow — fast-path → `/train`, remove `MissionIntakePanel` from default flow

#### Step 3.3.4 — Mobile & Keyboard

- [ ] `219` Update mobile tab bar component — 4 primary tab icons
- [ ] `220` Update keyboard shortcuts — ⌘1-4 primary, ⌘5-0 Mission Mode only

### Phase 3.4 — Migration

#### Step 3.4.1 — localStorage Migration

- [ ] `221` Build `migrateNavStorage()` function — runs once on first AppShell load
- [ ] `222` Migrate `mission:guidance-mode:v1` → `ptb:guidance-mode:v1`
- [ ] `223` Migrate `ptb:mission-flow-checkpoint` → `ptb:app-checkpoint:v1` (map old paths to new)
- [ ] `224` Drop `mission:step-complete:v1` key (mission-mode only)
- [ ] `225` Keep path-independent keys unchanged: `mission:intake:v1`, `mission:fast-path:v1`, `mission:guidance-overlay:v1`, `ptb:mission-flow-context`

#### Step 3.4.2 — PWA & Deployment Migration

- [ ] `226` Update `manifest.webmanifest` — `start_url` → `/train`, `scope` → `/`
- [ ] `227` Check `sw.js` precache paths — verify navigation fallback serves `index.html`
- [ ] `228` Check `vercel.json` rewrite rules — extend for new paths if needed
- [ ] `229` Add legacy `<Navigate replace />` routes in Routes.tsx (10 redirects: old → new)

#### Step 3.4.3 — Telemetry Data Continuity

- [ ] `230` Decide telemetry continuity strategy (recommended: map in dashboards)
- [ ] `231` Emit new route paths in telemetry events going forward
- [ ] `232` Add old + new path aliases in dashboard queries
- [ ] `233` Document path change date in telemetry audit report

### Phase 3.5 — Feature Flag & Rollback

#### Step 3.5.1 — Staged Rollout

- [ ] `234` Implement feature flag `ptb:shell-v2` in localStorage
- [ ] `235` Build `ShellLayout` gate component — renders AppShell or MissionShell based on flag
- [ ] `236` Test both shells in parallel for 2-4 weeks

#### Step 3.5.2 — Flag Removal

- [ ] `237` Confirm 2-4 weeks of stability
- [ ] `238` Remove `ptb:shell-v2` flag and `ShellLayout` gate
- [ ] `239` Always render AppShell

### Phase 3.6 — Test Updates

#### Step 3.6.1 — E2E Test Updates

- [ ] `240` Create route mapping constant in `e2e/fixtures/` — all new paths
- [ ] `241` Update `00-smoke-gate.spec.ts` — URLs and selectors
- [ ] `242` Update `01-first-contact.spec.ts` — onboarding flow targets
- [ ] `243` Update `02-impatient-recruit.spec.ts` — drill route
- [ ] `244` Update `03-daily-cycle.spec.ts` — mission route references
- [ ] `245` Update `04-mission-loop.spec.ts` — mission cycle routes, Mission Mode toggle
- [ ] `246` Update `05-knowledge-retention.spec.ts` — quiz route
- [ ] `247` Update `06-proving-yourself.spec.ts` — stats/profile routes
- [ ] `248` Update E2E seed helpers — all `page.goto('/mission/...')` calls

#### Step 3.6.2 — Unit Test Updates

- [ ] `249` Update ~8 MissionShell tests for route/tab assertion changes
- [ ] `250` Add AppShell unit tests — tab rendering, Mission Mode toggle, route matching

### Phase 3.7 — Validation & Measurement

#### Step 3.7.1 — Score Verification

- [ ] `251` Run full unit test suite — all pass
- [ ] `252` Run full E2E test suite — all pass
- [ ] `253` Run TypeScript compiler — zero errors
- [ ] `254` Run production build — clean
- [ ] `255` Verify localStorage migration works for existing users
- [ ] `256` Re-score shell/navigation dimension (target: 7/10 → 9/10)
- [ ] `257` Update scoring in `docs/effectiveness-overhaul/README.md`

---

## Summary

| Stage | Phases | Steps | Tasks | Timeline |
|-------|--------|-------|-------|----------|
| 1 — Drill Enforcement | 4 | 14 | 62 | Weeks 1–3 |
| 2 — Content Pipeline | 6 | 17 | 117 | Months 1–8 |
| 3 — Shell Simplification | 7 | 18 | 78 | Weeks 3–7 |
| **Total** | **17** | **49** | **257** | **4–8 months** |

### Completion Formula

$$\text{Progress} = \frac{\text{checked tasks}}{257} \times 100\%$$

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
