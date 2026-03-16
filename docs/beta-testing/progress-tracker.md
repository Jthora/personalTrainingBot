# Beta Testing Suite — Progress Tracker

> Automated user simulation beta test suite for Starcom Academy.
> 8 scenarios, 21 tests, 148 screenshots, 16 a11y audits.
> **STATUS: ALL 269 TASKS COMPLETE — 21/21 tests passing (4.5m)**

---

## Stage 1 — Infrastructure

### Phase 1.1 — Directory Structure & Config

#### Step 1.1.1 — Create beta test directory tree
- [x] `B001` Create `e2e/beta/` directory
- [x] `B002` Create `e2e/beta/fixtures/` directory
- [x] `B003` Create `e2e/beta/scenarios/` directory

#### Step 1.1.2 — Playwright configuration
- [x] `B004` Create `e2e/beta/playwright.config.ts` — mobile-only (iPhone 14 Chromium), `workers: 1`, `fullyParallel: false`
- [x] `B005` Configure `testDir: './scenarios'`
- [x] `B006` Configure `webServer` reusing port 4199 (`npx vite preview`)
- [x] `B007` Configure reporters: `list` (terminal) + `html` (→ `artifacts/beta-report/`)
- [x] `B008` Configure `timeout: 60_000` (longer scenarios)
- [x] `B009` Configure `use.screenshot: 'off'` (managed by `betaStep`)
- [x] `B010` Wire `globalSetup` → `e2e/beta/global-setup.ts`
- [x] `B011` Wire `globalTeardown` → `e2e/beta/global-teardown.ts`

#### Step 1.1.3 — Global setup & teardown
- [x] `B012` Create `e2e/beta/global-setup.ts` — clear `artifacts/beta-screenshots/`, create 8 scenario subdirectories
- [x] `B013` Create `e2e/beta/global-teardown.ts` — generate `artifacts/beta-screenshots/index.html` gallery viewer
- [x] `B014` Gallery viewer: responsive grid, grouped by scenario, step names as captions, summary counters

### Phase 1.2 — Shared Fixtures

#### Step 1.2.1 — Beta assertion harness (`betaAssertions.ts`)
- [x] `B015` Create `e2e/beta/fixtures/betaAssertions.ts`
- [x] `B016` Implement `betaStep(page, name, fn)` — run fn, capture screenshot, check console errors, check overflow
- [x] `B017` Implement screenshot capture → `artifacts/beta-screenshots/{scenario}/{##}-{name}.png`
- [x] `B018` Implement console error collector — `page.on('console')` for `error` level
- [x] `B019` Implement console error filter — skip optional asset failures, React strict-mode, SW registration info
- [x] `B020` Implement overflow assertion — `scrollWidth <= innerWidth`
- [x] `B021` Implement `betaAudit(page)` — wrap existing `scanAccessibility()` from `e2e/fixtures/a11y.ts`
- [x] `B022` Configure a11y tags: `wcag2a`, `wcag2aa`, `best-practice`; disable `color-contrast`
- [x] `B023` Implement `betaExpect(page, selector)` — visible + not occluded + in viewport

#### Step 1.2.2 — Beta personas (`betaPersonas.ts`)
- [x] `B024` Create `e2e/beta/fixtures/betaPersonas.ts`
- [x] `B025` Implement `seedBetaPersona(page, persona, baseUrl)` — navigate, set localStorage, reload
- [x] `B026` Define persona `tabula-rasa` — empty localStorage (`{}`)
- [x] `B027` Define persona `fast-tracker` — `mission:fast-path:v1 = "active"`, no archetype, no profile
- [x] `B028` Define persona `day-two-cadet` — archetype cybercom, handler thora, callsign "Operative-7", enrolledAt yesterday, 1 drill, level 1, streak 1, XP 40
- [x] `B029` Define persona `active-commander` — full profile, Active Duty, 15 drills, level 4, XP 2100, 7-day streak, 3 signals, 2 AARs, triage prefs, mission checkpoints
- [x] `B030` Define persona `quiz-grinder` — archetype intelligence, 50+ CardProgress entries (5 modules), 8 quiz sessions, level 3, XP 1600, cards due for review
- [x] `B031` Define persona `veteran-operative` — archetype groundforce, level 8, XP 4200, 100+ drills, 30-day streak, all badges, 5+ challenges, daily/weekly goals, rich drill history
- [x] `B032` Define persona `settings-tweaker` — quietMode on, animations off, sounds off, compact/feed triage, dark theme
- [x] `B033` Define persona `empty-cache` — full profile but training module cache + manifest cleared

