# Content Pipeline

> **Dimension: Content Quality · Current: 2/10 · Target: 5/10**

## Problem Statement

The Training Console has 4,354 cards across 663 decks in 19 modules. The infrastructure
works — cards render, quizzes generate, SR schedules reviews. But the content itself is
**templated filler produced by automation**, not curriculum authored by domain experts.

### The Numbers

| Metric | Value |
|--------|-------|
| Total decks | 663 |
| Total cards | 3,231 (audit report) / ~4,354 (manifest) |
| Thin decks (2-3 cards) | **453 (68.3%)** |
| Modules with 75-100% thin decks | **13 of 19** |
| Templated "list the key points" exercises | **4,064 (34.6% of all exercises)** |
| Semi-formulaic exercises (self-check, analyze, apply templates) | **~7,000-9,000** |
| Modules with zero thin decks | 5 (counter_psyops, equations, intelligence, self_sovereignty, space_force) |

### What Templated Content Looks Like

**Card: "Parsing System and Network Logs" (cybersecurity)**
- description: `"Using forensic techniques to analyze log files for security incidents."` (1 sentence)
- bulletpoints: `["Syslog analysis", "SIEM tools", "log parsing techniques"]` (3 labels)
- exercise (recall): `"From memory, list the key points of 'Parsing System and Network Logs'."` → expected: the 3 labels
- exercise (apply): `"Describe how you would apply the concepts in a real-world scenario."` → expected: `"A practical application of parsing system and network logs concepts with concrete steps."`
- keyTerms: `["Parsing System Network", "Syslog analysis", "SIEM tools", "log parsing"]` (fragments)
- learningObjectives: `["Understand the core principles of...", "Apply knowledge of syslog analysis", "Evaluate the significance of..."]` (Bloom's template)

### Why This Matters

The quiz system — the strongest feature at 7/10 — can only be as good as its source
material. When bulletpoints are 3-word labels and exercises are tautological, quizzes
test recognition of labels, not comprehension of concepts. The entire SR pipeline
optimally schedules review of material that doesn't teach anything.

## What "Fixed" Looks Like

A target-quality card for the same topic:

```json
{
  "title": "Parsing System and Network Logs",
  "description": "System and network logs are the primary evidence source in digital forensics. Understanding log formats, correlation techniques, and common attack signatures lets you reconstruct incident timelines and identify compromised systems.",
  "bulletpoints": [
    "Syslog (RFC 5424) uses facility/severity codes — auth.crit means a critical authentication event",
    "SIEM tools (Splunk, ELK, QRadar) correlate logs across sources to surface patterns invisible in isolation",
    "Common attack indicators: repeated failed auth (brute force), unusual outbound connections (C2 beacons), privilege escalation sequences",
    "Log integrity verification: compare hashes, check for time gaps, validate against NTP synchronization records",
    "Chain of custody: document who accessed logs, when, and preserve originals before analysis"
  ],
  "exercises": [
    {
      "type": "scenario",
      "prompt": "You see 47 failed SSH logins from the same IP in 3 minutes, followed by a successful login and immediate sudo access. What attack pattern is this, and what's your next investigation step?",
      "expectedOutcome": "Brute force attack succeeded. Next: check what commands were run under sudo, look for lateral movement indicators, check if the IP appears in threat intelligence feeds."
    },
    {
      "type": "apply",
      "prompt": "Write a grep/awk command to extract all authentication failures from /var/log/auth.log in the last 24 hours, sorted by source IP frequency.",
      "expectedOutcome": "grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn"
    }
  ],
  "keyTerms": ["Syslog RFC 5424", "SIEM correlation", "brute force", "C2 beacon", "chain of custody", "log integrity"],
  "learningObjectives": [
    "Identify common attack patterns from raw log entries",
    "Explain how SIEM correlation reveals multi-stage attacks",
    "Apply log integrity verification before forensic analysis"
  ]
}
```

## Effort Estimate

| Work | Effort | Notes |
|------|--------|-------|
| Quality rubric definition | 1-2 days | What "good enough" means, field by field |
| Schema changes (Quiz explanation, new exercise types) | 2-3 days | Type definitions + generator updates |
| Content validation tooling | 3-5 days | Scripts to detect templates, enforce minimums |
| Card authoring tool (optional) | 2-3 weeks | Basic editor with preview for card JSON |
| **Content authoring (13 thin modules)** | **10-20 weeks** | **The long pole — see [authoring-strategy.md](authoring-strategy.md)** |
| Content authoring (exercise rewrite across all 19) | **8-16 weeks** | 7,000-9,000 prompts |
| **Total** | **3-6 months** | Tooling: 2-3 weeks · Content: 3-5 months |

## Documents

| Document | Purpose |
|----------|---------|
| [quality-rubric.md](quality-rubric.md) | What a "good enough" card looks like, field by field |
| [domain-audit.md](domain-audit.md) | Per-module current state and requirements |
| [authoring-strategy.md](authoring-strategy.md) | AI-assist vs manual vs hybrid, pilot selection |
| [schema-changes.md](schema-changes.md) | Quiz explanation field, new exercise types, keyTerm curation |
| [tooling-requirements.md](tooling-requirements.md) | Validation scripts, card editor, content review pipeline |
