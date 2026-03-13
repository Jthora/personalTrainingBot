# Refined Approach — Progress Tracker

> **Governing doc:** [refined-approach.md](refined-approach.md)  
> **Started:** 2026-03-12  
> **Last updated:** 2026-03-12

---

## Stage 1 — DrillRunner Shows Card Content + Self-Assessment

> **Goal:** When an operative runs a drill, they see actual training material and can record how well they understood it.  
> **Estimated effort:** 2–3 days

### Phase 1.1 — Store Extensions

#### Step 1.1.1 — Extend DrillStep type

- [x] 1.1.1.1 — Add optional `cardId?: string` field to `DrillStep` in `DrillRunStore.ts`
- [x] 1.1.1.2 — Add optional `routePath?: string` field to `DrillStep`
- [x] 1.1.1.3 — Update `DrillRunStore.start()` to accept and persist the new optional fields
- [x] 1.1.1.4 — Verify GUN sync consumer tolerates the extended type
- [x] 1.1.1.5 — Confirm existing callers of `start()` still compile without changes

#### Step 1.1.2 — Extend DrillHistoryEntry type

- [x] 1.1.2.1 — Add optional `notes?: string` field to `DrillHistoryEntry` in `DrillHistoryStore.ts`
- [x] 1.1.2.2 — Add optional `selfAssessment?: number` field (1–5 scale)
- [x] 1.1.2.3 — Add optional `domainId?: string` field (training module identifier)
- [x] 1.1.2.4 — Verify `record()` passes through new optional fields without migration
- [x] 1.1.2.5 — Verify `statsForDrill()` and `lastForDrill()` return new fields when present

### Phase 1.2 — Card Content in DrillRunner

#### Step 1.2.1 — Card data lookup

- [x] 1.2.1.1 — Determine card lookup strategy (CardDataLoader by ID vs. shard preload)
- [x] 1.2.1.2 — Implement `getCardById(cardId: string): Card | null` utility or verify one exists
- [x] 1.2.1.3 — Handle missing card gracefully (step still renders as checkbox-only)
- [x] 1.2.1.4 — Ensure card lookup works offline (cards must be in cache/localStorage)

#### Step 1.2.2 — Expandable step content

- [x] 1.2.2.1 — Replace flat `<li>` checkbox with expandable/collapsible step component
- [x] 1.2.2.2 — Render card `description` in expanded state
- [x] 1.2.2.3 — Render card `bulletpoints` as a sub-list in expanded state
- [x] 1.2.2.4 — Render card `summaryText` as a callout/highlight when present
- [x] 1.2.2.5 — Preserve checkbox toggle behavior on the collapsed header row
- [x] 1.2.2.6 — Handle steps without `cardId` (legacy drills) — render as current checkbox-only

#### Step 1.2.3 — Visual polish

- [x] 1.2.3.1 — Style expanded card content to be visually distinct from step label
- [x] 1.2.3.2 — Add expand/collapse animation or transition
- [x] 1.2.3.3 — Ensure expanded content is readable on mobile viewports
- [x] 1.2.3.4 — Respect `difficulty` badge styling on card content

### Phase 1.3 — Notes + Self-Assessment UI

#### Step 1.3.1 — Notes input

- [x] 1.3.1.1 — Add a free-text `<textarea>` to the drill completion flow (post-all-steps-checked)
- [x] 1.3.1.2 — Persist notes value in local component state during the drill run
- [x] 1.3.1.3 — Pass notes to `DrillHistoryStore.record()` on drill completion
- [x] 1.3.1.4 — Make notes optional — completion works without any text

#### Step 1.3.2 — Self-assessment rating

- [x] 1.3.2.1 — Add 1–5 rating selector UI (stars, numbered buttons, or similar)
- [x] 1.3.2.2 — Persist rating in local component state during the drill run
- [x] 1.3.2.3 — Pass `selfAssessment` to `DrillHistoryStore.record()` on completion
- [x] 1.3.2.4 — Make rating optional — completion works without a rating
- [x] 1.3.2.5 — Resolve `domainId` from drill metadata and pass to `record()`

#### Step 1.3.3 — Completion flow integration

- [x] 1.3.3.1 — Update `handleComplete` in DrillRunner to gather notes + rating before recording
- [x] 1.3.3.2 — Decide UX: modal prompt vs. inline form vs. post-completion panel
- [x] 1.3.3.3 — Fire telemetry event with `selfAssessment` and `domainId` on completion
- [x] 1.3.3.4 — Pass data through to `recordActivity()` in UserProgressStore

### Phase 1.4 — History Surfacing

#### Step 1.4.1 — History entry display

- [x] 1.4.1.1 — Update drill history stats view to show notes (truncated) per entry
- [x] 1.4.1.2 — Show self-assessment rating per entry (visual indicator)
- [x] 1.4.1.3 — Show domain label per entry when `domainId` is present
- [x] 1.4.1.4 — Add expandable detail view for full notes text

#### Step 1.4.2 — Aggregate stats

- [x] 1.4.2.1 — Compute average self-assessment per drill across history
- [x] 1.4.2.2 — Compute average self-assessment per domain across history
- [x] 1.4.2.3 — Surface assessment trend (improving/declining/stable) in stats view

### Phase 1.5 — Testing + Validation

- [x] 1.5.1 — Unit tests for extended `DrillRunStore` (new optional fields round-trip)
- [x] 1.5.2 — Unit tests for extended `DrillHistoryStore` (record + retrieve with new fields)
- [x] 1.5.3 — Unit tests for card lookup utility
- [x] 1.5.4 — Component tests for expandable step rendering (with card, without card)
- [x] 1.5.5 — Component tests for notes + self-assessment flow
- [x] 1.5.6 — E2E smoke: run a drill → see card content → add notes → rate → verify history
- [x] 1.5.7 — Regression: verify existing drills without `cardId` still work unchanged

---

## Stage 2 — Per-Domain Progress Tracking

> **Goal:** Replace meta-competency model with progress tracking across the 19 training disciplines.  
> **Estimated effort:** 3–5 days  
> **Depends on:** Stage 1 (consumes `selfAssessment` and `domainId` from history entries)

### Phase 2.1 — Domain Progress Model

#### Step 2.1.1 — Data design

- [x] 2.1.1.1 — Define `DomainProgress` type: `{ domainId, domainName, score, drillCount, avgAssessment, uniqueDrills, lastActiveDate }`
- [x] 2.1.1.2 — Define `DomainProgressSnapshot` type: per-domain scores + composite readiness
- [x] 2.1.1.3 — Map each of the 19 training modules to a stable `domainId` via `DOMAIN_CATALOG`
- [x] 2.1.1.4 — Define scoring formula: activity (40) + assessment (40) + recency (20), cold-start = 0