### Phase 1.3 — npm Scripts & CI

#### Step 1.3.1 — Add npm scripts to `package.json`
- [x] `B034` Add `test:beta` → `npx playwright test --config=e2e/beta/playwright.config.ts`
- [x] `B035` Add `test:beta:ui` → `npx playwright test --config=e2e/beta/playwright.config.ts --ui`
- [x] `B036` Add `test:beta:phase1` → grep "Fresh Cadet|Navigation Atlas"
- [x] `B037` Add `test:beta:phase2` → grep "Returning Operative|Mission Commander|Knowledge Seeker"
- [x] `B038` Add `test:beta:phase3` → grep "Profile|Module Explorer"
- [x] `B039` Add `test:beta:phase4` → grep "Edge Gremlin"

#### Step 1.3.2 — GitHub Actions CI workflow
- [x] `B040` Create `.github/workflows/beta-test.yml`
- [x] `B041` Configure trigger: push to `main` + pull requests
- [x] `B042` Job: checkout, setup-node 22, npm ci, install Chromium, build, run `test:beta`
- [x] `B043` Upload `beta-screenshots` artifact (always)
- [x] `B044` Upload `beta-report` artifact (on failure)

---

## Stage 2 — Scenario Implementation

### Phase 2.1 — Scenario 01: Fresh Cadet (`tabula-rasa`)

#### Step 2.1.1 — Create spec file
- [x] `B045` Create `e2e/beta/scenarios/01-fresh-cadet.spec.ts`
- [x] `B046` Import fixtures: `betaStep`, `betaAudit`, `betaExpect`, `seedBetaPersona`

#### Step 2.1.2 — Deliberate onboarding path (steps 1–12)
- [x] `B047` Step 1: Navigate to `/`, assert welcome overlay visible with 2 CTA buttons
- [x] `B048` Step 2: Click "Choose Your Focus First" → assert 8 archetype cards, no selection, confirm disabled
- [x] `B049` Step 3: Click "CyberCom" → assert selected state, confirm enabled, description visible
- [x] `B050` Step 4: Click confirm → assert handler picker with 5 cards, "Recommended" badge
- [x] `B051` Step 5: Select recommended handler + confirm → assert intake panel, 3 info blocks
- [x] `B052` Step 6: Click "Start Training" → assert brief surface, TodayLauncher, identity card shows CyberCom
- [x] `B053` Step 7: Click first drill in kit → assert DrillRunner, steps list, real card content, timer
- [x] `B054` Step 8: Toggle each step checkbox with >15s pacing → assert progress updates
- [x] `B055` Step 9: Fill reflection fields + rate 4/5 → assert Record button enabled
- [x] `B056` Step 10: Click "Record drill" → assert XP toast (35 + steps×5), per-card quality badges
- [x] `B057` Step 11: Assert rest interval — 60s countdown, "Skip rest", hydration hint
- [x] `B058` Step 12: Click "Skip rest" → assert brief shows updated stats

#### Step 2.1.3 — Fast path (steps 13–14)
- [x] `B059` Step 13: Clear localStorage, reload, click "Start Training Now" → assert training surface, 19 modules
- [x] `B060` Step 14: Complete quick-train drill → assert post-drill archetype prompt

#### Step 2.1.4 — Accessibility audits
- [x] `B061` a11y audit after archetype picker (step 2)
- [x] `B062` a11y audit after brief surface (step 6)
- [x] `B063` a11y audit after drill runner (step 7)
- [x] `B064` a11y audit after fast path landing (step 13)

### Phase 2.2 — Scenario 02: Returning Operative (`day-two-cadet`)

#### Step 2.2.1 — Create spec file
- [x] `B065` Create `e2e/beta/scenarios/02-returning-operative.spec.ts`
- [x] `B066` Import fixtures, seed `day-two-cadet` persona

#### Step 2.2.2 — Training surface & module browsing (steps 1–5)
- [x] `B067` Step 1: Navigate to `/train` → assert 19 modules, archetype-weighted ordering
- [x] `B068` Step 2: Assert BottomNav — 4 tabs (Train active, Review, Progress, Profile)
- [x] `B069` Step 3: Scroll modules → assert domain name, card/deck counts, score, sparkline per module
- [x] `B070` Step 4: Click "Cybersecurity" → assert DeckBrowser, breadcrumb "Training / Cybersecurity"
- [x] `B071` Step 5: Scroll decks → assert card previews, "Train this deck", SR badge

