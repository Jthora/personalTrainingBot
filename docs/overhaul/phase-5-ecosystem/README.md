# Phase 5 — Ecosystem Wiring

> Connect the Personal Training Bot to the Earth Intelligence Network.

## Current State

The app exists in isolation. It has a single external link (`archangel.agency/hub` on the logo) and zero integrations with sibling ecosystem apps.

| Integration | Status |
|-------------|--------|
| Ecosystem navigation | Logo link only — no app switcher |
| Operative identity (SEA keypair) | Implemented, **OFF in prod** |
| P2P data sync (Gun.js) | 4 stores sync, **OFF in prod** |
| Telemetry | Local buffer, console only, **no outbound** |
| Service worker cross-app | None |
| IPFS content | Gateway fetcher exists, **OFF in prod** |
| Shared design language | Convention only, no shared library |

## Target

| Integration | Target State |
|-------------|-------------|
| Ecosystem navigation | Full app switcher in Header with all 5 apps |
| Operative identity | ON in production, portable across apps |
| P2P data sync | ON in production, with dedicated Gun relay |
| Telemetry | Outbound to shared collector endpoint |
| Cross-app identity handoff | Deep-link with encrypted keypair fragment |

## Prerequisites

- Phase 2 complete — `p2pIdentity` graduated to staging/prod
- Phase 4 complete — Gun.js lazy-loaded (so enabling it in prod doesn't bloat critical path)

## Strategy

1. **Ship identity to production** — the foundation everything else builds on
2. **Add ecosystem navigation** — operatives need to reach sibling apps
3. **Wire telemetry outbound** — operational intelligence requires data flow
4. **Enable cross-app identity** — one keypair, all apps

## Files

| Document | Purpose |
|----------|---------|
| [identity-shipping.md](identity-shipping.md) | Graduate p2pIdentity to production |
| [ecosystem-navigation.md](ecosystem-navigation.md) | App switcher design and implementation |
| [telemetry-bridge.md](telemetry-bridge.md) | Cross-app telemetry architecture |

## Done Definition

- [ ] `p2pIdentity` ON in production, stable for 2+ weeks
- [ ] Header has ecosystem app switcher with all 5 apps
- [ ] Telemetry events POST to shared endpoint
- [ ] Operative can export identity from PTB and import into at least one sibling app
- [ ] Update [docs/overhaul/README.md](../README.md) Phase 5 status to ✅
