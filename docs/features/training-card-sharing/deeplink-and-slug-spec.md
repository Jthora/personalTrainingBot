# Deep Link & Slug Spec

## URL Patterns
- Canonical: `/c/:slug` → resolves to a card view.
- Optional fragment: `#v=1` reserved for future state.

## Slug Strategy
- Deterministic: hash(cardId) → Base58 (8–10 chars).
- Collision: check at build/runtime; fallback to longer slug.

## Hydration Flow
- On route: ensure data loaded; lookup by cardId via index.
- Not found: graceful error; suggest browsing.

## Hosting Notes
- IPFS/Vercel friendly: use DNSLink and relative assets.

## Acceptance
- URL short enough for X and works across environments.