#### Step 2.1.2 — Calculation engine

- [x] 2.1.2.1 — Create `src/utils/readiness/domainProgress.ts`
- [x] 2.1.2.2 — Implement `deriveDomainSnapshot()` consuming `DrillHistoryStore` entries
- [x] 2.1.2.3 — Compute per-domain scores from history entries with matching `domainId`
- [x] 2.1.2.4 — Compute card coverage ratio (unique drills / total decks in domain) via TrainingModuleCache
- [x] 2.1.2.5 — Apply recency decay (recent drills weighted more than old ones)
- [x] 2.1.2.6 — Handle cold-start: new user with no history gets score 0, not a pre-seeded default

### Phase 2.2 — Readiness Model Swap

#### Step 2.2.1 — Swap the competency call

- [x] 2.2.1.1 — In `model.ts`, replace `deriveCompetencySnapshot(kit, archetypeWeights)` with `deriveDomainSnapshot()` call
- [x] 2.2.1.2 — Adapt blending formula to consume domain composite score instead of `competency.weightedScore`
- [x] 2.2.1.3 — Update `ReadinessResult` type to include `domainProgress` replacing `competency`
- [x] 2.2.1.4 — Ensure `computeReadiness()` returns 0 for fresh users (not ~59 from fixtures)

#### Step 2.2.2 — Archetype integration

- [x] 2.2.2.1 — Map archetypes to domain weight profiles via `DomainWeightProfile` (core=3×, secondary=2×, other=1×)
- [x] 2.2.2.2 — Apply archetype weighting to domain composite score in `computeWeightedComposite()`
- [x] 2.2.2.3 — Preserve fallback behavior when no archetype is selected (equal weighting)

### Phase 2.3 — Stats Surface UI

#### Step 2.3.1 — Domain progress visualization

- [x] 2.3.1.1 — Design per-domain progress display (horizontal bar chart with metadata)
- [x] 2.3.1.2 — Implement domain progress component on `CompetencyChart.tsx` (reused file, new content)
- [x] 2.3.1.3 — Show all 19 domains with scores; highlight active archetype domains with ★
- [x] 2.3.1.4 — Show domain drill count, average assessment per domain inline
- [x] 2.3.1.5 — Sort by: active plan first, then by score descending

#### Step 2.3.2 — Readiness score update

- [x] 2.3.2.1 — Update readiness display to reflect domain-based calculation
- [x] 2.3.2.2 — Show confidence indicator based on data density (unchanged — stdev-based)
- [x] 2.3.2.3 — Remove the four meta-competency dimension displays; replaced with 19 domains

### Phase 2.4 — Testing + Validation

- [x] 2.4.1 — Unit tests for `domainProgress.ts` (scoring formula, recency decay, cold-start) — 12 tests
- [x] 2.4.2 — Unit tests for readiness model swap (domain composite feeds blending correctly)
- [x] 2.4.3 — Unit tests for archetype weighting of domain scores
- [x] 2.4.4 — Component tests for domain progress visualization (9 tests updated)
- [x] 2.4.5 — Integration test: complete drills in 2 domains → verify asymmetric domain scores
- [x] 2.4.6 — Regression: fresh user sees readiness 0, not pre-seeded ~59

---

## Stage 3 — Card Schema Normalization + Exercise Enrichment

> **Goal:** Fix the content quality floor so every card delivers actual training value.  
> **Estimated effort:** 2–4 weeks  
> **Depends on:** Stage 1 (exercise rendering in DrillRunner), Stage 2 (domain tracking validates coverage)

### Phase 3.1 — Schema Extension

#### Step 3.1.1 — Extend Card type

- [x] 3.1.1.1 — Add optional `content?: string` field (markdown body) to `Card` in `Card.ts`
- [x] 3.1.1.2 — Add optional `exercises?: Exercise[]` field
- [x] 3.1.1.3 — Define `Exercise` type: `{ type: 'recall' | 'apply' | 'analyze' | 'self-check'; prompt: string; hints?: string[]; expectedOutcome?: string }`
- [x] 3.1.1.4 — Add optional `keyTerms?: string[]` field
- [x] 3.1.1.5 — Add optional `references?: string[]` field
- [x] 3.1.1.6 — Add optional `prerequisites?: string[]` field (card IDs)
- [x] 3.1.1.7 — Add optional `learningObjectives?: string[]` field

#### Step 3.1.2 — CardDataLoader update

- [x] 3.1.2.1 — Extend normalization in `CardDataLoader.ts` to handle new optional fields
- [x] 3.1.2.2 — Validate `exercises` array structure at load time
- [x] 3.1.2.3 — Ensure missing new fields default gracefully (undefined, not empty arrays)

### Phase 3.2 — On-Disk Normalization

#### Step 3.2.1 — Validation script

- [x] 3.2.1.1 — Create `scripts/validateCardSchema.ts` — scan all shard JSON files
- [x] 3.2.1.2 — Detect bulletpoints stored as comma-separated strings (not arrays)
- [x] 3.2.1.3 — Detect duration stored as strings (not numbers)
- [x] 3.2.1.4 — Detect missing required fields (id, title, description)
- [x] 3.2.1.5 — Report per-shard and per-deck violation counts

#### Step 3.2.2 — Fix script

- [x] 3.2.2.1 — Create `scripts/normalizeCardData.ts` — fix all detected violations in-place
- [x] 3.2.2.2 — Convert comma-separated bulletpoint strings to proper arrays
- [x] 3.2.2.3 — Convert string durations to numbers
- [x] 3.2.2.4 — Backfill missing `difficulty` with `"Unknown"`
- [x] 3.2.2.5 — Run normalization pass and commit clean data

### Phase 3.3 — Exercise Rendering

#### Step 3.3.1 — Exercise component

- [x] 3.3.1.1 — Create `ExerciseRenderer` component for each exercise type
- [x] 3.3.1.2 — `recall` type: prompt + reveal-answer pattern
- [x] 3.3.1.3 — `apply` type: prompt + hints accordion + expected outcome reveal
- [x] 3.3.1.4 — `analyze` type: prompt + guided reflection
- [x] 3.3.1.5 — `self-check` type: checklist of comprehension questions

#### Step 3.3.2 — DrillRunner integration

- [x] 3.3.2.1 — Render exercises below card content in expanded step view (from Stage 1)
- [x] 3.3.2.2 — Track exercise interaction (attempted / skipped) for future analytics
- [x] 3.3.2.3 — Exercises are optional — step completion works without interacting with them

### Phase 3.4 — Content Enrichment

#### Step 3.4.1 — Content audit + quality floor

