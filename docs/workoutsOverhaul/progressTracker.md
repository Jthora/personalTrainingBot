# Workouts Overhaul — Progress Tracker

Use this nested structure to track progress with increasing granularity.

## Status at a Glance
- Overall status: **Complete**
- Current Stage → Phase → Step: **Metrics & Risks / Risks & Mitigations / Review cadence**
- Feature flags: generator swap **[on]**, calendar surface **[off]**, migration bridge **[off]**
- Dependency health: npm audit **0 vulns** (2026-01-01)

## Stages
For each Stage, list its Phases, Steps, Sub-Steps, Tasks, and Sub-Tasks. Copy/paste the template blocks as needed.

### Stage: ___ (Owner: ___) — Status: [Not started / In progress / Blocked / Done] — Target: ___
- Goals: ___
- Risks/Notes: ___

#### Phase: ___ (Owner: ___) — Status: [Not started / In progress / Blocked / Done] — Target: ___
- Objectives: ___
- Dependencies: ___

##### Step: ___ — Status: [Not started / In progress / Blocked / Done]
- Outcome: ___

###### Sub-Step: ___ — Status: [Not started / In progress / Blocked / Done]
- Acceptance: ___

####### Task: ___ — Status: [Not started / In progress / Blocked / Done]
- Definition of done: ___

######## Sub-Task: ___ — Status: [Not started / In progress / Blocked / Done]
- Notes: ___

### Stage: Unified Generation (Owner: Engineering) — Status: Done — Target: M2
- [x] Goals: Single difficulty-aware generator used everywhere
- [ ] Risks/Notes: Sync fallback may produce empty schedule if cache not loaded; monitor

#### Phase: Generator Adoption — Status: Done — Target: M2
- [x] Objectives: Route all creation through unified generator
- [x] Dependencies: WorkoutCategoryCache readiness

##### Step: Replace store creation path — Status: Done
- [x] Outcome: Store createNewSchedule uses unified generator; sync path aligned to shape

###### Sub-Step: Update async createNewSchedule — Status: Done
- [x] Acceptance: Calls createWorkoutSchedule

####### Task: Remove legacy logic — Status: Done
- [x] Definition of done: No legacy per-workout-set creation remains

######## Sub-Task: Ensure tests pass — Status: Done
- [x] Notes: npm test green (Vitest)

### Stage: Reactive Custom Schedules (Owner: Engineering) — Status: Done — Target: M3
- [x] Goals: Adopting a custom schedule updates UI/context immediately
- [x] Risks/Notes: Sidebar refresh dependency removed; context-driven updates only

#### Phase: Context Integration — Status: In progress — Target: M3
- [x] Objectives: Add context setter and wire UI
- [x] Dependencies: WorkoutScheduleContext consumers

##### Step: Add setCurrentSchedule to context — Status: Done
- [x] Outcome: Context persists and bumps version on adoption

###### Sub-Step: Update CustomScheduleCreatorView — Status: Done
- [x] Acceptance: Uses setCurrentSchedule instead of direct store write

####### Task: Keep sidebar refresh hook — Status: Done
- [x] Definition of done: onScheduleUpdate still triggers sidebar refresh

#### Phase: Coverage & Regression — Status: In progress — Target: M3
- [x] Objectives: Add regression tests for store/context flows
- [x] Dependencies: Cache + store ready

##### Step: Cover persistence selection defaults — Status: Done
- [x] Outcome: WorkoutScheduleStore tests ensure versioned selections hydrate and reset invalid storage

##### Step: Cover schedule context adoption — Status: Done
- [x] Outcome: WorkoutScheduleContext tests ensure load uses store and setCurrentSchedule persists + bumps version

##### Step: UI adoption path — Status: Done
- [x] Outcome: Custom schedules setCurrentSchedule pathway wired; remaining sidebar refresh dependency noted but acceptable

##### Step: Sidebar refresh dependency — Status: Done
- [x] Outcome: Removed onScheduleUpdate wiring; sidebar consumes context schedule directly

##### Step: Custom schedule UI test — Status: Done
- [x] Outcome: Integration test covers select custom schedule → setCurrentSchedule → schedule renders

##### Step: Empty/zero-difficulty guardrail — Status: In progress
- [x] Outcome: UI warns and offers regenerate when generated schedule is empty or zero-difficulty

#### Phase: Coverage & Regression — Status: In progress — Target: M3
- Objectives: Add regression tests for store/context flows
- Dependencies: Cache + store ready

##### Step: Cover persistence selection defaults — Status: Done
- Outcome: WorkoutScheduleStore tests ensure versioned selections hydrate and reset invalid storage

