# Telemetry and Automation

## Objectives
- Define events, dashboards, automated checks, and perf budgets that align with phased rollout and avoid manual testing cycles.

## Event Taxonomy (examples)
- IA navigation: tab/view impressions, deep-link loads, errors.
- Readiness: score render, score source (local/synced), next-action clicks.
- Offline: offline/online transitions, cache hits/misses, SW install/update.
- Drills: start, step complete, completion/abort, export.
- Signals/AAR: item created, ack/resolve, AAR export.
- Mission route transitions: see [mission-step-transition-contracts.md](./mission-step-transition-contracts.md) for required/optional payload contract fields.

## Dashboards and Alerts
- Readiness render rate and time-to-ready.
- Offline success rate and cache hit ratio.
- Deep-link success/failure by route.
- Drill completion vs abort.

## Automated Checks
- Deep links: headless checks for home, mission-kit, mission routes (`/mission/*`), drills, c/:slug, share/:slug (online/offline-after-sync), including continuity query permutations (`op/case/signal`).
- Offline: scripted cold start, reload with SW update, cache eviction path.
- Low-data: assert asset reduction via network inspection.
- Accessibility: reduced motion/focus order via linting/headless audits.
- Telemetry shape validation: run `npx tsx scripts/validateTelemetryEvents.ts artifacts/telemetry-sample.json artifacts/telemetry-validate-report.json` (or against an exported buffer) to verify categories/actions/required fields and emit a JSON report for CI.
- Telemetry schema drift detection: run `npm run telemetry:drift` to compare current event payload key shapes against `artifacts/telemetry-schema-baseline.json` and emit `artifacts/telemetry-schema-drift-report.json`.
	- Initialize/update baseline with `npx tsx scripts/checkTelemetrySchemaDrift.ts artifacts/telemetry-headless.json artifacts/telemetry-schema-baseline.json artifacts/telemetry-schema-drift-report.json --update-baseline`.
- Telemetry audit summary report: run `npm run telemetry:audit` to generate `artifacts/telemetry-audit-report.md` from validation, drift, and smoke outputs for manual review.
- Telemetry headless trigger: run `npx tsx scripts/triggerTelemetryFlows.ts` against a running dev server on http://localhost:4173 to produce events before validation.
	- Requires `npm install -D playwright` and `npx playwright install chromium` once. Override base URL with `BASE_URL=http://localhost:4173`.
- Headless smoke (deeplinks + offline + telemetry): run `npm run smoke:headless` (uses BASE_URL, TELEMETRY_OUT, TELEMETRY_REPORT, TELEMETRY_BASELINE, TELEMETRY_DRIFT_REPORT, TELEMETRY_AUDIT_OUT, SMOKE_REPORT envs). Includes online deep links, offline deep links, offline mission critical path, offline recovery checks, mission-route payload report + guard, mission render-cycle profiling, and telemetry validation/drift/audit. Produces artifacts/telemetry-headless.json, artifacts/telemetry-validate-report.json, artifacts/telemetry-schema-drift-report.json, artifacts/telemetry-audit-report.md, artifacts/offline-critical-path-report.json, artifacts/offline-recovery-report.json, artifacts/mission-route-payload-report.json, artifacts/mission-render-profile-report.json, and artifacts/smoke-headless-report.json.
- Mission route payload report: `npm run report:mission-route-payloads -- --base=http://localhost:4173` emits `artifacts/mission-route-payload-report.json` with per-route transfer sizes for `/mission/*` surfaces.
- Mission route payload guard: `npm run check:mission-route-budgets` compares measured route payloads against tier budgets and fails on regressions.
- Mission render-cycle profile: `npm run report:mission-render-cycles -- --base=http://localhost:4173` emits `artifacts/mission-render-profile-report.json` with render count and duration summaries for triage/case/detail hotspots.

## Latest Telemetry Validation (2026-03-05)
- Buffer: [artifacts/telemetry-headless.json](artifacts/telemetry-headless.json) (17 events) produced via headless trigger (within smoke run).
- Report: [artifacts/telemetry-validate-report.json](artifacts/telemetry-validate-report.json) — no schema issues.
- Smoke summary: [artifacts/smoke-headless-report.json](artifacts/smoke-headless-report.json) captured exit codes for deep links (online/offline) and telemetry steps.
- Drift baseline: [artifacts/telemetry-schema-baseline.json](artifacts/telemetry-schema-baseline.json) (schema keyset reference).
- Drift report: [artifacts/telemetry-schema-drift-report.json](artifacts/telemetry-schema-drift-report.json).
- Human-readable audit: [artifacts/telemetry-audit-report.md](artifacts/telemetry-audit-report.md) generated from validation, drift, and smoke outputs.
- Observations: readiness “Next” and “Start” buttons still not clickable headlessly (warnings only); offline runs report navigator online in headless but caches serve content. Next iteration: widen selectors or scroll/wait states for those buttons; consider forcing offline flag for assertions.

## Performance Budgets
- TTI p75 (warm): <1.5s; bundle size budgets; image/asset budgets per mode.

## Acceptance
- Event schema checked in; sample dashboard queries defined.
- Automated cases enumerated with cadence and expected results; headless scripts runnable solo.
