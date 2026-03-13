# Operation Charlie Pack

## Scope
- Artifact-chain decision exemplar for Stage 9 Step 8.2.3.
- Focus: dependency ordering, origin verification, and traceable decision release.

## Canonical Entities
- Operation: `op-operation-charlie` (`active`, readiness `84`)
- Case: `case-charlie-artifact-chain`
- Leads: `lead-charlie-chain-sequencing`, `lead-charlie-origin-verification`
- Signals: `signal-charlie-chain-gap`, `signal-charlie-hash-drift`, `signal-charlie-origin-conflict`
- Artifacts: `artifact-charlie-ingress-capture`, `artifact-charlie-parser-log`, `artifact-charlie-origin-report`, `artifact-charlie-escalation-note`
- Intel packet: `intel-operation-charlie-chain`
- Debrief outcome: `debrief-operation-charlie`

## Artifact Chain and Dependencies
- Chain order: ingress capture → parser log → origin report → escalation note.
- Dependency rule: escalation cannot complete until origin report and chain integrity checks pass.
- Decision checkpoints: chain gap, hash drift, and origin conflict signals drive branch outcomes.

## Route Flow
- Brief: align objective and chain-integrity constraints.
- Triage: prioritize dependency risks and missing links.
- Case: inspect chain order and source consistency.
- Signal: resolve dependency breakpoints and commit branch decisions.
- Checklist: execute ownership and sequencing tasks.
- Debrief: record traceability outcomes and readiness delta.

## Runtime Wiring
- Exemplar data source: `src/domain/mission/exemplars/operationCharlie.ts`
- Canonical hydration merge: `src/domain/mission/MissionEntityStore.ts`
- Drill sequence wiring: `src/data/missionKits/sampleMissionKit.ts`

## Validation Notes
- Mission hydration and route-state suites pass.
- Production build passes.
