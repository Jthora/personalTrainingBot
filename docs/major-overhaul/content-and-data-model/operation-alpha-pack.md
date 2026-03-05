# Operation Alpha Pack

## Scope
- Introductory exemplar operation for Stage 9 Step 8.2.1.
- Covers full mission route path: Brief → Triage → Case → Signal → Checklist → Debrief.

## Canonical Entities
- Operation: `op-operation-alpha` (`briefing`, readiness `78`)
- Case: `case-alpha-relay-corridor`
- Leads: `lead-alpha-gateway-cert`, `lead-alpha-operator-window`
- Signals: `signal-alpha-beacon-surge`, `signal-alpha-gateway-drift`
- Artifacts: `artifact-alpha-pcap`, `artifact-alpha-auth-report`, `artifact-alpha-comms-note`
- Intel packet: `intel-operation-alpha-brief`
- Debrief outcome: `debrief-operation-alpha`

## Narrative Arc
- Brief: relay corridor compromise with evidence-preservation constraints.
- Triage: prioritize critical beacon surge then trust-anchor drift.
- Case: validate certificate replay chain and staffing-window risk.
- Signal: acknowledge/escalate the highest-severity stream with explicit ownership.
- Checklist: execute containment and comms confirmation loop.
- Debrief: capture lessons learned and readiness delta for progression.

## Runtime Wiring
- Exemplar data source: `src/domain/mission/exemplars/operationAlpha.ts`
- Hydration integration: `src/domain/mission/MissionEntityStore.ts`
- Drill sequence mapping: `src/data/missionKits/sampleMissionKit.ts` + `src/components/MissionKit/MissionKitPanel.tsx`

## Validation Notes
- Focused tests pass for mission store hydration and route state.
- Full production build passes.
