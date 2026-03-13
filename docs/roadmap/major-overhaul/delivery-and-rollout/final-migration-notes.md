# Final Migration Notes and Compatibility Constraints (Stage 11 / Step 10.2.3)

## Final migration decisions

### Routing and IA
- Mission IA is the long-term canonical model.
- Mission IA is now the runtime canonical model.
- Root route resolves to `/mission/brief` across environments.
- Workout-centric aliases are permanently retired as compatibility redirects:
  - `/schedules` -> `/mission/brief`
  - `/workouts` -> `/mission/triage`
  - `/training` -> `/mission/checklist`
  - `/training/run` -> `/mission/checklist`
  - `/settings` -> `/mission/debrief`
- `/home/*` routes are retained as compatibility redirects only and are not product-facing navigation.

### Legacy surface behavior
- Mission surfaces are always enabled.
- `/home/*` route family redirects into mission routes to preserve old links without dual IA exposure.

### Data bridge
- Legacy training-module content remains bridged via `mapTrainingModulesToMissionEntities` in canonical hydration.
- No additional schema removals are applied in this step beyond verified dead route-alias branch cleanup.

## Deprecated features (effective now)
- Legacy alias resolution based on `missionDefaultRoutes` for workout-centric paths is removed.
- Home-target alias branching for `/schedules`, `/workouts`, `/training`, `/training/run`, `/settings` is deprecated and deleted.

## Long-term compatibility constraints

### Constraint 1: Alias stability
- Do not reuse retired alias paths for non-mission destinations.
- Alias targets must remain mission-route-only to preserve deep-link behavior consistency.

### Constraint 2: Fallback integrity
- Do not remove `/home/*` fallback surfaces until Step 10.3 rollback automation and post-rollback smoke are complete.
- Mission-route fallback mapping must remain documented and test-covered.

### Constraint 3: Telemetry schema safety
- Any new telemetry action or payload key introduced in route/IA flows requires baseline update and audit report refresh in the same change set.

### Constraint 4: Modularization guard
- Keep TS/TSX modules <= 500 LOC, and prefer compartmentalized files for route/flow/store logic.

## Verification evidence for Step 10.2
- Route tests: `npm test -- src/routes/__tests__/missionCutover.test.ts src/routes/__tests__/mixedModeJourneys.test.ts`
- Deep-link validation: `npm run check:deeplinks -- --base=http://127.0.0.1:4175`
- Build validation: `npm run build`
