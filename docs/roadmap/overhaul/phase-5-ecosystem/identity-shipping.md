# Identity Shipping — Graduate `p2pIdentity` to Production

The sovereign identity system is the foundation of the Earth Intelligence Network. Every operative gets a cryptographic keypair (Ed25519 via Gun.js SEA) that is theirs — not held by a server, not controlled by a platform.

This document covers graduating `p2pIdentity` from staging to production.

---

## What Ships

When `p2pIdentity` is ON, the operative gets:

1. **Keypair generation** — `SEA.pair()` creates Ed25519 + ECDH keypair client-side
2. **Gun user graph** — authenticated `~/` namespace for operative data
3. **Profile sync** — `OperativeProfileStore` ↔ Gun `~/profile` (bidirectional)
4. **Progress sync** — `UserProgressStore` ↔ Gun `~/stores/progress` (bidirectional)
5. **Drill run sync** — `DrillRunStore` → Gun `~/stores/drillRun` (push-only)
6. **AAR sync** — `AARStore` ↔ Gun `~/stores/aar` (bidirectional, merge by ID)
7. **SovereigntyPanel** — UI for identity management, export (file + QR), import (paste + QR scan)

---

## Pre-Ship Checklist

### Infrastructure

- [ ] **Dedicated Gun relay** — do NOT ship to prod using free community relays (`gun-manhattan.herokuapp.com` etc.)
  - Set up self-hosted relay: `npx gun --port 8765` on a VPS or Railway/Fly.io
  - Set `VITE_GUN_PEERS=https://relay.archangel.agency/gun` in prod env
  - Fallback to community relays if self-hosted is down (already supported in code)

- [ ] **Relay monitoring** — ensure relay is pingable and WebSocket connections are accepted
  - Simple health check: `curl -I https://relay.archangel.agency/gun`

### Code Quality

- [ ] All Gun service tests pass (`gunDb.test.ts`, `gunIdentity.test.ts`, `gunStoreSyncs.test.ts`, `gunSyncAdapter.test.ts`, `gunProfileBridge.test.ts`)
- [ ] `useGunIdentity` hook test passes
- [ ] `SovereigntyPanel` component test passes
- [ ] Phase 4 Gun lazy-loading is complete (Gun code not in critical path vendor chunk)

### Functional Testing

- [ ] **Create identity** — new keypair generates, stores in localStorage, Gun user authenticates
- [ ] **Reload persistence** — identity survives browser restart, auto-login works
- [ ] **Profile sync** — change callsign → appears in Gun graph → reload → still there
- [ ] **Progress sync** — complete a drill → XP syncs to Gun → open in new browser → XP appears
- [ ] **Export to file** — download JSON, verify contains `pub`, `priv`, `epub`, `epriv`
- [ ] **Export with passphrase** — encrypted JSON is not human-readable
- [ ] **Import from file** — paste exported JSON → identity restores, stores re-sync
- [ ] **Import with passphrase** — correct passphrase decrypts, wrong passphrase rejected
- [ ] **QR export** — QR code generates (< 1273 bytes at error correction H)
- [ ] **QR scan import** — scan exported QR → identity restores
- [ ] **Logout** — identity removed, Gun user leaves, stores stop syncing
- [ ] **Conflict resolution** — two devices with same identity, both modify XP → higher value wins (monotonic merge)

### Staging Soak (2 weeks minimum)

- [ ] Enabled in staging for internal team
- [ ] Monitor for:
  - Gun WebSocket connection errors
  - SEA keypair generation failures
  - Sync conflicts (check console for `gun_sync_pull_*` telemetry)
  - localStorage quota issues (identity + sync data)
  - Battery/performance impact of persistent WebSocket connections

---

## Deployment Steps

### Step 1 — Set environment variables

```bash
# Production environment (Vercel)
VITE_GUN_PEERS=https://relay.archangel.agency/gun
```

### Step 2 — Enable flag in production

```typescript
// src/config/featureFlags.ts — ENV_DEFAULT_FLAGS.production
production: {
  p2pIdentity: true,   // was false
}
```

### Step 3 — Deploy

Standard deploy. The flag change is the only code diff.

### Step 4 — Monitor (48 hours)

- Check browser console for `p2p` telemetry events
- Verify Gun relay is receiving connections
- Check error rates in hosting dashboard (Vercel)
- Spot-check sync behavior across two browsers/devices

### Step 5 — Announce to operatives

The SovereigntyPanel becomes available. Operatives should be directed to:
1. Open their profile
2. Initialize their sovereign identity
3. Export a backup (file or QR)

---

## Rollback Plan

If critical issues found after shipping:

1. Set `p2pIdentity: false` in production config
2. Deploy immediately — flag disables all Gun init
3. Operative identities remain in localStorage (not lost)
4. When fixed, re-enable flag — identities auto-restore on next load

**Identity data is never lost** — it lives in the operative's localStorage. The flag only controls whether Gun connections and the SovereigntyPanel are active.

---

## Post-Ship: Cross-App Identity

Once identity is stable in production, the next step is making it portable:

1. **Deep-link handoff** — `https://starcom.app/import?identity=<encrypted-fragment>` allows one-click import from the Academy to Starcom
2. **Shared Gun namespace** — all ecosystem apps use the same relay and same `~/` user graph, so profile data appears everywhere automatically
3. **QR-based device transfer** — already implemented and working; just needs to be promoted in onboarding

Cross-app identity details are covered in [ecosystem-navigation.md](ecosystem-navigation.md).
