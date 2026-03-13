# Mixed-mode Validation (Stage 11 / Task 10.1.2)

## Scope
Validate shared user journeys while legacy `/home/*` and mission `/mission/*` routes coexist behind cutover flags.

## Scenario matrix
| Scenario | Flag profile | Expected behavior |
| --- | --- | --- |
| Legacy-canonical mode | `missionDefaultRoutes=false` with mission surface flags any value | `/` resolves to `/home/plan`; retired aliases (`/schedules`, `/workouts`, `/training`, `/settings`) resolve to mission routes; mission routes are treated as disabled and fall back to mapped home routes. |
| Partial mission rollout | `missionDefaultRoutes=true` with selective mission surface flags | Enabled mission surfaces load directly; disabled mission surfaces redirect to mapped `/home/*` fallbacks; legacy aliases resolve to mission targets while preserving fallback continuity for disabled surfaces. |
| Full mission rollout | `missionDefaultRoutes=true` and all mission surface flags true | `/` resolves to `/mission/brief`; all legacy aliases map to mission routes; no fallback redirects expected for enabled mission surfaces. |

## Automated coverage
- Unit scenarios: `src/routes/__tests__/mixedModeJourneys.test.ts`
- Route cutover assertions: `src/routes/__tests__/missionCutover.test.ts`
- Flag resolution assertions: `src/config/__tests__/featureFlags.test.ts`

## Latest execution
- Command: `npm test -- src/routes/__tests__/missionCutover.test.ts src/routes/__tests__/mixedModeJourneys.test.ts src/config/__tests__/featureFlags.test.ts`
- Result: 3 test files passed, 10 tests passed.
- Follow-up build check: `npm run build` passed.

## Incompatibility defects
- No incompatibility defects detected in current mixed-mode validation run.

## Staging cutover drill (Task 10.1.3.2)
- Staging artifact command: `VITE_APP_ENV=staging npm run build`
- Smoke command: `BASE_URL=http://127.0.0.1:4174 npm run smoke:headless`
- Result: pass (suite complete).
- Notes:
	- Payload budget reporting stabilized after dedupe fix in mission route payload reporting.
	- Render profile and telemetry trigger flows passed with mission-context seeding.
	- Telemetry schema drift report returned no drift after aligning trigger flow outputs.
- Rollback drill artifact command:
	- `VITE_APP_ENV=staging VITE_FEATURE_FLAGS='{"missionDefaultRoutes":false,"missionSurfaceBrief":false,"missionSurfaceTriage":false,"missionSurfaceCase":false,"missionSurfaceSignal":false,"missionSurfaceChecklist":false,"missionSurfaceDebrief":false}' npm run build`
- Rollback verification command: `npm run check:deeplinks -- --base=http://127.0.0.1:4174`
- Rollback verification result: pass (legacy `/home/*` root and route continuity validated).