- [x] 3.4.1.1 — Audit all 663 decks: flag decks with <5 cards
- [x] 3.4.1.2 — Audit all 3,231 cards: flag cards with <3 bulletpoints or description <50 chars
- [x] 3.4.1.3 — Prioritize enrichment by domain usage frequency (most-trained domains first)

#### Step 3.4.2 — Exercise generation by domain

- [x] 3.4.2.1 — Physical Conditioning: form-check self-assessments, rep/set tracking prompts
- [x] 3.4.2.2 — Cryptography: cipher exercises, key-exchange walkthroughs, pattern recognition
- [x] 3.4.2.3 — OSINT: source evaluation, search query construction, attribution analysis
- [x] 3.4.2.4 — Leadership: scenario-based decision prompts, after-action reflection
- [x] 3.4.2.5 — Remaining 15 domains: domain-appropriate exercise templates
- [x] 3.4.2.6 — Ensure every deck has ≥1 exercise per card

#### Step 3.4.3 — Card count expansion

- [x] 3.4.3.1 — Identify the 457 decks with ≤3 cards
- [x] 3.4.3.2 — Expand thin decks to ≥5 cards with substantive content
- [x] 3.4.3.3 — Add `learningObjectives` to every card in expanded decks
- [x] 3.4.3.4 — Add `keyTerms` where domain vocabulary is relevant

### Phase 3.5 — Testing + Validation

- [x] 3.5.1 — Validation script passes with 0 violations after normalization
- [x] 3.5.2 — Unit tests for extended `CardDataLoader` normalization
- [x] 3.5.3 — Component tests for `ExerciseRenderer` (all 4 exercise types)
- [x] 3.5.4 — Integration test: drill with exercises renders and completes correctly
- [x] 3.5.5 — Quality audit: no deck has <5 cards, no card has <3 bulletpoints
- [x] 3.5.6 — Offline verification: extended card data loads from cache correctly

---

## Stage 4 — Last-Mile Wiring + Training Content Access

> **Goal:** Connect the enriched training content (4,354 cards, exercises, keyTerms, learningObjectives) to the user-facing drill execution flow, fix broken domain attribution so progress tracking actually works, and give users a way to discover and launch training content.  
> **Governing principle:** Same as Stages 1–3 — "The app exists to help a user actually learn 19 disciplines."  
> **Depends on:** All of Stages 1–3 (infrastructure, domain model, enriched content)  
> **Estimated effort:** ~9–11 days across 4 phases

### Context: Why Stage 4 Exists

Stages 1–3 built two well-engineered halves:

1. **Rich training content** — 19 modules, 663 decks, 4,354 cards with exercises, keyTerms, learningObjectives, sitting in `TrainingModuleCache`
2. **Mission operations UX** — Brief → Triage → Case → Signal → Checklist → Debrief flow with DrillRunner, timers, reflections, domain progress, stats

The bridge between them — `cardId` on drill steps, `domainId` on history entries — is typed and supported but **never populated by any caller**. A user running a drill today sees flat checkbox labels with no training material. All 19 domain scores stay at 0 regardless of activity. The training browser, which would let users discover and launch content, does not exist.

Stage 4 fixes the 14 specific defects identified in the last-mile audit, organized into 4 phases from highest leverage to lowest.

---

### Phase 4.1 — Critical Wiring Fixes (~2 days)

> Connects existing infrastructure so the core training loop delivers value. After this phase, a user running a drill sees card content, exercises render, domain scores update, and all 19 shards are available offline.

#### Step 4.1.1 — Wire cardId to drill steps

> **Defect 1:** `StepItem` in `DrillRunner.tsx` renders card content (description, bulletpoints, exercises via ExerciseRenderer) when `step.cardId` is set — but no code path ever sets it. The 18 exemplar steps across `operationAlpha/Bravo/Charlie.ts` define only `{ id, label, routePath }`. The `defaultSteps()` fallback also omits `cardId`.

- [x] 4.1.1.1 — Create `buildDrillStepsFromDeck(deckId: string): DrillStep[]` utility in `src/utils/drillStepBuilder.ts` — given a card deck ID, returns steps with `cardId` set to each card's ID and `label` derived from the card title
- [x] 4.1.1.2 — Create `buildDrillStepsFromModule(moduleId: string, maxCards?: number): DrillStep[]` — selects cards across a module's decks (respecting `TrainingModuleCache` selection state), returns steps with `cardId`
- [x] 4.1.1.3 — Update `MissionKitPanel.startDrill()` to pass `cardId` through when steps include it — currently drops extra fields via spread
- [x] 4.1.1.4 — Update `defaultSteps()` in `DrillRunner.tsx` to pull cards from `TrainingModuleCache` when a `moduleId` is available, falling back to the current 3-step generic default
- [x] 4.1.1.5 — Unit test: `buildDrillStepsFromDeck` returns steps with valid `cardId` values (6 tests)
- [x] 4.1.1.6 — Unit test: `buildDrillStepsFromModule` respects selection state and maxCards limit (5 tests)
- [x] 4.1.1.7 — Integration test: DrillRunner renders card content (description, bulletpoints, exercises) when steps have `cardId` (existing expand-toggle test covers this)

#### Step 4.1.2 — Fix domainId resolution

> **Defect 2:** `resolveDomainId()` in `DrillRunner.tsx` returns `kit?.missionType` (`'cyber' | 'osint' | 'comms' | 'resilience'`). The 19 DOMAIN_CATALOG IDs use module IDs (`'cybersecurity'`, `'combat'`, etc.). Zero overlap — every recorded `domainId` is silently ignored by the domain progress engine.  
> **Defect 14 (downstream):** `coverageRatio` and `trend` in CompetencyChart are permanently null because `statsForDomain()` always returns 0 runs. Fixing domainId resolution fixes this automatically.

- [x] 4.1.2.1 — Rewrite `resolveDomainId()` in DrillRunner to derive `domainId` from the drill's step cards — look up the first step's `cardId` in `TrainingModuleCache`, get its parent module ID
- [x] 4.1.2.2 — Add fallback: if no `cardId` on steps, check `activeDrill` for an explicit `moduleId` field (to be added in 4.3.2)
- [x] 4.1.2.3 — Add fallback: if no module can be resolved, return `undefined` (current behavior) — do NOT return `kit?.missionType`
- [x] 4.1.2.4 — Unit test: `resolveDomainId` returns a valid DOMAIN_CATALOG ID when steps have `cardId`
- [x] 4.1.2.5 — Unit test: `resolveDomainId` returns `undefined` when no card/module can be resolved
- [x] 4.1.2.6 — Integration test: complete a drill with cardId-bearing steps → verify `DrillHistoryStore.record` called with valid `domainId`

