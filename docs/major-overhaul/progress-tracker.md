# Progress Tracker (Solo Overhaul)

- [x] Program Reset: Execution-grade transmutation track
  - [x] Step R.1: Treat prior stages as baseline hardening, not full persona refactor completion
  - [x] Step R.2: Execute Stage 6+ as primary path to app-wide mission-console reconstruction

## Priority Queue (Order of Operations)

- P0 (Start now): Stage 6 → Step 5.1 (domain contracts + invariants)
  - Why first: All route, UI, and telemetry work depends on stable canonical entities.
  - Exit criteria: Tasks 5.1.1–5.1.3 complete with validation fixtures.

- P1 (Immediately after P0): Stage 6 → Step 5.2 (legacy adapters)
  - Why second: Enables migration without breaking current content sources.
  - Exit criteria: Tasks 5.2.1–5.2.3 complete; drift report script passes.

- P2 (Then): Stage 6 → Step 5.3 (canonical read path + flag)
  - Why third: Needed before route reconstruction can safely consume new model.
  - Exit criteria: Tasks 5.3.1–5.3.3 complete; deep-link matrix green in both modes.

- P3: Stage 7 → Step 6.1 (navigation + route tree refactor)
  - Why fourth: Route shells should be rebuilt only after canonical read path is usable.
  - Exit criteria: Tasks 6.1.1–6.1.3 complete with legacy redirects in place.

- P4: Stage 7 → Step 6.2 then 6.3 (state continuity, then loading/empty/error redesign)
  - Why fifth: Continuity must be solved before polishing route states.
  - Exit criteria: Tasks 6.2.1–6.2.3 complete before 6.3.1–6.3.3.

- P5: Stage 8 → Step 7.1 then 7.2 then 7.3 (tokens → components → interactions)
  - Why sixth: Interaction model should be built on finalized tokens/components.
  - Exit criteria: Theming tokens applied before core components and keyboard model.

- P6: Stage 9 → Step 8.1 then 8.2 then 8.3 (copy → exemplar ops → progression)
  - Why seventh: Content language foundation precedes scenario authoring and scoring.
  - Exit criteria: Copy sweep done before Operation Alpha/Bravo/Charlie production.

- P7: Stage 10 → Step 9.1 then 9.2 then 9.3 (telemetry → offline/deeplink → perf)
  - Why eighth: Observability must exist before confidence and optimization passes.
  - Exit criteria: Telemetry contracts validated prior to full offline/perf hardening.

- P8 (Final): Stage 11 → Step 10.1 then 10.2 then 10.3 (cutover → retire legacy → stabilize)
  - Why last: Cutover only after all functional and reliability gates are green.
  - Exit criteria: Mission-default enabled, rollback validated, stabilization protocol active.

## Current Focus Lock

- Active lane: P6 only (Stage 9, Step 8.1)
- Do not start P6+ until P5 exit criteria are met.

- [x] Stage 1: Baseline and Guards
  - [x] Phase 0: Rewrites + SW Skeleton
    - [x] Step 0.1: Automated deep-link checks
      - [x] Task 0.1.1: Build headless deep-link script (home, mission-kit, drills, training/execute, c/:slug, share/:slug)
        - [x] Subtask 0.1.1.1: Prep routes/fixtures for script
        - [x] Subtask 0.1.1.2: Add assertions for load/redirect states
        - [x] Subtask 0.1.1.3: Emit structured errors on failure
      - [x] Task 0.1.2: Pipe results into telemetry-and-qa/test-matrix-deeplinks-offline (automation log)
        - [x] Subtask 0.1.2.1: Log pass/fail per route from script output (matrix stub added; pending next run)
        - [x] Subtask 0.1.2.2: Note follow-ups in doc
    - [x] Step 0.2: Add SW skeleton and offline indicator
      - [x] Task 0.2.1: Implement SW install/activate with no-op precache
        - [x] Subtask 0.2.1.1: Add SW registration in app shell
        - [x] Subtask 0.2.1.2: Implement install/activate handlers
        - [x] Subtask 0.2.1.3: Validate SW lifecycle via automated checks
      - [x] Task 0.2.2: Add offline indicator UI toggle
        - [x] Subtask 0.2.2.1: Add network listener hook
        - [x] Subtask 0.2.2.2: Render indicator in header/Home
      - [x] Task 0.2.3: Scripted verification of offline indicator
        - [x] Subtask 0.2.3.1: Simulate network drop in test script and assert UI state

- [x] Stage 2: IA/Copy + Readiness Slice
  - [x] Phase 1: IA/Copy + Readiness
    - [x] Step 1.1: Rename IA to mission language
      - [x] Task 1.1.1: Update nav labels and headers
        - [x] Subtask 1.1.1.1: Update tab labels
        - [x] Subtask 1.1.1.2: Update page headers/CTAs
      - [x] Task 1.1.2: Remove fitness/Web3 phrasing
        - [x] Subtask 1.1.2.1: Sweep copy for fitness/Web3 terms
    - [x] Step 1.2: Add readiness score + next actions on Home
      - [x] Task 1.2.1: Implement local readiness model
        - [x] Subtask 1.2.1.1: Define formula and inputs
        - [x] Subtask 1.2.1.2: Code computation and decay
        - [x] Subtask 1.2.1.3: Add unit tests (local)
        - [x] Subtask 1.2.1.4: Seed with sample data
      - [x] Task 1.2.2: Render score and two actions on Home
        - [x] Subtask 1.2.2.1: Add UI component for score
        - [x] Subtask 1.2.2.2: Add “next two actions” list
        - [x] Subtask 1.2.2.3: Wire telemetry hooks
    - [x] Step 1.3: Minimal mission kit/drill content pack
      - [x] Task 1.3.1: Create starter kits/drills JSON
        - [x] Subtask 1.3.1.1: Draft mission kit schema instance
        - [x] Subtask 1.3.1.2: Draft drills with steps
        - [x] Subtask 1.3.1.3: Validate JSON against schema
        - [x] Task 1.3.2: Wire to UI
          - [x] Subtask 1.3.2.1: Load sample pack via store
          - [x] Subtask 1.3.2.2: Render kits/drills lists
          - [x] Subtask 1.3.2.3: Add visibility toggle (dev config)
      - [x] Step 1.4: Privacy note and Web3 removal
        - [x] Task 1.4.1: Hide/remove Web3 panel
          - [x] Subtask 1.4.1.1: Remove UI entry points
        - [x] Task 1.4.2: Add privacy note in Ops/Settings
          - [x] Subtask 1.4.2.1: Draft privacy note copy
          - [x] Subtask 1.4.2.2: Insert into Ops/Settings view

- [x] Stage 2a: ~~Persona-first Ops UX~~ (SUPERSEDED — all objectives delivered via Stage 6–11 depth track)

- [x] Stage 3: Offline/Low-data + Drill Flow
  - [x] Phase 2: Offline + Low-data
    - [x] Step 2.1: Precache and runtime caching
      - [x] Task 2.1.1: Define precache list (shell + starter pack)
        - [x] Subtask 2.1.1.1: List assets and JSON to cache
        - [x] Subtask 2.1.1.2: Size-check against budget
      - [x] Task 2.1.2: Implement runtime caching for drills/assets
        - [x] Subtask 2.1.2.1: Add SW routes for drills JSON
        - [x] Subtask 2.1.2.2: Add caching strategy for media
        - [x] Subtask 2.1.2.3: Handle versioning/cleanup
        - [x] Subtask 2.1.2.4: Test cache hit/miss paths
    - [x] Step 2.2: Preload/sync and low-data toggle
      - [x] Task 2.2.1: Add preload/sync action
        - [x] Subtask 2.2.1.1: Trigger fetch + cache warmup
        - [x] Subtask 2.2.1.2: Show progress/state in UI
      - [x] Task 2.2.2: Add low-data toggle and enforce budgets
        - [x] Subtask 2.2.2.1: Add toggle in Ops/Settings
        - [x] Subtask 2.2.2.2: Enforce low-data asset selection
        - [x] Subtask 2.2.2.3: Verify reduced requests
    - [x] Step 2.3: Drill run offline continuity
      - [x] Task 2.3.1: Ensure drill run works offline after sync
        - [x] Subtask 2.3.1.1: Test cached drill steps
        - [x] Subtask 2.3.1.2: Handle re-entry mid-drill
        - [x] Subtask 2.3.1.3: Queue telemetry while offline
      - [x] Task 2.3.2: Add offline fallbacks for missing assets
        - [x] Subtask 2.3.2.1: Text-first fallback when media absent
        - [x] Subtask 2.3.2.2: User messaging for missing cache
    - [x] Step 2.4: Automated offline deep-link matrix
      - [x] Task 2.4.1: Run headless offline matrix after sync
        - [x] Subtask 2.4.1.1: Prepare cached state in setup script
        - [x] Subtask 2.4.1.2: Execute offline cases per route
        - [x] Subtask 2.4.1.3: Emit structured error logs on failure
        - [x] Task 2.4.2: Log results in test-matrix doc
          - [x] Subtask 2.4.2.1: Update pass/fail table from script output

