# Workouts Overhaul

## Purpose & Scope
- Establish a single, reliable workout scheduling experience (random + custom) with difficulty-aware generation, persistent selections, and responsive UI updates.
- In scope: schedule generation, persistence/versioning, custom schedules, calendar integration, UX flows, testing/observability.
- Out of scope (for now): new workout content, backend APIs beyond current data sources.

## Goals & Success Metrics
- Consistent schedule shapes across all entry points.
- Hydration success rate ~100% (no corrupt storage left behind); stale selections auto-cleared on taxonomy changes.
- User metrics: improved completion/skip funnel, reduced empty-schedule incidents.
- Technical: reduced duplicate loads, log noise controlled, expanded tests.

## Owners & Stakeholders
- Product: <owner>
- Engineering: <owner>
- Design: <owner>
- QA: <owner>
- Support/CS: <owner>

## Timeline & Phases
- See `roadmap.md` for milestones, dates, and dependencies.

## Quick Links
- Architecture: `architecture.md`
- Decisions: `problems_and_decisions.md`
- Roadmap: `roadmap.md`
- Workflows: `workflows.md`
- API/Data: `api_and_data.md`
- Migration/Risks: `migration_and_risks.md`
- Testing/Metrics: `testing_and_metrics.md`
- Release Notes: `release_notes.md`
- Playbook: `playbook.md`
