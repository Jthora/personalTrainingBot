# Telemetry Bridge — Cross-App Operational Intelligence

The Earth Intelligence Network needs data flow between apps. Currently, telemetry is local-only (console + localStorage buffer). This document designs the outbound telemetry bridge.

---

## Current Telemetry Architecture

```
Operative action
  → track(category, action, payload)
    → enrich(timestamp, route, offline, network)
      → push to localStorage buffer (max 80 events)
        → console.info()
        → (END — nothing leaves the device)
```

**Event categories:** `ia`, `p2p`, `readiness`, `offline`, `drills`, `signals`, `aar`, `settings`

**No outbound endpoint exists.** No `fetch`, no `sendBeacon`, no analytics service.

---

## Target Architecture

```
Operative action
  → track(category, action, payload)
    → enrich(timestamp, route, offline, network, operativeId)
      → push to localStorage buffer
        → console.info() (dev only)
        → flush() → POST to telemetry collector    ← NEW
        → offline? queue for background sync        ← NEW
```

---

## Design Decisions

### 1. Outbound Endpoint

**Option A: Dedicated telemetry collector** (recommended for Phase 5)

```
POST https://telemetry.archangel.agency/v1/events
Content-Type: application/json
X-App-Id: ptb
X-Operative-Id: <pub-key-fingerprint>  (not the full public key)

{ events: [...] }
```

A lightweight collector (Cloudflare Worker, Vercel Edge Function, or self-hosted) that:
- Accepts batched events
- Stores in append-only log (e.g., ClickHouse, SQLite, or even a JSON file per day)
- Exposes read API for Tactical Intel Dashboard to consume

**Option B: Gun.js telemetry namespace**

Write events to `~/telemetry/<date>` in the Gun user graph. Other apps can read it.
- Pro: No new infrastructure needed
- Con: Gun is not designed for high-throughput append-only logs, data is per-operative (not aggregatable without a relay-side reducer)

**Recommendation:** Start with Option A (dedicated collector). It's simpler, faster, and Tactical Intel Dashboard can query it directly.

### 2. Operative ID in Events

Include a **fingerprint** of the operative's public key (first 8 chars of SHA-256 of `pub`), not the full key. This allows correlating events across apps without exposing the private key material.

If `p2pIdentity` is OFF (no keypair), use a random `sessionId` from `sessionStorage` (not persistent, not correlatable across sessions).

### 3. Batching & Flush Strategy

| Trigger | Action |
|---------|--------|
| Buffer reaches 20 events | Flush batch |
| 60 seconds since last flush | Flush batch |
| `visibilitychange` (tab hidden) | Flush via `sendBeacon` |
| `beforeunload` | Flush via `sendBeacon` |
| Network returns (offline → online) | Flush queued events |

### 4. Offline Queuing

When offline:
- Events accumulate in localStorage buffer (already implemented, max 80)
- On `online` event: flush buffer to collector
- If buffer overflows while offline: drop oldest events (FIFO)

### 5. Privacy & Consent

- **No PII** in events — no email, no IP logging server-side
- Operative ID is a fingerprint of their public key (their choice to generate or not)
- `globalKillSwitch` flag already exists — when ON, all telemetry stops
- Add a `telemetryOptOut` flag for operatives who want to participate but not send data

---

## Implementation Steps

### Step 1 — Add flush sink to telemetry.ts

```typescript
// src/utils/telemetry.ts — add to existing file

const TELEMETRY_ENDPOINT = import.meta.env.VITE_TELEMETRY_ENDPOINT || null;

async function flushToCollector(events: TelemetryEvent[]): Promise<void> {
  if (!TELEMETRY_ENDPOINT || events.length === 0) return;
  
  try {
    const body = JSON.stringify({ events, appId: 'ptb' });
    
    // Use sendBeacon for unload scenarios, fetch for normal flush
    if (document.visibilityState === 'hidden') {
      navigator.sendBeacon(TELEMETRY_ENDPOINT, body);
    } else {
      await fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Silently fail — telemetry should never break the app
  }
}
```

### Step 2 — Wire flush triggers

```typescript
// Batch flush on threshold
function maybeFlush() {
  if (buffer.length >= 20) flush();
}

// Periodic flush
setInterval(() => flush(), 60_000);

// Visibility change flush
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});

// Online recovery
window.addEventListener('online', () => flush());
```

### Step 3 — Enrich with operative fingerprint

```typescript
function enrich(event: RawEvent): TelemetryEvent {
  return {
    ...event,
    ts: new Date().toISOString(),
    route: location.pathname,
    offline: !navigator.onLine,
    net: (navigator as any).connection?.effectiveType ?? 'unknown',
    operativeId: getOperativeFingerprint(),  // NEW
    appId: 'ptb',                             // NEW
  };
}

function getOperativeFingerprint(): string {
  // From Gun identity if available
  const identity = localStorage.getItem('ptb:gun-identity');
  if (identity) {
    const { pub } = JSON.parse(identity);
    return sha256(pub).substring(0, 8);
  }
  // Fallback: session-scoped random ID
  let sid = sessionStorage.getItem('ptb:session-id');
  if (!sid) {
    sid = crypto.randomUUID().substring(0, 8);
    sessionStorage.setItem('ptb:session-id', sid);
  }
  return sid;
}
```

### Step 4 — Set environment variable

```bash
# Production (Vercel)
VITE_TELEMETRY_ENDPOINT=https://telemetry.archangel.agency/v1/events

# Development — leave unset (no outbound in dev)
# Staging — set to staging collector
VITE_TELEMETRY_ENDPOINT=https://telemetry-staging.archangel.agency/v1/events
```

### Step 5 — Deploy telemetry collector

Minimum viable collector (Cloudflare Worker or Vercel Edge Function):

```typescript
// Pseudocode — collector endpoint
export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('', { status: 405 });
  
  const { events, appId } = await req.json();
  
  // Append to storage (ClickHouse, D1, R2, or even KV)
  await storage.append(appId, events);
  
  return new Response('', { status: 202 });
}
```

This collector is shared across all ecosystem apps. The `appId` field distinguishes events from PTB vs Starcom vs Navcom.

---

## Telemetry Events for Ecosystem Consumption

Events from PTB that are valuable to other apps:

| Event | Consumer | Value |
|-------|----------|-------|
| `drill_complete` with score | Tactical Intel Dashboard | Aggregate readiness metrics |
| `gun_identity_create` | Ecosystem analytics | Operative onboarding funnel |
| `offline_enter` / `offline_exit` | Navcom | Network condition awareness |
| `readiness_score_render` | Tactical Intel Dashboard | Per-operative readiness tracking |
| `signal_create` | Starcom | Signal intelligence forwarding |
| `aar_export` | Tactical Intel Dashboard | After-action intelligence |

---

## Tests

```
✅ flushToCollector sends POST to endpoint
✅ flushToCollector uses sendBeacon when tab hidden
✅ flushToCollector silently fails on network error
✅ flush clears buffer after successful send
✅ offline events queue and flush on reconnect
✅ operative fingerprint derived from pub key
✅ session fallback when no gun identity
✅ globalKillSwitch prevents all tracking
✅ no outbound when VITE_TELEMETRY_ENDPOINT unset
```

---

## Verification Gate

- [ ] `VITE_TELEMETRY_ENDPOINT` configured in staging
- [ ] Events reach collector within 60s of generation
- [ ] `sendBeacon` fires on tab close
- [ ] Offline queue drains on reconnect
- [ ] Zero errors in prod console from telemetry code
- [ ] `globalKillSwitch` disables all outbound
- [ ] Tactical Intel Dashboard can query collector for PTB events
