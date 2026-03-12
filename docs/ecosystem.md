# Earth Alliance Ecosystem Architecture

## Overview

The Earth Alliance ecosystem is a distributed suite of applications that together provide the infrastructure for an emerging global organization. Each application serves a distinct operational role, and they are designed to interoperate through shared operative identity, data contracts, and sovereign-first architecture.

The ecosystem is not finite — it will expand as the Earth Alliance grows. This document represents the current state.

## Applications

### Archangel Knights Training Console
- **URL:** [personaltrainingbot.archangel.agency](https://personaltrainingbot.archangel.agency)
- **Role:** Academy and commissioning authority
- **Function:** Takes civilians through operative formation — archetype selection, handler assignment, multi-domain training curriculum, drill execution, progression tracking. Issues sovereign operative credentials (SEA keypairs).
- **Ecosystem Position:** Front door. This is where every operative's journey begins. The Training Console is the root of trust for operative identity.

### Starcom
- **URL:** [starcom.app](https://starcom.app)
- **Role:** Cyber Command Interface
- **Function:** 3D global visualization for cyber investigations and open source intelligence (OSINT) operations. Operatives trained in Cybersecurity, Intelligence, and Investigation modules through the Training Console apply their skills here.
- **Ecosystem Position:** Operational field for cyber and intelligence work. Consumes operative credentials for access control and role assignment.

### Navcom
- **URL:** [navcom.app](https://navcom.app)
- **Role:** Secure decentralized communications
- **Function:** Post-quantum cryptography encrypted messaging, navigational reporting, and intel sharing between operatives. Designed for operational coordination and field reporting.
- **Ecosystem Position:** Communications backbone. All inter-operative coordination flows through Navcom. Sovereign identity enables end-to-end encrypted channels without central key management.

### Tactical Intel Dashboard
- **URL:** [tacticalinteldashboard.archangel.agency](https://tacticalinteldashboard.archangel.agency)
- **Role:** Actionable intelligence
- **Function:** Aggregates, processes, and presents open source intelligence for operative decision-making. Provides situational awareness and threat assessment.
- **Ecosystem Position:** Intelligence product layer. Operations conducted through Starcom and field reports via Navcom feed intelligence into this dashboard. Operatives trained in Intelligence and Investigation modules are prepared to interpret and act on this data.

### Mecha Jono
- **URL:** [mecha.jono.archangel.agency](https://mecha.jono.archangel.agency)
- **Role:** AI Agent and organizational memory
- **Function:** Digital doppelganger of Jono Tho'ra — leader of Arch Angel Agency, Knight Commander of the Archangel Knights, free operative of the future Earth Alliance, and creator of the Earth Intelligence Network. Provides continuity, guidance, and institutional knowledge.
- **Ecosystem Position:** Connective tissue. Mecha Jono understands the entire ecosystem — training progress, operational history, intelligence products — and can personalize guidance, conduct debriefs, and serve as organizational memory across all applications.

## How Applications Connect

```
                    ┌──────────────────────┐
                    │    MECHA JONO        │
                    │  AI Agent / Memory   │
                    └──────────┬───────────┘
                               │
              Understands all ──┤── Guides all
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │                          │                          │
    ▼                          ▼                          ▼
┌──────────┐           ┌──────────────┐           ┌──────────────┐
│ TRAINING │──────────▶│   STARCOM    │──────────▶│  TACTICAL    │
│ CONSOLE  │ Produces  │ Cyber Command│ Produces  │  INTEL       │
│ Academy  │ Operatives│ OSINT Ops    │ Intel     │  Dashboard   │
└──────────┘           └──────┬───────┘           └──────────────┘
    │                         │                          ▲
    │                         │                          │
    │                    ┌────▼──────┐                   │
    │                    │  NAVCOM   │───────────────────┘
    └───────────────────▶│ Secure    │  Field Reports
     Identity travels    │ Comms     │  Feed Intel
     across ecosystem    └───────────┘
```

### Data Flow

1. **Training → Operations:** Operatives formed in the Training Console carry their credentials and training certifications into Starcom and Navcom where they conduct real operations.

2. **Operations → Intelligence:** Cyber investigations in Starcom and field reports through Navcom produce raw intelligence that feeds the Tactical Intel Dashboard.

3. **Intelligence → Training:** Intelligence products and operational patterns identified by the Tactical Intel Dashboard can inform training curriculum — surfacing areas where operatives need development.

4. **AI → Everything:** Mecha Jono observes patterns across the ecosystem — training telemetry, operational activity, intelligence products — and provides personalized guidance, conducts debriefs, and maintains organizational continuity.

## Shared Infrastructure

### Operative Identity (Sovereign Credentials)

All ecosystem applications recognize the same operative identity:

- **Generation:** SEA keypair created in the Training Console during operative commissioning
- **Format:** Ed25519 public/private keypair with encrypted export capability
- **Transport:** Operative exports credential (QR code or encrypted file) from Training Console, imports into other ecosystem apps
- **Trust Model:** No central identity server. The keypair IS the identity. Trust is established through peer attestation, not central authority.

See [operative-identity.md](operative-identity.md) for the full specification.

### Decentralized Architecture

The ecosystem is intentionally sovereignty-first:

- **No central server dependency** — Applications function independently and can operate offline
- **P2P sync via Gun.js** — Data synchronization without central databases where applicable
- **Post-quantum encryption** — Navcom uses cryptography designed to resist quantum computing attacks
- **Client-side first** — State lives on the operative's device, not in a corporate cloud

### Shared Design Language

All ecosystem applications share:

- **Mission vocabulary** — Brief, Triage, Case, Signal, Checklist, Debrief
- **Dark-mode military aesthetic** — Consistent visual identity across applications
- **Operative-centric UX** — Interfaces designed for people conducting operations, not browsing content

## Future Expansion

The ecosystem is designed for growth. Potential future nodes include:

- **Field operations applications** for physical-world mission execution
- **Training assessment systems** for competency verification and peer validation
- **Cross-operative trust networks** for reputation and certification management
- **Specialized domain tools** as the Earth Alliance's operational scope expands

Each new application follows the same pattern: sovereign identity, offline capability, decentralized architecture, and integration with the existing ecosystem through shared contracts and operative credentials.

---

*The Earth Alliance ecosystem is being built piece by piece. Each application that comes online strengthens the whole. The Training Console is where it starts.*
