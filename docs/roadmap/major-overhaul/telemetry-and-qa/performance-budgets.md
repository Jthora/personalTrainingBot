# Performance Budgets

## Targets
- Warm time-to-interactive p75: <1.5s; p95: <2.2s.
- JS bundle budget: define per entry; minimize critical path.
- Image/asset budgets: low-data defaults; rich mode opt-in.

## Monitoring
- Track via telemetry and dashboards; alert on regressions.

## Mission Route Payload Budgets (Step 9.3)
- Measure current mission-route transfer sizes (headless):
	- `npm run report:mission-route-payloads -- --base=http://localhost:4173`
	- Output artifact: `artifacts/mission-route-payload-report.json`
- Enforce mission-route budgets:
	- `npm run check:mission-route-budgets`
- Route tiers and transfer budgets:
	- Tier 1 (core): `/mission/brief`, `/mission/triage`, `/mission/checklist` → ≤ 8200 KB transfer each.
	- Tier 2 (analysis): `/mission/case`, `/mission/signal` → ≤ 8250 KB transfer each.
	- Tier 3 (support): `/mission/debrief` → ≤ 8300 KB transfer.
- Baseline measurement (2026-03-05): mission routes measured at ~7969.5–7969.7 KB transfer each on preview host; thresholds set with ~3%–4% guard headroom.

## Mission Render-Cycle Profiling (Step 9.3.3)
- Capture render-cycle timings for mission hotspots (triage board + case detail list):
	- `npm run report:mission-render-cycles -- --base=http://localhost:4173`
	- Output artifact: `artifacts/mission-render-profile-report.json`
- Profile IDs in report:
	- `mission:triage:board`
	- `mission:triage:detail-table`
	- `mission:case:artifact-list`
- Use this report to validate that selection/interaction flows do not cause runaway rerenders before adjusting memoization and local state partitioning.

## Local + CI Wiring
- Local validation sequence:
	1. `npm run build`
	2. `npm run preview -- --host --port 4173`
	3. `npm run report:mission-route-payloads -- --base=http://localhost:4173`
	4. `npm run check:mission-route-budgets`
- CI expectation: run the same report+check pair against a preview host to catch route-level payload regressions.
- Local hotspot tuning sequence (before/after optimization):
	1. `npm run build`
	2. `npm run preview -- --host --port 4173`
	3. `npm run report:mission-render-cycles -- --base=http://localhost:4173`

## Acceptance
- Budgets documented per entry and asset type; tracked in CI where possible.
- Mission-route budgets are measured per route tier and enforced with a failing guard command.
