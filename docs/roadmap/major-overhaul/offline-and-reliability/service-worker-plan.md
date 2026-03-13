# Service Worker Plan

## Scope
- Precache shell, core routes, manifest, base CSS/JS, fonts, starter content packs.
- Runtime caching for kits/drills JSON and images with stale-while-revalidate.

## Versioning
- Cache version per release; cleanup strategy documented.

## Update Flow
- Notify user on SW update; allow refresh; handle background activation.

## Acceptance
- SW skeleton passes install/activate; precache list documented; versioning and update flow defined.
