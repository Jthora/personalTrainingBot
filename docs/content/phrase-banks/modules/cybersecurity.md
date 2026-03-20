# Cybersecurity Phrase Bank

> Threat modeling, incident response, log analysis, network forensics, adversary TTPs.
> 143 cards.

---

## Threat Modeling

**keywords**: threat, model, STRIDE, attack, surface, mitre, ATT&CK, adversary, kill-chain

### Facts
- STRIDE threat modeling categories: Spoofing (impersonating another identity), Tampering (modifying data or code), Repudiation (denying actions), Information disclosure (exposing data to unauthorized parties), Denial of service, Elevation of privilege.
- MITRE ATT&CK is a knowledge base of adversary tactics, techniques, and procedures (TTPs) based on real-world observations. It is organized by tactic (the goal) and technique (the method). Using ATT&CK vocabulary normalizes adversary behavior descriptions across teams.
- The cyber kill chain (Lockheed Martin) models an attack in seven stages: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command & Control, Actions on objective. Defenders can interrupt the kill chain at any stage; interruption earlier is cheaper.
- Attack surface is the sum of all points where an unauthorized user can attempt to enter or extract data. Reducing attack surface — removing unneeded services, closing unused ports, revoking unneeded permissions — is more durable than patching individual vulnerabilities.

### Procedures
- Threat modeling for a system: enumerate assets (what would an adversary want?), enumerate trust boundaries (where do components of different trust levels interact?), apply STRIDE to each trust boundary, and prioritize mitigations by risk (impact × likelihood / cost).
- MITRE ATT&CK mapping: when investigating an incident, map each observed attacker behavior to a specific ATT&CK technique ID. This enables comparison with documented adversary group profiles and prioritization of defensive gaps.

### Exercises
- Conduct a STRIDE threat model on a simple 3-tier web application (browser → web server → database). Enumerate one threat in each STRIDE category for each tier. Identify the mitigation for each threat.
- Using the MITRE ATT&CK Navigator, map the TTPs of a documented threat actor group (APT29, Lazarus Group, or similar). Identify which techniques your current defensive tools detect and which they do not.

---

## Incident Response

**keywords**: incident, response, IR, triage, containment, eradication, recovery, forensics, timeline

### Facts
- The NIST incident response lifecycle: Preparation, Detection and Analysis, Containment/Eradication/Recovery, Post-incident activity.
- Containment before eradication: do not remove malware or clean affected systems before evidence is collected. Evidence collected during active containment enables root cause analysis; cleaning first destroys it.
- Chain of custody for digital evidence: every action taken on evidence must be documented (who, what, when, what tool was used, what the result was). Courts and internal accountability both require this documentation.
- The 1-10-60 rule (CrowdStrike benchmark): detect intrusions within 1 minute, investigate within 10 minutes, contain within 60 minutes. Adversary dwell time (time from initial access to detection) averages weeks to months in organizations without mature IR capability.

### Procedures
- First responder protocol: (1) Do not reboot the system — volatile memory (running processes, network connections, encryption keys) is lost on reboot. (2) Isolate from network (unplug, disable Wi-Fi) without powering down. (3) Document the current state (running processes, network connections, logged-in users) before any remediation. (4) Acquire memory and disk images before cleaning.
- Post-incident review (blameless): focus on: what the timeline of events was, what detection gaps existed, what processes or controls failed, and what specific changes will prevent recurrence. Not: who made a mistake.

### Exercises
- Write an incident response playbook for a specific scenario: ransomware on a file server, credential compromise of an admin account, or exfiltration from a cloud storage bucket. Include: detection criteria, initial triage steps, escalation path, containment actions, evidence collection steps.
- Practice memory acquisition using volatility or similar tools on a test system. Identify: running processes, network connections, loaded modules, and any anomalous entries in each category.

---

## Log Analysis

**keywords**: logs, analysis, SIEM, correlation, event, Windows, syslog, detection, anomaly, baseline

