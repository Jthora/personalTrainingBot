# Caching Strategy

## Precache
- Shell, fonts, core JS/CSS, manifest, minimal kits/drills JSON.

## Runtime
- Kits/drills JSON: stale-while-revalidate.
- Images/media: low-data variants; cap size; cache-first with versioning.
- API GET: network-first with fallback to cache when safe.

## Eviction
- LRU or version bump for old packs; quota management.

## Acceptance
- Documented per-route/data cache policy; tested in offline matrix.
