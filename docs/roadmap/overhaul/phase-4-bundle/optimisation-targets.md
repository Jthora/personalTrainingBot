# Optimisation Targets

Step-by-step actions ranked by impact. Each includes the change, expected savings, and verification.

---

## Step 1 — Remove `html-to-image` (5 min, ~0 KB JS but cleans dependency tree)

**Why:** Declared in `package.json` but zero imports in `src/`. Dead weight in `node_modules` and lockfile.

**Action:**
```bash
npm uninstall html-to-image
```

**Verify:**
```bash
grep -r "html-to-image" src/     # Should return 0 results (already does)
npx vite build                    # Build succeeds
```

**Savings:** 0 KB bundled (it wasn't being bundled), but cleaner dependency manifest.

---

## Step 2 — Lazy-load Gun.js behind `p2pIdentity` flag (~200 KB saved)

**Why:** Gun.js is ~200 KB in the vendor chunk. The `p2pIdentity` flag is OFF in production. Zero production users execute Gun code, but all download it.

**What changes:**

### 2a. Create `src/services/gunLoader.ts` — async Gun bootstrapper

```typescript
// src/services/gunLoader.ts
let gunModulePromise: Promise<typeof import('./gunDb')> | null = null;

export function loadGunServices() {
  if (!gunModulePromise) {
    gunModulePromise = import('./gunDb');
  }
  return gunModulePromise;
}
```

### 2b. Update `src/App.tsx` — conditional dynamic import

```typescript
// Before:
import { startGunProfileBridge } from './services/gunProfileBridge';
import { startStoreSyncs } from './services/gunStoreSyncs';
import { GunIdentityService } from './services/gunIdentity';

// After:
if (isEnabled('p2pIdentity')) {
  const { loadGunServices } = await import('./services/gunLoader');
  const gun = await loadGunServices();
  // ... init
}
```

### 2c. Update `src/components/SovereigntyPanel/SovereigntyPanel.tsx`

Already has `React.lazy` for QR components. Add similar lazy guard for Gun imports:

```typescript
// Move all gun imports behind the flag check
const gunServices = isEnabled('p2pIdentity')
  ? await import('../../services/gunLoader').then(m => m.loadGunServices())
  : null;
```

### 2d. Update vite.config.ts — add `gun` chunk group

```typescript
// In manualChunks:
if (id.includes('node_modules/gun')) return 'gun-vendor';
```

This isolates Gun into its own chunk that's only fetched when dynamically imported.

**Files to edit:**
- `src/services/gunLoader.ts` (new)
- `src/App.tsx`
- `src/components/SovereigntyPanel/SovereigntyPanel.tsx`
- `vite.config.ts` (add gun-vendor chunk)
- Any other file that eagerly imports from `src/services/gun*.ts`

**Verify:**
```bash
npx vite build
ls -lh dist/assets/gun-vendor-*.js    # Should exist as separate chunk
ls -lh dist/assets/vendor-*.js        # Should be ~150 KB smaller
npx vitest run                         # All tests pass
# Manual: load app with p2pIdentity OFF → gun-vendor chunk NOT requested
# Manual: load app with p2pIdentity ON → gun-vendor chunk IS requested
```

**Expected savings:** ~200 KB removed from critical path vendor chunk.

---

## Step 3 — Lazy-load KaTeX in ShareCard (~80 KB JS, 29 KB CSS)

**Why:** KaTeX is 80 KB JS + 29 KB CSS + ~40 font files. Only used by `ShareCard.tsx` (1 file). Currently eagerly bundled into vendor.

**What changes:**

### 3a. Dynamic import in ShareCard

```typescript
// Before:
import katex from 'katex';
import 'katex/dist/katex.min.css';

// After:
const renderMath = async (expression: string): Promise<string> => {
  const { default: katex } = await import('katex');
  return katex.renderToString(expression, { throwOnError: false });
};
```

### 3b. Load CSS conditionally

```typescript
// In ShareCard, load CSS on first render:
useEffect(() => {
  import('katex/dist/katex.min.css');
}, []);
```

### 3c. Update vite.config.ts — add katex chunk

```typescript
if (id.includes('node_modules/katex')) return 'katex-vendor';
```

**Verify:**
```bash
npx vite build
ls -lh dist/assets/katex-vendor-*.js  # Separate chunk
# Manual: load app → katex chunk NOT requested until ShareCard renders
```

**Expected savings:** ~80 KB JS + 29 KB CSS removed from critical path.

---

## Step 4 — Update dead chunk groups in vite.config.ts

**Why:** After Phase 0 renames, the `coaches` and `workouts` patterns no longer match. `sounds` never matched. These are dead config.

**Action:**

```typescript
// Remove dead groups:
// { name: 'coaches', patterns: [...] }   — DELETE
// { name: 'workouts', patterns: [...] }  — DELETE
// { name: 'sounds', patterns: [...] }    — DELETE

// Add replacement groups after Phase 0 renames:
{ name: 'handlers', patterns: [/\/src\/components\/Handler/i, /\/src\/data\/handlers/i] },
{ name: 'drills', patterns: [/\/src\/components\/(Drill|Training)/i] },
```

**Verify:**
```bash
npx vite build   # No warnings about chunk matching
```

---

## Step 5 — Audit and split entry chunk further (~100-150 KB further savings)

**Why:** The 684 KB entry chunk contains stores, services, and utilities that aren't needed at first paint.

### 5a. Defer non-critical stores

Stores that are only used by specific surfaces could be dynamically imported:

| Store | Used by | Candidate for lazy? |
|-------|---------|:--:|
| SignalsStore | SignalSurface only | ✅ Already lazy (separate chunk) |
| ArtifactActionStore | CaseSurface only | ✅ Already lazy |
| TriageActionStore | TriageSurface only | ✅ Already lazy |
| MissionKitStore | ChecklistSurface only | ✅ Already lazy |
| challenges.ts | ChallengePanel only | ✅ Can lazy-load |
| DrillFilterStore | PlanSurface only | ✅ Can lazy-load |
| DifficultySettingsStore | DrillRunner only | ✅ Can lazy-load |

These are already separate chunks in the build output — good sign that Vite's tree-shaking put them there. If any are still in the entry chunk, add explicit `import()` at usage sites.

### 5b. Lazy-load heavy utilities

| Utility | Lines | Used by | Action |
|---------|-------|---------|--------|
| `taskScheduler.ts` | 233 | Background tasks (non-critical path) | Dynamic import on first task registration |
| `MissionScheduleCreator.ts` | ~200 | PlanSurface | Dynamic import in PlanSurface |
| `DrillDataLoader.ts` | 225 | Data fetching (deferred) | Already handles async fetch — ensure not eagerly imported |
| `missionRenderProfile.ts` | 93 | Dev tooling only | Guard behind `performanceInstrumentation` flag |

### 5c. Consider route-level shell splitting

`MissionShell.tsx` (609 lines) is always in the entry chunk because it wraps all mission routes. It could itself be lazy-loaded:

```typescript
// In Routes.tsx, instead of:
import MissionShell from '../pages/MissionFlow/MissionShell';

// Use:
const MissionShell = React.lazy(() => import('../pages/MissionFlow/MissionShell'));
```

This would defer loading until the first mission route is hit.

**Expected savings from Step 5:** ~100-150 KB from entry chunk.

---

## Step 6 — Image optimisation (non-JS, but large impact on total dist)

| Image | Current | Action |
|-------|---------|--------|
| Coach PNGs (4 × 295 KB–1.4 MB) | Uncompressed PNG | Convert to WebP (~70% smaller) with PNG fallback |
| WingCommanderLogo.gif (299 KB) | GIF | Convert to WebP or AVIF |
| KaTeX fonts (~40 files, ~1 MB) | All formats | After Step 3, only loaded when needed |

**Action:** Use `squoosh-cli` or `sharp` to batch-convert:
```bash
npx @aspect-build/rules_js squoosh --webp -d dist/assets/ src/assets/*.png
```

Or add a Vite plugin like `vite-plugin-image-optimizer`.

---

## Summary — Expected Cumulative Savings

| Step | Action | JS Saved | CSS Saved |
|------|--------|----------|-----------|
| 1 | Remove html-to-image | 0 KB | 0 KB |
| 2 | Lazy-load Gun.js | **~200 KB** | 0 KB |
| 3 | Lazy-load KaTeX | **~80 KB** | **~29 KB** |
| 4 | Clean chunk groups | 0 KB | 0 KB |
| 5 | Split entry chunk | **~100-150 KB** | 0 KB |
| 6 | Image optimisation | 0 KB | 0 KB |
| **Total** | | **~380-430 KB** | **~29 KB** |

Critical path JS reduction: **1.6 MB → ~1.0 MB** (37% reduction)

Entry chunk: **684 KB → ~400 KB**

Vendor chunk: **342 KB → ~60 KB** (after Gun and KaTeX extraction)

---

## Verification Gate (Phase 4 Complete)

- [ ] `html-to-image` not in `package.json`
- [ ] `npx vite build` produces:
  - Entry chunk ≤ 400 KB
  - Vendor chunk ≤ 150 KB (ideally ≤ 80 KB)
  - Separate `gun-vendor` chunk (only loaded when p2pIdentity on)
  - Separate `katex-vendor` chunk (only loaded by ShareCard)
- [ ] `npx vitest run` passes
- [ ] Lighthouse desktop ≥ 90 performance
- [ ] No dead chunk groups remain in vite.config.ts
- [ ] Service worker precache list still works (check `public/sw.js`)
- [ ] Update [docs/overhaul/README.md](../README.md) Phase 4 status to ✅
