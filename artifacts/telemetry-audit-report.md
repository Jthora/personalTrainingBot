# Telemetry Audit Report

- Generated: 2026-03-05T12:42:16.295Z
- Overall status: PASS
- Validation report: artifacts/telemetry-validate-report.json
- Drift report: artifacts/telemetry-schema-drift-report.json
- Smoke report: artifacts/smoke-headless-report.json

## Validation Summary
- Events checked: 11
- Issues found: 0
- Event distribution:
  - offline:offline_exit: 4
  - readiness:score_render: 2
  - signals:signal_create: 1
  - signals:signal_resolve: 1
  - aar:aar_save: 1
  - aar:aar_export: 1
  - settings:preload_trigger: 1

## Schema Drift Summary
- Mode: compare
- Drift detected: no
- Drift details: none

## Smoke Run Summary
- Base URL: http://127.0.0.1:4176
- Steps: 10
  - PASS Deep links (online) (exit 0, 19.68s)
  - PASS Deep links (offline cached) (exit 0, 23.96s)
  - PASS Offline critical path (exit 0, 12.81s)
  - PASS Offline recovery checks (exit 0, 4.87s)
  - PASS Mission route payload report (exit 0, 14.01s)
  - PASS Mission route payload budgets (exit 0, 616ms)
  - PASS Mission render profile (exit 0, 6.97s)
  - PASS Telemetry trigger (exit 0, 23.47s)
  - PASS Telemetry validation (exit 0, 621ms)
  - PASS Telemetry schema drift (exit 0, 618ms)

## Reviewer Checklist
- Confirm validation issues are empty.
- Confirm drift is expected or baseline was intentionally updated.
- Confirm smoke steps passed for this run.