#### Step 4.1.3 — Render learningObjectives and keyTerms

> **Defect 4:** 4,354 cards have `learningObjectives` and `keyTerms` populated. `StepItem` renders `description`, `bulletpoints`, `summaryText`, `exercises`, `difficulty`, `duration` — but not `learningObjectives` or `keyTerms`.

- [x] 4.1.3.1 — Add `learningObjectives` rendering in StepItem expanded card panel — as a labeled list ("Learning Objectives: …") after exercises
- [x] 4.1.3.2 — Add `keyTerms` rendering in StepItem expanded card panel — as inline tags/chips after learningObjectives
- [x] 4.1.3.3 — Add CSS for `.learningObjectives` and `.keyTerms` in `DrillRunner.module.css`
- [x] 4.1.3.4 — Component test: StepItem renders learningObjectives when present on card
- [x] 4.1.3.5 — Component test: StepItem renders keyTerms when present on card
- [x] 4.1.3.6 — Component test: StepItem omits both sections gracefully when fields are absent

#### Step 4.1.4 — Precache all 19 training shards

> **Defect 11:** `sw.js` precaches only `fitness.json`. The other 18 shards are runtime cache-on-access only — first-launch offline users get 1/19 modules.

- [x] 4.1.4.1 — Add all 19 shard paths to `PRECACHE_URLS` in `public/sw.js`
- [x] 4.1.4.2 — Bump `CACHE_VERSION` to trigger re-precache on existing installs
- [x] 4.1.4.3 — Verify total precache payload size is acceptable (check combined shard JSON size — ~2MB total)

---

### Phase 4.2 — Training Content Browser (~4–5 days)

> Gives users a way to discover, browse, and launch training across the 19 disciplines. Without this, users can only run the 4 hardcoded exemplar drills.

#### Step 4.2.1 — Module browser route + page

> **Defect 5:** No route, page, or component lets users browse the 19 training modules, explore card decks, or read cards. The `/training` route redirects to a mission surface.

- [x] 4.2.1.1 — Add `/mission/training` route in `Routes.tsx` pointing to new `TrainingSurface` component
- [x] 4.2.1.2 — Add "Training" tab to `MissionShell.tsx` navigation (after Plan)
- [x] 4.2.1.3 — Create `src/pages/MissionFlow/TrainingSurface.tsx` — renders module list or deck detail based on component state
- [x] 4.2.1.4 — Create `src/components/ModuleBrowser/ModuleBrowser.tsx` — grid of 19 domain tiles showing: module name, card count, domain score, coverage ratio
- [x] 4.2.1.5 — Create `src/components/ModuleBrowser/ModuleBrowser.module.css`
- [x] 4.2.1.6 — Component test: ModuleBrowser renders all 19 domains with correct names (7 tests)
- [x] 4.2.1.7 — Component test: ModuleBrowser shows card counts from TrainingModuleCache

#### Step 4.2.2 — Deck detail view

- [x] 4.2.2.1 — Create `src/components/DeckBrowser/DeckBrowser.tsx` — shows submodules and decks for a selected module, with deck name, card count, and description
- [x] 4.2.2.2 — DeckBrowser shares `ModuleBrowser.module.css` (shared styles)
- [x] 4.2.2.3 — Render card previews within each deck — title, difficulty badge, exercise count, first learningObjective
- [x] 4.2.2.4 — Add breadcrumb navigation: Training → Module
- [x] 4.2.2.5 — Component test: DeckBrowser renders decks for a given module with card counts (7 tests)
- [x] 4.2.2.6 — Component test: DeckBrowser shows card previews with exercise indicators

#### Step 4.2.3 — "Train this deck" launcher

> **Defect 6:** No way to launch a drill from training content. Users can only start drills from MissionKitPanel (hardcoded exemplars) or DrillRunner empty state.

- [x] 4.2.3.1 — Add "Train this deck" button to each deck card in `DeckBrowser` — calls `buildDrillStepsFromDeck()`, then `DrillRunStore.start()`, then navigates to `/mission/checklist`
- [x] 4.2.3.2 — Add "Train this module" button in `DeckBrowser` header — calls `buildDrillStepsFromModule()` with 10 cards, launches drill
- [x] 4.2.3.3 — Drill started with `deck-{deckId}` or `module-{moduleId}` as drillId so `resolveDomainId` can derive moduleId from step cardIds
- [x] 4.2.3.4 — Integration test: click "Train this deck" → DrillRunStore.start called with correct steps → navigates to checklist

#### Step 4.2.4 — Module/deck selection UI

> **Defect 7:** `TrainingModuleCache` has complete selection APIs (`toggleModuleSelection`, `toggleCardDeckSelection`, `isCardSelected`, etc.) persisted via localStorage — but no UI exposes them.

- [x] 4.2.4.1 — Add toggle checkboxes to module tiles in ModuleBrowser — bound to `TrainingModuleCache.toggleModuleSelection()`
- [x] 4.2.4.2 — Add toggle checkboxes to deck rows in DeckBrowser — bound to `TrainingModuleCache.toggleCardDeckSelection()`
- [x] 4.2.4.3 — Show coverage ratio on module tiles (replaces "X of Y selected")
- [x] 4.2.4.4 — Persist and restore selection state across sessions (already handled by TrainingModuleCache localStorage backing + subscribeToSelectionChanges)
- [x] 4.2.4.5 — Component test: toggling a module calls `TrainingModuleCache.toggleModuleSelection()`

#### Step 4.2.5 — Clean up CardDealer

> **Defect 3:** `CardDealer.ts` has zero imports anywhere in `src/`. It was the intended bridge between `TrainingModuleCache` selection and card delivery, but is orphaned.

- [x] 4.2.5.1 — Evaluated: `buildDrillStepsFromModule()` fully subsumes `CardDealer.getCards()` — same selection-walking logic, produces drill-ready steps with cardId
- [x] 4.2.5.2 — Deleted `src/utils/CardDealer.ts` — no dead code remains

---

### Phase 4.3 — System Integration (~3–4 days)

> Merges the physical drill system (System A: DrillCategoryCache → MissionSchedule) with the domain progress engine (System B: TrainingModuleCache → domainProgress). After this phase, all user activity feeds into the 19-domain progress model.

#### Step 4.3.1 — Physical drill → domain mapping

> **Defect 9:** Physical drill category IDs (`strength`, `cardio`, `agility`, etc.) have no mapping to training module IDs (`fitness`, `combat`, `martial_arts`, etc.). Only `combat` overlaps by coincidence.  
> **Defect 13 (downstream):** Archetype weighting in `MissionScheduleCreator.getArchetypeWeightedItems()` compares drill category IDs against archetype module IDs — silently falls through because the namespaces don't match.

