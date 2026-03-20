# Self-Sovereignty Phrase Bank

> OPSEC, digital hygiene, sovereign identity, encryption, privacy as doctrine.
> 469 cards.

---

## OPSEC Fundamentals

**keywords**: opsec, operational, security, information, protect, exposure, adversary, need-to-know

### Facts
- OPSEC (Operational Security) is the process of identifying and protecting information that, in aggregate, would allow an adversary to construct a picture of your capabilities, intentions, or vulnerabilities.
- The five-step OPSEC process: (1) identify critical information, (2) analyze the threat, (3) analyze vulnerabilities, (4) assess risk, (5) apply countermeasures.
- The aggregation problem: individually innocuous pieces of information (name, employer, neighborhood, gym, daily schedule) become operationally dangerous when combined. An adversary rarely needs a single revealing fact; they need a pattern.
- Need-to-know is not distrust — it is information hygiene. Information shared beyond operational necessity increases attack surface without operational benefit.

### Procedures
- Personal OPSEC audit: list every piece of information about yourself that is publicly accessible (social media, professional profiles, public records, photographs). Identify which combinations of data points would allow an adversary to predict your location, schedule, or vulnerabilities.
- OPSEC failure analysis: before sharing any information, ask: who has access to this channel, who might receive it downstream, and what could an adversary construct by combining this with what they likely already know?

### Exercises
- Conduct a 30-minute OSINT search on yourself using only public sources. Document every data point found. Map the aggregation risk: what pattern do these data points reveal when combined?
- Identify three information sharing habits that violate need-to-know. For each, design a specific operational alternative that achieves the same communication goal with less exposure.

---

## Digital Hygiene

**keywords**: hygiene, passwords, accounts, email, browser, tracking, cookies, security, updates

### Facts
- Password hygiene: each account requires a unique, random password of at least 20 characters. Password reuse is the primary attack vector for credential stuffing — one compromised service becomes access to all services using the same credential.
- A password manager is the operational solution to unique-random-password hygiene. Master password and 2FA on the password manager must be memorized, not written digitally.
- Browser fingerprinting allows tracking without cookies: browser version, screen resolution, installed fonts, and dozens of other parameters create a statistically unique fingerprint. Cookies are the least sophisticated tracking mechanism.
- Software updates are security patches. Unpatched systems carry known vulnerabilities with public exploit code. "I'll update later" is an exploitable attack surface with a documented timeline.

### Procedures
- New device setup protocol: enable full-disk encryption, install a password manager, generate unique passwords for all accounts, enable 2FA on all accounts that support it, remove pre-installed software not needed, verify automatic updates are enabled.
- Email hygiene: use email aliases for registrations (simplelogin.io, addy.io) so that compromise of one alias does not expose your primary email, and so that spam or data breach exposure is traceable to a specific vendor.

### Exercises
- Audit your current password hygiene: using your password manager's audit function (or manual review), list every account that shares a password with another account. Remediate all shared passwords within 48 hours.
- Set up and configure a browser security profile: uBlock Origin (list maintenance), disable third-party cookies, enable HTTPS-only mode. Test the configuration using a fingerprinting test site (coveryourtracks.eff.org).

---

## Encryption

**keywords**: encryption, encrypt, GPG, PGP, signal, end-to-end, keys, symmetric, asymmetric, at-rest

### Facts
- Symmetric encryption uses the same key to encrypt and decrypt (AES-256 for at-rest data). Asymmetric encryption uses a key pair: a public key to encrypt and a private key to decrypt (RSA, Curve25519).
- End-to-end encryption (E2EE) means messages are encrypted on the sender's device and decrypted only on the recipient's device. The service provider cannot read the content. Signal implements E2EE correctly; WhatsApp claims E2EE but has metadata vulnerabilities and owned by Meta.
- At-rest encryption protects data on storage media: full-disk encryption (FileVault, BitLocker, LUKS) ensures that a seized or stolen device does not yield its data without the decryption key.
- A public key is intended to be shared. A private key is never shared. If a private key is compromised, all past communications encrypted to it are readable by the attacker, and all future signatures made with it are untrustworthy.

