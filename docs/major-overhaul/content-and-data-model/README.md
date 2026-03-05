# Content and Data Model

## Objectives
- Define schemas for mission kits and drills suited to Psi Operative training.
- Specify readiness score inputs and aggregation.
- Provide starter content packs.

## Schemas (to detail)
- Mission Kit: id, title, synopsis, mission tags, prerequisites, drills list, readiness impact, offline assets.
- Drill: id, type (simulation, tabletop, rapid response), difficulty, duration, steps, success criteria, telemetry hooks, cacheability.
- Readiness Model: factors (recency, difficulty, completion quality, fatigue proxy), decay/boost rules, displayed score range.

## Deliverables
- JSON schema drafts for mission kits and drills.
- Readiness model spec with examples.
- Sample content packs (at least 1 cyber incident kit, 1 OSINT kit) with offline-safe assets.

## Acceptance
- Schemas versioned and validated in repo; sample packs load in app.
- Readiness score computes locally from sample data and surfaces on Home.

## Implemented Pack
- [Operation Alpha Pack](./operation-alpha-pack.md)
- [Operation Bravo Pack](./operation-bravo-pack.md)
- [Operation Charlie Pack](./operation-charlie-pack.md)

## Progression Model
- [Competency Scoring Rubric](./competency-scoring-rubric.md)
- [Debrief Readiness Progression](./debrief-readiness-progression.md)
- [Mission Milestones and Unlock Criteria](./mission-milestones-and-unlocks.md)
