# Test Matrix: Deep Links and Offline

## Routes
- Home, Mission Kit, Drills, Training/Execute, c/:slug, share/:slug.
- Mission flow routes with continuity params (`op`, `case`, `signal`): brief, triage, case, signal, checklist, debrief.

## Scenarios (automated)
- Online fresh load (headless).
- Offline after sync (cached data present) with simulated network drop.
- Offline missing cache (expect explicit fallback) with assertion on messaging.
- SW update in progress; reload behavior via script.
- Low-data enabled with network budget assertions.

## Cases to Cover
- Load success, copy correctness, indicator states, telemetry fired (captured via script assertions).
- Drill run offline continuity with cached steps.
- Mission state permutations:
	- Valid continuity state: `?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`.
	- Alternate valid continuity state: `?op=op-operation-bravo&case=case-bravo-signal-cascade&signal=signal-bravo-route-hijack`.
	- Stale/invalid continuity state should self-heal to canonical context without route crash.

## Acceptance
- Cases enumerated with cadence (per phase) and expected result; scripts produce pass/fail output.

## Cadence and Tooling
- Command: `npm run smoke:headless` (uses BASE_URL/TELEMETRY_OUT/TELEMETRY_REPORT/SMOKE_REPORT). Runs online deep links, offline cached deep links, telemetry trigger, and telemetry validation.
- Command: `npm run check:offline-critical-path -- --base=http://localhost:4173` validates mission critical-path checkpoints offline and emits `artifacts/offline-critical-path-report.json`.
- Cadence: run at end of each phase (0–3) and before deploy/rollback; archive artifacts/telemetry-headless.json, artifacts/telemetry-validate-report.json, artifacts/smoke-headless-report.json per run.
- Expected results: all routes render without console/page errors; offline cached runs may warn that navigator reports online in headless but should still load from cache; readiness “Next/Start” clicks may need relaxed selectors to avoid skips.

## Current Automation Run (online)

Online: `npm run check:deeplinks -- --base=http://localhost:4173`
Offline cached: `npm run check:deeplinks-offline -- --base=http://localhost:4173` (warms caches, then runs offline).

| Route | Scenario | Status | Notes |
| --- | --- | --- | --- |
| /home | Online fresh | pass | Headless against preview host |
| /home/plan | Online fresh | pass | Mission Kit tab renamed; rendered readiness + kit panel |
| /home/cards | Online fresh | pass | Deep link focus handling asserted by script |
| /home/progress | Online fresh | pass | Renamed to Readiness; section loads without console errors |
| /home/coach | Online fresh | pass | Renamed to Signals/Ops Brief; section load only |
| /home/settings | Online fresh | pass | Web3 panel removed; privacy note present |
| /mission/brief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge | Online fresh | pass | Mission continuity state path |
| /mission/triage?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge | Online fresh | pass | Mission continuity state path |
| /mission/case?op=op-operation-bravo&case=case-bravo-signal-cascade&signal=signal-bravo-route-hijack | Online fresh | pass | Alternate continuity state path |
| /mission/signal?op=op-operation-charlie&case=case-charlie-artifact-chain&signal=signal-charlie-chain-gap | Online fresh | pass | Alternate continuity state path |
| /mission/checklist?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge | Online fresh | pass | Mission continuity state path |
| /mission/debrief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge | Online fresh | pass | Mission continuity state path |
| /mission/brief?op=op-missing&case=case-missing&signal=sig-missing | Online fresh | pass | Stale continuity params normalize via route-state resolver |
| /training | Online fresh | pass | Execute route renders without console errors |
| /training/run | Offline cached | pass | Cached shell/runner load offline; navigator.onLine stayed true in headless (warning only) |
| /c/demo-slug?source=test | Online fresh | pass | Resolves slug path or reports not-found without crash |
| /share/demo-slug | Online fresh | pass | Share route resolves without console errors |

Latest run: Mar 5, 2026 using `npm run smoke:headless` against http://localhost:4173 (headless). Offline cached runs warn when navigator reports online but still load from cache. Readiness “Next/Start” clicks skipped (selectors to relax). See artifacts/smoke-headless-report.json for exit codes and durations.

Next action: rerun smoke on preview/prod host after selector relax for readiness/drill buttons; archive artifact trio per host.

## Follow-Ups (noted per Task 0.1.2.2)
- Relax readiness/drill button selectors in smoke scripts to reduce skips.
- Add mobile-viewport (390×844) deep-link pass to `smoke:headless` — currently runs desktop-only.
- Re-archive artifact trio after next full smoke run.
- Consider gating deploy on `smoke:headless` pass + `psi-operative-scenario` pass.

## Offline Mission Critical Path Runbook (2026-03-05)
- Command: `npm run check:offline-critical-path -- --base=http://localhost:4173`
- Artifact: [artifacts/offline-critical-path-report.json](artifacts/offline-critical-path-report.json)
- Result: pass across brief → triage → case → signal → checklist → debrief + `/training/run` with cached/offline navigation.
- Note: headless offline still reports `navigator.onLine=true` warnings; route rendering and cached loads remained valid.

## Offline Recovery Runbook (2026-03-05)
- Command: `npm run check:offline-recovery -- --base=http://localhost:4173`
- Artifact: [artifacts/offline-recovery-report.json](artifacts/offline-recovery-report.json)
- Result: pass for cache corruption simulation (offline fail → online recovery → offline success) and stale manifest invalidation.