- [x] Stage 4: Signals/AAR Stub
  - [x] Phase 3: Signals + AAR (local-only)
    - [x] Step 3.1: Signals list with ack/resolve
      - [x] Task 3.1.1: Implement local Signals list
        - [x] Subtask 3.1.1.1: Data model and local storage
        - [x] Subtask 3.1.1.2: List UI and filters
        - [x] Subtask 3.1.1.3: Basic telemetry hooks
      - [x] Task 3.1.2: Support ack/resolve and offline queue messaging
        - [x] Subtask 3.1.2.1: Ack/resolve state transitions
        - [x] Subtask 3.1.2.2: Offline queue notice copy
        - [x] Subtask 3.1.2.3: Local persistence for queued actions
    - [x] Step 3.2: AAR template and export
      - [x] Task 3.2.1: Add AAR create/save locally
        - [x] Subtask 3.2.1.1: Form fields and validation
        - [x] Subtask 3.2.1.2: Local save with versioning
        - [x] Subtask 3.2.1.3: Autosave and restore
      - [x] Task 3.2.2: Support export/share (text/JSON)
        - [x] Subtask 3.2.2.1: Generate text/JSON export
        - [x] Subtask 3.2.2.2: Provide download/share action
    - [x] Step 3.3: Role tags (lightweight)
      - [x] Task 3.3.1: Add role labels to Signals/AAR entries
        - [x] Subtask 3.3.1.1: Define role labels and colors
      - [x] Task 3.3.2: Document assumptions/risks
        - [x] Subtask 3.3.2.1: Note lack of enforced ACL

- [x] Stage 5: Telemetry/Automation and Rollout
  - [x] Cross-cutting: Telemetry, tests, delivery
    - [x] Step 4.1: Event taxonomy + logging
      - [x] Task 4.1.1: Implement event emitters (console/local sink)
        - [x] Subtask 4.1.1.1: Add emitter utility
        - [x] Subtask 4.1.1.2: Wire to key flows (IA, readiness, offline, drills)
        - [x] Subtask 4.1.1.3: Add log sampling/guards
      - [x] Task 4.1.2: Automated validation of key events
        - [x] Subtask 4.1.2.1: Write script to trigger flows headlessly
        - [x] Subtask 4.1.2.2: Assert payload shapes and required fields (validation script emits JSON report)
        - [x] Subtask 4.1.2.3: Capture findings in telemetry doc
    - [x] Step 4.2: Automated test suites
      - [x] Task 4.2.1: Finalize deep-link/offline test cases
        - [x] Subtask 4.2.1.1: Enumerate cases and expected results
        - [x] Subtask 4.2.1.2: Mark cadence for headless runs (per phase)
      - [x] Task 4.2.2: Run headless smoke per phase and record results
        - [x] Subtask 4.2.2.1: Execute smoke suite after each phase
        - [x] Subtask 4.2.2.2: Log outcomes and defects automatically
      - [x] Task 4.2.3: Add full mission UI scenario simulation
        - [x] Subtask 4.2.3.1: Simulate operator journey (Brief → Debrief) with realistic UI interactions
        - [x] Subtask 4.2.3.2: Emit machine-readable scenario report artifact for release evidence
    - [x] Step 4.3: Deploy/rollback steps
      - [x] Task 4.3.1: Document deploy/rollback steps
        - [x] Subtask 4.3.1.1: Write deploy steps and defaults
        - [x] Subtask 4.3.1.2: Note dependencies between features
      - [x] Task 4.3.2: Scripted rollback verification
        - [x] Subtask 4.3.2.1: Run sanity suite after rollback
        - [x] Subtask 4.3.2.2: Document rollback timing and impacts
    - [x] Step 4.4: Monolith reductions
      - [x] Task 4.4.1: Split WorkoutResultsPanel into subcomponents/helpers
        - [x] Subtask 4.4.1.1: Extract result summary/presentation logic into focused components
        - [x] Subtask 4.4.1.2: Move shared formatting/helpers into utility modules
      - [x] Task 4.4.2: Split WorkoutScheduleStore into modular slices
        - [x] Subtask 4.4.2.1: Separate schedule state domains into independent store slices
        - [x] Subtask 4.4.2.2: Update selectors/actions to consume slice boundaries
      - [x] Task 4.4.3: Split cardDeckPaths into shard modules + regenerate via script
        - [x] Subtask 4.4.3.1: Partition path definitions into shard files by content domain
        - [x] Subtask 4.4.3.2: Regenerate aggregate paths and verify output parity
      - [x] Task 4.4.4: Split remaining >500 line files (none pending; next candidates <500 lines)
        - [x] Subtask 4.4.4.1: Audit TypeScript source for files exceeding 500 lines
        - [x] Subtask 4.4.4.2: Record next split candidates for proactive maintenance

- [x] Stage 6: App-wide Domain Transmutation
  - [x] Phase 5: Canonical domain model + migration adapters
    - [x] Step 5.1: Define domain contracts and invariants
      - [x] Task 5.1.1: Add schema/types for operation, case, lead, signal, artifact, intel packet, debrief outcome
        - [x] Subtask 5.1.1.1: Create TypeScript interfaces/types for all canonical entities
        - [x] Subtask 5.1.1.2: Add schema-level required field checks and example fixtures
      - [x] Task 5.1.2: Define entity identity/versioning strategy and lifecycle states
        - [x] Subtask 5.1.2.1: Define ID strategy and version metadata rules per entity
        - [x] Subtask 5.1.2.2: Define lifecycle transition matrix with invalid transition guards
      - [x] Task 5.1.3: Add validation utilities and fixture coverage for edge states
        - [x] Subtask 5.1.3.1: Implement validation utility functions for schema and state invariants
        - [x] Subtask 5.1.3.2: Add fixtures for edge states (partial data, invalid states, stale versions)
    - [x] Step 5.2: Add legacy-to-new adapters
      - [x] Task 5.2.1: Map legacy modules/submodules/decks/cards to canonical entities
        - [x] Subtask 5.2.1.1: Author field mapping table from legacy structures to canonical model
        - [x] Subtask 5.2.1.2: Identify unmapped legacy fields and decide keep/drop policy
      - [x] Task 5.2.2: Build adapter layer with deterministic transformation outputs
        - [x] Subtask 5.2.2.1: Implement transformation functions for each legacy content layer
        - [x] Subtask 5.2.2.2: Add deterministic output tests using snapshot or strict equality checks
      - [x] Task 5.2.3: Add migration drift report script (missing fields, invalid transitions)
        - [x] Subtask 5.2.3.1: Build script to report schema gaps and transition violations
        - [x] Subtask 5.2.3.2: Emit machine-readable report for CI/local review
    - [x] Step 5.3: Adopt canonical read path
      - [x] Task 5.3.1: Route current content loaders through adapter-backed canonical selectors
        - [x] Subtask 5.3.1.1: Add canonical selectors for mission routes and shared widgets
        - [x] Subtask 5.3.1.2: Switch loader usage to canonical selectors behind a compatibility shim
      - [x] Task 5.3.2: Add feature flag to switch canonical path on/off
        - [x] Subtask 5.3.2.1: Add runtime flag and default behavior for canonical read path
        - [x] Subtask 5.3.2.2: Document toggle procedure for testing and rollback
      - [x] Task 5.3.3: Validate no deep-link regressions under both paths
        - [x] Subtask 5.3.3.1: Run deep-link matrix with canonical path enabled
        - [x] Subtask 5.3.3.2: Run deep-link matrix with canonical path disabled and compare results

- [x] Stage 7: Route and Flow Reconstruction
  - [x] Phase 6: Mission-first UX architecture
    - [x] Step 6.1: Navigation and route tree refactor
      - [x] Task 6.1.1: Replace workout-centric IA with mission flow hierarchy
        - [x] Subtask 6.1.1.1: Define mission route hierarchy and nav grouping
        - [x] Subtask 6.1.1.2: Update route metadata, labels, and ordering to match mission flow
      - [x] Task 6.1.2: Implement top-level routes for Brief, Triage, Case, Signal, Checklist, Debrief
        - [x] Subtask 6.1.2.1: Add route definitions and shell pages for all six mission surfaces
        - [x] Subtask 6.1.2.2: Connect shells to canonical data selectors with loading/error boundaries
      - [x] Task 6.1.3: Add fallback/redirect behavior from legacy routes
        - [x] Subtask 6.1.3.1: Define legacy-to-mission redirect map for deprecated paths
        - [x] Subtask 6.1.3.2: Implement fallback handlers and verify deep-link compatibility
    - [x] Step 6.2: Cross-route state continuity
      - [x] Task 6.2.1: Persist active operation/case/signal context across route transitions
        - [x] Subtask 6.2.1.1: Define shared context store for active mission entities
        - [x] Subtask 6.2.1.2: Wire route transitions to preserve and restore active context
      - [x] Task 6.2.2: Implement resume-on-reentry behavior for interrupted missions
        - [x] Subtask 6.2.2.1: Persist checkpoint state on mission interruption events
        - [x] Subtask 6.2.2.2: Restore checkpoint and guide user back to correct step on reentry
      - [x] Task 6.2.3: Add deterministic URL state for shareable deep links
        - [x] Subtask 6.2.3.1: Define URL param contract for operation/case/signal context
        - [x] Subtask 6.2.3.2: Add encode/decode guards for invalid or stale URL state
    - [x] Step 6.3: Error/empty/loading behavior redesign
      - [x] Task 6.3.1: Mission-aware empty states (next action clarity)
        - [x] Subtask 6.3.1.1: Define empty-state templates per mission route
        - [x] Subtask 6.3.1.2: Add next-action CTAs to move user to valid mission step
      - [x] Task 6.3.2: Failure states with investigation-safe recovery options
        - [x] Subtask 6.3.2.1: Define recovery actions for network/data/render failures
        - [x] Subtask 6.3.2.2: Implement failure-state components with actionable guidance
      - [x] Task 6.3.3: Loading skeletons tuned for split-pane mission surfaces
        - [x] Subtask 6.3.3.1: Design split-pane skeleton layouts for each core route
        - [x] Subtask 6.3.3.2: Implement skeleton states and validate perceived-load behavior

