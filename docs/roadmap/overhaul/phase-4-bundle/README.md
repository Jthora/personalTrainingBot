# Phase 4 — Bundle Optimisation

> Shrink the payload so operatives can deploy faster, especially on constrained networks.

## Current State

| Chunk | Size | Notes |
|-------|------|-------|
| `index` (entry) | **684 KB** | All eagerly-imported code |
| `vendor` | **342 KB** | gun.js (~200 KB), dayjs, katex JS, uuid |
| `react-vendor` | **214 KB** | React + ReactDOM (expected) |
| `qr-vendor` | **152 KB** | qrcode + jsqr (already lazy) |
| `scheduler` | 47 KB | Schedule components |
| Surface chunks (8) | 5–30 KB each | Already lazy-loaded per route ✓ |
| **Total JS** | **~1.6 MB** | |
| **Total CSS** | **~172 KB** | 29 KB is just katex fonts |
| **Total dist** | **8.1 MB** | Includes ~40 KaTeX font files + images |

## Target

| Metric | Before | Target | Savings |
|--------|--------|--------|---------|
| Entry chunk | 684 KB | ≤ 400 KB | -284 KB |
| Vendor chunk | 342 KB | ≤ 150 KB | -192 KB |
| Total JS | 1.6 MB | ≤ 1.0 MB | -600 KB |
| First meaningful paint | — | < 2s on 3G | — |

## Strategy

1. **Remove phantom dependency** — `html-to-image` (zero imports)
2. **Lazy-load Gun.js** behind `p2pIdentity` flag (biggest win)
3. **Lazy-load KaTeX** — only used by one component
4. **Split main `index` chunk** — extract more code into lazy chunks
5. **Clean up dead chunk groups** from vite.config.ts
6. **Audit remaining vendor contents**

## Files

| Document | Purpose |
|----------|---------|
| [current-analysis.md](current-analysis.md) | Full breakdown of what's in each chunk |
| [optimisation-targets.md](optimisation-targets.md) | Step-by-step actions with expected savings |

## Prerequisites

- Phase 2 (feature flags) complete — know which features ship to prod
- Tests from Phase 3 — safe to refactor with coverage

## Done Definition

- [ ] `html-to-image` removed from `package.json`
- [ ] Gun.js dynamically imported behind `p2pIdentity` flag
- [ ] KaTeX dynamically imported in ShareCard
- [ ] Entry chunk ≤ 400 KB
- [ ] Vendor chunk ≤ 150 KB
- [ ] Total JS ≤ 1.0 MB
- [ ] All tests pass
- [ ] Lighthouse performance score ≥ 90 on desktop
