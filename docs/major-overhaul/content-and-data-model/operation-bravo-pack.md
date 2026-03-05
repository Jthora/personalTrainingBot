# Operation Bravo Pack

## Scope
- Signal-heavy exemplar operation for Stage 9 Step 8.2.2.
- Focuses on branch decisions: escalate, monitor, dismiss.

## Canonical Entities
- Operation: `op-operation-bravo` (`triage`, readiness `81`)
- Case: `case-bravo-signal-cascade`
- Leads: `lead-bravo-auth-chain`, `lead-bravo-route-integrity`, `lead-bravo-recovery-noise`
- Signals: `signal-bravo-gateway-flood`, `signal-bravo-auth-anomaly`, `signal-bravo-route-hijack`, `signal-bravo-recovery-false-positive`
- Artifacts: `artifact-bravo-correlation-report`, `artifact-bravo-route-diff`, `artifact-bravo-ops-log`
- Intel packet: `intel-operation-bravo-branches`
- Debrief outcome: `debrief-operation-bravo`

## Analysis Branches
- Branch A (escalate): auth-chain divergence validated by correlated anomalies.
- Branch B (escalate): route-integrity compromise confirmed by route-diff evidence.
- Branch C (monitor/dismiss): recovery replay false-positive separated from hostile indicators.

## Route Flow
- Brief: establish signal-analysis objective and branch criteria.
- Triage: prioritize critical and high-confidence signals.
- Case: map hypotheses to artifacts and assigned leads.
- Signal: execute branch outcomes and status transitions.
- Checklist: confirm owners/timing for each branch action.
- Debrief: evaluate decision quality and readiness effect.

## Runtime Wiring
- Exemplar data source: `src/domain/mission/exemplars/operationBravo.ts`
- Canonical hydration merge: `src/domain/mission/MissionEntityStore.ts`
- Drill sequence wiring: `src/data/missionKits/sampleMissionKit.ts`

## Validation Notes
- Mission hydration and route state focused tests pass.
- Production build passes.
