# Delivery and Rollout

## Objectives
- Ship overhaul safely as a solo developer using staged deploys and clear rollback paths.

## Migration and Compatibility
- Redirect map for renamed tabs/routes; preserve deep links via rewrites.
- Data migration: legacy workout data handling (hide or map to mission kits? document decision).
- Legacy schema/service inventory for retirement tracked in `legacy-retirement-inventory.md`.
- Final migration decisions + long-term constraints tracked in `final-migration-notes.md`.

## Rollout Plan (solo)
- Staging deploy with automated deep-link/offline/readiness checks.
- Deploy to production sequentially (one phase at a time) with a short watch window and automated smoke.
- Rollback criteria and steps documented and verified via scripted checks.
- Mixed-mode validation scenarios and outcomes tracked in `mixed-mode-validation.md`.
- Stabilization thresholds and triage cadence documented in `stabilization-protocol.md`.

## Comms
- Release notes and in-product banners for IA changes and offline capability.
- Privacy note outlining data handling and telemetry choices.

## Acceptance
- Rollout steps documented; rollback steps tested.
- Rollout checklist exists with owners and timelines.