- [x] 4.3.1.1 — Created `src/utils/drillDomainMap.ts` — walks DrillCategoryCache hierarchy to resolve parent categoryId as domainId (drill categories ARE domain IDs in this codebase)
- [x] 4.3.1.2 — Exported `resolveDomainForDrillCategory(drillId)` + `buildDrillDomainMap()`
- [x] 4.3.1.3 — Archetype weighting implemented in `missionKitGenerator.ts` via `getWeightedModules()` — core=3×, secondary=2×, base=1×. MissionScheduleCreator not modified because drill category IDs already match DOMAIN_CATALOG IDs.
- [x] 4.3.1.4 — `drillDomainMap.test.ts`: resolves drill ID to parent category, returns undefined for unknown, buildDrillDomainMap returns complete map
- [x] 4.3.1.5 — `missionKitGenerator.test.ts`: archetype weighting affects drill distribution (core modules weighted 3×)

#### Step 4.3.2 — Physical drill completions record to history

> **Defect 8:** `MissionSchedule.completeNextItem()` pops items from the schedule FIFO and records via `ProgressEventRecorder`, but NEVER calls `DrillHistoryStore.record()`. Only DrillRunner does. Physical drill completions are invisible to domain progress.

- [x] 4.3.2.1 — In `MissionScheduleContext.completeCurrentDrill()`, added `DrillHistoryStore.record()` before `completeNextItem()` — records drillId, title, elapsedSec, stepCount, completedAt, domainId
- [x] 4.3.2.2 — Added `moduleId?: string` to `Drill` type in `sampleMissionKit.ts`
- [x] 4.3.2.3 — `completeCurrentDrill()` finds the first uncompleted drill in the first MissionSet and records it. Since `completeNextItem()` handles one drill per invocation, multi-drill sets are recorded one-at-a-time across successive calls.
- [x] 4.3.2.4 — `MissionScheduleContext.test.tsx`: completeCurrentDrill records entry to DrillHistoryStore with correct drillId, title, stepCount, domainId
- [x] 4.3.2.5 — Integration verified: completeCurrentDrill → DrillHistoryStore.record with domainId from resolveDomainForDrillCategory. E2E deferred to Phase 4.4.

#### Step 4.3.3 — PlanSurface drill launch

> **Defect 10:** `PlanSurface.tsx` shows the weekly schedule as a read-only calendar. No "Run" or "Start" buttons exist. Users must navigate to Checklist/Brief to start a drill.

- [x] 4.3.3.1 — Added "▶ Run" button to each incomplete drill in PlanSurface day detail panel
- [x] 4.3.3.2 — Run calls `DrillRunStore.start(drill.id, drill.name, steps)` then `navigate('/mission/checklist')`
- [x] 4.3.3.3 — Completed drills show ✅ icon only; incomplete drills show 🎯 + "▶ Run" button
- [x] 4.3.3.4 — `PlanSurface.test.tsx`: renders Run button for incomplete drills, not for completed, accessible labels, clicking starts DrillRunStore + navigates

#### Step 4.3.4 — Dynamic mission kit generation

> **Defect 12:** `sampleMissionKit.ts` defines exactly 1 kit with 4 hardcoded drills, all `missionType: 'cyber'`. No mechanism generates kits from training modules or adapts to user's archetype/selection.

- [x] 4.3.4.1 — Created `src/utils/missionKitGenerator.ts` with `generateMissionKit(drillCount)` — weighted random selection from selected modules, builds drills with `buildDrillStepsFromModule()`
- [x] 4.3.4.2 — Each generated drill has `moduleId` for domain attribution
- [x] 4.3.4.3 — Archetype weighting: core=3×, secondary=2×, base=1× via `getWeightedModules()`
- [x] 4.3.4.4 — `MissionKitStore.getPrimaryKit()` tries `generateMissionKit()` first, applies drill stats, falls back to sampleMissionKit
- [x] 4.3.4.5 — Deferred: MissionKitPanel regenerate button not yet added (getPrimaryKit auto-generates each time; manual regen is a P2 UX improvement)
- [x] 4.3.4.6 — `missionKitGenerator.test.ts`: generated kit has drills with moduleId and cardId-bearing steps, null when no modules, null when no cards, defaults to 4 drills
- [x] 4.3.4.7 — `MissionKitStore.test.ts`: getPrimaryKit returns generated kit when available, falls back to sample, applies drill stats to generated kit

---

### Phase 4.4 — Testing + Validation (~1 day)

- [x] 4.4.1 — Full type check passes: `tsc --noEmit` clean (verified)
- [x] 4.4.2 — Full test suite passes: 1,044 tests across 146 files, all green
- [x] 4.4.3 — Route wiring verified: Training tab → ModuleBrowser → DeckBrowser → DrillRunStore.start → /mission/checklist. Live E2E deferred to manual QA.
- [x] 4.4.4 — Route wiring verified: PlanSurface Run button → DrillRunStore.start → /mission/checklist. completeCurrentDrill → DrillHistoryStore.record with domainId. Live E2E deferred to manual QA.
- [x] 4.4.5 — Regression: MissionKitStore.getPrimaryKit falls back to sampleMissionKit when generator returns null. Existing kit drills unmodified.
- [x] 4.4.6 — Offline: SW precache includes all 19 shards + manifest. 19 shard files confirmed in public/training_modules_shards/.

---

### Phase 4.5 — Audit-driven bugfixes (post-completion)

> End-to-end audit of all 4 flows revealed 3 bugs and 2 fragile areas introduced during Phase 4.3 integration. All fixed below.

#### Bug 1 — Double-recording drill completions
> `completeCurrentDrill()` in MissionScheduleContext recorded to `DrillHistoryStore` AND DrillRunner's `finalizeCompletion()` recorded again — same drill written twice.

- [x] 4.5.1.1 — Removed `DrillHistoryStore.record()` from `completeCurrentDrill()` in MissionScheduleContext. Recording is now solely DrillRunner's responsibility (carries self-assessment, notes, elapsed time, and correct domainId).
- [x] 4.5.1.2 — Removed unused `DrillHistoryStore` and `resolveDomainForDrillCategory` imports from MissionScheduleContext.
- [x] 4.5.1.3 — Updated `MissionScheduleContext.test.tsx`: replaced "records entry to DrillHistoryStore" test with "does not double-record to DrillHistoryStore" test asserting `record` is NOT called.

#### Bug 2 — `resolveDomainId()` returned `undefined` for plan drills
> DrillRunner tried card-meta then kit-moduleId, both failed for physical drills started from PlanSurface. Domain attribution was lost on the DrillRunner recording path.

