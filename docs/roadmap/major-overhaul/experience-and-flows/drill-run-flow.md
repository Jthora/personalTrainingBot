# Drill Run Flow

## Entry
- From drill list/detail; from shared link; from Mission Kit.

## States
- Loading, Ready, In-progress, Paused, Completed, Aborted, Offline-missing-assets.

## Steps
- Start event; step navigation; timers (if any); success/fail logging; export AAR prompt.

## Offline Behavior
- Require cached steps/assets; fallback to text-only.
- Queue telemetry if offline.

## Acceptance
- Flow documented with states, copy, and events; offline path specified.
