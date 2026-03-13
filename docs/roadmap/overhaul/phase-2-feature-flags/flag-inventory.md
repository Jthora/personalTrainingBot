# Feature Flag Inventory

Every flag in `src/config/featureFlags.ts` with current state, code references, and verdict.

---

## Flags to Ship (Enable in Production)

### `archetypeSystem`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 5 (components, profile logic)
- **What it gates:** `ArchetypePicker` component, archetype-aware profile, archetype-weighted drill selection
- **Risk:** Low — component has tests, works in dev
- **Verdict: SHIP** — Archetypes are core to operative identity

### `celebrations`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 1 (`CelebrationLayer` conditional render)
- **What it gates:** Full-screen celebration overlay on level-ups and badge unlocks
- **Risk:** Low — purely visual, doesn't affect data flow
- **Verdict: SHIP** — Gamification is motivational backbone

### `statsSurface`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 2 (route gating, navigation)
- **What it gates:** `/mission/stats` surface with performance metrics, competency chart, drill history
- **Bundle impact:** 30KB lazy chunk (already code-split)
- **Risk:** Low — full page with tests
- **Verdict: SHIP** — Operatives need visibility into their progress

### `planSurface`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 2 (route gating, navigation)
- **What it gates:** `/mission/plan` surface for schedule building
- **Bundle impact:** 6.8KB lazy chunk
- **Risk:** Low — already code-split and lazy-loaded
- **Verdict: SHIP** — Schedule building is core mission planning

### `profileEditor`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 1 (component conditional render)
- **What it gates:** `ProfileEditor` component for callsign/archetype editing
- **Risk:** Low — component has tests
- **Verdict: SHIP** — Operative identity editing is fundamental

### `drillRunnerUpgrade`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 1 (DrillRunner variant)
- **What it gates:** Upgraded drill execution flow
- **Risk:** Medium — need to verify which DrillRunner variant prod currently uses
- **Verdict: SHIP** — but verify the upgrade actually improves the experience first

---

## Flags to Remove (Permanently On in All Environments)

### `missionDefaultRoutes`
- **Current:** on everywhere (dev=on, staging=on, prod=on)
- **Code refs:** Controls `getDefaultRootPath()` which sets `/mission/brief` as root
- **Action:** Remove flag. Inline `true` at usage sites. Delete dead `else` branches.

### `missionSurfaceBrief`
- **Current:** on everywhere
- **Action:** Remove flag. The Brief surface is always available.

### `missionSurfaceTriage`
- **Current:** on everywhere
- **Action:** Remove flag.

### `missionSurfaceCase`
- **Current:** on everywhere
- **Action:** Remove flag.

### `missionSurfaceSignal`
- **Current:** on everywhere
- **Action:** Remove flag.

### `missionSurfaceChecklist`
- **Current:** on everywhere
- **Action:** Remove flag.

### `missionSurfaceDebrief`
- **Current:** on everywhere
- **Action:** Remove flag.

### `generatorSwap`
- **Current:** on everywhere (dev=on, staging=on, prod=on)
- **Code refs:** 2 (schedule generation variant)
- **Action:** Remove flag. Inline `true` at usage. Delete old generator code path.

---

## Flags to Promote to Staging

### `p2pIdentity`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 2 (App.tsx Gun.js init, StatsSurface SovereigntyPanel)
- **What it gates:** Gun.js identity generation, profile bridge, store syncs, SovereigntyPanel display
- **Risk:** HIGH — Gun.js peer connections, SEA keypair generation, sync reliability at scale
- **Verdict: PROMOTE TO STAGING** — soak for 1-2 weeks, monitor for errors, then ship to prod
- **Dependency:** Phase 5 (ecosystem wiring) cannot complete until this ships to prod

### `loadingCacheV2`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 5 (IndexedDB cache wrappers for handler data, module data, etc.)
- **What it gates:** IndexedDB-based caching layer (`withCache()` function) that caches training data between sessions
- **Risk:** Medium — IndexedDB can behave differently across browsers, storage quotas vary
- **Verdict: PROMOTE TO STAGING** — soak test, verify cache hit/miss rates, then ship

---

## Flags to Hold

### `ipfsContent`
- **Current:** dev=on, staging=on, prod=**off**
- **Code refs:** 2 (IPFS fetcher integration)
- **What it gates:** Fetching training content from IPFS instead of static hosting
- **Why hold:** IPFS infrastructure not yet reliable enough for production. Depends on external pinning service.
- **Verdict: HOLD** — revisit when IPFS pinning is stable

---

## Flags to Kill (Delete Entirely)

### `calendarSurface`
- **Current:** dev=on, staging=on, prod=off
- **Code refs:** **0** (zero code references outside featureFlags.ts)
- **Status:** Dead flag. Whatever it was supposed to gate was never implemented or was removed.
- **Verdict: KILL** — Remove from `FeatureFlagKey` type, all env configs, and `DEFAULT_FLAGS`

### `migrationBridge`
- **Current:** dev=on, staging=off, prod=off
- **Code refs:** 3 (migration logic from old data format)
- **Status:** Migration is complete — all operatives have been migrated.
- **Verdict: KILL** — Remove flag AND the migration code behind it. Data format is stable.
- **Pre-check:** Verify no operatives still have pre-migration localStorage data. If uncertain, keep for one more release.

### `canonicalReadPath`
- **Current:** dev=off, staging=off, prod=off
- **Code refs:** 1
- **Status:** Off everywhere including dev. Dead experiment.
- **Verdict: KILL** — Remove flag and gated code path.

---

## Post-Graduation Flag Set (Target: 9 flags)

```typescript
export type FeatureFlagKey =
  | 'performanceInstrumentation'   // Debug tooling, dev/staging only
  | 'loadingCacheV2'               // IndexedDB caching, graduating to prod
  | 'archetypeSystem'              // Newly shipped
  | 'statsSurface'                 // Newly shipped
  | 'profileEditor'                // Newly shipped
  | 'drillRunnerUpgrade'           // Newly shipped
  | 'celebrations'                 // Newly shipped
  | 'planSurface'                  // Newly shipped
  | 'p2pIdentity'                  // Staging, graduating to prod
  | 'ipfsContent'                  // On hold
;

type GlobalFlagKey = 'globalKillSwitch';
```

After `loadingCacheV2` and `p2pIdentity` ship to prod and stabilise, they can be removed too, bringing the count to 7.