- [x] Stage 8: Ops Design System + Interaction Model
  - [x] Phase 7: UI primitives and layout contracts
    - [x] Step 7.1: Mission theming tokens
      - [x] Task 7.1.1: Define semantic color tokens for severity/trust/state transitions
        - [x] Subtask 7.1.1.1: Create severity/trust/state semantic token catalog
        - [x] Subtask 7.1.1.2: Map tokens to component states and document usage constraints
      - [x] Task 7.1.2: Define typography scale and hierarchy for ops console readability
        - [x] Subtask 7.1.2.1: Define heading/body/mono text scales for dense mission layouts
        - [x] Subtask 7.1.2.2: Apply and verify readability across major mission screens
      - [x] Task 7.1.3: Define iconography mapping for signal, lead, artifact, threat classes
        - [x] Subtask 7.1.3.1: Build icon mapping table by entity and severity class
        - [x] Subtask 7.1.3.2: Validate icon semantics in triage and case detail views
    - [x] Step 7.2: Core mission components
      - [x] Task 7.2.1: Mission header (status, objective, timebox, readiness)
        - [x] Subtask 7.2.1.1: Implement mission header layout and state variants
        - [x] Subtask 7.2.1.2: Bind header to live operation context and readiness source
      - [x] Task 7.2.2: Triage board components (columns, card density modes, priority badges)
        - [x] Subtask 7.2.2.1: Implement column/card primitives with severity and status badges
        - [x] Subtask 7.2.2.2: Add density/view mode toggles and persistence behavior
      - [x] Task 7.2.3: Evidence/artifact list + detail viewer component pair
        - [x] Subtask 7.2.3.1: Build artifact list with sorting/filter affordances
        - [x] Subtask 7.2.3.2: Build detail viewer with metadata and action surface
      - [x] Task 7.2.4: Alert stream and timeline band components
        - [x] Subtask 7.2.4.1: Implement alert stream with severity/time grouping
        - [x] Subtask 7.2.4.2: Implement timeline band with event markers and jump links
    - [x] Step 7.3: Interaction system
      - [x] Task 7.3.1: Keyboard-first triage actions (ack, escalate, defer, resolve)
        - [x] Subtask 7.3.1.1: Define keyboard shortcut map for triage state transitions
        - [x] Subtask 7.3.1.2: Implement shortcut handlers with focus-safe execution
      - [x] Task 7.3.2: Multi-pane focus management and accessibility labels
        - [x] Subtask 7.3.2.1: Implement focus trap/restore behavior across split panes
        - [x] Subtask 7.3.2.2: Add accessible labels/roles for mission-critical controls
      - [x] Task 7.3.3: Fast action palette for mission-critical shortcuts
        - [x] Subtask 7.3.3.1: Implement command palette trigger and searchable actions
        - [x] Subtask 7.3.3.2: Integrate mission context actions into palette results

- [x] Stage 9: Content and Scenario Production
  - [x] Phase 8: Mission content overhaul
    - [x] Step 8.1: Copy rewrite and lexicon enforcement
      - [x] Task 8.1.1: Replace remaining fitness/Web3 terminology in all visible strings
        - [x] Subtask 8.1.1.1: Run targeted copy sweep across UI strings and data content names
        - [x] Subtask 8.1.1.2: Review and approve replacements against mission lexicon rules
      - [x] Task 8.1.2: Add mission lexicon lint checklist for future copy edits
        - [x] Subtask 8.1.2.1: Define forbidden/required terminology checklist
        - [x] Subtask 8.1.2.2: Add checklist to contribution docs and review workflow
      - [x] Task 8.1.3: Apply SOP/ROE tone across system messaging
        - [x] Subtask 8.1.3.1: Draft SOP/ROE style guide for alerts, prompts, and guidance
        - [x] Subtask 8.1.3.2: Rewrite key system messages and validate tone consistency
    - [x] Step 8.2: Exemplar operations
      - [x] Task 8.2.1: Build Operation Alpha (introductory triage + debrief)
        - [x] Subtask 8.2.1.1: Author Operation Alpha narrative, entities, and step sequence
        - [x] Subtask 8.2.1.2: Validate end-to-end run through all mission routes
      - [x] Task 8.2.2: Build Operation Bravo (signal-heavy analysis workflow)
        - [x] Subtask 8.2.2.1: Author Operation Bravo signal set and analysis branches
        - [x] Subtask 8.2.2.2: Validate signal drill-down and decision outcomes
      - [x] Task 8.2.3: Build Operation Charlie (artifact-chain decision workflow)
        - [x] Subtask 8.2.3.1: Author Operation Charlie artifact chain and dependencies
        - [x] Subtask 8.2.3.2: Validate artifact navigation and decision traceability
    - [x] Step 8.3: Training progression model
      - [x] Task 8.3.1: Define competency dimensions and scoring rubric
        - [x] Subtask 8.3.1.1: Define competency categories and weighted scoring rules
        - [x] Subtask 8.3.1.2: Map mission actions to competency score inputs
      - [x] Task 8.3.2: Tie debrief outcomes to readiness and progression
        - [x] Subtask 8.3.2.1: Define debrief-to-readiness update formula and constraints
        - [x] Subtask 8.3.2.2: Implement progression updates from debrief completion events
      - [x] Task 8.3.3: Add mission completion milestones and unlock criteria
        - [x] Subtask 8.3.3.1: Define milestone tiers and unlock prerequisites
        - [x] Subtask 8.3.3.2: Surface milestone progress in mission and home views

- [x] Stage 10: Reliability, Telemetry, and QA Hardening
  - [x] Phase 9: End-to-end confidence gates
    - [x] Step 9.1: Telemetry taxonomy expansion
      - [x] Task 9.1.1: Define event contracts for every mission step transition
        - [x] Subtask 9.1.1.1: Create event contract table for all mission route transitions
        - [x] Subtask 9.1.1.2: Add required/optional payload field definitions per event
      - [x] Task 9.1.2: Add payload validation tests and schema drift checks
        - [x] Subtask 9.1.2.1: Implement automated payload schema validation tests
        - [x] Subtask 9.1.2.2: Add schema drift detector to compare emitted payloads over time
      - [x] Task 9.1.3: Generate human-readable telemetry audit reports per run
        - [x] Subtask 9.1.3.1: Add report formatter for telemetry validation output
        - [x] Subtask 9.1.3.2: Publish per-run summary artifacts for manual review
    - [x] Step 9.2: Offline and deep-link coverage expansion
      - [x] Task 9.2.1: Extend deep-link matrix to all mission routes and states
        - [x] Subtask 9.2.1.1: Add mission route permutations to deep-link matrix spec
        - [x] Subtask 9.2.1.2: Implement matrix automation updates for new state parameters
      - [x] Task 9.2.2: Validate offline continuity for synced mission critical path
        - [x] Subtask 9.2.2.1: Define offline critical path checkpoints across mission flow
        - [x] Subtask 9.2.2.2: Execute offline runbook and capture pass/fail evidence
      - [x] Task 9.2.3: Add cache corruption and stale-data recovery tests
        - [x] Subtask 9.2.3.1: Simulate cache corruption scenarios and expected recovery behavior
        - [x] Subtask 9.2.3.2: Add stale-data invalidation tests for mission content updates
    - [x] Step 9.3: Performance and bundle control
      - [x] Task 9.3.1: Establish per-route payload budgets for mission surfaces
        - [x] Subtask 9.3.1.1: Measure current payload sizes per mission route
        - [x] Subtask 9.3.1.2: Define and document budget thresholds by route tier
      - [x] Task 9.3.2: Add CI guard script for budget regressions
        - [x] Subtask 9.3.2.1: Implement script to compare build artifacts against route budgets
        - [x] Subtask 9.3.2.2: Wire budget guard into CI and local validation commands
      - [x] Task 9.3.3: Tune rendering hotspots in triage/case/detail surfaces
        - [x] Subtask 9.3.3.1: Profile render cycles for triage/case/detail components
        - [x] Subtask 9.3.3.2: Implement targeted memoization and state partitioning fixes

