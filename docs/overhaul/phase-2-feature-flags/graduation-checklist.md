# Feature Flag Graduation Checklist

Step-by-step execution guide for graduating, removing, and killing flags.

---

## Pre-flight

- [ ] All Phase 0 (terminology) renames are merged and green
- [ ] Read the full [flag-inventory.md](flag-inventory.md) — know the verdict for every flag
- [ ] Create a branch: `phase-2/feature-flag-graduation`

---

## Step 1 — Kill Dead Flags

These flags have zero or dead code paths. Remove them completely.

### 1a. Kill `calendarSurface`

```
Files to edit:
  src/config/featureFlags.ts
    - Remove from FeatureFlagKey type
    - Remove from DEFAULT_FLAGS object
    - Remove from ENV_DEFAULT_FLAGS.development
    - Remove from ENV_DEFAULT_FLAGS.staging
    - Remove from ENV_DEFAULT_FLAGS.production
```

**Verify:** `grep -r "calendarSurface" src/` returns 0 results outside featureFlags.ts.

### 1b. Kill `canonicalReadPath`

```
Files to edit:
  src/config/featureFlags.ts  — Remove from type + all config objects
  1 consumer file (find with: grep -r "canonicalReadPath" src/)
    — Delete the flag check and its gated code. Keep the else-branch code (the default path).
```

### 1c. Kill `migrationBridge`

```
Files to edit:
  src/config/featureFlags.ts  — Remove from type + all config objects
  3 consumer files (find with: grep -r "migrationBridge" src/)
    — Delete the flag checks AND the migration code behind them.
    — The migration is complete; the migrated data format is the only format now.
```

**⚠️ Pre-check:** Before deleting migration code, confirm no localStorage keys still contain pre-migration format:
```typescript
// Run in browser console on prod:
Object.keys(localStorage).filter(k => k.startsWith('trainingData:')).forEach(k => {
  const v = JSON.parse(localStorage.getItem(k)!);
  if (v.version === undefined || v.version < 2) console.warn('PRE-MIGRATION:', k);
});
```

### After Step 1:
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes
- [ ] Commit: `chore(flags): kill dead flags — calendarSurface, canonicalReadPath, migrationBridge`

---

## Step 2 — Remove Permanently-On Flags

These flags are `true` in all environments. Inline `true` and delete dead `else` branches.

### Process for each flag:

1. `grep -rn "FLAG_NAME" src/` — find every usage
2. At each usage site:
   - Replace `if (isEnabled('FLAG_NAME'))` check with just the truthy path
   - Delete the `else` branch / fallback code
3. Remove from `featureFlags.ts` (type + all config objects)

### 2a. Remove `missionDefaultRoutes`

Consumer: `getDefaultRootPath()` in routing logic. Remove the flag check; `/mission/brief` is always the root.

### 2b–2g. Remove mission surface flags

Remove each in one pass:
- `missionSurfaceBrief`
- `missionSurfaceTriage`
- `missionSurfaceCase`
- `missionSurfaceSignal`
- `missionSurfaceChecklist`
- `missionSurfaceDebrief`

For each: find the route gating or component render guard, remove the flag check, keep the component always rendered.

### 2h. Remove `generatorSwap`

Consumer: schedule generation. Remove the flag check and delete the old generator code path.

### After Step 2:
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes
- [ ] Commit: `chore(flags): remove permanently-on flags — 8 flags inlined`
- [ ] Verify: `FeatureFlagKey` type now has 13 fewer keys (3 killed + 8 removed + 2 pending = -11 at this step, but 2 pending happen in Step 3)

---

## Step 3 — Ship Flags to Production

These flags work in dev/staging and need to be enabled in production.

### 3a. Enable in `ENV_DEFAULT_FLAGS.production`:

```typescript
// src/config/featureFlags.ts
production: {
  archetypeSystem: true,     // was false
  celebrations: true,         // was false
  statsSurface: true,         // was false
  planSurface: true,          // was false
  profileEditor: true,        // was false
  drillRunnerUpgrade: true,   // was false
}
```

### 3b. Pre-ship verification per flag:

| Flag | Manual test |
|------|------------|
| `archetypeSystem` | Open profile → archetype picker renders → select archetype → persists |
| `celebrations` | Complete a drill → level up event → celebration overlay appears |
| `statsSurface` | Navigate to `/mission/stats` → charts render, data populates |
| `planSurface` | Navigate to `/mission/plan` → schedule builder renders |
| `profileEditor` | Open profile → edit callsign → saves correctly |
| `drillRunnerUpgrade` | Start a drill run → upgraded flow renders → completes successfully |

### After Step 3:
- [ ] Deploy to staging with all 6 flags on
- [ ] Manual smoke test every flag (checklist above)
- [ ] Deploy to production
- [ ] Monitor error rates for 24-48 hours
- [ ] Commit config change: `feat(flags): ship 6 features to production`

---

## Step 4 — Promote Staging Flags

### 4a. `loadingCacheV2`

1. Verify it's on in staging (already should be)
2. Monitor IndexedDB cache hit rates in staging for 1 week
3. If stable: set `production: { loadingCacheV2: true }`
4. Monitor prod for 2 weeks (watch for quota errors, stale cache bugs)
5. If stable: remove the flag — inline the V2 code, delete V1 fallback

### 4b. `p2pIdentity`

1. Verify GunDB relay/peer connections work in staging
2. Load test: 50+ concurrent connections to relay
3. Verify keypair generation, storage, and recovery flow
4. If stable after 2-week soak: set `production: { p2pIdentity: true }`
5. **Do NOT remove the flag yet** — this is Phase 5 territory (ecosystem wiring)

---

## Step 5 — Clean Up After Shipping

Once shipped flags have been stable in production for 2+ weeks:

### For each shipped flag (`archetypeSystem`, `celebrations`, etc.):
1. `grep -rn "FLAG_NAME" src/`
2. Remove all `isEnabled('FLAG_NAME')` checks — inline the truthy code
3. Delete the fallback / else branches
4. Remove from `FeatureFlagKey` type and all env configs
5. Run `tsc && vitest`

### After Step 5:
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes
- [ ] Commit: `chore(flags): clean up shipped flags — remove runtime checks`

---

## Verification Gate (Phase 2 Complete)

- [ ] `FeatureFlagKey` type has ≤ 9 members
- [ ] Zero flags are `true` in all 3 environments (no more permanently-on flags)
- [ ] Zero dead flags remain
- [ ] `grep -c "isEnabled" src/**/*.ts{,x}` returns a lower count than before
- [ ] All tests pass
- [ ] Production has been stable for 48+ hours with newly shipped features
- [ ] Update [docs/overhaul/README.md](../README.md) Phase 2 status to ✅
