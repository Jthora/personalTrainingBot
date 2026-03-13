# Offline and Reliability

## Objectives
- Guarantee cold offline start for cached shell and last-synced content.
- Maintain deep-link reliability across hosts.

## Service Worker Plan
- Precache: shell (/, /index.html), manifest, starter shard (`/training_modules_shards/fitness.json`).
- Runtime caching: manifest + shards cache-first with background refresh; navigation fallback to cached shell when offline; stale-while-revalidate for media under /assets/ with a cap of 40 entries.
- Versioning/cleanup: split precache/runtime caches (v4), delete older cache buckets on activate, prune non-runtime entries, cap media cache entries.
- Verification: `npm run check:sw-cache-paths -- --base=http://localhost:4173` warms shard, asserts offline hit for shard, and fails a miss path to prove cache boundaries.
- Controls: manual preload/sync action in Settings, low-data enforcement skips prefetch/warm.
- Drill run: starter drill runner persists steps locally, resumes after reload, and queues telemetry until online.
- Offline deep-links: `npm run check:deeplinks-offline -- --base=http://localhost:4173` warms caches, flips offline, and verifies navigation renders without console errors.
- Mission critical path (offline): `npm run check:offline-critical-path -- --base=http://localhost:4173` warms mission continuity routes, flips offline, and verifies checkpoint traversal while emitting `artifacts/offline-critical-path-report.json`.
- Cache corruption + stale-data recovery: `npm run check:offline-recovery -- --base=http://localhost:4173` simulates shard cache corruption and stale manifest cache, then verifies online recovery and offline revalidation; emits `artifacts/offline-recovery-report.json`.
- Drill run fallbacks: if drill metadata is missing offline, runner shows text-only steps with guidance to resync.

## Offline/Low-data UX
- Indicator for offline/online; retry affordances.
- Low-data toggle: skips manifest prefetch and cache warming; media stays on-demand.
- Manual preload action on Settings page to fetch manifest + starter shard for offline use; status shown.
- Drill run continuity: `/training/run` starts/resumes starter drill with cached steps; telemetry logs queue offline.
- Fallback messaging: text-first runner message appears when drill metadata/media are unavailable offline.
- Error states: graceful fallback for missing cached drill, suggest sync.

## Deep-link Matrix
- Routes: home, mission-kit, drills, training/execute, c/:slug, share/:slug.
- Mission routes: `/mission/brief`, `/mission/triage`, `/mission/case`, `/mission/signal`, `/mission/checklist`, `/mission/debrief`.
- Mission state permutations: valid and stale `?op=<id>&case=<id>&signal=<id>` continuity params.
- Tests: online and offline-after-sync; include SW bypass/reload cases.

## Mission Critical Path Checkpoints (Offline)
- `/mission/brief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/mission/triage?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/mission/case?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/mission/signal?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/mission/checklist?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/mission/debrief?op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge`
- `/training/run`

## Acceptance
- Cold offline launch renders shell + readiness + last synced kit.
- Deep links load when cached; fallbacks are explicit when not cached.
- Corrupted cache entry and stale manifest scenarios have scripted recovery checks with pass/fail artifacts.
- Cache hit ratio and offline success tracked in telemetry.