### Facts
- Windows Security Event IDs frequently used in threat hunting: 4624 (successful logon), 4625 (failed logon), 4648 (explicit credential use), 4688 (process creation — requires audit policy), 4697 (service installed), 4698 (scheduled task created), 7045 (service installed in system log).
- Log sources for a minimal viable visibility setup: Windows Security Event Log, Windows System Event Log, DNS query logs, proxy/web filter logs, authentication logs (AD/LDAP), firewall logs with denied traffic, and EDR process execution logs.
- Baselines enable anomaly detection: without a documented baseline of normal activity, any alert threshold is arbitrary. Establish baselines for: logon times by user, process execution frequency by host, network egress volume by IP, and authentication failure rates.
- Log retention requirements: compliance frameworks typically specify minimum retention of 90 days hot (immediately searchable) and 1 year cold (archived). Investigations require logs from before the incident — logs deleted before investigation begins are forensically worthless.

### Procedures
- Log review protocol for a suspected compromised host: (1) Review authentication events (4624, 4625, 4648) for the target timeframe — look for unusual hours, unusual source IPs, lateral movement. (2) Review process creation (4688) for unusual parent-child relationships, LOLBins (living-off-the-land binaries), or encoded command lines. (3) Review network connections correlated against DNS queries.
- SIEM correlation rule construction: rules should have a documented rationale (what attack technique does this detect?), a documented false positive rate (what benign activity does this also match?), and a documented response action (what does an analyst do when this fires?).

### Exercises
- Given a sample Windows Security Event Log (use publicly available DFIR challenge logs), identify: all failed authentication attempts, all explicit credential use events, all new services installed. Build a timeline of the three most suspicious events.
- Write three SIEM correlation rules for detecting lateral movement using valid credentials: (1) a single source authenticating to 5+ hosts within 10 minutes, (2) authentication to a host outside normal business hours, (3) authentication using credentials that have not been used in 30+ days.

---

## Network Forensics

**keywords**: network, forensics, pcap, traffic, analysis, wireshark, protocol, C2, exfiltration, beaconing

### Facts
- Beaconing is a Command and Control (C2) communication pattern: malware periodically contacts its C2 server at regular (or jittered) intervals. Beaconing is detectable through traffic analysis: look for periodic connections to external IPs with low data volume and consistent timing.
- DNS is the most common C2 exfiltration channel for mature adversaries: data is encoded in DNS query subdomains. DNS C2 is difficult to block without breaking legitimate DNS, passes through most firewalls, and is rarely logged with the resolution detail needed to detect it.
- TLS traffic analysis: even encrypted traffic reveals metadata — packet sizes, timing, connection duration, certificate subject. Encrypted C2 channels have characteristic traffic profiles that differ from legitimate HTTPS browse traffic.
- Long tail analysis for network anomaly detection: sort external IP communication by session count or data volume. The "long tail" — rare IPs contacted by few hosts — is where C2 and exfiltration appear. The head of the distribution (Google, Microsoft, CDNs) is noise.

### Procedures
- PCAP triage workflow: open in Wireshark → Statistics → Conversations (identify volume outliers) → follow TCP streams on outlier connections → check DNS queries for unusual subdomains, long query strings, or high-entropy subdomains → check HTTP traffic for encoded payloads, unusual user agents, or unexpected external resources.
- Exfiltration detection: baseline normal egress volume per host per day. Alert on deviations exceeding 2–3 standard deviations above normal. Correlate egress spikes with access to sensitive data repositories in the same timeframe.

### Exercises
- Download a PCAP file from a public DFIR challenge or malware analysis repository. Identify: all domains contacted, all external IPs, any beaconing patterns (regular interval connections), and any data in DNS queries or HTTP requests that appears encoded.
- Practice building a long-tail analysis: given a netflow or firewall log dataset, sort external IP connections by frequency. Identify the 10 least-frequently-contacted external IPs. Research each to determine if any are known malicious infrastructure.