##### Step: Cover schedule context adoption — Status: Done
- Outcome: WorkoutScheduleContext tests ensure load uses store and setCurrentSchedule persists + bumps version

##### Step: UI adoption path — Status: Done
- Outcome: Custom schedules setCurrentSchedule pathway wired; remaining sidebar refresh dependency noted but acceptable

### Stage: Persistence Hardening (Owner: Engineering) — Status: Done — Target: M4
- [x] Goals: Versioned selection storage + signature to clear stale taxonomy
- [ ] Risks/Notes: Keep an eye on cache load flow to ensure defaults persist when mismatch occurs

#### Phase: Selection Versioning — Status: Done — Target: M4
- [x] Objectives: Version keys, compute taxonomy signature, clear on mismatch
- [x] Dependencies: Taxonomy stability

##### Step: Add taxonomy signature sync — Status: Done
- [x] Outcome: WorkoutCategoryCache computes deterministic signature and syncs with store before hydration; defaults persist when data changes

###### Sub-Step: Wire cache load to signature — Status: Done
- [x] Acceptance: Cache hydrates persisted selections only when signatures match

####### Task: Default to persisted fresh selection state — Status: Done
- [x] Definition of done: On mismatch, cache writes current defaults back to store to keep storage aligned

####### Task: Regression test pass after change — Status: Done
- [x] Definition of done: Vitest suite green post integration (includes new WorkoutCategoryCache signature tests)

### Stage: UX & State Polish (Owner: Engineering) — Status: Done — Target: M5
- [x] Goals: Smooth UX for schedule generation/adoption; resilient empty/zero-difficulty handling
- [x] Risks/Notes: Potential regressions if load flows are refactored; ensure coverage

#### Phase: Empty/Zero-Difficulty Handling — Status: Done — Target: M5
- [x] Objectives: Detect empty/zero-difficulty schedules and prompt regenerate
- [x] Dependencies: Generator + cache readiness

##### Step: Add empty/zero-schedule detection — Status: Done
- [x] Outcome: Generator/store returns explicit error/signal when no workouts selected or difficulty is zero

##### Step: UI fallback for empty schedule — Status: Done
- [x] Outcome: Surface message + regenerate CTA in schedule window (context error banner)

##### Step: Logging/metric for empty schedule — Status: Done
- [x] Outcome: Emit counter for monitoring

#### Phase: Load Efficiency — Status: Done — Target: M5
- [x] Objectives: Remove redundant loads; derive active item from schedule state
- [x] Dependencies: Context/state wiring

##### Step: Derive active item from schedule — Status: Done
- [x] Outcome: Active workout/block derived from schedule state, not extra fetches

##### Step: Remove redundant schedule loads — Status: Done
- [x] Outcome: Single load path via context; sidebar refresh no-op where possible

##### Step: Cache warm hints — Status: Done
- [x] Outcome: Optional preload/idle warming of workout cache

#### Phase: UI Polish — Status: Done — Target: M5
- [x] Objectives: Improve schedule editor usability
- [x] Dependencies: CustomScheduleCreatorView ready

##### Step: Disable invalid moves — Status: Done
- [x] Outcome: Up/down buttons disable at bounds

##### Step: Item ordering feedback — Status: Done
- [x] Outcome: Show position/ordering numbers in schedule items

##### Step: Inline validation — Status: Done
- [x] Outcome: Prevent saving empty custom schedules; minimal guidance copy

### Stage: Feature Flags & Rollout (Owner: Engineering) — Status: Done — Target: M6
- [x] Goals: Gate generator swap and calendar surface; define kill switches
- [x] Risks/Notes: Ensure defaults documented; avoid accidental exposure

#### Phase: Flag Definitions — Status: Done — Target: M6
- [x] Objectives: Add flag config for generator swap, calendar surface, migration bridge
- [x] Dependencies: Build-time/runtime flag infra

##### Step: Define flag defaults — Status: Done
- [x] Outcome: generator swap [on], calendar surface [off], migration bridge [off] captured in config/docs

##### Step: Wire flags into UI — Status: Done
- [x] Outcome: Hide calendar surface behind flag; ensure generator swap respects flag

##### Step: Document flag operations — Status: Done
- [x] Outcome: Runbook for toggling flags and expected effects

### Stage: Metrics & Risks (Owner: Engineering) — Status: Done — Target: M7
- [x] Goals: Establish metrics, risks, mitigations, and snapshots
- [x] Risks/Notes: Data availability for some metrics may be limited

#### Phase: Metrics Snapshot — Status: Done — Target: M7
- [x] Objectives: Populate metrics section (hydration success, time to load, empty incidence, generation failures, completion/skip ratio)

