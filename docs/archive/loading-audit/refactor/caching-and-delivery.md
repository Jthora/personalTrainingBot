# Caching and Delivery Plan

1. Goals
- Optimize HTTP caching for static JSON/assets.
- Clarify CDN/hosting assumptions and policies.
- Evaluate service worker feasibility for offline/cache-first.
- Add connection hints (preconnect/prefetch/dns-prefetch) for faster starts.

2. HTTP Cache Headers (static JSON)
- Use versioned file names (hash) to allow `Cache-Control: public, max-age=31536000, immutable`.
- For non-hashed but stable: `Cache-Control: public, max-age=86400, stale-while-revalidate=600`.
- Include `ETag` and `Last-Modified` for validation.
- Ensure `Content-Type: application/json; charset=utf-8` and `Content-Encoding: br/gzip`.

3. Dynamic JSON (if any)
- `Cache-Control: no-store` or short `max-age=60` if user-specific.
- Use ETag/If-None-Match for schedule stub where supported to reduce bytes.

4. CDN Considerations
- Assume CDN in front of static assets (e.g., Cloudflare/Fastly).
- Enable brotli compression at edge.
- Serve from edge POPs near users; confirm origin cache TTL alignment with headers.
- Consider `cache key` includes query params if used; avoid uncacheable URLs.

5. Asset Hosting
- Host images/avatars with hashed filenames; long max-age + immutable.
- Audio files similarly hashed; allow range requests.
- Fonts: preload + long cache.

6. Service Worker Feasibility
- Scope: optional; focus on cache-first for static catalogs and shell.
- Risks: complexity and stale data; keep small surface if implemented.
- If built: register sw behind flag, precache shell + manifests, runtime cache for JSON with TTL.
- If not: rely on HTTP cache + IndexedDB persistence.

7. Offline/Cache-first Targets
- Static catalogs (coach/module/categories) can be cache-first with revalidate.
- Schedule stub: network-first with cache fallback (stale allowed with indicator).
- Workout details: cache-first if present; otherwise network.

8. Preconnect/Prefetch/DNS-Prefetch
- Preconnect to CDN domain hosting static assets.
- dns-prefetch for API/static domains.
- Prefetch main JSON manifests post-critical.
- Add `<link rel="preload">` for fonts/theme CSS.

9. HTML Head Additions (index.html)
- `<link rel="preconnect" href="https://static-cdn.example.com" crossorigin>`
- `<link rel="dns-prefetch" href="https://static-cdn.example.com">`
- `<link rel="preload" as="style" href="/theme.css">` (if external)
- `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/xyz.woff2">`

10. Cache Busting
- Use hashed filenames to avoid manual busting.
- For JSON served without hash, append version param `?v=YYYYMMDD` aligned with signature.
- On app version change, clear IndexedDB/local caches via version key.

11. Validation Strategy
- Use ResourceTiming to verify cached vs network load.
- Log header values (dev) to ensure correct caching behavior.
- Add CI/CD check to confirm compression and cache headers set (if infra allows).

12. Security/Privacy
- Avoid caching sensitive user data at CDN.
- For authenticated requests, ensure `Cache-Control: private` or `no-store` as needed.

13. Delivery Performance Targets
- DNS/connection time <100ms on target networks after preconnect.
- Static JSON served from cache for warm loads (verify via timing).
- CDN HIT rate target for static assets: >95%.

14. Rollout
- Add head hints in `index.html` once domains confirmed.
- Adjust hosting config for cache headers.
- Optionally prototype small service worker; keep flag to disable.

15. Risks
- Misconfigured caching causing stale data; mitigate with signatures/TTL.
- Too many preconnect/prefetch hints can waste bandwidth; choose minimal set.

16. Observability
- Track CDN cache status via response headers (CF-Cache-Status, etc.).
- Log cache mode (memory/disk) from ResourceTiming when available.

17. Checklist for Deployment
- Verify `index.html` contains intended preconnect/dns-prefetch/preload links.
- Confirm CDN edge compression enabled (brotli/gzip) and not double-compressing.
- Validate cache headers via curl in staging.
- Ensure hashed filenames emitted for static JSON/asset bundles.
- Confirm `immutable` only used with hashed assets.

18. Dev/QA Verification Steps
- Load app twice; check ResourceTiming for cached responses (transferSize near header size).
- Inspect response headers for cache-control, etag, content-encoding.
- Simulate offline warm load to confirm browser cache + IndexedDB fallback path works.

19. Service Worker Decision Notes
- Only proceed if offline use-case justified; otherwise defer.
- If implemented: keep scope narrow, avoid opaque caching of API responses without TTL.
- Provide `window.__forceSWUpdate` for dev testing; document disable steps.

20. CDN/Edge Config Hints
- Enable origin shield if available to reduce origin fetches.
- Strip cookies on static asset paths.
- Set `vary: accept-encoding` appropriately.
- Allow HTTP/2 or HTTP/3 where available; confirm server supports.

21. Ownership
- Infra/CDN config: TBD.
- Frontend head hints: TBD.
- Service worker (if any): TBD.

22. Future Enhancements
- Consider `prefers-reduced-data` or `save-data` header handling at CDN to reduce payloads.
- Add `Early Hints (103)` support if infra allows to push preload hints.
