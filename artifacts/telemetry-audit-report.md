# Telemetry Audit Report

- Generated: 2026-03-06T23:32:06.923Z
- Overall status: FAIL
- Validation report: artifacts/telemetry-validate-report.json
- Drift report: artifacts/telemetry-schema-drift-report.json
- Smoke report: artifacts/smoke-headless-report.json

## Validation Summary
- Events checked: 9
- Issues found: 3
- Event distribution:
  - offline:offline_exit: 3
  - ia:tab_view: 3
  - readiness:score_render: 1
  - signals:signal_create: 1
  - signals:signal_resolve: 1

### Validation Issues
- Event[2] Missing required field data.tab; Missing required mission transition field data.fromTab; Missing required mission transition field data.toTab; Missing required mission transition field data.transitionType; Missing required mission transition field data.source
- Event[4] Missing required field data.tab; Missing required mission transition field data.fromTab; Missing required mission transition field data.toTab; Missing required mission transition field data.transitionType; Missing required mission transition field data.source
- Event[8] Missing required field data.tab; Missing required mission transition field data.fromTab; Missing required mission transition field data.toTab; Missing required mission transition field data.transitionType; Missing required mission transition field data.source

## Schema Drift Summary
- Mode: compare
- Drift detected: yes
- Missing event keys:
  - aar:aar_export
  - aar:aar_save
  - settings:preload_trigger
- New event keys:
  - ia:tab_view

## Smoke Run Summary
- Base URL: http://localhost:4175
- Steps: 11
  - PASS Deep links (online) (exit 0, 24.47s)
  - PASS Deep links (offline cached) (exit 0, 34.68s)
  - PASS Offline critical path (exit 0, 11.72s)
  - PASS Offline recovery checks (exit 0, 4.12s)
  - PASS Mission route payload report (exit 0, 14.45s)
  - PASS Mission route payload budgets (exit 0, 637ms)
  - PASS Mission render profile (exit 0, 7.72s)
  - PASS Psi Operative end-to-end scenario (exit 0, 4.87s)
  - PASS Telemetry trigger (exit 0, 68.83s)
  - FAIL Telemetry validation (exit 1, 692ms)
  - FAIL Telemetry schema drift (exit 1, 699ms)

## Reviewer Checklist
- Confirm validation issues are empty.
- Confirm drift is expected or baseline was intentionally updated.
- Confirm smoke steps passed for this run.