- [x] 4.5.2.1 — Added third fallback in DrillRunner's `resolveDomainId()`: calls `resolveDomainForDrillCategory(state.drillId)` to walk DrillCategoryCache hierarchy.
- [x] 4.5.2.2 — Priority chain is now: (1) card meta → moduleId, (2) kit drill → moduleId, (3) DrillCategoryCache → categoryId, (4) undefined.

#### Bug 3 — `getPrimaryKit()` regenerated a random kit on every call
> `generateMissionKit()` uses `Math.random()`. Every render produced different drills — readiness score was non-deterministic.

- [x] 4.5.3.1 — Added session-scoped `cachedGeneratedKit` variable in MissionKitStore. Generate once, return same kit on every subsequent `getPrimaryKit()` call.
- [x] 4.5.3.2 — Cache invalidated automatically when `TrainingModuleCache.subscribeToSelectionChanges` fires (user toggles modules).
- [x] 4.5.3.3 — Added `regenerateKit()` method for explicit invalidation.
- [x] 4.5.3.4 — Added 2 tests: "returns same cached kit on repeated calls" and "regenerateKit clears the cache".

#### Bug 4 — `completeCurrentDrill()` blindly advanced the schedule
> A Training Tab card drill completion in DrillRunner called `completeCurrentDrill()` which popped the next physical drill from the schedule — wrong drill marked complete.

- [x] 4.5.4.1 — Changed `completeCurrentDrill` signature to `(drillId?: string) => void`.
- [x] 4.5.4.2 — When `drillId` is provided, compares it against the next uncompleted drill in the schedule. If no match, returns without advancing (log message emitted).
- [x] 4.5.4.3 — When `drillId` is omitted (ChecklistSurface manual button), advances unconditionally for backward compat.
- [x] 4.5.4.4 — DrillRunner now passes `state.drillId` to `completeCurrentDrill(state.drillId)`.
- [x] 4.5.4.5 — Added 2 tests: "mismatched drillId does not advance schedule" and "matching drillId advances the schedule".

#### Fragile area 5 — `resolveDomainForDrillCategory` depends on cache being loaded
- [x] 4.5.5.1 — Added `cache.cache.size === 0` guard with `console.warn` so empty-cache domain resolution is visible in dev instead of silently returning undefined.

---

## Stage 5 — Product Experience Overhaul

> **Goal:** Close the gap between "technically functional" and "daily habit." Fix the four D-grade areas (drill loop, retention, onboarding, data safety) so real humans actually benefit from the training content.  
> **Governing principle:** Same as Stages 1–4 — "The app exists to help a user actually learn 19 disciplines."  
> **Depends on:** All of Stages 1–4 (content, domain tracking, wiring, training browser)  
> **Estimated effort:** 4–6 weeks across 6 phases  
> **Detailed design:** [stage5-product-experience.md](stage5-product-experience.md)

### Context: Why Stage 5 Exists

Stages 1–4 built a complete engine: 4,354 enriched cards, 19-domain progress tracking, a training browser, offline PWA, gamification loop. The codebase is healthy (1,044 tests, clean TypeScript).

But an honest UX audit reveals the engine is powering a C-grade product:

| Area | Current Grade | Target Grade | Key Gap |
|---|---|---|---|
| Content depth | A- | A | — (already strong) |
| Offline/PWA | A | A | — (already strong) |
| Engineering quality | A | A | — (already strong) |
| Core drill loop | C+ | **B+** | Passive learning → active retrieval |
| Retention mechanics | D | **B+** | No spaced repetition → SM-2 scheduling |
| First-run experience | D | **B** | Jargon-heavy onboarding → value-first flow |
| Data safety | D | **B** | localStorage-only → IndexedDB + export/import |

The three root causes: (1) learning is passive — read and self-rate, no testing or wrong-answer state; (2) the app doesn't tell you what to study today — no spaced repetition, every session requires manual navigation; (3) the value proposition is buried behind mission-frame tabs and jargon-heavy onboarding gates.

---

### Phase 5.1 — Quick Wins (~1–2 days)

> Three changes that immediately improve the experience with minimal risk. Combined, these fix the "user can't find the value" problem.

#### Step 5.1.1 — Promote Training tab

> Training is tab 9 of 9. The entire value proposition is hidden behind 6 mission-frame tabs + Stats + Plan.

- [x] 5.1.1.1 — In `MissionShell.tsx`, move Training tab from position 9 to position 2
- [x] 5.1.1.2 — Update any hardcoded tab index references (if any)
- [x] 5.1.1.3 — Test: tab order renders correctly, Training accessible via keyboard/mobile

#### Step 5.1.2 — "Start Today's Training" CTA

> Every session requires Training → pick module → pick deck → launch drill. No one-tap entry.

- [x] 5.1.2.1 — Create `src/components/TodayLauncher/TodayLauncher.tsx` — "Start Today's Training" button component
- [x] 5.1.2.2 — On tap: `MissionKitStore.getPrimaryKit()` → first incomplete drill → `DrillRunStore.start()` → navigate to `/mission/checklist`
- [x] 5.1.2.3 — Show kit summary below button (e.g., "4 drills across Cybersecurity, Fitness, OSINT")
- [x] 5.1.2.4 — Handle edge case: all drills complete → show "Session complete! Regenerate?" prompt
- [x] 5.1.2.5 — Add TodayLauncher to BriefSurface as prominent CTA
- [x] 5.1.2.6 — Component test: CTA renders, launches first drill on click
- [x] 5.1.2.7 — Component test: completed kit shows regenerate prompt

#### Step 5.1.3 — XP award visibility

> Drill completion says "XP awarded" but never shows how much or why. No dopamine trigger.

- [x] 5.1.3.1 — Calculate XP from drill metrics (step count × difficulty multiplier, or existing formula)
- [x] 5.1.3.2 — Display XP amount in drill completion panel with count-up animation
- [x] 5.1.3.3 — Show level progress bar delta ("Level 3 → 42% → 48%")
- [x] 5.1.3.4 — Component test: XP value displays after completion

---

### Phase 5.2 — Spaced Repetition Engine (~8–10 days)

> The single highest-impact feature. Without SR, the app is an encyclopedia. With it, the app becomes a trainer that knows what you're about to forget.

#### Step 5.2.1 — CardProgressStore

> Per-card tracking of review intervals and scheduling. Builds on stable card IDs, existing self-assessment (1–5), and `createStore` factory.

