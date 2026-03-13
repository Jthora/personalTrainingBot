# Data Persistence and TTL Plan

1. Goals
- Persist reusable datasets to speed warm starts.
- Validate cached data via version/signature and TTL rules.
- Provide safe fallbacks and migrations.
- Keep UX transparent when using cached or stale data.

2. Persistence Medium
- Primary: IndexedDB (via light wrapper) for structured JSON and larger payloads.
- Fallback: localStorage for small primitives (flags, timestamps) if IndexedDB unavailable.
- Avoid sessionStorage for persistence needs beyond tab.

3. Storage Schema (proposed)
- Database: `ptb-loading-cache`
- Object stores:
  - `coachCatalog`: key `version`, value {version, signature, ttlMs, fetchedAt, data}
  - `moduleCatalog`: key `version`, value {version, signature, ttlMs, fetchedAt, data}
  - `workoutCategories`: key `version`, value {...}
  - `scheduleStub`: key `user` (or `anon`), value {version, signature, ttlMs, fetchedAt, data}
  - `workoutDetails`: key `workoutId`, value {version, signature, ttlMs, fetchedAt, data}
  - `meta`: housekeeping (schemaVersion, lastPurge)

4. Signatures / Versions
- Static JSON (bundled): include `version` field and hash signature (e.g., sha256) generated at build.
- Remote JSON: include `version` or `etag` and lastModified if available.
- Cache key includes `version` + `dataset`.
- On signature mismatch -> discard entry and refetch.

5. TTL Rules (starting values)
- Coach catalog: 24h if static; shorten to 6h if dynamic.
- Module catalog: 24h static; 6h dynamic.
- Workout categories: 12h.
- Schedule stub: 15m (user-specific, more volatile).
- Workout details: 6h; refresh on usage if stale.
- Assets (avatars thumbs): 24h.

6. Trust/Reuse Rules
- Use cache if: signature matches expected build signature AND (now - fetchedAt) < ttlMs.
- If expired but signature still valid: allow "stale-while-revalidate" for non-critical data (coach/module/catalog) with UI indicator; schedule remains stricter (require fresh fetch, but can show cached stub with warning).
- If signature mismatch: do not use; refetch before display (except shell skeleton continues).

7. Read/Write Flow
- Read-through: attempt cache read; if valid -> return data and trigger background revalidate if close to expiry (e.g., 80% TTL consumed).
- Write-through: after successful fetch, store with metadata (signature, fetchedAt, ttlMs).
- Provide helper `getWithTTL(dataset, loader)` returning {data, source: 'cache' | 'network' | 'stale-cache', stale?: boolean}.

8. Fallback and Invalidation
- If IndexedDB blocked/unavailable -> log and use network-only; optionally persist minimal data to localStorage if small.
- Invalidation triggers:
  - App version change -> clear caches with mismatched appVersion key.
  - Signature mismatch -> clear entry.
  - TTL expiry for critical data -> mark invalid and refetch before use.
- Manual clear: expose dev/QA command to wipe caches.

9. Migration Handling
- Track `schemaVersion` in `meta` store.
- On upgrade: if schemaVersion differs, run migration steps; if failure, clear stores and fall back to network.
- Migration example: split monolithic `training_modules.json` into `manifest + shards`.

10. Stale Data UX
- Surface lightweight "Using cached data" pill when showing stale-but-acceptable data.
- For schedule: show "Refreshing schedule" inline spinner while background fetch runs.
- For workouts: mark stale entries with subtle badge until refreshed.

11. Error Handling
- All cache operations should be try/catch with telemetry (cache read/write failure event).
- If write fails (QuotaExceeded or blocked), disable persistence for session and log.

12. Security/Privacy
- Avoid storing sensitive PII; data is primarily catalog/training content.
- Namespaced keys to avoid collisions across environments.

13. Testing
- Unit tests for TTL logic (valid, expired, stale-while-revalidate).
- Integration test: boot with cached data present; verify warm start faster and correct flags set.
- Migration test: simulate old schemaVersion -> new, ensure purge or migration succeeds.

14. API Sketch (TypeScript)
- `interface CachedEntry<T> { version: string; signature?: string; ttlMs: number; fetchedAt: number; data: T; }`
- `getCached<T>(store, key): Promise<CachedEntry<T> | null>`
- `setCached<T>(store, key, entry): Promise<void>`
- `withCache(dataset, key, ttlMs, signature, loader)` returns {data, source} and handles background revalidate.

15. Observability
- Metrics: cache hits/misses/stale per dataset; read/write duration; quota errors.
- Logs include dataset, key, version, ttlMs, ageMs, source.

16. Offline Behavior
- If offline: use valid cache; if expired but available, allow stale for catalogs with UX indicator.
- Queue background refresh when back online.

17. Data Size Guardrails
- Store upper bound per dataset (e.g., workoutDetails per entry <200KB; catalog total <2MB) to avoid quota issues.
- Evict LRU entries for workoutDetails when exceeding threshold.

18. Concurrency
- Use mutex or simple in-flight map to avoid duplicate fetch/store for same key.
- Prevent race overwrites by checking fetchedAt; keep freshest.

19. Dev/QA Controls
- Add `DEBUG_CACHE_DISABLE` flag to bypass cache easily.
- Add button/command to clear caches and show current cache state.
- Implemented: In dev builds, `window.ptbCache` exposes `{ clear(), disable(), enable(), status(), resetSchema() }`; console-accessible. `DEBUG_CACHE_DISABLE=true` in localStorage also bypasses cache paths. Clearing removes IndexedDB stores and `ptb-cache:*` localStorage keys. `resetSchema()` deletes the IndexedDB database and clears local fallback for migration/rollback.

20. Rollout
- Behind `loadingCacheV2` flag; enable incrementally.
- Monitor hit rate and warm-start improvement before broad enablement.
