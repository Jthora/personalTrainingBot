# Feature Flag Removal Plan

> Remove `shellV2` and clean up associated dead code.

---

## Current State

### `shellV2` Flag

- **Defined**: `src/config/featureFlags.ts` L5
- **Default**: `false` (L21)
- **Environment overrides**: `true` in development, staging, AND production (L32, L40, L47)
- **Effective value**: Always `true` — the flag is dead

### Consumers

| File | Line | Usage | What to do |
|------|------|-------|-----------|
| `src/routes/Routes.tsx` | L49 | `const shellV2 = isFeatureEnabled('shellV2')` | Remove conditional; inline v2 path |
| `src/utils/resolveShellRoute.ts` | L27 | Branches on `shellV2` to determine route prefix | Remove v1 branch |
| `src/pages/MissionFlow/TrainingSurface.tsx` | L26 | Uses `shellV2` for navigation target | Remove v1 branch |

### Dead Code in `missionCutover.ts`

| Export | Status | Callers |
|--------|--------|---------|
| `isMissionRouteEnabled()` | Dead | Always returns `true` — zero meaningful callers |
| `toHomeFallbackPath()` | Dead | Zero callers in codebase |
| `missionHomeFallbacks` | Dead | Zero references outside own file |
| `getDefaultRootPath()` | Used in Routes.tsx | Returns `/train` (when shellV2 true) or v1 fallback |

---

## Removal Steps

### 1. Remove `shellV2` from `featureFlags.ts`

```diff
- type FeatureFlagKey = 'performanceInstrumentation' | 'loadingCacheV2' | 'p2pIdentity' | 'ipfsContent' | 'shellV2';
+ type FeatureFlagKey = 'performanceInstrumentation' | 'loadingCacheV2' | 'p2pIdentity' | 'ipfsContent';
```

Remove from `DEFAULT_FLAGS`, all `ENV_DEFAULT_FLAGS` entries.

### 2. Simplify `Routes.tsx`

```diff
- const shellV2 = isFeatureEnabled('shellV2');
- const defaultRoot = shellV2 ? '/train' : getDefaultRootPath();
+ const defaultRoot = '/train';

  // Remove conditional v2 route block — it's the only route block now
```

### 3. Simplify `resolveShellRoute.ts`

Remove the `isFeatureEnabled('shellV2')` branch. Only the v2 resolution path remains.

### 4. Simplify `TrainingSurface.tsx`

Remove the `isFeatureEnabled('shellV2')` check. Only the v2 navigation target remains.

### 5. Delete `missionCutover.ts`

The file contains only dead exports. Delete the entire file.

Update any remaining imports (there may be a `getDefaultRootPath` import in Routes.tsx — replace with inline `'/train'`).

---

## Legacy Redirect Routes to Remove

These redirects in Routes.tsx are from the v1 → v2 migration and are no longer needed once the shell is unified:

| Redirect From | Redirect To | Status |
|--------------|-------------|--------|
| `/mission/brief` | — | Now a real route (keep) |
| `/workout` | `/train` | Can remove after 6 months |
| `/workouts` | `/train` | Can remove after 6 months |
| `/quiz` | `/train/quiz` | Can remove after 6 months |
| `/stats` | `/progress` | Can remove after 6 months |
| `/modules` | `/train` | Can remove after 6 months |
| `/settings` | `/profile` | Can remove after 6 months |
| `/profile-old` | `/profile` | Remove immediately (no external links) |
| `/daily` | `/train` | Can remove after 6 months |
| `/plan` | `/mission/plan` | Can remove after 6 months |
| `/training` | `/mission/training` | Can remove after 6 months |

**Recommendation**: Keep external-facing redirects for 6 months post-deploy (SEO/bookmarks). Remove internal-only redirects immediately.
