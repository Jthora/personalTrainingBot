# Payload Optimization Plan

1. Goals
- Reduce size of largest JSON/assets impacting cold start.
- Deduplicate shared data and avoid repeated fields.
- Ensure compression (gzip/brotli) and caching headers are effective.
- Provide manifest-based loading to avoid eager full-body loads.

2. Inventory (assumed top offenders)
- `training_modules.json` (large content per module)
- `training_coach_data/*.json` (per-coach modules/decks)
- Workout cards/details JSON
- Assets: avatars, sounds

3. Measurement Actions
- Record compressed/uncompressed sizes for top 10 JSON assets.
- Identify duplicated fields across modules/workouts.
- Use `rollup-plugin-visualizer` or similar to view asset contribution.

4. Dedupe/Normalize Strategies
- Move repeated strings (coach names, tags) to lookup tables.
- Use shared `exercise` definitions referenced by ID in workouts.
- Store per-coach deck manifest listing IDs; load details on demand.
- Normalize module metadata (id, name, difficulty, tags, updatedAt) separate from content.

5. Splitting Strategies
- Split `training_modules.json` into manifest + shards:
  - Manifest: id, name, version, size, hash, difficulty, tags.
  - Shards: per-module content loaded lazily.
- For workouts: list endpoint with minimal fields; fetch details by ID when needed.
- For sounds: keep metadata small; lazy load audio files per need.

6. Optional Fields to Trim
- Remove verbose descriptions from initial payload; fetch details when opening detail panel.
- Drop debug fields from production bundles.
- Limit history arrays length in initial load; fetch history on demand.

7. Compression Expectations
- Enable gzip and brotli at CDN/host.
- Target compressed sizes: manifest <50KB, per-module shard <80KB compressed, workout detail <30KB.
- Verify `content-encoding` headers served correctly.

8. Header Checklist
- `Cache-Control` for static JSON: `public, max-age=86400, immutable` where versioned.
- `ETag`/`Last-Modified` for validation.
- `Content-Type: application/json; charset=utf-8`.
- `Content-Encoding: br` (or gzip fallback).

9. Manifest/Index Approach
- Create `modules-manifest.json` listing module IDs, versions, hashes, sizes.
- App uses manifest to decide which shards to fetch.
- Support `If-None-Match` with ETag to avoid re-downloading unchanged shards.

10. Request Budget Targets
- Critical JSON total compressed <=300KB on cold path.
- Number of critical JSON requests <=4.
- Non-critical payloads deferred to enrichment/idle.

11. Testing/Verification
- Build step to emit asset size report; fail CI if budgets exceeded.
- Runtime check: log size of fetched payloads for top datasets.
- Spot-check compression headers in dev/prod.

12. UX Considerations
- When detail content fetched on demand, show quick skeleton/placeholder text.
- Avoid user-visible delay when opening details by prefetching likely items on hover/intent.

13. Migration Notes
- If splitting files, provide backward compatibility or versioned paths to avoid cache confusion.
- Update cache key scheme to include shard version.

14. Risks
- Increased request count if shards too granular; balance size vs overhead.
- Cache fragmentation leading to misses; mitigate with manifest + prefetch for near-term items.

15. Action Items
- Measure current asset sizes.
- Draft manifest/shard schema for modules and workouts.
- Update fetchers to use manifest + lazy shard loading.
- Add size budget checks in CI.

16. Example Manifest Entry
- `{ "id": "module-123", "version": "2024-12-01", "hash": "abc123", "size": 42000, "difficulty": "med", "tags": ["strength"] }`

17. Expected Outcomes
- Smaller critical payload -> faster FCP/TTI.
- Warm cache with validated shards -> faster warm start with consistency.
- Better control over regressions via CI size budgets.

18. Compression Validation Steps
- Use `curl -I` to confirm `content-encoding` headers for top assets.
- Compare compressed vs uncompressed sizes to ensure savings realized.
- Ensure brotli not served to legacy browsers if unsupported (CDN handles negotiation).

19. Optional Binary Packing
- For large structured data, consider binary format (e.g., protocol buffers) only if JSON optimizations insufficient; weigh complexity.
- If used, keep manifest JSON and decode lazily.

20. Client Parsing Considerations
- Avoid blocking main thread parsing huge JSON; stream/parse in chunks if possible.
- Use yield to event loop between parsing of large arrays.

21. Header Examples
- `Cache-Control: public, max-age=31536000, immutable`
- `ETag: "abc123"`
- `Content-Encoding: br`

22. Monitoring
- Log payload sizes at runtime for key datasets (bytes, compressed if available from performance entries).
- Alert when size exceeds budget by >10%.

23. Warm-up Strategy
- Pre-warm cache for top N workouts/modules during idle after first render to smooth subsequent navigations.
- Keep warm-up list small to avoid undoing size savings.

24. Data Minimization Checklist
- Remove unused fields flagged by analytics/usage analysis.
- Ensure IDs are short; avoid verbose GUIDs if not needed.
- Use enums/ints for difficulty/tags instead of long strings where feasible.

25. Ownership
- Data shaping: TBD.
- CI budgets: TBD.
- Runtime logging: TBD.