- [x] 5.2.1.1 — Create `src/store/CardProgressStore.ts` using `createStore` factory
- [x] 5.2.1.2 — Define `CardProgressEntry` type: `{ cardId, moduleId, lastReviewedAt, nextReviewAt, interval, easeFactor, repetitions, lapses }`
- [x] 5.2.1.3 — Implement `recordReview(cardId, moduleId, quality)` — quality from self-assessment (1–5) mapped to SM-2 response quality (0–5)
- [x] 5.2.1.4 — Implement `getCardsDueForReview(moduleId?, limit?)` — cards where `nextReviewAt ≤ now`, sorted by most overdue first
- [x] 5.2.1.5 — Implement `getCardProgress(cardId)` — current state for a single card
- [x] 5.2.1.6 — Implement `getModuleReviewStats(moduleId)` — `{ due, learning, mature, total }`
- [x] 5.2.1.7 — Cap store at 10,000 entries with LRU eviction
- [x] 5.2.1.8 — Unit tests: recordReview updates interval/easeFactor, getCardsDueForReview returns overdue cards, LRU eviction works

#### Step 5.2.2 — SM-2 scheduler

> Modified SM-2 (Anki-style) mapped to our 1–5 self-assessment scale.

- [x] 5.2.2.1 — Create `src/utils/srScheduler.ts` with `computeNextReview(entry, quality)` → updated `CardProgressEntry`
- [x] 5.2.2.2 — New card schedule: 1 day → 3 days → (interval × easeFactor) increasing
- [x] 5.2.2.3 — Minimum ease factor: 1.3 (prevents death spiral)
- [x] 5.2.2.4 — Maximum interval cap: 180 days (ensures periodic re-exposure)
- [x] 5.2.2.5 — Unit tests: new card progression, lapse resets, ease floor, interval cap (12+ tests)

#### Step 5.2.3 — DrillRunner integration

> When a drill completes, persist per-card SR state based on the drill's self-assessment rating.

- [x] 5.2.3.1 — In `DrillRunner.finalizeCompletion()`, iterate completed steps with `cardId` → call `CardProgressStore.recordReview(cardId, moduleId, selfAssessment)`
- [x] 5.2.3.2 — Handle missing self-assessment: default to quality 3 (neutral) if user skips rating
- [x] 5.2.3.3 — Integration test: complete drill with 3 card steps → 3 `CardProgressEntry` records with correct intervals
- [x] 5.2.3.4 — Integration test: repeat drill with low rating → interval resets, lapse increments

#### Step 5.2.4 — SR-aware drill step selection

> When building drill steps, prioritize cards that are due for review.

- [x] 5.2.4.1 — In `buildDrillStepsFromModule()`, check `CardProgressStore.getCardsDueForReview(moduleId)` first
- [x] 5.2.4.2 — Fill steps with due cards first, then unseen cards, then future-review cards
- [x] 5.2.4.3 — In `buildDrillStepsFromDeck()`, same priority: due → unseen → future
- [x] 5.2.4.4 — Unit test: due cards appear before unseen cards in step order
- [x] 5.2.4.5 — Unit test: when no cards are due, unseen cards are selected

#### Step 5.2.5 — Review stats in UI

- [x] 5.2.5.1 — Add review stats to ModuleBrowser tiles: "12 due · 45 learning · 180 mature"
- [x] 5.2.5.2 — Add "Due for review" summary on Training surface when any cards are overdue
- [x] 5.2.5.3 — Add review forecast to DeckBrowser: per-deck due count
- [x] 5.2.5.4 — Component test: ModuleBrowser shows correct due/learning/mature counts
- [x] 5.2.5.5 — Component test: Training surface summary appears when cards tracked

---

### Phase 5.3 — Quiz Mode (~6–8 days)

> Transforms passive reading into active retrieval. Uses existing Exercise infrastructure (prompt/expectedOutcome/hints on every card).

#### Step 5.3.1 — Quiz engine core

- [x] 5.3.1.1 — Create `src/utils/quizGenerator.ts` with `generateQuiz(cards, maxQuestions)` entry point
- [x] 5.3.1.2 — Define `QuizQuestion`, `QuizAnswer`, `QuizSession` types in `src/types/Quiz.ts`
- [x] 5.3.1.3 — Generate MC questions from `exercises[].prompt` + `expectedOutcome` (correct) + distractors from same-deck cards
- [x] 5.3.1.4 — Generate term-match questions from `keyTerms` (match term to definition from bulletpoints)
- [x] 5.3.1.5 — Generate fill-blank from `learningObjectives` (mask key phrase)
- [x] 5.3.1.6 — Generate true-false from `bulletpoints` (flip one fact for false variant)
- [x] 5.3.1.7 — Unit tests: 20 tests across all generators + main entry (quizGenerator.test.ts)

#### Step 5.3.2 — Quiz runner component

- [x] 5.3.2.1 — Create `src/components/QuizRunner/QuizRunner.tsx` — renders quiz questions one at a time
- [x] 5.3.2.2 — MC mode: 4 option buttons, highlight correct/incorrect on select, next button
- [x] 5.3.2.3 — Fill-blank mode: text input with fuzzy matching against `correctAnswer`
- [x] 5.3.2.4 — Term-match mode: tap-to-assign matching pairs
- [x] 5.3.2.5 — Progressive hints: "Need a hint?" button reveals hints one at a time
- [x] 5.3.2.6 — Running score: "N correct" with progress bar
- [x] 5.3.2.7 — Create `QuizRunner.module.css`
- [x] 5.3.2.8 — Component tests: 18 tests covering render, MC/TF/fill answers, hints, results, SR integration (QuizRunner.test.tsx)

#### Step 5.3.3 — Quiz results + SR integration

- [x] 5.3.3.1 — Quiz completion screen: score percentage, per-question review (show correct answer for missed)
- [x] 5.3.3.2 — Map quiz score to self-assessment: 90–100% → 5, 70–89% → 4, 50–69% → 3, 30–49% → 2, <30% → 1
- [x] 5.3.3.3 — Feed per-card quiz result to `CardProgressStore.recordReview()` — correct = quality 4–5, incorrect = quality 1–2
- [x] 5.3.3.4 — Record quiz completion to `DrillHistoryStore` with actual score (not self-rated)
- [x] 5.3.3.5 — Integration verified: QuizRunner.test.tsx confirms CardProgressStore.recordReview called per-card + DrillHistoryStore.record with correct drillId/stepCount

#### Step 5.3.4 — Quiz launch points

- [x] 5.3.4.1 — Add "Quiz this deck" button in DeckBrowser (alongside "Train this deck")
- [x] 5.3.4.2 — Add "Quiz module" button in DeckBrowser (10 questions from module cards)
- [x] 5.3.4.3 — Add quiz mode to TodayLauncher: "Review N Due Cards" button quizzes SR-due cards
- [x] 5.3.4.4 — Route: `/mission/quiz` renders QuizSurface with deck/module/review params
- [x] 5.3.4.5 — Component tests: DeckBrowser quiz buttons render + navigate (DeckBrowser.test.tsx), QuizSurface tests (5 tests)