- [x] Stage 11: Cutover, Deprecation, and Rollback Safety
  - [x] Phase 10: Controlled migration to mission-default app
    - [x] Step 10.1: Progressive cutover
      - [x] Task 10.1.1: Add feature-flag strategy for route-level rollout
        - [x] Subtask 10.1.1.1: Define flag matrix by route/surface and environment
        - [x] Subtask 10.1.1.2: Implement runtime gating and fallback behavior per flag
      - [x] Task 10.1.2: Run mixed-mode validation (legacy + mission routes)
        - [x] Subtask 10.1.2.1: Create mixed-mode test scenarios across shared user journeys
        - [x] Subtask 10.1.2.2: Execute validation and record incompatibility defects
      - [x] Task 10.1.3: Enable mission-default in staging profile
        - [x] Subtask 10.1.3.1: Update staging defaults to mission-first route set
        - [x] Subtask 10.1.3.2: Run staging smoke and rollback drill before sign-off
    - [x] Step 10.2: Legacy path retirement
      - [x] Task 10.2.1: Redirect or remove obsolete workout-centric routes
        - [x] Subtask 10.2.1.1: Identify obsolete routes and assign redirect targets
        - [x] Subtask 10.2.1.2: Implement redirects/removals and validate deep-link behavior
      - [x] Task 10.2.2: Remove dead data structures and unused services
        - [x] Subtask 10.2.2.1: Inventory dead schemas/services after mission-default cutover
        - [x] Subtask 10.2.2.2: Remove unused code paths and verify build/test stability
      - [x] Task 10.2.3: Finalize migration notes and compatibility constraints
        - [x] Subtask 10.2.3.1: Document final migration decisions and deprecated features
        - [x] Subtask 10.2.3.2: Publish compatibility constraints for long-term maintenance
    - [x] Step 10.3: Rollback and stabilization
      - [x] Task 10.3.1: Validate one-command rollback for mission-default flag
        - [x] Subtask 10.3.1.1: Implement rollback command/script and verify execution path
        - [x] Subtask 10.3.1.2: Validate data/state integrity after rollback
      - [x] Task 10.3.2: Run post-rollback smoke and telemetry sanity checks
        - [x] Subtask 10.3.2.1: Execute smoke suite immediately after rollback
        - [x] Subtask 10.3.2.2: Confirm telemetry events continue to validate post-rollback
      - [x] Task 10.3.3: Define stabilization window and defect triage protocol
        - [x] Subtask 10.3.3.1: Define stabilization duration and quality thresholds
        - [x] Subtask 10.3.3.2: Define defect triage cadence and severity routing rules

- [x] Stage 12: Mobile-First UX Overhaul
  - [x] Phase 11: First-load mobile experience
    - [x] Step 11.1: Header nav collapse + drawer
      - [x] Task 11.1.1: Wire existing HeaderDrawer into Header.tsx with hamburger trigger
      - [x] Task 11.1.2: Hide inline nav, chips, settings at ≤768px; show hamburger
      - [x] Task 11.1.3: Add .desktopOnly / .hamburger CSS classes with breakpoint gating
    - [x] Step 11.2: Sequenced onboarding flow
      - [x] Task 11.2.1: Gate intake panel render behind guidance overlay dismissal
      - [x] Task 11.2.2: Hide all shell chrome (MissionHeader, stepTools, assistantCard, Outlet) during onboarding
      - [x] Task 11.2.3: Add min-height + align-content centering to intake + guidance overlay
    - [x] Step 11.3: Header height variable sync
      - [x] Task 11.3.1: Override --header-height on .header at each breakpoint (56/52/48px)
      - [x] Task 11.3.2: Add safe-area-inset-top padding to header and shell
      - [x] Task 11.3.3: Add viewport-fit=cover to index.html meta viewport
    - [x] Step 11.4: Interaction and information density
      - [x] Task 11.4.1: Add min-height: 44px to all buttons at ≤768px (stepButton, CTA, intake actions)
      - [x] Task 11.4.2: Create useIsMobile hook (matchMedia-based, 768px threshold)
      - [x] Task 11.4.3: Hide keyboard shortcut references (⌘K) on mobile in overlay, assistant card, button labels
      - [x] Task 11.4.4: Remove keyboard hints from assistant card on mobile
    - [x] Step 11.5: Branding, typography, safety
      - [x] Task 11.5.1: Rebrand LoadingMessage title, spinner color, title font size to clamp()
      - [x] Task 11.5.2: Update index.html title to Archangel Knights Training Console
      - [x] Task 11.5.3: Convert --mission-type-* to clamp() responsive scale
      - [x] Task 11.5.4: Add scroll-padding-top to html
    - [x] Step 11.6: Polish and finishing
      - [x] Task 11.6.1: Add :active press states (scale 0.97 + opacity 0.85) to all buttons
      - [x] Task 11.6.2: Move NetworkStatusIndicator from top-right to bottom-left
      - [x] Task 11.6.3: Add overflow: hidden to header
    - [x] Step 11.7: Validation
      - [x] Task 11.7.1: E2E scenario passes at 390×844 (mobile) — 27/27 checkpoints
      - [x] Task 11.7.2: E2E scenario passes at 1440×900 (desktop) — 27/27 checkpoints
      - [x] Task 11.7.3: TypeScript + Vite build clean at each phase gate

- [x] Stage 13: Stability & Resilience
  - [x] Phase 12: Error boundaries + code splitting
    - [x] Step 12.1: Root ErrorBoundary component
      - [x] Task 12.1.1: Create ErrorBoundary class component with root/route level prop
      - [x] Task 12.1.2: Add themed fallback UI with retry/reload actions
      - [x] Task 12.1.3: Add CSS module matching mission console aesthetic
    - [x] Step 12.2: Wire into app root
      - [x] Task 12.2.1: Wrap App in ErrorBoundary level="root" in main.tsx
    - [x] Step 12.3: Route-level error boundaries + lazy loading
      - [x] Task 12.3.1: Convert 6 mission surfaces to React.lazy imports
      - [x] Task 12.3.2: Convert CardSharePage to React.lazy import
      - [x] Task 12.3.3: Create SurfaceLoader Suspense fallback component
      - [x] Task 12.3.4: Create Surface wrapper (ErrorBoundary route + Suspense + SurfaceLoader)
      - [x] Task 12.3.5: Wrap all lazy routes in Surface component
    - [x] Step 12.4: Validation
      - [x] Task 12.4.1: TypeScript clean compile
      - [x] Task 12.4.2: Vite build produces per-surface chunks (7 new JS chunks)
      - [x] Task 12.4.3: Main index chunk reduced 652 KB → 603 KB (−49 KB, −7.5%)
      - [x] Task 12.4.4: 232/232 unit tests passing
      - [x] Task 12.4.5: E2E 27/27 mobile + 27/27 desktop

---

## Stage 14 — PWA & Accessibility