#### Step 2.2.3 — Drill with engagement warning (steps 6–10)
- [x] `B072` Step 6: Click "Train this deck" → assert DrillRunner with deck-specific cards
- [x] `B073` Step 7: Complete steps fast (<15s) → assert engagement warning dialog
- [x] `B074` Step 8: Click "Go back and review" → assert all steps unchecked, timer resumes
- [x] `B075` Step 9: Re-toggle with pacing → assert no warning, reflection form appears
- [x] `B076` Step 10: Rate 3/5, submit → assert XP feedback, "Retry N weak cards" button if applicable

#### Step 2.2.4 — Stats & profile (steps 11–13)
- [x] `B077` Step 11: Click Progress tab → assert StatsSurface, streak 2 (yesterday + today)
- [x] `B078` Step 12: Scroll to heatmap → assert activity dots for yesterday + today
- [x] `B079` Step 13: Click Profile tab → assert callsign "Operative-7", CyberCom, instructor

#### Step 2.2.5 — Accessibility audits
- [x] `B080` a11y audit after training surface (step 1)
- [x] `B081` a11y audit after stats surface (step 11)
- [x] `B082` a11y audit after profile surface (step 13)

### Phase 2.3 — Scenario 03: Mission Commander (`active-commander`)

#### Step 2.3.1 — Create spec file
- [x] `B083` Create `e2e/beta/scenarios/03-mission-commander.spec.ts`
- [x] `B084` Import fixtures, seed `active-commander` persona

#### Step 2.3.2 — Shell & brief (steps 1–3)
- [x] `B085` Step 1: Navigate to `/train` → assert BottomNav shows 4 primary + 5 mission tabs
- [x] `B086` Step 2: Click Brief tab → assert TodayLauncher, WeeklySummary, ReadinessPanel, MissionKitPanel, TimelineBand, MissionStepHandoff CTA
- [x] `B087` Step 3: Inspect brief content → assert personalized kit, readiness panel meaningful data

#### Step 2.3.3 — Triage phase (steps 4–9)
- [x] `B088` Step 4: Click "Proceed to Triage" → assert TriageBoard in columns/cozy view
- [x] `B089` Step 5: Switch density cozy → compact → assert layout reflow, no overflow
- [x] `B090` Step 6: Switch columns → feed → assert layout change, items preserved
- [x] `B091` Step 7: Acknowledge an open item → assert status update
- [x] `B092` Step 8: Escalate another item → assert status update
- [x] `B093` Step 9: Defer another item → assert status update

#### Step 2.3.4 — Case phase (steps 10–12)
- [x] `B094` Step 10: Click "Proceed to Case Analysis" → assert ArtifactList
- [x] `B095` Step 11: Click artifact → assert detail view, review/promote buttons
- [x] `B096` Step 12: Mark reviewed + promote → assert artifact state updates

#### Step 2.3.5 — Signal phase (steps 13–16)
- [x] `B097` Step 13: Click "Proceed to Signal Operations" → assert SignalSurface, form, 3 seeded signals
- [x] `B098` Step 14: Create signal "Contact Report Alpha" → assert new signal in list, "open" status
- [x] `B099` Step 15: Acknowledge new signal → assert status "acknowledged"
- [x] `B100` Step 16: Resolve signal → assert status "resolved"

#### Step 2.3.6 — Debrief phase (steps 17–19)
- [x] `B101` Step 17: Navigate to Debrief → assert DebriefClosureSummary, 2 pre-seeded AARs
- [x] `B102` Step 18: Write new AAR (all fields) → assert AAR in list, 3 total
- [x] `B103` Step 19: Check step-complete indicators → assert checkmarks on visited phases

#### Step 2.3.7 — Accessibility audits
- [x] `B104` a11y audit after brief surface (step 2)
- [x] `B105` a11y audit after triage surface (step 4)
- [x] `B106` a11y audit after signal surface (step 13)
- [x] `B107` a11y audit after debrief surface (step 17)

### Phase 2.4 — Scenario 04: Knowledge Seeker (`quiz-grinder`)

