# Rollout Plan

## Pre-deploy checklist
- Build from main: `npm run build` and ensure dist is current.
- Run headless smoke: `npm run smoke:headless` (uses preview host) and archive artifacts/telemetry-headless.json, artifacts/telemetry-validate-report.json, artifacts/smoke-headless-report.json with the deploy tag.
- Budget checks: `npm run check:payload-budgets` and `npm run check:precache-size` clean.

## Staging deploy
- Push dist to staging host; apply redirect map from migration doc.
- Run smoke against staging host: `BASE_URL=https://staging.host npm run smoke:headless` and store artifacts under artifacts/staging-<date>/.
- Monitor staging for 30 minutes: readiness render rate, deep-link success, drill completion (console/telemetry sink).

## Production enablement
- Deploy from staging artifact; enable feature flags per phase (Phase 1→3) if applicable.
- Run smoke against production: `BASE_URL=https://prod.host npm run smoke:headless` and archive artifacts under artifacts/prod-<date>/.
- Watch window: 1 hour; rollback if any smoke step fails or readiness render drops >5% vs staging.

## Stage 11 route-level cutover matrix

### Environment defaults
| Environment | missionDefaultRoutes | missionSurfaceBrief | missionSurfaceTriage | missionSurfaceCase | missionSurfaceSignal | missionSurfaceChecklist | missionSurfaceDebrief |
| --- | --- | --- | --- | --- | --- | --- | --- |
| development | true | true | true | true | true | true | true |
| staging | true | true | true | true | true | true | true |
| production | true | true | true | true | true | true | true |

### Compatibility redirects
| Transitional route | Redirect target |
| --- | --- |
| `/home` | `/mission/brief` |
| `/home/plan` | `/mission/brief` |
| `/home/cards` | `/mission/triage` |
| `/home/progress` | `/mission/case` |
| `/home/coach` | `/mission/signal` |
| `/home/settings` | `/mission/debrief` |

### Runtime behavior
- Root route (`/`) resolves to `/mission/brief`.
- Mission routes are the only user-facing route family.
- `/home/*` routes are compatibility redirects for deep-link continuity and rollback-safe bookmarks.
- Retired aliases (`/training`, `/training/run`, `/workouts`, `/schedules`, `/settings`) now map directly to mission routes as permanent compatibility redirects.

## Rollback
- One-command rollback artifact build: `npm run rollback:mission-default`
- Trigger previous deploy artifact; clear CDN cache for precache assets and manifest.
- Verify rollback with smoke: `BASE_URL=https://prod.host npm run smoke:headless` (expect restored behaviors) and document in artifacts/prod-rollback-<date>/.
- Announce rollback + scope to ops channel; schedule root-cause follow-up.

## Monitoring
- Track deep-link/offline success, readiness render, drill completion via telemetry buffer exports until dashboards exist.
- Halt/rollback criteria: any smoke failure, spike in nav errors, or offline cache-miss rate >10% during watch window.

## Acceptance
- Stage timelines, owners, smoke commands, and rollback triggers documented with artifact paths per deploy.