- [x] Phase 14.A: PWA Manifest & Icons
  - [x] Task 14.A.1: Create manifest.webmanifest (name, short_name, theme_color #5A7FFF, background_color #040709, display standalone)
  - [x] Task 14.A.2: Create SVG icon (icon.svg) — shield+wings+star AK motif
  - [x] Task 14.A.3: Create maskable SVG icon (icon-maskable.svg) — safe-zone content
  - [x] Task 14.A.4: Add `<link rel="manifest">` and `<meta name="theme-color">` to index.html

- [x] Phase 14.B: Critical ARIA Fixes
  - [x] Task 14.B.1: WorkoutCard — add role="button", tabIndex={0}, onKeyDown (Enter/Space) to both clickable divs
  - [x] Task 14.B.2: CustomScheduleCreatorView — add aria-label to ▲ ("Move item up"), ▼ ("Move item down"), ❌ ("Remove item") buttons

- [x] Phase 14.C: Moderate ARIA Fixes
  - [x] Task 14.C.1: SchedulesPage — content wrapper `<div>` → `<main id="main-content">`
  - [x] Task 14.C.2: SettingsPage — content wrapper `<div>` → `<main id="main-content">`
  - [x] Task 14.C.3: TrainingPage — content wrapper `<div>` → `<main id="main-content">`
  - [x] Task 14.C.4: DrillRunPage — add `id="main-content"` to existing `<main>`
  - [x] Task 14.C.5: ShareCardModal — add `aria-labelledby="share-card-dialog-title"` to dialog div + id to h2
  - [x] Task 14.C.6: AlertStream — add `aria-live="polite"` to panel section
  - [x] Task 14.C.7: SchedulesWindow — error banner `role="status"` → `role="alert"`

- [x] Phase 14.D: Minor Fixes
  - [x] Task 14.D.1: CoachDialog — generic alt="Coach Icon" → dynamic `${coachName} avatar`

- [x] Phase 14.E: Test Updates & Validation
  - [x] Task 14.E.1: Update CustomScheduleCreatorView test to use aria-label queries instead of emoji text
  - [x] Task 14.E.2: TypeScript clean compile
  - [x] Task 14.E.3: Vite build clean
  - [x] Task 14.E.4: 232/232 unit tests passing
  - [x] Task 14.E.5: E2E 27/27 mobile + 27/27 desktop

---

## Stage 15 — Internal Naming Transmutation

- [x] Phase 15.A: Audit & Planning
  - [x] Task 15.A.1: Comprehensive naming audit (naming-audit.md — 552 lines)
  - [x] Task 15.A.2: Identify ~92 source files, ~22 directories, ~180 symbol patterns

- [x] Phase 15.B: Symbol Renames (sed patterns)
  - [x] Task 15.B.1: Create 180+ sed pattern file with correct ordering (specific → general)
  - [x] Task 15.B.2: Apply sed across all .ts/.tsx/.css files in src/
  - [x] Task 15.B.3: Workout → Drill (domain model classes, types, interfaces)
  - [x] Task 15.B.4: WorkoutSchedule → MissionSchedule (schedule family)
  - [x] Task 15.B.5: WorkoutBlock → MissionBlock, WorkoutSet → MissionSet
  - [x] Task 15.B.6: Coach → Handler (components, types, data, utils)
  - [x] Task 15.B.7: --coach-* → --handler-* (CSS custom properties across ~30 files)
  - [x] Task 15.B.8: All selection/schedule/default/filter functions renamed

- [x] Phase 15.C: File & Directory Renames
  - [x] Task 15.C.1: 17 component directories renamed
  - [x] Task 15.C.2: Type files (6): DrillCategory, DrillDifficultyLevel, DrillRank, MissionSchedule, DrillsData, HandlerData
  - [x] Task 15.C.3: Store files (5) + missionSchedule/ directory
  - [x] Task 15.C.4: Hook files (4): useHandlerSelection, useHandlerTheme, useDrillResultsData, useMissionSchedule
  - [x] Task 15.C.5: Context files (4) + test
  - [x] Task 15.C.6: Services & Cache (4) + test
  - [x] Task 15.C.7: Utils (12) + tests
  - [x] Task 15.C.8: Data TS files (3): handlers.ts, handlerThemes.ts, handlerModuleMapping.ts
  - [x] Task 15.C.9: Data JSON: training_coach_data → training_handler_data, workouts/ → drills/
  - [x] Task 15.C.10: Asset directory: icons/coaches → icons/handlers
  - [x] Task 15.C.11: Pages: WorkoutsPage → DrillsPage, CoachSection → HandlerSection

- [x] Phase 15.D: Backward Compatibility
  - [x] Task 15.D.1: Restore localStorage key string values (workout:v2: prefix preserved)
  - [x] Task 15.D.2: Fix test hardcoded localStorage keys

- [x] Phase 15.E: Validation
  - [x] Task 15.E.1: TypeScript 0 errors (clean on first compile)
  - [x] Task 15.E.2: Vite build clean
  - [x] Task 15.E.3: 232/232 unit tests passing
  - [x] Task 15.E.4: E2E 27/27 mobile + 27/27 desktop
  - [x] Task 15.E.5: Zero leftover Workout/Coach references (only preserved localStorage prefix)
  - [x] Task 15.E.6: Zero double-rename artifacts

---

## Stage 16 — Dead Code & Coverage

**Goal:** Remove all unreachable code left over from the pre-mission architecture.

### Summary

| Category | Dirs/Files | Lines Removed |
|----------|------------|---------------|
| Dead page directories | 6 dirs (24 files) | ~1,353 |
| Dead component directories | 34 dirs (82 files) | ~7,118 |
| Dead standalone files | 7 files | ~551 |
| Orphaned test files | 3 files | ~120 |
| Dead utility file (rollout.ts) | 1 file | ~45 |
| Unused npm packages | 7 packages | — |
| **Total** | **117 files** | **~9,187 lines** |

- [x] Phase 16.A: Audit
  - [x] Task 16.A.1: Comprehensive dead code inventory via Routes.tsx reachability analysis
  - [x] Task 16.A.2: Dependency tree cascade — traced 3 waves of transitively dead components
  - [x] Task 16.A.3: Verified DifficultySettingsStore.ts is LIVE (used by scheduleState.ts → MissionScheduleStore chain)

- [x] Phase 16.B: Dead Page Removal
  - [x] Task 16.B.1: Removed 6 dead page directories: HomePage, DrillRunPage, DrillsPage, SchedulesPage, SettingsPage, TrainingPage
  - [x] Task 16.B.2: Verified only MissionFlow/ and CardSharePage/ remain in src/pages/

- [x] Phase 16.C: Dead Component Removal
  - [x] Task 16.C.1: Removed 7 directly unreferenced component dirs (MissionScheduler, PartialFailureNotice, SchedulerOverlay, SettingsPanel, TrainingDfficulty, TrainingSequence, DrillSelector)
  - [x] Task 16.C.2: Removed 27 transitively dead component dirs across 3 cascade waves
  - [x] Task 16.C.3: Zero broken imports after removal

- [x] Phase 16.D: Dead Standalone Files & Dependencies
  - [x] Task 16.D.1: Removed 7 dead standalone files (telemetryDrift, telemetryValidation, CardContext, CardContextState, useCardContext + their tests)
  - [x] Task 16.D.2: Removed rollout.ts (all exports unreferenced)
  - [x] Task 16.D.3: Removed 2 orphaned test files (telemetryAuditReport.test.ts, fetchWithRetry.test.ts)
  - [x] Task 16.D.4: Fixed badgeCatalog.test.ts — removed imports of deleted badgeVisualTokens/badgeArtworkTokens
  - [x] Task 16.D.5: Uninstalled 7 dead npm packages: ethers, howler, wttp-handler, zustand, dotenv, fs, path (−18 transitive dependencies)

- [x] Phase 16.E: Validation
  - [x] Task 16.E.1: TypeScript 0 errors
  - [x] Task 16.E.2: Vite build clean
  - [x] Task 16.E.3: 201/201 unit tests passing (53 test files), down from 232 due to deleted dead-code tests
  - [x] Task 16.E.4: Zero broken imports or dangling references

---

## Stage 17 — Close the XP Loop & Cleanup

**Goal:** Wire the disconnected feedback loops so that user actions on mission surfaces actually produce XP, progression, and readiness changes. Rebrand badge/challenge systems to mission theme. Delete remaining orphaned components and dead data.

### Summary

| Category | What Changed |
|----------|-------------|
| DrillRunner → XP loop | Completing a drill now fires `completeCurrentWorkout()` → XP + streak + badges |
| DrillRunStore → MissionKitStore | Drill completions persist `lastCompleted` + running `successRate` to localStorage |
| AARStore → Readiness | AAR entries are mapped to `MissionDebriefOutcome` and fed into the readiness model |
| ReadinessPanel | Now uses live kit (with real drill stats) + AAR outcomes instead of hardcoded data |
| Checklist surface | Added "Mark current item complete" button wired to `completeCurrentWorkout()` |
| Badge rebranding | 10 badges renamed from fitness-era to mission-themed (e.g., "Weekly Warrior" → "Persistent Operative") |
| Challenge rebranding | 4 challenges renamed from generic to mission-themed (e.g., "Daily 20" → "Daily Recon") |
| Challenge rotation fix | `rotateChallengesIfNeeded` now cycles through all catalog entries instead of always picking the first |
| ChallengePanel | New component — shows active challenges with progress bars + claim button for completed challenges |
| Orphaned component deletion | 10 dead component dirs deleted: Schedule, TimerControls, SchedulesSidebar, TodaysPlanBanner, ProgressWidget, UpNextCard, CardSelector, Settings, SettingsWindow + ShareCardModal |
| Dead store deletion | ScheduleCalendarTimerStore.ts (zero UI consumers) |
| Dead data deletion | training_modules_combined.json (52,872 lines, 2.6MB, zero runtime consumers) |

- [x] Phase 17.A: Close the XP Loop
  - [x] Task 17.A.1: DrillRunner now imports `useMissionSchedule` and calls `completeCurrentWorkout()` when all steps are checked
  - [x] Task 17.A.2: DrillRunner also calls `MissionKitStore.recordDrillCompletion()` to persist lastCompleted and successRate
  - [x] Task 17.A.3: MissionKitStore upgraded with `recordDrillCompletion()` method — persists drill stats to localStorage, merges at read time
  - [x] Task 17.A.4: DrillRunner uses drill's own step sequence when available instead of always generating default 3-step fallback

- [x] Phase 17.B: Wire AAR → Readiness
  - [x] Task 17.B.1: Created `src/utils/readiness/aarBridge.ts` — maps AAREntry to MissionDebriefOutcome with inferred rating and readinessDelta
  - [x] Task 17.B.2: ReadinessPanel now reads AAR entries via `AARStore.list()` and merges them with exemplar debriefOutcomes
  - [x] Task 17.B.3: ReadinessPanel now uses `MissionKitStore.getPrimaryKit()` (with persisted drill stats) instead of hardcoded sampleMissionKit

- [x] Phase 17.C: Checklist Completion
  - [x] Task 17.C.1: ChecklistSurface now shows remaining item count and "Mark current item complete" button
  - [x] Task 17.C.2: Button wired to `completeCurrentWorkout()` from `useMissionSchedule()` context

- [x] Phase 17.D: Badge & Challenge Rebranding
  - [x] Task 17.D.1: 10 badges rebranded — "Weekly Warrior" → "Persistent Operative", "Iron Discipline" → "Iron Protocol", "One Hour Club" → "Deep Cover", "Five Hour Flight" → "Extended Op", "Starter Pack" → "Field Initiate", "Seasoned Pilot" → "Signal Analyst", "Ace Operator" → "Ace Operative", "Push the Limit" → "Clearance Escalation"
  - [x] Task 17.D.2: 4 challenges rebranded — "Daily 20" → "Daily Recon", "Double Up" → "Double Deployment", "Weekly 90" → "Weekly Surveillance", "Five Flights" → "Five-Op Sprint"
  - [x] Task 17.D.3: Challenge rotation fixed — `upsertForTimeframe()` now cycles through all catalog entries per timeframe instead of always picking the first
  - [x] Task 17.D.4: New ChallengePanel component with progress bars and claim button — renders on Debrief surface

- [x] Phase 17.E: Orphan Cleanup
  - [x] Task 17.E.1: Deleted 10 orphaned component directories (20 files): Schedule, TimerControls, SchedulesSidebar, TodaysPlanBanner, ProgressWidget, UpNextCard, CardSelector, Settings/Web3Panel, SettingsWindow, ShareCardModal
  - [x] Task 17.E.2: Deleted ScheduleCalendarTimerStore.ts (zero UI consumers)
  - [x] Task 17.E.3: Deleted training_modules_combined.json (52,872 lines, 2.6MB, zero runtime consumers)

- [x] Phase 17.F: Validation
  - [x] Task 17.F.1: TypeScript 0 errors
  - [x] Task 17.F.2: Vite build clean
  - [x] Task 17.F.3: 201/201 unit tests passing (53 test files)
  - [x] Task 17.F.4: 28 component directories remaining (down from 38 pre-cleanup)

## Stage 18 — Persist Mission Actions & Wire Lifecycle

| Artifact | Description |
|---|---|
| TriageActionStore | New localStorage-backed store — persists triage A/E/D/R decisions with severity, status, and domainStatus |
| ArtifactActionStore | New localStorage-backed store — persists artifact review/promote flags |
| TriageBoard wiring | Replaced ephemeral `useState` overrides with `TriageActionStore.subscribe()` — actions survive navigation |
| ArtifactList wiring | Replaced ephemeral `reviewedIds`/`promotedIds` with `ArtifactActionStore` integration |
| triageLifecycleBridge | New domain utility — maps triage UI actions (ack/escalate/defer/resolve) to validated Case/Signal lifecycle transitions |
| TriageCard.domainStatus | Added `domainStatus` field to preserve original entity status for lifecycle validation |
| Lifecycle-gated actions | TriageBoard refuses invalid transitions (e.g., ack from engaged, resolve from new) and shows ⛔ feedback |

- [x] Phase 18.A: Persist Triage Actions
  - [x] Task 18.A.1: Created `src/store/TriageActionStore.ts` — record/subscribe/getAll/byAction/count/clear/clearAll
  - [x] Task 18.A.2: TriageBoard hydrates from store on mount, subscribes to updates, records actions via `TriageActionStore.record()`

- [x] Phase 18.B: Persist Artifact Actions
  - [x] Task 18.B.1: Created `src/store/ArtifactActionStore.ts` — markReviewed/markPromoted/toggleReviewed/togglePromoted/subscribe
  - [x] Task 18.B.2: ArtifactList hydrates from store on mount, uses `ArtifactActionStore.markReviewed()` and `markPromoted()`

- [x] Phase 18.C: Wire Lifecycle Transitions
  - [x] Task 18.C.1: Created `src/domain/mission/triageLifecycleBridge.ts` — `resolveTriageTransition(lane, domainStatus, action)` returns validated nextStatus
  - [x] Task 18.C.2: Added `domainStatus` to `TriageCard` type, populated by `toCaseCard`/`toSignalCard`, stored + hydrated via `TriageActionStore`
  - [x] Task 18.C.3: Updated `applyTriageAction()` to accept optional `nextDomainStatus` and propagate it
  - [x] Task 18.C.4: TriageBoard keyboard handler now validates via bridge before recording — shows blocked-transition feedback

- [x] Phase 18.D: Tests & Validation
  - [x] Task 18.D.1: Created `triageLifecycleBridge.test.ts` — 16 tests covering Case/Signal valid transitions, rejections, and unknown lanes
  - [x] Task 18.D.2: Updated `model.test.ts` fixture — added `domainStatus` to `baseCard`
  - [x] Task 18.D.3: TypeScript 0 errors
  - [x] Task 18.D.4: Vite build clean
  - [x] Task 18.D.5: 217/217 unit tests passing (54 test files)

## Stage 19 — Writable MissionEntityStore & Reactive Surfaces

| Artifact | Description |
|---|---|
| MissionEntityStore mutations | Added `updateCaseStatus()`, `updateSignalStatus()`, `ingestSignal()`, `promoteArtifact()` — all lifecycle-validated |
| Subscribe/notify pattern | Entity store now supports `subscribe(listener)` with version counter; consumers re-render on mutations |
| useMissionEntityCollection hook | New React hook using `useSyncExternalStore` — reactive subscription to entity store |
| Entity shallow-clone on hydration | `mergeById` now shallow-clones each entity to prevent mutation of exemplar source objects |
| TriageBoard → entity mutations | Triage keyboard actions now propagate validated status transitions to canonical Case/Signal entities |
| ArtifactList → entity mutations | Artifact promote action now calls `promoteArtifact()` to tag description + link to intel packet |
| SignalsStore → entity graph | User-created signals are ingested into canonical collection; ack/resolve flow back as entity status updates |
| 6 reactive consumers | AlertStream, TimelineBand, DebriefClosureSummary, MissionHeader, ReadinessPanel, TriageBoard all switched to `useMissionEntityCollection` hook |

- [x] Phase 19.A: Entity Store Mutations
  - [x] Task 19.A.1: Added `subscribe(listener)` pattern with `StoreListener` type and `notify()` on every state change
  - [x] Task 19.A.2: Added `getVersion()` — monotonically increasing counter for snapshot identity
  - [x] Task 19.A.3: Added `updateCaseStatus(caseId, nextStatus, severity?)` — validates via `canTransition()` before applying
  - [x] Task 19.A.4: Added `updateSignalStatus(signalId, nextStatus, severity?)` — validates via `canTransition()` before applying
  - [x] Task 19.A.5: Added `ingestSignal(signal)` — adds new MissionSignal to canonical collection (rejects duplicates)
  - [x] Task 19.A.6: Added `promoteArtifact(artifactId)` — tags description with `[PROMOTED]` prefix + links to first intel packet
  - [x] Task 19.A.7: Fixed `mergeById` to shallow-clone entities, preventing mutation bleed into exemplar source objects

- [x] Phase 19.B: React Subscription Hook
  - [x] Task 19.B.1: Created `useMissionEntityCollection` hook using `useSyncExternalStore` for tear-free reactive reads

- [x] Phase 19.C: Wire Action Stores → Entity Mutations
  - [x] Task 19.C.1: TriageBoard keyboard handler now calls `entityStore.updateCaseStatus()` / `updateSignalStatus()` after lifecycle validation
  - [x] Task 19.C.2: ArtifactList promote handler now calls `entityStore.promoteArtifact()` to propagate to canonical collection
  - [x] Task 19.C.3: SignalsStore `add()` now calls `entityStore.ingestSignal()` — user-created signals appear in AlertStream/Triage
  - [x] Task 19.C.4: SignalsStore `acknowledge()`/`resolve()` now calls `entityStore.updateSignalStatus()` — status changes flow back

- [x] Phase 19.D: Reactive Surface Consumers
  - [x] Task 19.D.1: AlertStream switched to `useMissionEntityCollection()` — re-renders when signals are added/mutated
  - [x] Task 19.D.2: TimelineBand, DebriefClosureSummary, MissionHeader, ReadinessPanel all switched to reactive hook
  - [x] Task 19.D.3: TriageBoard switched to reactive hook — re-derives columns when entity statuses change
  - [x] Task 19.D.4: ArtifactList made reactive — `resolveCaseArtifacts()` now takes collection param, re-derives on mutation

- [x] Phase 19.E: Tests & Validation
  - [x] Task 19.E.1: 11 new mutation tests — valid/invalid transitions, severity update, signal ingestion, duplicate rejection, artifact promotion, subscribe notification, version increment, null-collection guard
  - [x] Task 19.E.2: TypeScript 0 errors
  - [x] Task 19.E.3: Vite build clean
  - [x] Task 19.E.4: 228/228 unit tests passing (54 test files)

---

## Stage 20 — Mission Cycle Summary + Wire Readiness Actions + Bug Fixes

- [x] Phase 20.A: MissionCycleSummary Component
  - [x] Task 20.A.1: Created `MissionCycleSummary` component — reads from TriageActionStore, ArtifactActionStore, and SignalsStore to show triage/artifact/signal counts
  - [x] Task 20.A.2: Added MissionCycleSummary to DebriefSurface — appears between MissionStepHandoff and DebriefClosureSummary
  - [x] Task 20.A.3: Created CSS module matching existing design system (surface-card, metric grid, section labels)
  - [x] Task 20.A.4: Added `collectCycleSummary()` unit test with mocked stores

- [x] Phase 20.B: Wire ReadinessPanel Next-Actions to Navigation
  - [x] Task 20.B.1: Extended `ReadinessResult.nextActions` type to include `route: string` field
  - [x] Task 20.B.2: Updated `pickNextActions()` to return `{ id, title, route: '/mission/checklist' }`
  - [x] Task 20.B.3: Wired ReadinessPanel `handleActionClick` with `useNavigate()` — buttons now navigate to the target surface while preserving telemetry

- [x] Phase 20.C: Bug Fixes
  - [x] Task 20.C.1: Fixed `getRandomItems` in MissionScheduleCreator — `[...array].sort()` instead of in-place `array.sort()` to prevent source mutation
  - [x] Task 20.C.2: Fixed same `getRandomItems` mutation bug in DrillCategoryCache
  - [x] Task 20.C.3: Removed artificial 1-second `setTimeout` delay from DrillCategoryCache.loadData — method is now synchronous
  - [x] Task 20.C.4: Retained legacy generator as migration safety net (migrationBridge flag `true` in one environment)

- [x] Phase 20.D: Validation
  - [x] Task 20.D.1: TypeScript 0 errors
  - [x] Task 20.D.2: Vite build clean
  - [x] Task 20.D.3: 229/229 unit tests passing (55 test files)

## Stage 21: Rename Fitness Remnants & Wire Loose Ends

- [x] Phase 21.A: Rebrand User-Facing Copy
  - [x] Task 21.A.1: RecapModal — "Great work!" → "Mission Complete", "You wrapped the plan" → "After-action summary ready for review", "Minutes logged" → "Op time", "Back to planner" → "Return to Brief"
  - [x] Task 21.A.2: MissionBlock placeholder text — "Do something productive!" → "Review intel and prepare for the next phase.", "Take a break…" → "Consolidate findings, update case notes, and verify continuity before proceeding." (MissionScheduleCreator + scheduleState)

- [x] Phase 21.B: Ops-Based Goal System
  - [x] Task 21.B.1: GoalUnit changed from `'minutes' | 'items'` to `'ops' | 'items'`
  - [x] Task 21.B.2: `totalWorkoutsCompleted` → `totalDrillsCompleted` with backward-compat safeParse migration
  - [x] Task 21.B.3: Default goals updated — daily 20min → 5ops, weekly 90min → 20ops
  - [x] Task 21.B.4: Badge predicates updated to ops-based thresholds (minutes_60 → ops≥10, minutes_300 → ops≥40)
  - [x] Task 21.B.5: Goal unit checks changed from `'minutes'` to `'ops'` throughout recordActivity

- [x] Phase 21.C: API & Method Renames
  - [x] Task 21.C.1: MissionScheduleContext — `completeCurrentWorkout` → `completeCurrentDrill`, `skipCurrentWorkout` → `skipCurrentDrill`, `timeoutCurrentWorkout` → `timeoutCurrentDrill`
  - [x] Task 21.C.2: Metric events — `workout_completed` → `drill_completed`, `workout_skipped` → `drill_skipped`
  - [x] Task 21.C.3: UserProgressEvents — `completedWorkouts` → `completedDrills`, `firstIncompleteWorkout` → `firstIncompleteDrill`
  - [x] Task 21.C.4: alignmentCheck — `AlignmentResult.totalWorkouts` → `totalDrills`
  - [x] Task 21.C.5: schedulePreview — `cloneWorkout` → `cloneDrill` (3 call sites)

- [x] Phase 21.D: ChecklistSurface Double-Completion Guard
  - [x] Task 21.D.1: Added DrillRunStore import and `drillRunActive` flag
  - [x] Task 21.D.2: Manual "Mark current item complete" button disabled when DrillRunner has active run; text changes to "Drill in progress — auto-completes"

- [x] Phase 21.E: Test Updates
  - [x] Task 21.E.1: MissionScheduleContext.test — renamed all workout→drill method calls and metric expectations
  - [x] Task 21.E.2: UserProgressStore.badges.test — `completedWorkouts` → `completedDrills`, ops-based badge thresholds
  - [x] Task 21.E.3: UserProgressStore.challenges.test — `completedWorkouts` → `completedDrills`
  - [x] Task 21.E.4: UserProgressStore.test — pass `completedDrills` for ops-based goal assertions
  - [x] Task 21.E.5: UserProgressEvents.test — ops-based daily goal assertion
  - [x] Task 21.E.6: RecapModal.test — updated copy assertions ("Mission Complete", "Return to Brief")

- [x] Phase 21.F: Validation
  - [x] Task 21.F.1: TypeScript 0 errors
  - [x] Task 21.F.2: Vite build clean
  - [x] Task 21.F.3: 229/229 unit tests passing (55 test files)

- **Known remaining (lower-priority internal):** ~190 "workout" naming references across 28 files — DrillCategoryCache methods (`getAllWorkoutsSelected`, `getAllWorkouts`), storage keys with `workout:` prefix (intentional for backward compat), drillFilters/drillPresets local vars, InitialDataLoader/DrillDataLoader vars, `totalWorkoutSubCategories` export, legacy badge IDs (`minutes_60`, `minutes_300`). Fitness shard content in `public/training_modules_shards/fitness.json` needs dedicated content authoring.

---

## Stage 22 — Role/Archetype System (COMPLETE)

**Goal:** Give the app an identity model so it knows *who the user wants to become* and can shape every downstream system accordingly — module selection, drill scheduling, milestone labels, competency emphasis, handler recommendation, and SOP guidance.

**User story driving this stage:**
> *"I signed up to become a Rescue Ranger type of Psi Operative Super Hero Cyber Investigator. The app should ask me what I want to be, then train me specifically for that."*

### Design Decisions

**D1: Archetype, not class.** An archetype is a training focus that maps to a curated subset of the 19 training modules. It's not a hard lock — all content remains accessible, but the schedule creator, readiness model, and milestones prioritize the archetype's modules. Users can change archetypes later.

**D2: Archetype → modules, not archetype → handler.** Handlers and archetypes are orthogonal. Any handler can train any archetype. The handler controls the *personality/theme*; the archetype controls the *curriculum*. The intake will recommend a handler based on archetype (because handlers specialize in certain modules), but the user can override.

**D3: Store archetype in a new `OperativeProfileStore`.** Not UserProgressStore (which is XP/streaks/badges). The profile is identity, not progression. Persisted to `localStorage('operative:profile:v1')`. Shape: `{ archetypeId, handlerId, callsign?, enrolledAt }`.

**D4: Archetype flavors milestones, not replaces them.** The 4-tier structure (Trainee → Operator → Specialist → Mission Lead) stays, but the labels become archetype-flavored: e.g., "Tier III · Rescue Specialist" instead of "Tier III · Specialist". Prerequisites also shift: a Rescue Ranger's Tier III might require counter_biochem competency ≥ 65 instead of signal_analysis.

**D5: Competency dimensions become archetype-weighted, not archetype-replaced.** The 4 existing dimensions stay. Each archetype defines custom weights. A Rescue Ranger emphasizes `triage_execution` (0.40) and `decision_quality` (0.30) over `signal_analysis` (0.15) and `artifact_traceability` (0.15).

**D6: Intake becomes a 3-step sequenced flow.** Currently: Guidance Overlay → Intake Panel → Brief. New: Guidance Overlay → Archetype Picker → Handler Picker (with recommendation) → Brief. The old intake panel's informational content merges into the Archetype Picker preamble. All 3 steps persist to localStorage independently, so partial completion survives reload.

**D7: Feature-flagged.** `archetypeSystem` flag in featureFlags.ts. When off, the app behaves exactly as today (silent handler default, generic milestones, unweighted competencies).

### Archetype Catalog

Based on the existing 19 training modules (14 with content, 5 large shards: counter_psyops, self_sovereignty, equations, anti_psn, anti_tcs_idc_cbc):

| Archetype ID | Display Name | Icon | Core Modules (primary 4) | Secondary Modules (2-3) | Handler Rec |
|---|---|---|---|---|---|
| `rescue_ranger` | Rescue Ranger | 🛡️ | combat, counter_biochem, fitness, investigation | intelligence, psiops | Tiger War God |
| `cyber_sentinel` | Cyber Sentinel | 🔒 | cybersecurity, intelligence, espionage, investigation | agencies, counter_psyops | Agent Simon |
| `psi_operative` | Psi Operative | 🔮 | psiops, counter_psyops, self_sovereignty, martial_arts | dance, equations | Tara Van Dekar |
| `shadow_agent` | Shadow Agent | 🕵️ | espionage, intelligence, agencies, war_strategy | cybersecurity, counter_psyops | Agent Simon |
| `cosmic_engineer` | Cosmic Engineer | ⚡ | cybersecurity, equations, web_three, space_force | dance, psiops | Jono Tho'ra |
| `tactical_guardian` | Tactical Guardian | ⚔️ | combat, martial_arts, war_strategy, fitness | espionage, counter_biochem | Tiger War God |
| `star_commander` | Star Commander | 🌟 | space_force, war_strategy, intelligence, fitness | cybersecurity, agencies | Star Cmdr Raynor |
| `field_scholar` | Field Scholar | 📖 | self_sovereignty, counter_psyops, anti_psn, anti_tcs_idc_cbc | intelligence, investigation | Tara Van Dekar |

Each archetype also defines:
- `description`: 2-sentence summary for the picker card
- `milestone_labels`: archetype-flavored tier names (4 strings)
- `competency_weights`: custom `Record<CompetencyDimension, number>` (sums to 1.0)
- `tier3_competency_gate`: which dimension + threshold replaces the default signal_analysis ≥ 65
- `tier4_competency_gate`: which dimension + threshold replaces the default artifact_traceability ≥ 70

### Data Model

```typescript
// src/data/archetypes.ts
export interface ArchetypeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  coreModules: string[];        // primary 4 module IDs
  secondaryModules: string[];   // 2-3 supplementary module IDs
  recommendedHandler: string;   // handler ID
  milestoneLabels: [string, string, string, string]; // tier 1-4
  competencyWeights: Record<CompetencyDimension, number>;
  tier3Gate: { dimension: CompetencyDimension; threshold: number };
  tier4Gate: { dimension: CompetencyDimension; threshold: number };
}

// src/store/OperativeProfileStore.ts
export interface OperativeProfile {
  archetypeId: string;
  handlerId: string;
  callsign: string;        // user-entered or auto-generated
  enrolledAt: string;       // ISO date
}
// localStorage key: 'operative:profile:v1'
```

### Phase Breakdown

- [x] **Phase 22.A: Archetype Data Layer**
  - [x] Task 22.A.1: Create `src/data/archetypes.ts` — `ArchetypeDefinition` interface + 8-archetype catalog + `getArchetypeCatalog()` / `findArchetype(id)` accessors
  - [x] Task 22.A.2: Create `src/store/OperativeProfileStore.ts` — `OperativeProfile` type, `get()` / `set()` / `reset()` / `subscribe()` with localStorage persistence (`operative:profile:v1`), `safeParse` with migration guard
  - [x] Task 22.A.3: ~~Add `archetypeSystem` feature flag~~ — graduated; archetype system is always-on, no flag needed
  - [x] Task 22.A.4: Unit tests for OperativeProfileStore (persist/read/reset/subscribe/migration)

- [x] **Phase 22.B: Archetype Picker Component**
  - [x] Task 22.B.1: Create `src/components/ArchetypePicker/ArchetypePicker.tsx` — grid of archetype cards with icon, name, description, core-module tags; selecting one highlights it; "Confirm" button saves to OperativeProfileStore
  - [x] Task 22.B.2: Create `ArchetypePicker.module.css` — mobile-first card grid (single-column at ≤480px, 2-col at ≤768px, 3-col desktop), min-height 44px buttons, dark console aesthetic
  - [x] Task 22.B.3: Cards show core modules as tag pills; selected card gets border highlight + checkmark

- [x] **Phase 22.C: Handler Picker Component**
  - [x] Task 22.C.1: Create `src/components/HandlerPicker/HandlerPicker.tsx` — shows 5 handler cards with icon, name, personality summary; selected archetype's `recommendedHandler` gets a "Recommended" badge; selecting saves to OperativeProfileStore.handlerId
  - [x] Task 22.C.2: Create `HandlerPicker.module.css` — same responsive grid pattern as ArchetypePicker
  - [x] Task 22.C.3: Wire handler selection to `HandlerSelectionContext.setCoachId()` — changing handler here does what the app could never do before

- [x] **Phase 22.D: Intake Flow Rewire**
  - [x] Task 22.D.1: Update `MissionShell.tsx` gate sequence — new flow: Guidance Overlay → Archetype Picker → Handler Picker → Brief. Each step persists independently (`mission:archetype-pick:v1`, reuse `mission:intake:v1` key for handler pick since the old intake panel is being replaced)
  - [x] Task 22.D.2: Merge old MissionIntakePanel informational copy into ArchetypePicker preamble text (program description, "Who this is for", session outcome)
  - [x] Task 22.D.3: If archetype already selected on return visit, skip picker — go straight to Brief. If no archetype, show picker.
  - [x] Task 22.D.4: Add "Change Archetype" button to MissionHeader or action palette — re-triggers archetype picker for users who want to switch

- [x] **Phase 22.E: Module Selection Wiring**
  - [x] Task 22.E.1: Create `src/utils/archetypeModuleResolver.ts` — `resolveModulesForArchetype(archetypeId): string[]` returns `[...coreModules, ...secondaryModules]` from archetype definition
  - [x] Task 22.E.2: Update `syncHandlerModuleSelection` in HandlerSelectionContext — when `archetypeSystem` flag is on, module list comes from archetype (via OperativeProfileStore) instead of handler mapping. Handler mapping becomes the fallback when no archetype is set.
  - [x] Task 22.E.3: On archetype change, call `TrainingModuleCache.selectModules()` with new archetype module set + regenerate schedule

- [x] **Phase 22.F: Milestone & Competency Flavoring**
  - [x] Task 22.F.1: Update `milestones.ts` — `computeMissionMilestoneProgress` accepts optional `ArchetypeDefinition`; when present, uses archetype's `milestoneLabels` and archetype-specific tier3/tier4 gate checks instead of hardcoded signal_analysis/artifact_traceability thresholds
  - [x] Task 22.F.2: Update `competencyModel.ts` — `deriveCompetencySnapshot` accepts optional `competencyWeights` override from archetype definition; when present, uses those weights instead of the global default
  - [x] Task 22.F.3: Update `ReadinessPanel.tsx` — reads archetype from OperativeProfileStore, passes definition through to milestone/competency computations
  - [x] Task 22.F.4: Update `MissionHeader.tsx` — show archetype icon + name in header alongside operation status

- [x] **Phase 22.G: Schedule Creator Archetype Awareness**
  - [x] Task 22.G.1: Update `MissionScheduleCreator.createModernMissionSchedule` — when archetype is set, weight drill selection toward archetype's core modules (2:1 ratio core:secondary) instead of pure random sampling
  - [x] Task 22.G.2: Update `scheduleState.createNewScheduleSync` — same archetype-weighted logic (or consolidate the two code paths into a shared function)
  - [x] Task 22.G.3: Archetype-specific rest-block copy — MissionBlock text references the archetype ("Consolidate rescue intel" vs generic "Review intel")

- [x] **Phase 22.H: SOP & Assistant Hints**
  - [x] Task 22.H.1: Update `MissionShell` assistantHints — when archetype is set, SOP prompts reference the archetype focus ("As a Rescue Ranger, prioritize civilian safety signals in triage" vs generic)
  - [ ] Task 22.H.2: Create `src/data/archetypeHints.ts` — per-archetype, per-step hint overrides (sopPrompt, contextHint, nextAction) *(deferred — content authoring, not engineering)*

- [x] **Phase 22.I: Tests & Validation**
  - [x] Task 22.I.1: Unit tests for archetype catalog (all 8 archetypes validate: modules exist in manifest, weights sum to 1.0, handler exists, 4 milestone labels)
  - [x] Task 22.I.2: Unit tests for archetypeModuleResolver
  - [x] Task 22.I.3: Unit tests for milestone flavoring with archetype override
  - [x] Task 22.I.4: Unit tests for competency weights override
  - [x] Task 22.I.5: Integration: archetype selection → module selection → schedule creation produces drills from correct module pool
  - [x] Task 22.I.6: TypeScript 0 errors
  - [x] Task 22.I.7: Vite build clean
  - [x] Task 22.I.8: All existing tests still pass + new tests green

### Injection Points Summary

| Existing File | What Changes | Risk |
|---|---|---|
| `featureFlags.ts` | +1 flag | None |
| `HandlerSelectionContext.tsx` | Module source switches from handler→archetype when flag on | Medium — primary data flow change |
| `MissionShell.tsx` | Gate sequence adds 2 new steps | Medium — intake flow restructure |
| `MissionIntakePanel.tsx` | Content merges into ArchetypePicker; component may become unused | Low |
| `milestones.ts` | Accepts optional archetype for label/gate overrides | Low — additive param |
| `competencyModel.ts` | Accepts optional weights override | Low — additive param |
| `ReadinessPanel.tsx` | Reads archetype, passes to computations | Low |
| `MissionHeader.tsx` | Shows archetype badge | Low |
| `MissionScheduleCreator.ts` | Weighted drill selection by archetype modules | Medium — core schedule logic |
| `scheduleState.ts` | Same weighted selection (or consolidate) | Medium — duplicate path |
| `MissionShell` assistantHints | Archetype-specific overrides | Low |

### Files Created (New)

| File | Purpose |
|---|---|
| `src/data/archetypes.ts` | 8-archetype catalog with module mappings, weights, milestone labels |
| `src/store/OperativeProfileStore.ts` | Identity persistence (archetype + handler + callsign) |
| `src/components/ArchetypePicker/ArchetypePicker.tsx` | Selection UI — mobile-first card grid |
| `src/components/ArchetypePicker/ArchetypePicker.module.css` | Responsive styling |
| `src/components/HandlerPicker/HandlerPicker.tsx` | Handler selection UI with archetype-based recommendation |
| `src/components/HandlerPicker/HandlerPicker.module.css` | Responsive styling |
| `src/utils/archetypeModuleResolver.ts` | Archetype → module list resolution |
| `src/data/archetypeHints.ts` | Per-archetype per-step SOP/context/next-action hints |
| Tests (4-6 files) | Store, catalog, resolver, milestone, competency, integration |

### Implementation Order & Dependencies

```
22.A (data layer) ──→ 22.B (archetype picker) ──→ 22.D (intake rewire)
       │                                                    │
       │                                                    ▼
       ├──→ 22.E (module wiring) ──→ 22.G (schedule creator)
       │
       ├──→ 22.F (milestone/competency flavoring)
       │
       └──→ 22.C (handler picker) ──→ 22.D (intake rewire)
                                            │
                                            ▼
                                      22.H (SOP hints)
                                            │
                                            ▼
                                      22.I (validation)
```

Phases A, B, C can be built independently then wired together in D. Phases E, F, G can proceed in parallel after A. Phase H depends on the archetype definition from A. Phase I is last.

### Exit Criteria

- [x] New user sees: Guidance Overlay → Archetype Picker (8 cards) → Handler Picker (5 cards, 1 recommended) → Brief
- [x] Returning user with archetype set skips pickers, lands on Brief with archetype badge in header
- [x] Schedule drills bias 2:1 toward archetype's core modules
- [x] Milestone tier labels reflect archetype (e.g., "Tier III · Rescue Specialist")
- [x] Competency weights shift per archetype
- [x] Tier 3/4 unlock gates use archetype-specific dimension thresholds
- [x] SOP hints reference archetype focus
- [x] ~~Feature flag off → zero behavioral change from Stage 21~~ — graduated; archetype system is always-on
- [x] All existing tests pass + new test coverage for archetype catalog, store, resolver, milestones, competency, integration