### Procedures
- GPG key setup: generate a 4096-bit RSA or Ed25519 keypair, set a strong passphrase on the private key, back up the private key to offline storage (encrypted USB, paper key backup), and publish the public key to a keyserver or self-hosted location.
- Signal verification: use the Signal safety number verification (compare in person or via another authenticated channel) to confirm you are communicating with the actual person and not a MITM or impersonator.

### Exercises
- Generate a GPG keypair, encrypt a test message to your own public key, decrypt it, and verify the process works as expected. Export your public key and verify it imports correctly on a second device.
- Research the difference between transport encryption (TLS/HTTPS — protects data in transit but the server can read it) and end-to-end encryption (server cannot read it). Identify three services that claim encryption but provide only transport-level protection.

---

## Sovereign Identity

**keywords**: sovereign, identity, self-custody, keys, wallet, decentralized, identifier, DID, identity

### Facts
- Identity sovereignty means: you hold the keys to your identity. No third-party service can revoke, modify, or deny your identity without your consent.
- Digital identity custody models: custodial (a company holds your keys and can lock you out), self-custodial (you hold your private keys and are the sole authority on your identity), and federated (your identity is controlled by an institution that can be compelled by governments to restrict or expose it).
- Platform-dependent identity (Google account, LinkedIn, Twitter/X verification, government-issued digital ID) creates a centralized point of failure: the platform's policies, legal requirements, and operational decisions govern your identity.
- Decentralized identifiers (DIDs) allow identity claims to be verified cryptographically without reliance on a central authority. PGP/GPG key infrastructure provides a proven implementation of this principle.

### Procedures
- Identity dependency audit: list every system you depend on for identity/authentication. For each, ask: if this service disappeared tomorrow, deleted your account, or was compelled to lock you out, what would you lose? What would you need to rebuild?
- Sovereign communications setup: a communications system that cannot be silenced without your consent requires: self-owned domain for email, self-managed encryption keys, and at least one communications channel not dependent on any single platform or jurisdiction.

### Exercises
- Map your current identity dependencies. Identify which are platform-dependent and which are key-based. Develop a transition plan that moves at least one critical identity dependency to a self-custodial model.
- Research a case where platform-dependent identity was used as an instrument of control (account deletion, deplatforming with no appeal, government compulsion to freeze accounts). Identify what alternative would have been available with sovereign identity.

---

## Threat Modeling

**keywords**: threat, model, adversary, risk, attack, surface, capability, intention, mitigate

### Facts
- Threat modeling is the process of: (1) identifying what you are protecting, (2) identifying who the adversary is and what their capabilities and motivations are, (3) identifying the specific attack vectors relevant to your situation, and (4) selecting mitigations proportional to the actual risk.
- Not all privacy measures are appropriate for all threat models. Tor and Tails are appropriate for journalists working with confidential sources; they are overkill for general consumer privacy. A mismatch between threat model and countermeasures creates friction without proportionate benefit.
- Capability vs. intention: an adversary must have both capability and motivation to be an actual threat. Government intelligence services have high capability but may lack motivation to target an individual. A stalker may have low technical capability but high motivation and creativity.
- Proportionality: countermeasures that impose high operational cost for low risk reduction are not good security. Security theater (measures that look effective but do not address real threats) reduces resources available for real countermeasures.

### Procedures
- Write out your threat model in four parts: (1) What am I protecting? (2) Who would want to access or interfere with it? (3) What specific methods could they use? (4) What is the consequence if they succeed? Use this to evaluate every proposed countermeasure against the actual threat it addresses.
- Update your threat model when your situation changes: new role, new location, new adversary context, change in public visibility. A static threat model becomes outdated as circumstances change.

### Exercises
- Write a full threat model for a specific scenario: a journalist protecting a source, an activist in an authoritarian jurisdiction, a person leaving an abusive relationship. For each, identify the specific adversary, their likely capabilities, and the three highest-priority countermeasures.
- Evaluate a commonly recommended privacy tool (Signal, Tor, a VPN, a password manager) against a specific threat model. Does the tool address the actual threat? What does it not protect against?