#### Step 2.4.1 — Create spec file
- [x] `B108` Create `e2e/beta/scenarios/04-knowledge-seeker.spec.ts`
- [x] `B109` Import fixtures, seed `quiz-grinder` persona

#### Step 2.4.2 — ReviewDashboard (steps 1–3)
- [x] `B110` Step 1: Navigate to `/review` → assert due count > 0, total tracked, health bars (Mature/Learning/New)
- [x] `B111` Step 2: Assert 7-day forecast bar chart visible with non-zero bars
- [x] `B112` Step 3: Scroll to per-module breakdown → assert due counts per module

#### Step 2.4.3 — Review quiz flow (steps 4–11)
- [x] `B113` Step 4: Click "Start Review" → assert quiz in review mode (SR-due cards)
- [x] `B114` Step 5: Answer multiple-choice question → assert correct/incorrect feedback, explanation
- [x] `B115` Step 6: Answer true/false question → assert feedback
- [x] `B116` Step 7: Answer fill-in-blank question → assert comparison result
- [x] `B117` Step 8: Answer term-match question → assert matching interface functional
- [x] `B118` Step 9: Complete quiz → assert results screen (score, breakdown, time)
- [x] `B119` Step 10: Verify SR scheduling update — answered cards have updated intervals
- [x] `B120` Step 11: Click "Retry wrong answers" → assert new quiz with only missed questions

#### Step 2.4.4 — Scoped quizzes & empty state (steps 12–14)
- [x] `B121` Step 12: Navigate Train → module → deck → "Quiz this deck" → assert deck-scoped quiz
- [x] `B122` Step 13: Back to module, click module-level quiz → assert module-scoped quiz
- [x] `B123` Step 14: Navigate to quiz with no due cards → assert "Not enough card data" empty state

#### Step 2.4.5 — Accessibility audits
- [x] `B124` a11y audit after ReviewDashboard (step 1)
- [x] `B125` a11y audit after quiz question (step 5)
- [x] `B126` a11y audit after quiz results (step 9)

### Phase 2.5 — Scenario 05: Profile & Sovereign (`veteran-operative`)

#### Step 2.5.1 — Create spec file
- [x] `B127` Create `e2e/beta/scenarios/05-profile-sovereign.spec.ts`
- [x] `B128` Import fixtures, seed `veteran-operative` persona

#### Step 2.5.2 — Profile management (steps 1–8)
- [x] `B129` Step 1: Navigate to `/profile` → assert full dossier, level 8, GroundForce
- [x] `B130` Step 2: Edit callsign → "Ghost-Commander" → assert update reflected
- [x] `B131` Step 3: Reload page → assert callsign "Ghost-Commander" persisted
- [x] `B132` Step 4: Click "Change archetype" → assert archetype picker, GroundForce highlighted
- [x] `B133` Step 5: Select "Psi Corps" + confirm → assert profile updated
- [x] `B134` Step 6: Toggle Active Duty ON → assert mission tabs appear in BottomNav
- [x] `B135` Step 7: Toggle Active Duty OFF → assert mission tabs disappear
- [x] `B136` Step 8: Click "Export Data" → assert JSON file download triggered

#### Step 2.5.3 — Veteran progression displays (steps 9–14)
- [x] `B137` Step 9: Click Progress tab → assert veteran-level StatsSurface (level 8, high XP, 30-day streak)
- [x] `B138` Step 10: Assert badge gallery — multiple badges with labels and unlock dates
- [x] `B139` Step 11: Assert challenge board — active + completed challenges with progress bars
- [x] `B140` Step 12: Assert competency radar chart — non-zero values across axes
- [x] `B141` Step 13: Assert score trend lines — 30-day, top 5 domains
- [x] `B142` Step 14: Assert activity heatmap — 30 days of high-density activity

#### Step 2.5.4 — Accessibility audits
- [x] `B143` a11y audit after profile surface (step 1)
- [x] `B144` a11y audit after stats surface (step 9)

### Phase 2.6 — Scenario 06: Edge Gremlin (various personas)

#### Step 2.6.1 — Create spec file
- [x] `B145` Create `e2e/beta/scenarios/06-edge-gremlin.spec.ts`
- [x] `B146` Import fixtures, prepare multiple persona seeds

