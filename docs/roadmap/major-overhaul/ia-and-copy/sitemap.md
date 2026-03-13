# Sitemap

## Primary Routes
- Home: readiness + next actions.
- Mission Kit: list/browse kits; deep-linkable.
- Drills: list and detail; run mode.
- Training/Execute: run context (alias of drills execute).
- Signals: coordination items.
- Ops/Settings: low-data, mute, privacy note.
- c/:slug, share/:slug: existing share/deep-link routes.

## Deep-link Expectations
- All primary routes reachable via SPA rewrites; ensure offline cached variants when available.
- Document required data dependencies per route for offline fallback.

## Navigation Model
- Tabs: Home, Mission Kit, Drills, Readiness (optional dedicated view), Signals, Ops.
- Secondary links: Share links, specific drill links, AAR exports.
