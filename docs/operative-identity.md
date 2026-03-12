# Operative Identity System

## Overview

The Archangel Knights Training Console serves as the **commissioning authority** for Earth Alliance operatives. Every operative receives a sovereign cryptographic identity — not a server-managed account, not a username/password pair, but a cryptographic keypair that the operative owns outright. This identity is the credential that travels across the entire Earth Alliance ecosystem.

## Why Sovereign Identity

Traditional applications create user accounts on a central server. The server owns the account. If the server disappears, the identity disappears. If the server is compromised, all identities are compromised.

The Earth Alliance operates on different principles:

- **No central authority controls operative identity.** The keypair is generated locally on the operative's device.
- **The operative owns their keys.** Not Arch Angel Agency, not the Training Console, not any server.
- **Identity is portable.** The same credential works across Navcom, Starcom, Tactical Intel Dashboard, and any future ecosystem application.
- **Identity survives infrastructure.** If any single server or application goes offline, the operative's identity persists because it was never stored on that server.

This is sovereignty-first design. The operative is not a row in someone else's database.

## Technical Implementation

### Keypair Generation

The Training Console uses **Gun.js SEA (Security, Encryption, Authorization)** to generate operative keypairs:

```
SEA.pair() → {
  pub:  Ed25519 public key    (the operative's public identity)
  priv: Ed25519 private key   (the operative's signing authority)
  epub: ECDH public key       (for encrypted communication)
  epriv: ECDH private key     (for decrypting received messages)
}
```

This keypair is generated entirely client-side. No server is contacted. No seed is shared. The operative's device is the only place the private keys ever exist.

### Identity Storage

- **Primary storage:** `localStorage` under key `ptb:gun-identity`
- **Format:** JSON-serialized keypair object
- **Encryption at rest:** The operative can encrypt their stored identity with a passphrase

### Identity Export / Import

Operatives can export their identity for backup or transfer to another device:

- **Export:** Keypair serialized to JSON, optionally encrypted with a user-provided passphrase
- **Import:** Paste or scan the exported credential to restore identity on a new device
- **QR Code:** Identity can be encoded as a QR code for physical transfer between devices

### Profile Data

The operative profile associated with the identity includes:

| Field | Description |
|---|---|
| **Callsign** | The operative's chosen identifier (display name) |
| **Archetype** | Specialization path (Rescue Ranger, Cyber Sentinel, etc.) |
| **Handler** | Assigned training mentor |
| **Public Key** | The operative's Ed25519 public key (their ecosystem-wide identifier) |

Profile data syncs peer-to-peer via Gun.js user graph (`~/profile`). No central server stores this data.

## Cross-Ecosystem Identity

### How Identity Travels

1. **Commissioning:** Operative generates keypair in the Training Console during onboarding
2. **Export:** Operative exports their credential (encrypted file or QR code)
3. **Import elsewhere:** Operative imports the same credential into Navcom, Starcom, or other ecosystem apps
4. **Recognition:** Each application verifies the operative's identity using their public key
5. **Continuity:** Training progress, operational history, and reputation are all associated with the same public key across all applications

### What the Public Key Represents

The operative's public key is their canonical identifier across the ecosystem:

- In the **Training Console** → Training history, XP, level, archetype, certifications
- In **Navcom** → Communication identity, encrypted channel membership
- In **Starcom** → Operational role, investigation access, OSINT contributions
- In **Tactical Intel Dashboard** → Intelligence product authorship, analysis history
- In **Mecha Jono** → Full operative profile, cross-app behavioral understanding

### Trust Model

The ecosystem uses a **peer trust** model, not a central authority model:

- **Self-sovereign:** Each operative generates and controls their own identity
- **Peer attestation:** Operatives can attest to each other's capabilities (future)
- **Training certification:** Completed training modules produce verifiable credentials signed by the Training Console (future)
- **Reputation accrual:** Operational activity across ecosystem apps builds a reputation associated with the public key (future)

## Current Implementation Status

| Capability | Status |
|---|---|
| SEA keypair generation | Implemented |
| localStorage persistence | Implemented |
| Encrypted export/import | Implemented |
| QR code display/scan | Implemented |
| Gun.js P2P profile sync | Implemented (feature-flagged) |
| Cross-app credential import | Architecture defined, not yet wired |
| Training certification credentials | Planned |
| Peer trust attestation | Planned |
| Reputation system | Planned |

## Security Considerations

### What the operative must protect

- **Private key (`priv`, `epriv`):** These are signing and decryption keys. If compromised, an attacker can impersonate the operative.
- **Export passphrase:** If the operative encrypts their export, the passphrase must be strong and stored securely.

### What is safe to share

- **Public key (`pub`, `epub`):** These are designed to be shared. They identify the operative without granting any authority.
- **Callsign:** Display name, safe for public contexts.

### Key rotation

The current system does not implement key rotation. An operative's keypair is permanent. Future work may add:

- Revocation certificates
- Key rotation with continuity proofs
- Multi-device key management

## For Developers

### Service Layer

The identity system is implemented in:

- `src/services/gunIdentity.ts` — `GunIdentityService` class handling keypair generation, storage, export, and import
- `src/services/gunProfileBridge.ts` — Syncs operative profile to Gun.js user graph
- `src/services/gunStoreSyncs.ts` — Manages P2P data synchronization

### Store Integration

The identity is connected to the application through:

- `src/store/OperativeProfileStore.ts` — Stores callsign, archetype, handler, and public key locally
- `src/context/HandlerSelectionContext.tsx` — Provides handler assignment context

### Feature Flags

The P2P identity system is gated behind the `p2pIdentity` feature flag in `src/config/featureFlags.ts`. When disabled, the operative profile exists only in localStorage without P2P sync.

---

*The operative's identity belongs to the operative. Not to a server. Not to a company. Not to us. That's the foundation everything else is built on.*
