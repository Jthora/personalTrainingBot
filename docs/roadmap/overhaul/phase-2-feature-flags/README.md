# Phase 2 — Feature Flag Graduation

## Objective

Move features from behind disabled-in-production flags to being permanently available. Remove dead flags. Clean up the flag system so every remaining flag has a clear purpose.

## Why This Matters

10 features are written, tested in development, but invisible to operatives in production. Every flag adds cognitive overhead (is this feature on? in which environment?). Dead flags accumulate noise. Permanent-on flags that gate nothing are technical debt.

The Earth Alliance mission demands that operatives have access to the full training experience — archetypes, celebrations, stats, sovereignty. Keeping these flagged off contradicts the WHY.

## Prerequisites

- Phase 0 complete (clean terminology)
- Recommended: Phase 3 in progress (test coverage provides safety net for shipping flags)

## Detailed Flag Analysis

See [flag-inventory.md](flag-inventory.md) for every flag with verdict and rationale.

See [graduation-checklist.md](graduation-checklist.md) for step-by-step execution.

## Summary of Actions

| Action | Flags | Count |
|--------|-------|-------|
| **Ship (enable in prod)** | `archetypeSystem`, `celebrations`, `statsSurface`, `planSurface`, `profileEditor`, `drillRunnerUpgrade` | 6 |
| **Remove (permanently on)** | `missionDefaultRoutes`, `missionSurfaceBrief`, `missionSurfaceTriage`, `missionSurfaceCase`, `missionSurfaceSignal`, `missionSurfaceChecklist`, `missionSurfaceDebrief`, `generatorSwap` | 8 |
| **Promote to staging** | `p2pIdentity`, `loadingCacheV2` | 2 |
| **Hold** | `ipfsContent` | 1 |
| **Kill (delete)** | `calendarSurface`, `migrationBridge`, `canonicalReadPath` | 3 |

**Net result:** 22 flags → 9 flags

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Shipped feature has bugs in prod | Phase 3 test coverage. All features work in dev/staging. `globalKillSwitch` exists as emergency off switch. |
| Removing permanent flags breaks code | Each removal is a simple `isFeatureEnabled('x')` → `true` substitution, then dead-code elimination. TypeScript catches any missed references. |
| IndexedDB cache key issue from `loadingCacheV2` | Promote to staging first, soak for 1 week, then ship to prod |

## Done Definition

- `FeatureFlagKey` type has ≤ 9 members
- `src/config/featureFlags.ts` default + env configs have no permanently-on values in all environments
- All `isFeatureEnabled('removedFlag')` calls are replaced with `true` or removed
- `npx tsc --noEmit` and `npm test` green
- Production deploy shows: archetypes, celebrations, stats, plan, profile editor accessible