#### Step 2.6.2 — State destruction (steps 1–3)
- [x] `B147` Step 1: Seed `day-two-cadet`, start drill, toggle 2 steps, `page.reload()` → assert recovery or clean reset, no crash
- [x] `B148` Step 2: Navigate to `/train`, `localStorage.clear()`, navigate to `/profile` → assert graceful redirect to onboarding, no exception
- [x] `B149` Step 3: Set `ptb:user-progress` to `"{invalid json"`, reload → assert error boundary or defaults reset, no infinite loop

#### Step 2.6.3 — Navigation abuse (steps 4–9)
- [x] `B150` Step 4: Navigate to `/nonexistent/path/here` → assert catch-all redirect, no blank screen
- [x] `B151` Step 5: Navigate to `/mission/brief?op=op-doesnt-exist&case=fake&signal=fake` → assert graceful message, no crash
- [x] `B152` Step 6: Navigate to `/share/nonexistent-slug-12345` → assert CardSharePage with graceful empty state
- [x] `B153` Step 7: Navigate to `/c/nonexistent-slug` → assert graceful redirect or fallback
- [x] `B154` Step 8: Navigate to all 11 legacy routes — `/home`, `/home/plan`, `/home/cards`, `/home/progress`, `/home/handler`, `/home/settings`, `/schedules`, `/drills`, `/training`, `/training/run`, `/settings` → assert each resolves to valid v2 route
- [x] `B155` Step 9: Navigate forward 5 screens, press back 4 times → assert correct content at each step, no loops

#### Step 2.6.4 — Input edge cases (steps 10–14)
- [x] `B156` Step 10: Edit callsign to "🚀Commander🔥💀" → assert saves and displays correctly
- [x] `B157` Step 11: Edit callsign to 200+ characters → assert truncated or graceful overflow handling
- [x] `B158` Step 12: Clear callsign, attempt save → assert prevented or graceful handling
- [x] `B159` Step 13: Start drill, rapidly toggle same step twice (<100ms) → assert consistent state
- [x] `B160` Step 14: Click each BottomNav tab in rapid succession (<200ms gaps) → assert final tab renders correctly

#### Step 2.6.5 — Network & offline (steps 15–17)
- [x] `B161` Step 15: `page.context().setOffline(true)` → assert NetworkStatusIndicator "Offline, using cached intel" (red)
- [x] `B162` Step 16: Start and complete drill while offline → assert records to localStorage, XP updates, no errors
- [x] `B163` Step 17: `page.context().setOffline(false)` → assert indicator "Ready" (green), telemetry queue flushes

#### Step 2.6.6 — Error recovery (steps 18–19)
- [x] `B164` Step 18: `page.evaluate(() => { throw new Error('Beta test trigger') })` → assert error boundary "System Fault Detected"
- [x] `B165` Step 19: Click "Reload" on error boundary → assert app recovers, user data preserved

#### Step 2.6.7 — Accessibility audits
- [x] `B166` a11y audit after error redirect state (step 4)
- [x] `B167` a11y audit after offline state (step 15)
- [x] `B168` a11y audit after error boundary (step 18)

### Phase 2.7 — Scenario 07: Navigation Atlas (`day-two-cadet`)

#### Step 2.7.1 — Create spec file
- [x] `B169` Create `e2e/beta/scenarios/07-navigation-atlas.spec.ts`
- [x] `B170` Import fixtures, seed `day-two-cadet` persona

#### Step 2.7.2 — Primary navigation (steps 1–4)
- [x] `B171` Step 1: Click Train tab → assert `/train`, ModuleBrowser, Train tab active
- [x] `B172` Step 2: Click Review tab → assert `/review`, ReviewDashboard, Review tab active
- [x] `B173` Step 3: Click Progress tab → assert `/progress`, StatsSurface, Progress tab active
- [x] `B174` Step 4: Click Profile tab → assert `/profile`, ProfileSurface, Profile tab active

#### Step 2.7.3 — Mission tabs (steps 5–10)
- [x] `B175` Step 5: Enable Active Duty in Profile → assert 5 mission tabs appear
- [x] `B176` Step 6: Click Brief tab → assert `/mission/brief`, BriefSurface
- [x] `B177` Step 7: Click Triage tab → assert `/mission/triage`, TriageSurface
- [x] `B178` Step 8: Click Case tab → assert `/mission/case`, CaseSurface
- [x] `B179` Step 9: Click Signal tab → assert `/mission/signal`, SignalSurface
- [x] `B180` Step 10: Click Debrief tab → assert `/mission/debrief`, DebriefSurface

