# Stabilization Window and Defect Triage Protocol (Stage 11 / Task 10.3.3)

## Stabilization window
- Duration: 7 calendar days after rollback/cutover validation passes.
- Scope: mission navigation, deep-link continuity, offline flows, telemetry validity, and payload/regression guardrails.

## Quality thresholds (must hold during window)
- Smoke: `npm run smoke:headless` passes on daily run and on any route/flag change.
- Telemetry:
  - validation report contains zero issues.
  - schema drift report contains zero unexpected drift entries.
- Deep-link continuity:
  - online and offline deep-link checks pass for mission and compatibility alias paths.
- Payload budget guard:
  - all mission routes remain within configured tier budgets.

## Defect severity routing

### Severity 0 (blocker)
- Definition: production/staging smoke failure, rollback command failure, or telemetry contract break.
- Routing: immediate fix or rollback, owner = current deploy owner.
- SLA: same-day mitigation.

### Severity 1 (high)
- Definition: mission-route mismatch, offline continuity failure, or data-loss risk.
- Routing: assign primary engineer and open hotfix track.
- SLA: fix in next 24 hours.

### Severity 2 (medium)
- Definition: non-blocking IA/copy mismatch or minor degraded behavior with workaround.
- Routing: batch into daily stabilization backlog.
- SLA: fix within stabilization window.

### Severity 3 (low)
- Definition: cosmetic or observability-only issues with no user impact.
- Routing: defer to next scheduled maintenance sprint.

## Triage cadence
- Daily 15-minute stabilization triage while window is active.
- Inputs:
  - latest smoke artifact set
  - telemetry audit report
  - open defect list grouped by severity
- Exit condition:
  - 3 consecutive days with no Sev0/Sev1 and all guard checks passing.

## Operational commands
- Primary smoke: `BASE_URL=<host> npm run smoke:headless`
- Deep links online: `npm run check:deeplinks -- --base=<host>`
- Deep links offline: `npm run check:deeplinks-offline -- --base=<host>`
- Rollback artifact build: `npm run rollback:mission-default`
