# Current Bundle Analysis

Detailed breakdown of what's in each chunk and why.

---

## Entry Chunk — `index-*.js` (684 KB)

The entry chunk contains everything that is eagerly imported at app startup:

### What's in it

| Category | Est. Size | Files |
|----------|----------|-------|
| App shell (App.tsx, routing, layout) | ~40 KB | App.tsx, Routes.tsx, MissionShell.tsx (609 lines) |
| All stores (16 stores) | ~80 KB | src/store/*.ts — all eagerly imported |
| All non-lazy components (~30) | ~120 KB | Header, DrillRunner, etc. |
| Services (Gun init, telemetry) | ~50 KB | src/services/*.ts (8 files, 1,156 lines) |
| Utilities (loaders, caching, schedulers) | ~100 KB | src/utils/*.ts (~2,163 lines of source) |
| Context providers | ~30 KB | MissionScheduleContext, HandlerSelectionContext, SettingsContext |
| Cache layer | ~40 KB | src/cache/*.ts |
| Domain logic | ~30 KB | src/domain/mission/*.ts |
| Config, hooks, data | ~50 KB | Feature flags, hooks, badge catalog, archetypes |
| Vite/React runtime glue | ~30 KB | Module system, HMR remnants |
| **Total** | **~570 KB** | (+ overhead from minification/Rollup wrappers → 684 KB) |

### Key insight

The entry chunk is large because **almost nothing beyond route surfaces is dynamically imported**. All stores, all services, all utilities, and most components are eagerly loaded on first paint.

---

## Vendor Chunk — `vendor-*.js` (342 KB)

All `node_modules` packages except React and QR libraries.

| Package | Est. Size | Used By |
|---------|----------|---------|
| `gun` (gun.js + sea.js) | **~200 KB** | 10 files, but only active when p2pIdentity flag is on |
| `katex` | **~80 KB** | 1 file (ShareCard.tsx) |
| `dayjs` | ~12 KB | 4 files (challenges, readiness logic) |
| `uuid` | ~5 KB | Spread across stores |
| Other (Rollup helpers, etc.) | ~45 KB | — |

### Key insight

**Gun.js is ~58% of the vendor chunk but feature-flagged OFF in production.** Every production user downloads 200 KB of Gun code they never execute.

---

## React Vendor — `react-vendor-*.js` (214 KB)

React + ReactDOM. This is the expected size for React 19 in production mode. **No action needed.**

---

## QR Vendor — `qr-vendor-*.js` (152 KB)

`qrcode` + `jsqr` — bundled together.

- Already lazy-loaded ✓ (only loaded when SovereigntyPanel renders QR UI)
- Both packages are only imported by one component each (QRCodeDisplay, QRCodeScanner)
- These components are `React.lazy()` in SovereigntyPanel

**No action needed** — already optimally lazy.

---

## CSS Analysis (172 KB total)

| File | Size | Source |
|------|------|--------|
| `index-*.css` | 39 KB | App styles |
| `vendor-*.css` | **29 KB** | `katex/dist/katex.min.css` |
| Surface CSS (12 files) | 5–20 KB each | Per-route lazy CSS ✓ |

### KaTeX CSS + Fonts

KaTeX contributes:
- 29 KB CSS (katex.min.css)
- **~40 font files** in dist/assets/ (4.9 KB – 63 KB each)

These font files are only needed by ShareCard (one component) but are emitted into the build unconditionally. Browsers only download fonts when they're referenced in rendered CSS, so the font file weight is not as bad as it looks — but the CSS file loads on every page.

---

## Static Assets

| Category | Size | Count | Notes |
|----------|------|-------|-------|
| Coach images (PNG) | 1.4 MB largest | 4 | Large PNG images for handler personas |
| Logo GIF | 299 KB | 1 | WingCommanderLogo.gif |
| KaTeX fonts | ~1 MB total | ~40 | .ttf, .woff, .woff2 |
| App font (Aldrich) | 53 KB | 1 | Main typeface |

### Training data shards

`public/training_modules_shards/` — 2.1 MB across 19 shard files.

| Shard | Size |
|-------|------|
| counter_psyops.json | 432 KB |
| self_sovereignty.json | 299 KB |
| equations.json | 274 KB |
| anti_tcs_idc_cbc.json | 244 KB |
| anti_psn.json | 213 KB |
| Top 5 total | 1,462 KB |
| All 19 shards | 2,100 KB |

Only `fitness.json` (48 KB) is precached by the service worker. All other shards are cache-first on demand. This is a good strategy — operatives only download the modules they need.

---

## Dynamic Import Map

Currently lazy-loaded:

| Component | Trigger | Chunk |
|-----------|---------|-------|
| BriefSurface | Route: `/mission/brief` | 5.9 KB |
| TriageSurface | Route: `/mission/triage` | 9.1 KB |
| CaseSurface | Route: `/mission/case` | 7.6 KB |
| SignalSurface | Route: `/mission/signal` | 5.5 KB |
| ChecklistSurface | Route: `/mission/checklist` | 9.5 KB |
| DebriefSurface | Route: `/mission/debrief` | 14 KB |
| StatsSurface | Route: `/mission/stats` | 30 KB |
| PlanSurface | Route: `/mission/plan` | 6.8 KB |
| CardSharePage | Route: `/share/:slug` | — |
| QRCodeDisplay | SovereigntyPanel interaction | 745 B |
| QRCodeScanner | SovereigntyPanel interaction | 1.9 KB |
| drills.json | phaseTasks.ts | 550 B |

**Not lazy-loaded (but should be):**
- Gun.js services (10 files, ~50 KB source → ~200 KB bundled via vendor)
- KaTeX (1 file usage, ~80 KB in vendor + 29 KB CSS)
- MissionShell (609 lines, always loaded even on non-mission routes)
- All stores (could defer non-critical stores)

---

## Phantom Dependencies

| Package | In package.json | Imports in src/ | Verdict |
|---------|:-:|:-:|---------|
| `html-to-image` | ✅ | **0** | **Remove** — never imported anywhere |

---

## Dead Chunk Groups in vite.config.ts

| Group | Pattern | Matching output chunks | Status |
|-------|---------|----------------------|--------|
| `coaches` | `/Coach/i`, `/coaches/i`, `/coachModuleMapping/i` | 0 in dist | **Dead** — paths renamed to Handler |
| `workouts` | `/(Workout\|Training)/i` | 0 in dist | **Dead** — paths renamed to Drill, or absorbed into index |
| `sounds` | `/sounds/i` | 0 in dist | **Dead** — no .js chunk for sound assets |
| `scheduler` | `/(Schedule\|Scheduler\|Calendar)/i` | 47 KB chunk | Active ✓ |
| `share` | `/(Share\|CardTable)/i`, `/CardSharePage/i` | 14 KB chunk | Active ✓ |

After Phase 0 terminology renames, `coaches` and `workouts` chunk groups will definitely be dead and must be updated.