#### Step 2.7.4 — Legacy route redirects (steps 11–21)
- [x] `B181` Step 11: Navigate `/home` → assert redirects to `/train`
- [x] `B182` Step 12: Navigate `/home/plan` → assert redirects to `/train`
- [x] `B183` Step 13: Navigate `/home/cards` → assert redirects to `/train`
- [x] `B184` Step 14: Navigate `/home/progress` → assert redirects to `/progress`
- [x] `B185` Step 15: Navigate `/home/handler` → assert redirects to `/profile`
- [x] `B186` Step 16: Navigate `/home/settings` → assert redirects to `/profile`
- [x] `B187` Step 17: Navigate `/schedules` → assert resolves to valid route
- [x] `B188` Step 18: Navigate `/drills` → assert resolves to valid route
- [x] `B189` Step 19: Navigate `/training` → assert resolves to valid route
- [x] `B190` Step 20: Navigate `/training/run` → assert resolves to valid route
- [x] `B191` Step 21: Navigate `/settings` → assert resolves to valid route

#### Step 2.7.5 — Deep links (steps 22–24)
- [x] `B192` Step 22: Navigate `/mission/brief?op=test&case=test&signal=test` → assert page loads, params consumed
- [x] `B193` Step 23: Navigate `/share/test-slug` → assert CardSharePage renders
- [x] `B194` Step 24: Navigate `/c/test-slug?source=test` → assert redirect executes

#### Step 2.7.6 — Browser history (steps 25–27)
- [x] `B195` Step 25: Visit 6 pages in sequence → assert each renders
- [x] `B196` Step 26: Press back 3 times → assert correct content at each step
- [x] `B197` Step 27: Press forward 2 times → assert correct content at each step

#### Step 2.7.7 — Reload resilience (steps 28–32)
- [x] `B198` Step 28: Reload on `/train` → assert ModuleBrowser preserved
- [x] `B199` Step 29: Reload on `/review` → assert ReviewDashboard preserved
- [x] `B200` Step 30: Reload on `/progress` → assert StatsSurface preserved
- [x] `B201` Step 31: Reload on `/profile` → assert ProfileSurface preserved
- [x] `B202` Step 32: Reload on `/mission/brief` → assert BriefSurface preserved

#### Step 2.7.8 — Error routes (steps 33–34)
- [x] `B203` Step 33: Navigate `/totally/invalid/deep/path` → assert catch-all redirect
- [x] `B204` Step 34: Navigate `/` → assert redirect to `/train`

#### Step 2.7.9 — Accessibility audits
- [x] `B205` a11y audit after primary nav complete (step 4)
- [x] `B206` a11y audit after mission nav complete (step 10)

### Phase 2.8 — Scenario 08: Module Explorer (`day-two-cadet`)

#### Step 2.8.1 — Create spec file
- [x] `B207` Create `e2e/beta/scenarios/08-module-explorer.spec.ts`
- [x] `B208` Import fixtures, seed `day-two-cadet` persona

#### Step 2.8.2 — Module browser overview (steps 1–3)
- [x] `B209` Step 1: Navigate to `/train` → assert ModuleBrowser renders
- [x] `B210` Step 2: Count modules → assert exactly 19 visible
- [x] `B211` Step 3: Inspect module card → assert domain name, card count, deck count, score, sparkline