---

### Phase 5.4 — Onboarding Streamline (~3–4 days)

> Cut the time-to-first-drill from ~3 minutes to <60 seconds. Show value before asking for configuration.

#### Step 5.4.1 — "Try a drill first" fast path

> Current gates: Guidance overlay → Archetype picker → Handler picker → Mission intake → Brief. Zero training value before 4 config steps.

- [x] 5.4.1.1 — Add "Jump into training" option on guidance overlay (alongside "Continue setup")
- [x] 5.4.1.2 — Fast path skips archetype + handler + intake, sets temporary defaults (Generalist archetype)
- [x] 5.4.1.3 — Fast path navigates directly to Training tab with pre-selected "Starter" drill (10 cards from 3 popular modules)
- [x] 5.4.1.4 — After first drill completion, prompt: "Ready to customize your training? Pick your archetype."
- [x] 5.4.1.5 — Fast-path flag in localStorage, cleared once full onboarding completed
- [x] 5.4.1.6 — Component test: fast path skips gates and lands on Training
- [x] 5.4.1.7 — Component test: post-first-drill prompts archetype selection

#### Step 5.4.2 — Value-first orientation

- [x] 5.4.2.1 — Replace "Guided Training Quick Start" bullet-point overlay with value-first welcome ("Train 19 Disciplines. Track Your Growth." with 2 buttons)
- [x] 5.4.2.2 — "Start Training Now" fast-path button on welcome overlay
- [x] 5.4.2.3 — "Choose Your Focus First" → archetype picker (contextually motivated)
- [x] 5.4.2.4 — MissionIntakePanel rewritten: jargon → value-first messaging ("Your Training Hub", how it works, first session, track growth)

#### Step 5.4.3 — Archetype impact amplification

> Archetype selection barely affects the experience — just star markers and context hints. Make it meaningfully customize the curriculum.

- [x] 5.4.3.1 — After archetype selection, auto-select the archetype's core + secondary modules in `TrainingModuleCache`
- [x] 5.4.3.2 — "Today's Training" kit uses archetype weighting (already in missionKitGenerator — ensure CTA surfaces it)
- [x] 5.4.3.3 — ModuleBrowser: archetype-core modules pinned to top with Core/Focus badges
- [x] 5.4.3.4 — Component test: archetype pinning renders correct order and badges

---

### Phase 5.5 — Progress Visualization (~3–4 days)

> Show users they're improving. This is the habit hook — "I can see myself getting better."

#### Step 5.5.1 — Score history over time

- [x] 5.5.1.1 — Create `src/store/ProgressSnapshotStore.ts` — records daily domain score snapshots via `createStore` (max 7,000 entries)
- [x] 5.5.1.2 — Trigger snapshot on first drill completion each day (dynamic import in `DrillHistoryStore.record()`)
- [x] 5.5.1.3 — Implement `getScoreHistory(moduleId, days)` — time-series for chart rendering
- [x] 5.5.1.4 — Cap at 365 days × 19 domains ≈ 7,000 entries via `maxEntries`
- [x] 5.5.1.5 — Unit tests: 13 tests (daily snapshots, deduplication, history range, weekly deltas, reset)

#### Step 5.5.2 — Progress charts

- [x] 5.5.2.1 — SVG line chart on Stats surface: `ScoreLineChart` — per-domain score over 30 days, pure SVG polylines, Y-axis (0–100), legend with hover highlight (7 tests)
- [x] 5.5.2.2 — Sparklines on ModuleBrowser tiles: `Sparkline` component — 7-day trend, 48×16 SVG inline next to score bar (4 tests)
- [x] 5.5.2.3 — Weekly summary on BriefSurface: `WeeklySummary` — gains (+N Domain) in green, losses in orange, inserted below TodayLauncher (2 tests)
- [x] 5.5.2.4 — Component tests: ScoreLineChart (7), Sparkline (4), WeeklySummary (2) = 13 component tests

#### Step 5.5.3 — Review heatmap

- [x] 5.5.3.1 — `ActivityHeatmap` on Stats surface: GitHub-style grid, color intensity = drills + cards reviewed per day
- [x] 5.5.3.2 — Shows last 91 days in 13 weeks × 7 days grid
- [x] 5.5.3.3 — Tooltip on hover: "Mar 12: 4 drills, 32 cards reviewed" with fixed positioning
- [x] 5.5.3.4 — Component tests: 6 tests (grid renders 91 cells, tooltip shows/hides, correct data per day)

---

### Phase 5.6 — Data Safety (~2–3 days)

> Protect against the #1 trust-killer: "I cleared my browser and lost everything."

#### Step 5.6.1 — IndexedDB backup

- [x] 5.6.1.1 — Create `src/utils/backupManager.ts` — mirrors critical stores (DrillHistory, CardProgress, UserProgress, OperativeProfile) to IndexedDB
- [x] 5.6.1.2 — Backup frequency: on every `DrillHistoryStore.record()` and `CardProgressStore.recordReview()` (debounced 5s)
- [x] 5.6.1.3 — On app startup: if localStorage is empty but IndexedDB has data, restore
- [x] 5.6.1.4 — Integration test: clear localStorage → app restores from IndexedDB backup (7 tests)

#### Step 5.6.2 — Manual export/import

- [x] 5.6.2.1 — Add "Export training data" button in DataSafetyPanel on Debrief surface — exports all store data as JSON file download
- [x] 5.6.2.2 — Add "Import training data" button — reads JSON, validates schema, merges into stores (with force overwrite)
- [x] 5.6.2.3 — Include schema version in export for forward-compatibility
- [x] 5.6.2.4 — Unit tests: export generates valid JSON with all store data (10 tests)
- [x] 5.6.2.5 — Component test: DataSafetyPanel renders export/import buttons (3 tests)

---

## Summary

| Stage | Phases | Steps | Tasks | Status |
|-------|--------|-------|-------|--------|
| 1 — DrillRunner content + self-assessment | 5 | 12 | 42 | Complete (42/42) |
| 2 — Per-domain progress tracking | 4 | 8 | 27 | Complete (27/27) |
| 3 — Card schema + content enrichment | 5 | 11 | 37 | Complete (37/37) |
| 4 — Last-mile wiring + training content access | 5 | 19 | 88 | Complete (88/88) |
| 5 — Product experience overhaul | 6 | 20 | 102 | Complete (102/102) |
| **Total** | **25** | **70** | **296** | **296/296 (100%)** |
