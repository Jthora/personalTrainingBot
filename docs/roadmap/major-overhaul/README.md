# Major Overhaul Plan (Psi Operative / Archangel Knights)

## Overview
- Objective: Reframe the product into a mission-first Psi Operative training hub with reliable offline behavior, and do it solo without blocking on teams or infra changes.
- Constraints: Keep SPA shell and routing; avoid regressions in deep links; prioritize offline baseline and low-data modes early; ship sequentially with automated smoke verification.
- Definition of done: Persona-aligned IA/copy, a minimal mission kit content pack live, readiness score visible on Home, offline cold-start works, and a lightweight Signals/AAR stub exists—even if thin—plus basic telemetry to watch the rollout.

## Transmutation Target (App-wide)
- Product shape: Shift from workout-centric training app to operations-centric investigative console.
- Primary domains: operations, cases, leads, signals, artifacts, intel packets, debrief outcomes.
- Core route set: Mission Brief, Triage Board, Case Detail, Signal Analysis, Action Checklist, Debrief.
- Core UX pattern: Split-pane situational layout with fast triage, evidence context, and mission timeline continuity.
- Core quality bar: Offline-capable mission flow, low-data resilience, deterministic deep-link behavior, and telemetry coverage for all critical user paths.

## Principles
- Thin slices first: Ship the smallest vertical that proves IA/copy + readiness + offline, then expand.
- Reliability before richness: Cache, preload, and error paths must land before any heavier assets or UI polish.
- Solo-friendly gates: One-person reversible steps and quick rollback via deploy control.
- Measurable but lightweight: Metrics that can be logged locally/console-first, then hooked to a sink if time allows.
- Security/trust by default: Remove unused Web3; add a clear privacy/auth note; avoid taking on new auth work.

## Phasing (solo-friendly)
- Phase 0: Baseline and guards
  - Verify SPA rewrites/deep-link matrix online; add SW skeleton + offline indicator.
  - Success: Deep links pass; offline indicator flips.
- Phase 1: IA/Copy + Readiness slice
  - Rename IA; add readiness score + two next actions on Home (local model + sample pack).
  - Hide/remove Web3; add privacy note.
  - Success: Mission IA live; readiness renders from local sample; Web3 gone; privacy note present.
- Phase 1a: Persona-first Ops UX (new)
  - Reframe IA and flows around Psi Operative operations: Mission Brief → Triage Board → Case Detail → Signal Drill-Down → Action Checklist → Debrief.
  - Define ops-grade components (mission header, status chips, triage board, evidence list, timeline/map slot, alert stack) and a distinct visual system.
  - Reshape data/content toward operations: operations, cases, leads, signals, artifacts, intel packets, after-action outcomes; convert one exemplar pack to the new schema.
  - Success: Updated IA map, component spec, and one end-to-end exemplar operation wired in UI with mission theming.
- Phase 2: Offline/Low-data + Drill flow
  - Precache shell + sample pack; runtime cache for drills; preload action; low-data toggle; ensure drill run works offline after sync.
  - Success: Cold offline start loads shell + sample kit; cached deep links work; low-data reduces asset loads.
- Phase 3: Signals/AAR stub (solo scope)
  - Add minimal Signals list (local-only), role tags as labels, and AAR template with local save/export.
  - Success: Signals visible; AAR can be created/saved/exported locally.

## Execution Program (Depth Upgrade)
- Program A: Domain and architecture refactor
  - Define canonical domain model and TypeScript contracts for operation/case/lead/signal/artifact/debrief.
  - Add compatibility adapters from legacy training modules/decks.
  - Add migration validators and schema conformance checks.
  - Exit gate: New domain contracts are the default app read path for at least one end-to-end operation.
- Program B: Route and flow reconstruction
  - Rebuild top-level navigation to mission flow hierarchy.
  - Implement route-level shells for the six core surfaces.
  - Add state continuity rules between routes (context carryover, selected case/signal persistence).
  - Exit gate: A single mission can be completed from brief through debrief without leaving the new route model.
- Program C: Ops design system implementation
  - Tokenize mission visual language (semantic colors, threat states, typography scale).
  - Implement reusable ops components (mission header, severity chips, triage columns, artifact list, timeline band, alert stream).
  - Add interaction contract for keyboard-first triage actions.
  - Exit gate: All new mission routes use shared ops primitives rather than ad hoc styling.
- Program D: Content and scenario production
  - Rewrite visible copy to mission language with SOP/ROE tone.
  - Create exemplar operation packs with realistic signals, leads, artifacts, and branching actions.
  - Build debrief prompts and scoring rubric tied to investigative competencies.
  - Exit gate: At least three exemplar operations are complete and internally consistent.
- Program E: Reliability, telemetry, and QA hardening
  - Expand offline matrix to all new routes and mission flow transitions.
  - Add telemetry taxonomy for triage/analysis/action/debrief milestones.
  - Add regression gates (build + smoke + offline + telemetry schema checks) for each phase completion.
  - Exit gate: All critical path checks pass in a single scripted run.
- Program F: Rollout and deprecation
  - Add feature-flagged cutover from legacy flows to mission flows.
  - Provide rollback playbook and legacy compatibility window.
  - Remove dead fitness-centric artifacts once cutover stabilizes.
  - Exit gate: Mission flow is default-on and legacy routes are either removed or redirected.

## Dependency Chain (Critical Path)
- Domain model and adapters must land before route reconstruction beyond prototype surfaces.
- Ops design tokens/components must stabilize before full-page visual pass.
- Exemplar content packs must exist before telemetry validation is meaningful.
- Telemetry schema must stabilize before rollout gates are considered reliable.
- Rollout/deprecation starts only after offline + deep-link + telemetry gates are green.

## Acceptance Gates (Non-negotiable)
- Gate 1: Mission language parity
  - No user-visible fitness/Web3 phrasing in active routes/content packs.
- Gate 2: End-to-end mission continuity
  - Brief → Triage → Case → Signal → Checklist → Debrief works with persisted context.
- Gate 3: Offline field viability
  - Synced mission runs through key steps offline with graceful fallback messaging.
- Gate 4: Observability completeness
  - Critical mission events emit valid payloads and appear in report scripts.
- Gate 5: Legacy cutover readiness
  - Redirects, deep links, and rollback scripts validated before enabling mission-default mode.

## Cross-cutting Deliverables (solo scale)
- Telemetry/test: Event names + console logging; small deep-link/offline matrix runnable by one person; perf budget targets noted.
- Security/privacy: Data handling note; consent pattern (even if lightweight); remove unused Web3 hooks.
- Rollout: Simple deploy plan (staging → production) with automated checks; rollback steps documented; minimal comms note.

## Risk Register (Current)
- Scope risk: App-wide refactor may exceed solo throughput without strict phase gates.
- Data drift risk: Legacy and new schemas can diverge during mixed-mode period.
- UX inconsistency risk: Old and new components may coexist and dilute mission identity.
- Reliability risk: New route complexity can regress deep-link and offline behavior.
- Mitigation: Feature flags, adapter tests, phase exit gates, and mandatory scripted smoke per phase.

## Folder Map
- strategy/
- ia-and-copy/
- content-and-data-model/
- experience-and-flows/
- offline-and-reliability/
- ops-and-team/
- telemetry-and-qa/ (telemetry and automation)
- delivery-and-rollout/

Each subfolder holds the phase-specific plans and acceptance criteria; owner is Copilot (solo).