##### Step: Define metric owners/targets — Status: Done
- [x] Outcome: Owners + thresholds listed in tracker

##### Step: Add instrumentation hooks — Status: Done
- [x] Outcome: Log/metric emission points for key flows

#### Phase: Risks & Mitigations — Status: Done — Target: M7
- [x] Objectives: Capture top risks with likelihood/impact and mitigation/owner

##### Step: Populate risk table — Status: Done
- [x] Outcome: At least 3 risks with owners and status

##### Step: Review cadence — Status: Done
- [x] Outcome: Weekly review every Monday with eng lead + PM

## Examples (fill or duplicate)
- Stage: Foundation → Phase: ADRs → Step: Generator ADR → Sub-Step: Draft → Task: Circulate for review → Sub-Task: Capture feedback
- Stage: Unified Generation → Phase: Code changes → Step: Remove legacy generator → Sub-Step: Update store → Task: Delete legacy methods → Sub-Task: Fix imports
- Stage: Persistence Hardening → Phase: Versioning → Step: Add signatures → Sub-Step: Implement key versioning → Task: Migrate storage → Sub-Task: Add tests

## Sprint / Iteration Snapshot
- Goals: Ship metrics + risks (M7), finalize rollout readiness
- Committed stories: M7 metrics snapshot, risk table, cadence definition
- Blockers: None
- ETA: Pending metrics collection window

## Risks & Mitigations (live)
- Risk: Empty schedules slip through in production | Impact: Medium | Likelihood: Low | Mitigation/Owner: Monitor `schedule_empty_generated` metric + regenerate CTA; Owner: Eng | Status: Monitoring
- Risk: Calendar surface exposed unintentionally | Impact: Medium | Likelihood: Low | Mitigation/Owner: `calendarSurface` flag default off + release checklist; Owner: Eng | Status: Ready
- Risk: Local metrics storage overflows | Impact: Low | Likelihood: Low | Mitigation/Owner: Cap stored events at 200 and log warn; Owner: Eng | Status: Mitigated

## Metrics Snapshot
- Hydration success rate: Target ≥99%; instrumented via `schedule_load_success` / `schedule_load_failure`
- Time to first schedule load: Target p50 <1200ms (local); captured via load duration metric payload
- Empty-schedule incidence: Target <1%; instrumented via `schedule_empty_generated`
- Generation failures: Target <0.5%; instrumented via `schedule_generation_failure`
- Completion/skip ratio: Track `workout_completed` vs `workout_skipped`; target ≥1.5x completions
- Dependency vulnerabilities: **0** (npm audit, 2026-01-01)

### Stage: Test Hardening (Owner: Engineering/QA) — Status: Done — Target: M8
- [x] Goals: Deepen unit/integration coverage for generator flags, context metrics, and guardrails
- [x] Risks/Notes: Mock drift from production data; keep fixtures minimal/deterministic

#### Phase: Generator & Flags Coverage — Status: Done — Target: M8
- [x] Objectives: Validate generator swap, migration bridge, and legacy fallback paths

##### Step: Modern path when swap on — Status: Done
- [x] Outcome: WorkoutScheduleCreator test covers modern generator using selected workouts

##### Step: Migration bridge fallback — Status: Done
- [x] Outcome: Empty modern schedule with migrationBridge falls back to legacy generator

##### Step: Legacy path when swap off — Status: Done
- [x] Outcome: Generator swap off forces legacy path; modern not invoked

##### Step: Modern generator throws with migration bridge — Status: Done
- [x] Outcome: Modern error triggers migration bridge fallback to legacy generator

#### Phase: Context Metrics Coverage — Status: Done — Target: M8
- [x] Objectives: Assert success/failure metrics emission on load/create and completion/skip events

##### Step: Load/create success metrics — Status: Done
- [x] Outcome: Metrics recorded with duration/items/difficulty when load/create succeeds

##### Step: Completion/skip metrics — Status: Done
- [x] Outcome: Metrics emitted for `workout_completed` and `workout_skipped` flows

##### Step: Completion/skip edge cases — Status: Done
- [x] Outcome: Multi-workout sets drop off the schedule when finished; workout blocks complete/skip and preserve remaining items; skip on empty schedule no-ops without metrics

##### Step: Load/create failure metrics — Status: Done
- [x] Outcome: Metrics emitted for load failures and empty/failed generation with reasons

## Open Decisions / Follow-ups
- ___
- ___

## Notes / Links
- Roadmap: `roadmap.md`
- ADRs: `problems_and_decisions.md`
- Testing: `testing_and_metrics.md`
- Playbook: `playbook.md`