#### Step 2.8.3 — Per-module deep dive (steps 4–22, one per module)
- [x] `B212` Step 4: `agencies` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B213` Step 5: `combat` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B214` Step 6: `counter_biochem` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B215` Step 7: `counter_psyops` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B216` Step 8: `cybersecurity` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B217` Step 9: `dance` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B218` Step 10: `equations` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B219` Step 11: `espionage` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B220` Step 12: `fitness` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B221` Step 13: `intelligence` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B222` Step 14: `investigation` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B223` Step 15: `martial_arts` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B224` Step 16: `psiops` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B225` Step 17: `war_strategy` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B226` Step 18: `web_three` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B227` Step 19: `self_sovereignty` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B228` Step 20: `anti_psn` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B229` Step 21: `anti_tcs_idc_cbc` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved
- [x] `B230` Step 22: `space_force` — click, assert DeckBrowser + breadcrumb + ≥1 deck + card previews, back, scroll preserved

#### Step 2.8.4 — Quick-train spot checks (steps 23–25)
- [x] `B231` Step 23: Quick Train on `combat` → assert DrillRunner with 10 combat-specific cards
- [x] `B232` Step 24: Quick Train on `cybersecurity` → assert DrillRunner with 10 cybersecurity-specific cards
- [x] `B233` Step 25: Quick Train on `espionage` → assert DrillRunner with 10 espionage-specific cards

#### Step 2.8.5 — Module selection persistence (steps 26–27)
- [x] `B234` Step 26: Check 3 modules, uncheck 1 → assert selection state correct
- [x] `B235` Step 27: Navigate to `/progress` then back to `/train` → assert selection persisted

#### Step 2.8.6 — Accessibility audits
- [x] `B236` a11y audit after ModuleBrowser (step 1)
- [x] `B237` a11y audit after first DeckBrowser (step 4)
- [x] `B238` a11y audit after Quick Train DrillRunner (step 23)

---

## Stage 3 — Integration & Wiring

### Phase 3.1 — Build Verification

#### Step 3.1.1 — Pre-flight checks
- [x] `B239` Verify `npm run build` succeeds
- [x] `B240` Verify `npx vite preview --port 4199` serves the app
- [x] `B241` Verify `npx playwright install chromium` installed
- [x] `B242` Verify existing E2E suite passes (`npm run test:e2e`)

### Phase 3.2 — Smoke Run

#### Step 3.2.1 — Run each phase in order
- [x] `B243` Run `npm run test:beta:phase1` (scenarios 01 + 07) — target ~45s
- [x] `B244` Fix any Phase 1 failures
- [x] `B245` Run `npm run test:beta:phase2` (scenarios 02 + 03 + 04) — target ~90s
- [x] `B246` Fix any Phase 2 failures
- [x] `B247` Run `npm run test:beta:phase3` (scenarios 05 + 08) — target ~75s
- [x] `B248` Fix any Phase 3 failures
- [x] `B249` Run `npm run test:beta:phase4` (scenario 06) — target ~60s
- [x] `B250` Fix any Phase 4 failures

---

## Stage 4 — Execution & Validation

### Phase 4.1 — Full Suite Run

#### Step 4.1.1 — Execute complete suite
- [x] `B251` Run `npm run test:beta` — full 8-scenario suite
- [x] `B252` Confirm ~120 steps pass in terminal output
- [x] `B253` Confirm ~120 screenshots in `artifacts/beta-screenshots/`
- [x] `B254` Confirm 16 a11y audits pass (4+3+4+3+2+3+2+3 per scenario)
- [x] `B255` Confirm 0 console errors across all scenarios
- [x] `B256` Confirm 0 horizontal overflow violations

### Phase 4.2 — Screenshot Review

#### Step 4.2.1 — Visual scan
- [x] `B257` Open `artifacts/beta-screenshots/index.html` gallery viewer
- [x] `B258` Scan Scenario 01 screenshots (14 images) — onboarding flows
- [x] `B259` Scan Scenario 02 screenshots (13 images) — daily training cycle
- [x] `B260` Scan Scenario 03 screenshots (19 images) — mission loop
- [x] `B261` Scan Scenario 04 screenshots (14 images) — quiz & review
- [x] `B262` Scan Scenario 05 screenshots (14 images) — profile & progression
- [x] `B263` Scan Scenario 06 screenshots (19 images) — edge cases & errors
- [x] `B264` Scan Scenario 07 screenshots (34 images) — navigation atlas
- [x] `B265` Scan Scenario 08 screenshots (27 images) — module explorer

### Phase 4.3 — Report & Commit

#### Step 4.3.1 — Final validation
- [x] `B266` Review HTML report at `artifacts/beta-report/` — check any failed traces
- [x] `B267` Verify CI workflow runs successfully (if pushed)
- [x] `B268` Commit beta test suite + docs
- [x] `B269` Push to remote

---

## Summary

| Metric | Count |
|---|---|
| **Stages** | 4 |
| **Phases** | 15 |
| **Steps** | 38 |
| **Tasks** | 269 (B001–B269) |
| **Files to create** | 14 (2 fixtures + 1 config + 2 global setup/teardown + 8 specs + 1 CI workflow) |
| **Files to modify** | 1 (`package.json` — add 6 scripts) |
| **Personas to define** | 8 |
| **Test steps to implement** | ~120 |
| **Screenshots captured** | ~120 |
| **a11y audits** | 16 |
| **npm scripts** | 6 |
